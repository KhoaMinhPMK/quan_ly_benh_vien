import { useState, useEffect } from 'react';
import { createPatient, fetchRooms, fetchBedsByRoom, globalSearch, type Room, type Bed } from '../../services/api/medboardApi';
import { useTranslation } from '../../i18n/LanguageContext';
import Select from '../../components/Select/Select';
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
  // Re-admission (tái khám) search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedExistingId, setSelectedExistingId] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);

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

  // Debounced search for existing patients
  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); setShowResults(false); return; }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const r = await globalSearch(searchQuery);
        setSearchResults(r.patients || []);
        setShowResults(true);
      } catch { setSearchResults([]); }
      setSearching(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const selectExistingPatient = (p: any) => {
    setSelectedExistingId(p.id);
    setForm(f => ({ ...f, full_name: p.full_name }));
    setSearchQuery('');
    setShowResults(false);
  };

  const clearExistingPatient = () => {
    setSelectedExistingId(null);
    setForm(f => ({ ...f, full_name: '', date_of_birth: '', gender: 'male', phone: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.diagnosis || !form.doctor_name) { setError(t.addPatient.requiredFields); return; }
    setLoading(true);
    try {
      await createPatient({
        patient_id: selectedExistingId || undefined,
        full_name: form.full_name, date_of_birth: form.date_of_birth || undefined, gender: form.gender,
        phone: form.phone || undefined, diagnosis: form.diagnosis, doctor_name: form.doctor_name,
        bed_id: form.bed_id ? Number(form.bed_id) : undefined, expected_discharge: form.expected_discharge || undefined,
        notes: form.notes || undefined,
      } as any);
      onCreated(); onClose();
      setForm({ full_name: '', date_of_birth: '', gender: 'male', phone: '', address: '', diagnosis: '', doctor_name: '', bed_id: '', room_id: '', expected_discharge: '', notes: '' });
      setSelectedExistingId(null); setSearchQuery('');
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

            {/* Tái khám: Tìm bệnh nhân cũ */}
            <div className="form-field" style={{ marginBottom: 16 }}>
              <label className="form-field__label" style={{ color: '#3B82F6' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'middle',marginRight:4}}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>Tìm bệnh nhân cũ (Tái khám)</label>
              {selectedExistingId ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#EFF6FF', borderRadius: 8, fontSize: 13 }}>
                  <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" style={{verticalAlign:'middle',marginRight:4}}><path d="M5 12l5 5L20 7"/></svg>Đã chọn: <strong>{form.full_name}</strong></span>
                  <button type="button" style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: 13 }} onClick={clearExistingPatient}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{verticalAlign:'middle',marginRight:2}}><path d="M18 6L6 18M6 6l12 12"/></svg>Bỏ chọn</button>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <input className="form-field__input" placeholder="Gõ tên hoặc mã BN để tìm bệnh nhân cũ..."
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    onFocus={() => searchResults.length > 0 && setShowResults(true)} />
                  {searching && <span style={{ position: 'absolute', right: 12, top: 10, fontSize: 12, color: '#9CA3AF' }}>Đang tìm...</span>}
                  {showResults && searchResults.length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, maxHeight: 200, overflowY: 'auto' }}>
                      {searchResults.map(p => (
                        <div key={p.id} style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #F1F5F9', fontSize: 13 }}
                          onClick={() => selectExistingPatient(p)}
                          onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                          onMouseLeave={e => (e.currentTarget.style.background = '')}>
                          <strong>{p.full_name}</strong> — {p.patient_code}
                          {p.admission_code && <span style={{ color: '#9CA3AF', marginLeft: 8 }}>{p.admission_code}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="form-field">
              <label className="form-field__label">{t.addPatient.fullName} *</label>
              <input className="form-field__input" name="full_name" value={form.full_name} onChange={handleChange}
                placeholder={t.addPatient.fullNamePlaceholder} disabled={!!selectedExistingId}
                style={selectedExistingId ? { opacity: 0.6 } : {}} />
            </div>
            <div className="modal__row">
              <div className="form-field"><label className="form-field__label">{t.addPatient.dob}</label>
                <input className="form-field__input" name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} /></div>
              <div className="form-field"><label className="form-field__label">{t.addPatient.gender}</label>
                <Select value={form.gender} onChange={val => setForm({...form, gender: val})}
                  options={[{ value: 'male', label: t.addPatient.male }, { value: 'female', label: t.addPatient.female }]}
                /></div>
            </div>
            <div className="form-field"><label className="form-field__label">{t.addPatient.phone}</label>
              <input className="form-field__input" name="phone" value={form.phone} onChange={handleChange} placeholder={t.addPatient.phonePlaceholder} /></div>
            <div className="form-field"><label className="form-field__label">{t.addPatient.diagnosis} *</label>
              <input className="form-field__input" name="diagnosis" value={form.diagnosis} onChange={handleChange} placeholder={t.addPatient.diagnosisPlaceholder} /></div>
            <div className="form-field"><label className="form-field__label">{t.addPatient.doctor} *</label>
              <input className="form-field__input" name="doctor_name" value={form.doctor_name} onChange={handleChange} placeholder={t.addPatient.doctorPlaceholder} /></div>
            <div className="modal__row">
              <div className="form-field"><label className="form-field__label">{t.addPatient.room}</label>
                <Select value={form.room_id} onChange={val => { setForm({...form, room_id: val, bed_id: ''}); }}
                  placeholder={t.addPatient.selectRoom}
                  options={[
                    { value: '', label: t.addPatient.selectRoom },
                    ...rooms.map(r => ({ value: String(r.id), label: `${r.room_code} - ${r.name} ${r.empty_beds > 0 ? `(Còn ${r.empty_beds} giường)` : '(HẾT)'}`, disabled: r.empty_beds === 0 }))
                  ]}
                /></div>
              <div className="form-field"><label className="form-field__label">{t.addPatient.bed}</label>
                <Select value={form.bed_id} onChange={val => setForm({...form, bed_id: val})} disabled={!form.room_id}
                  placeholder={t.addPatient.selectBed}
                  options={[
                    { value: '', label: t.addPatient.selectBed },
                    ...beds.map(b => ({ value: String(b.id), label: b.bed_code }))
                  ]}
                /></div>
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
