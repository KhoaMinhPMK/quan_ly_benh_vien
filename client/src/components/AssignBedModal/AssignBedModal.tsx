import { useState, useEffect } from 'react';
import { fetchPatients, assignBed, type Patient } from '../../services/api/medboardApi';
import { useTranslation } from '../../i18n/LanguageContext';

interface AssignBedModalProps {
  open: boolean; bedId: number; bedCode: string;
  onClose: () => void; onAssigned: () => void;
}

export default function AssignBedModal({ open, bedId, bedCode, onClose, onAssigned }: AssignBedModalProps) {
  const { t } = useTranslation();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (open) { setLoading(true); fetchPatients({ status: 'admitted' }).then(all => setPatients(all.filter(p => !p.bed_id))).catch(() => {}).finally(() => setLoading(false)); }
  }, [open]);

  const filtered = patients.filter(p =>
    p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || p.patient_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!selectedId) { setError(t.assign.selectPatientError); return; }
    setSubmitting(true); setError('');
    try { await assignBed(bedId, selectedId); onAssigned(); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : t.assign.assignError); }
    finally { setSubmitting(false); }
  };

  if (!open) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="transfer-modal">
        <div className="transfer-modal__header">
          <h3>{t.assign.title} — {bedCode}</h3>
          <button className="transfer-modal__close" onClick={onClose}>&times;</button>
        </div>
        <div className="transfer-modal__body">
          <div className="transfer-modal__field">
            <label>{t.assign.searchPatient}</label>
            <input type="text" className="form-field__input" placeholder={t.assign.searchPlaceholder}
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ marginBottom: 8 }} />
          </div>
          {loading ? (
            <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>{t.common.loading}</p>
          ) : filtered.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>{t.assign.noPatients}</p>
          ) : (
            <div style={{ maxHeight: 250, overflowY: 'auto' }}>
              {filtered.map(p => (
                <div key={p.id}
                  className={`transfer-modal__bed-opt ${selectedId === p.id ? 'transfer-modal__bed-opt--selected' : ''}`}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, width: '100%' }}
                  onClick={() => setSelectedId(p.id)}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{p.full_name}</div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>{p.patient_code} · {p.diagnosis || t.assign.notUpdated}</div>
                  </div>
                  {selectedId === p.id && <span style={{ color: '#2563EB', fontWeight: 600 }}>✓</span>}
                </div>
              ))}
            </div>
          )}
          {error && <div className="transfer-modal__error">{error}</div>}
        </div>
        <div className="transfer-modal__footer">
          <button className="btn btn--secondary btn--sm" onClick={onClose}>{t.common.cancel}</button>
          <button className="btn btn--primary btn--sm" onClick={handleSubmit} disabled={submitting || !selectedId}>
            {submitting ? t.common.processing : t.assign.confirmAssign}
          </button>
        </div>
      </div>
    </>
  );
}
