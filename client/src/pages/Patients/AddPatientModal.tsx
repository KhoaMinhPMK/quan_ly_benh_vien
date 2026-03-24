import { useState, useEffect } from 'react';
import { createPatient, fetchRooms, fetchBedsByRoom, type Room, type Bed } from '../../services/api/medboardApi';
import '../../components/Modal/Modal.scss';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function AddPatientModal({ open, onClose, onCreated }: Props) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [form, setForm] = useState({
    full_name: '',
    date_of_birth: '',
    gender: 'male',
    phone: '',
    address: '',
    diagnosis: '',
    doctor_name: '',
    bed_id: '',
    room_id: '',
    expected_discharge: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      fetchRooms({ status: 'active' }).then(setRooms).catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    if (form.room_id) {
      fetchBedsByRoom(Number(form.room_id)).then((allBeds) => {
        setBeds(allBeds.filter((b) => b.status === 'empty'));
      }).catch(() => setBeds([]));
    } else {
      setBeds([]);
    }
    setForm((f) => ({ ...f, bed_id: '' }));
  }, [form.room_id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.diagnosis || !form.doctor_name) {
      setError('Vui long dien day du ho ten, chan doan va bac si phu trach.');
      return;
    }
    setLoading(true);
    try {
      await createPatient({
        full_name: form.full_name,
        date_of_birth: form.date_of_birth || undefined,
        gender: form.gender,
        phone: form.phone || undefined,
        diagnosis: form.diagnosis,
        doctor_name: form.doctor_name,
        bed_id: form.bed_id ? Number(form.bed_id) : undefined,
        expected_discharge: form.expected_discharge || undefined,
        notes: form.notes || undefined,
      } as Partial<import('../../services/api/medboardApi').Patient>);
      onCreated();
      onClose();
      setForm({
        full_name: '', date_of_birth: '', gender: 'male', phone: '', address: '',
        diagnosis: '', doctor_name: '', bed_id: '', room_id: '', expected_discharge: '', notes: '',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Loi khi them benh nhan';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h3 className="modal__title">Them benh nhan</h3>
          <button className="modal__close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal__body">
            {error && <div className="modal__error">{error}</div>}

            <div className="form-field">
              <label className="form-field__label">Ho ten *</label>
              <input className="form-field__input" name="full_name" value={form.full_name} onChange={handleChange} placeholder="Nguyen Van A" />
            </div>

            <div className="modal__row">
              <div className="form-field">
                <label className="form-field__label">Ngay sinh</label>
                <input className="form-field__input" name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} />
              </div>
              <div className="form-field">
                <label className="form-field__label">Gioi tinh</label>
                <select className="form-field__input" name="gender" value={form.gender} onChange={handleChange}>
                  <option value="male">Nam</option>
                  <option value="female">Nu</option>
                </select>
              </div>
            </div>

            <div className="form-field">
              <label className="form-field__label">So dien thoai</label>
              <input className="form-field__input" name="phone" value={form.phone} onChange={handleChange} placeholder="09xxxxxxxx" />
            </div>

            <div className="form-field">
              <label className="form-field__label">Chan doan *</label>
              <input className="form-field__input" name="diagnosis" value={form.diagnosis} onChange={handleChange} placeholder="Chan doan benh" />
            </div>

            <div className="form-field">
              <label className="form-field__label">Bac si phu trach *</label>
              <input className="form-field__input" name="doctor_name" value={form.doctor_name} onChange={handleChange} placeholder="BS. Nguyen Van B" />
            </div>

            <div className="modal__row">
              <div className="form-field">
                <label className="form-field__label">Phong</label>
                <select className="form-field__input" name="room_id" value={form.room_id} onChange={handleChange}>
                  <option value="">-- Chon phong --</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>{r.room_code} - {r.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label className="form-field__label">Giuong</label>
                <select className="form-field__input" name="bed_id" value={form.bed_id} onChange={handleChange} disabled={!form.room_id}>
                  <option value="">-- Chon giuong --</option>
                  {beds.map((b) => (
                    <option key={b.id} value={b.id}>{b.bed_code}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-field">
              <label className="form-field__label">Du kien ra vien</label>
              <input className="form-field__input" name="expected_discharge" type="date" value={form.expected_discharge} onChange={handleChange} />
            </div>

            <div className="form-field">
              <label className="form-field__label">Ghi chu</label>
              <textarea className="form-field__input" name="notes" value={form.notes} onChange={handleChange} rows={2} placeholder="Ghi chu them..." />
            </div>
          </div>

          <div className="modal__footer">
            <button type="button" className="btn btn--secondary" onClick={onClose}>Huy</button>
            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? 'Dang luu...' : 'Them benh nhan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
