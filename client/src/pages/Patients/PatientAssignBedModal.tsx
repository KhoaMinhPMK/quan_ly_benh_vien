import { useState, useEffect } from 'react';
import { fetchRooms, fetchBedsByRoom, assignBed, fetchPatient, type Room, type Bed, type Patient } from '../../services/api/medboardApi';
import { useTranslation } from '../../i18n/LanguageContext';
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
  const [roomId, setRoomId] = useState('');
  const [bedId, setBedId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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
      fetchBedsByRoom(Number(roomId)).then(allBeds => setBeds(allBeds.filter(b => b.status === 'empty'))).catch(() => setBeds([]));
    } else {
      setBeds([]);
    }
    setBedId('');
  }, [roomId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bedId || !patientId) { setError(t.addPatient?.selectBed || 'Vui lòng chọn giường'); return; }
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
          <h3 className="modal__title">{t.beds?.assignHint || 'Xếp giường'} - {patient.full_name}</h3>
          <button className="modal__close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal__body">
            {error && <div className="modal__error">{error}</div>}
            
            <div className="form-field">
              <label className="form-field__label">{t.dashboard?.department || 'Khoa'}</label>
              <input className="form-field__input form-field__input--disabled" value={patient.diagnosis || '--'} disabled />
            </div>

            <div className="modal__row">
              <div className="form-field">
                <label className="form-field__label">{t.addPatient?.room || 'Phòng'}</label>
                <select className="form-field__input" value={roomId} onChange={e => setRoomId(e.target.value)}>
                  <option value="">{t.addPatient?.selectRoom || 'Chọn phòng...'}</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.room_code} - {r.name}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label className="form-field__label">{t.addPatient?.bed || 'Giường'}</label>
                <select className="form-field__input" value={bedId} onChange={e => setBedId(e.target.value)} disabled={!roomId}>
                  <option value="">{t.addPatient?.selectBed || 'Chọn giường...'}</option>
                  {beds.map(b => <option key={b.id} value={b.id}>{b.bed_code}</option>)}
                </select>
              </div>
            </div>
            {beds.length === 0 && roomId && (
              <p style={{ fontSize: 12, color: '#EF4444', marginTop: -8 }}>Phòng này hiện đã hết giường trống.</p>
            )}
          </div>
          <div className="modal__footer">
            <button type="button" className="btn btn--secondary" onClick={onClose}>{t.common.cancel}</button>
            <button type="submit" className="btn btn--primary" disabled={submitting || !bedId}>
              {submitting ? t.common.processing : (t.beds?.assignHint || 'Xếp giường')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
