import { useState, useEffect } from 'react';
import { createPatient, fetchRooms, fetchBedsByRoom, type Room, type Bed } from '../../services/api/medboardApi';
import { useTranslation } from '../../i18n/LanguageContext';
import '../../components/Modal/Modal.scss';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function AddPatientModal({ open, onClose, onCreated }: Props) {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [form, setForm] = useState({
    full_name: '', date_of_birth: '', gender: 'male', phone: '', address: '',
    diagnosis: '', doctor_name: '', bed_id: '', room_id: '', expected_discharge: '', notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (open) fetchRooms({ status: 'active' }).then(setRooms).catch(() => {}); }, [open]);

  useEffect(() => {
    if (form.room_id) {
      fetchBedsByRoom(Number(form.room_id)).then((allBeds) => setBeds(allBeds.filter((b) => b.status === 'empty'))).catch(() => setBeds([]));
    } else { setBeds([]); }
    setForm((f) => ({ ...f, bed_id: '' }));
  }, [form.room_id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value }); setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.diagnosis || !form.doctor_name) { setError(t.addPatient.requiredFields); return; }
    setLoading(true);
    try {
      await createPatient({
        full_name: form.full_name, date_of_birth: form.date_of_birth || undefined, gender: form.gender,
        phone: form.phone || undefined, diagnosis: form.diagnosis, doctor_name: form.doctor_name,
        bed_id: form.bed_id ? Number(form.bed_id) : undefined, expected_discharge: form.expected_discharge || undefined,
        notes: form.notes || undefined,
      } as Partial<import('../../services/api/medboardApi').Patient>);
      onCreated(); onClose();
      setForm({ full_name: '', date_of_birth: '', gender: 'male', phone: '', address: '', diagnosis: '', doctor_name: '', bed_id: '', room_id: '', expected_discharge: '', notes: '' });
    } catch (err: unknown) { setError(err instanceof Error ? err.message : t.common.error); }
    finally { setLoading(false); }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h3 className="modal__title">{t.addPatient.title}</h3>
          <button className="modal__close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal__body">
            {error && <div className="modal__error">{error}</div>}
            <div className="form-field">
              <label className="form-field__label">{t.addPatient.fullName} *</label>
              <input className="form-field__input" name="full_name" value={form.full_name} onChange={handleChange} placeholder={t.addPatient.fullNamePlaceholder} />
            </div>
            <div className="modal__row">
              <div className="form-field"><label className="form-field__label">{t.addPatient.dob}</label>
                <input className="form-field__input" name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} /></div>
              <div className="form-field"><label className="form-field__label">{t.addPatient.gender}</label>
                <select className="form-field__input" name="gender" value={form.gender} onChange={handleChange}>
                  <option value="male">{t.addPatient.male}</option><option value="female">{t.addPatient.female}</option>
                </select></div>
            </div>
            <div className="form-field"><label className="form-field__label">{t.addPatient.phone}</label>
              <input className="form-field__input" name="phone" value={form.phone} onChange={handleChange} placeholder={t.addPatient.phonePlaceholder} /></div>
            <div className="form-field"><label className="form-field__label">{t.addPatient.diagnosis} *</label>
              <input className="form-field__input" name="diagnosis" value={form.diagnosis} onChange={handleChange} placeholder={t.addPatient.diagnosisPlaceholder} /></div>
            <div className="form-field"><label className="form-field__label">{t.addPatient.doctor} *</label>
              <input className="form-field__input" name="doctor_name" value={form.doctor_name} onChange={handleChange} placeholder={t.addPatient.doctorPlaceholder} /></div>
            <div className="modal__row">
              <div className="form-field"><label className="form-field__label">{t.addPatient.room}</label>
                <select className="form-field__input" name="room_id" value={form.room_id} onChange={handleChange}>
                  <option value="">{t.addPatient.selectRoom}</option>
                  {rooms.map((r) => <option key={r.id} value={r.id}>{r.room_code} - {r.name}</option>)}
                </select></div>
              <div className="form-field"><label className="form-field__label">{t.addPatient.bed}</label>
                <select className="form-field__input" name="bed_id" value={form.bed_id} onChange={handleChange} disabled={!form.room_id}>
                  <option value="">{t.addPatient.selectBed}</option>
                  {beds.map((b) => <option key={b.id} value={b.id}>{b.bed_code}</option>)}
                </select></div>
            </div>
            <div className="form-field"><label className="form-field__label">{t.addPatient.expectedDischarge}</label>
              <input className="form-field__input" name="expected_discharge" type="date" value={form.expected_discharge} onChange={handleChange} /></div>
            <div className="form-field"><label className="form-field__label">{t.addPatient.notes}</label>
              <textarea className="form-field__input" name="notes" value={form.notes} onChange={handleChange} rows={2} placeholder={t.addPatient.notesPlaceholder} /></div>
          </div>
          <div className="modal__footer">
            <button type="button" className="btn btn--secondary" onClick={onClose}>{t.common.cancel}</button>
            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? t.common.processing : t.addPatient.title}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
