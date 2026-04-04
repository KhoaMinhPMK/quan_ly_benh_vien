import { useState, useEffect } from 'react';
import { fetchRooms, fetchBedsByRoom, assignBed, fetchPatient, type Room, type Bed, type Patient } from '../../services/api/medboardApi';
import { useTranslation } from '../../i18n/LanguageContext';
import Select from '../../components/Select/Select';
import '../../components/Modal/Modal.scss';

interface Props {
  open: boolean;
  patientId: number | null;
  onClose: () => void;
  onAssigned: () => void;
}

export default function PatientAssignBedModal({ open, patientId, onClose, onAssigned }: Props) {
  const { t } = useTranslation();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [allBedsInRoom, setAllBedsInRoom] = useState<Bed[]>([]);
  const [roomId, setRoomId] = useState('');
  const [bedId, setBedId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // C4: Gender mismatch warning
  const genderWarning = (() => {
    if (!patient || !roomId || allBedsInRoom.length === 0) return '';
    const occupiedBeds = allBedsInRoom.filter(b => b.status === 'occupied' && b.gender);
    if (occupiedBeds.length === 0) return '';
    const otherGender = occupiedBeds.find(b => b.gender !== patient.gender);
    if (!otherGender) return '';
    const genderLabel = patient.gender === 'male' ? 'Nam' : 'Nữ';
    const otherLabel = otherGender.gender === 'male' ? 'Nam' : 'Nữ';
    return `⚠ Bệnh nhân ${genderLabel} — phòng đang có BN ${otherLabel} (${otherGender.patient_name})`;
  })();

  useEffect(() => {
    if (open && patientId) {
      setRoomId('');
      setBedId('');
      setError('');
      Promise.all([
        fetchPatient(patientId).then(setPatient),
        fetchRooms({ status: 'active' }).then(setRooms)
      ]).catch(() => setError(t.common.error));
    }
  }, [open, patientId, t]);

  useEffect(() => {
    if (roomId) {
      fetchBedsByRoom(Number(roomId)).then(allBeds => {
        setAllBedsInRoom(allBeds);
        setBeds(allBeds.filter(b => b.status === 'empty'));
      }).catch(() => setBeds([]));
    } else {
      setBeds([]);
      setAllBedsInRoom([]);
    }
    setBedId('');
  }, [roomId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bedId || !patientId) { setError(t.addPatient?.selectBed); return; }
    setSubmitting(true);
    try {
      await assignBed(Number(bedId), patientId);
      onAssigned();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.common.error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open || !patient) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h3 className="modal__title">{t.beds?.assignHint || t.assign?.title} - {patient.full_name}</h3>
          <button className="modal__close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal__body">
            {error && <div className="modal__error">{error}</div>}
            
            <div className="form-field">
              <label className="form-field__label">{t.dashboard?.department}</label>
              <input className="form-field__input form-field__input--disabled" value={patient.diagnosis || '--'} disabled />
            </div>

            <div className="modal__row">
              <div className="form-field">
                <label className="form-field__label">{t.addPatient?.room}</label>
                <Select value={roomId} onChange={val => setRoomId(val)}
                  placeholder={t.addPatient?.selectRoom}
                  options={[
                    { value: '', label: t.addPatient?.selectRoom || '' },
                    ...rooms.map(r => ({ value: String(r.id), label: `${r.room_code} - ${r.name} ${r.empty_beds > 0 ? `(Còn ${r.empty_beds})` : '(HẾT)'}`, disabled: r.empty_beds === 0 }))
                  ]}
                />
              </div>
              <div className="form-field">
                <label className="form-field__label">{t.addPatient?.bed}</label>
                <Select value={bedId} onChange={val => setBedId(val)} disabled={!roomId}
                  placeholder={t.addPatient?.selectBed}
                  options={[
                    { value: '', label: t.addPatient?.selectBed || '' },
                    ...beds.map(b => ({ value: String(b.id), label: b.bed_code }))
                  ]}
                />
              </div>
            </div>
            {beds.length === 0 && roomId && (
              <p style={{ fontSize: 12, color: '#EF4444', marginTop: -8 }}>{t.addPatient?.outOfBeds}</p>
            )}
            {genderWarning && (
              <div style={{ fontSize: 13, color: '#D97706', background: '#FFFBEB', padding: '8px 12px', borderRadius: 8, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                {genderWarning}
              </div>
            )}
          </div>
          <div className="modal__footer">
            <button type="button" className="btn btn--secondary" onClick={onClose}>{t.common.cancel}</button>
            <button type="submit" className="btn btn--primary" disabled={submitting || !bedId}>
              {submitting ? t.common.processing : (t.beds?.assignHint || t.assign?.confirmAssign)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
