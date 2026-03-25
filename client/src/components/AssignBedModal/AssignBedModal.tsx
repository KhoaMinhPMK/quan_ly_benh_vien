import { useState, useEffect } from 'react';
import { fetchPatients, assignBed, type Patient } from '../../services/api/medboardApi';

interface AssignBedModalProps {
  open: boolean;
  bedId: number;
  bedCode: string;
  onClose: () => void;
  onAssigned: () => void;
}

export default function AssignBedModal({ open, bedId, bedCode, onClose, onAssigned }: AssignBedModalProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (open) {
      setLoading(true);
      // Fetch patients without bed (status=admitted or those without bed_id)
      fetchPatients({ status: 'admitted' })
        .then(setPatients)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [open]);

  const filtered = patients.filter(p =>
    p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.patient_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!selectedId) { setError('Chọn bệnh nhân'); return; }
    setSubmitting(true);
    setError('');
    try {
      await assignBed(bedId, selectedId);
      onAssigned();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi xếp giường';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="transfer-modal">
        <div className="transfer-modal__header">
          <h3>Xếp giường — {bedCode}</h3>
          <button className="transfer-modal__close" onClick={onClose}>&times;</button>
        </div>

        <div className="transfer-modal__body">
          <div className="transfer-modal__field">
            <label>Tìm bệnh nhân chưa có giường</label>
            <input type="text" className="form-field__input" placeholder="Tên hoặc mã BN..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              style={{ marginBottom: 8 }} />
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>Đang tải...</p>
          ) : filtered.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
              Không có bệnh nhân chờ xếp giường
            </p>
          ) : (
            <div style={{ maxHeight: 250, overflowY: 'auto' }}>
              {filtered.map(p => (
                <div key={p.id}
                  className={`transfer-modal__bed-opt ${selectedId === p.id ? 'transfer-modal__bed-opt--selected' : ''}`}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, width: '100%' }}
                  onClick={() => setSelectedId(p.id)}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{p.full_name}</div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>{p.patient_code} · {p.diagnosis || 'Chưa cập nhật'}</div>
                  </div>
                  {selectedId === p.id && <span style={{ color: '#2563EB', fontWeight: 600 }}>✓</span>}
                </div>
              ))}
            </div>
          )}

          {error && <div className="transfer-modal__error">{error}</div>}
        </div>

        <div className="transfer-modal__footer">
          <button className="btn btn--secondary btn--sm" onClick={onClose}>Huỷ</button>
          <button className="btn btn--primary btn--sm" onClick={handleSubmit} disabled={submitting || !selectedId}>
            {submitting ? 'Đang xử lý...' : 'Xếp giường'}
          </button>
        </div>
      </div>
    </>
  );
}
