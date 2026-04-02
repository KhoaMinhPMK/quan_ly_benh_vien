import { useState, useEffect } from 'react';
import { createRoom, fetchDepartments, type Department } from '../../services/api/medboardApi';
import { useTranslation } from '../../i18n/LanguageContext';
import Select from '../../components/Select/Select';
import '../../components/Modal/Modal.scss';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function AddRoomModal({ open, onClose, onCreated }: Props) {
  const { t } = useTranslation();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [form, setForm] = useState({ room_code: '', name: '', department_id: '', room_type: 'normal', max_beds: '4', floor: '1', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (open) fetchDepartments().then(setDepartments).catch(() => {}); }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value }); setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.room_code || !form.name || !form.department_id) { setError(t.addPatient.requiredFields); return; }
    setLoading(true);
    try {
      await createRoom({ room_code: form.room_code, name: form.name, department_id: Number(form.department_id), room_type: form.room_type, max_beds: Number(form.max_beds), floor: Number(form.floor), notes: form.notes });
      setForm({ room_code: '', name: '', department_id: '', room_type: 'normal', max_beds: '4', floor: '1', notes: '' });
      onCreated(); onClose();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : t.common.error); }
    finally { setLoading(false); }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h3 className="modal__title">{t.addRoom.title}</h3>
          <button className="modal__close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal__body">
            {error && <div className="modal__error">{error}</div>}
            <div className="modal__row">
              <div className="form-field"><label className="form-field__label">{t.addRoom.roomCode} *</label>
                <input className="form-field__input" name="room_code" value={form.room_code} onChange={handleChange} placeholder={t.addRoom.roomCodePlaceholder} /></div>
              <div className="form-field"><label className="form-field__label">{t.addRoom.roomName} *</label>
                <input className="form-field__input" name="name" value={form.name} onChange={handleChange} placeholder={t.addRoom.roomNamePlaceholder} /></div>
            </div>
            <div className="modal__row">
              <div className="form-field"><label className="form-field__label">{t.addRoom.department} *</label>
                <Select value={form.department_id} onChange={val => setForm({...form, department_id: val})}
                  placeholder={t.addRoom.selectDept}
                  options={[
                    { value: '', label: t.addRoom.selectDept },
                    ...departments.map((d) => ({ value: String(d.id), label: d.name }))
                  ]}
                /></div>
              <div className="form-field"><label className="form-field__label">{t.addRoom.roomType}</label>
                <Select value={form.room_type} onChange={val => setForm({...form, room_type: val})}
                  options={[
                    { value: 'normal', label: t.addRoom.typeNormal },
                    { value: 'vip', label: 'VIP' },
                    { value: 'icu', label: t.addRoom.typeICU },
                    { value: 'isolation', label: t.addRoom.typeIsolation },
                  ]}
                /></div>
            </div>
            <div className="modal__row">
              <div className="form-field"><label className="form-field__label">{t.addRoom.maxBeds}</label>
                <input className="form-field__input" name="max_beds" type="number" min="1" max="20" value={form.max_beds} onChange={handleChange} /></div>
              <div className="form-field"><label className="form-field__label">{t.addRoom.floor}</label>
                <input className="form-field__input" name="floor" type="number" min="1" max="20" value={form.floor} onChange={handleChange} /></div>
            </div>
            <div className="form-field"><label className="form-field__label">{t.addRoom.notes}</label>
              <textarea className="form-field__input" name="notes" value={form.notes} onChange={handleChange} rows={2} placeholder={t.addPatient.notesPlaceholder} /></div>
          </div>
          <div className="modal__footer">
            <button type="button" className="btn btn--secondary" onClick={onClose}>{t.common.cancel}</button>
            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? t.common.processing : t.common.create}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
