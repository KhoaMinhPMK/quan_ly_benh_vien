import { useState, useEffect } from 'react';
import { fetchRooms, fetchBedsByRoom, transferBed, type Room, type Bed } from '../../services/api/medboardApi';
import { useTranslation } from '../../i18n/LanguageContext';
import Select from '../Select/Select';
import './TransferModal.scss';

interface TransferModalProps {
  open: boolean; patientName: string; patientId: number; currentBedId: number;
  currentBedCode: string; currentRoomId: number;
  currentRoomCode?: string; patientStatus?: string;
  onClose: () => void; onTransferred: () => void;
}

export default function TransferModal({ open, patientName, patientId, currentBedId, currentBedCode, currentRoomId, currentRoomCode, patientStatus, onClose, onTransferred }: TransferModalProps) {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [targetRoomId, setTargetRoomId] = useState<number | null>(null);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [targetBedId, setTargetBedId] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (open) fetchRooms({ status: 'active' }).then(setRooms).catch(() => {}); }, [open]);
  useEffect(() => {
    if (targetRoomId) { fetchBedsByRoom(targetRoomId).then(data => setBeds(data.filter(b => b.status === 'empty'))).catch(() => {}); }
    else { setBeds([]); }
    setTargetBedId(null);
  }, [targetRoomId]);

  const handleSubmit = async () => {
    if (!targetBedId) { setError(t.transfer.selectBedError); return; }
    setSubmitting(true); setError('');
    try { await transferBed(currentBedId, { patient_id: patientId, target_bed_id: targetBedId, reason }); onTransferred(); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : t.transfer.transferError); }
    finally { setSubmitting(false); }
  };

  if (!open) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="transfer-modal">
        <div className="transfer-modal__header">
          <h3>{t.transfer.title}</h3>
          <button className="transfer-modal__close" onClick={onClose}>&times;</button>
        </div>
        <div className="transfer-modal__body">
          {/* F6: Context banner */}
          <div style={{ padding: '10px 14px', background: '#F0F9FF', borderRadius: 8, marginBottom: 12, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #BAE6FD' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
            <div>
              <strong>{patientName}</strong>
              {patientStatus && <span style={{ marginLeft: 6, padding: '1px 6px', background: '#DBEAFE', borderRadius: 4, fontSize: 11 }}>{patientStatus === 'treating' ? 'Đang điều trị' : patientStatus === 'admitted' ? 'Nhập viện' : patientStatus}</span>}
              <span style={{ color: '#64748B', marginLeft: 6 }}>— từ {currentRoomCode || ''} / {currentBedCode}</span>
            </div>
          </div>

          <div className="transfer-modal__arrow">↓</div>
          <div className="transfer-modal__field">
            <label>{t.transfer.targetRoom}</label>
            <Select value={String(targetRoomId || '')} onChange={val => setTargetRoomId(val ? Number(val) : null)}
              placeholder={t.transfer.selectRoom}
              options={[
                { value: '', label: t.transfer.selectRoom },
                ...rooms.filter(r => r.id !== currentRoomId || rooms.length === 1).map(r => (
                  { value: String(r.id), label: `${r.name} (${r.room_code}) — ${r.total_beds - r.occupied_beds} ${t.transfer.emptyCount}` }
                )),
                ...rooms.filter(r => r.id === currentRoomId).map(r => (
                  { value: String(r.id), label: `${r.name} (${r.room_code}) — ${t.transfer.sameRoom}` }
                ))
              ]}
            />
          </div>
          {targetRoomId && (
            <div className="transfer-modal__field">
              <label>{t.transfer.availableBeds}</label>
              {beds.length === 0 ? (
                <p className="transfer-modal__no-beds">{t.transfer.noBeds}</p>
              ) : (
                <div className="transfer-modal__bed-grid">
                  {beds.map(b => (
                    <button key={b.id} className={`transfer-modal__bed-opt ${targetBedId === b.id ? 'transfer-modal__bed-opt--selected' : ''}`}
                      onClick={() => setTargetBedId(b.id)}>{b.bed_code}</button>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="transfer-modal__field">
            <label>{t.transfer.reason}</label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2} placeholder={t.transfer.reasonPlaceholder} />
          </div>
          {error && <div className="transfer-modal__error">{error}</div>}
        </div>
        <div className="transfer-modal__footer">
          <button className="btn btn--secondary btn--sm" onClick={onClose}>{t.common.cancel}</button>
          <button className="btn btn--primary btn--sm" onClick={handleSubmit} disabled={submitting || !targetBedId}>
            {submitting ? t.common.processing : t.transfer.confirmTransfer}
          </button>
        </div>
      </div>
    </>
  );
}
