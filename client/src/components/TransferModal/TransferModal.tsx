import { useState, useEffect } from 'react';
import { fetchRooms, fetchBedsByRoom, transferBed, type Room, type Bed } from '../../services/api/medboardApi';
import { useTranslation } from '../../i18n/LanguageContext';
import './TransferModal.scss';

interface TransferModalProps {
  open: boolean; patientName: string; patientId: number; currentBedId: number;
  currentBedCode: string; currentRoomId: number; onClose: () => void; onTransferred: () => void;
}

export default function TransferModal({ open, patientName, patientId, currentBedId, currentBedCode, currentRoomId, onClose, onTransferred }: TransferModalProps) {
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
          <div className="transfer-modal__current">
            <span className="transfer-modal__label">{t.transfer.patient}</span>
            <span className="transfer-modal__value">{patientName}</span>
          </div>
          <div className="transfer-modal__current">
            <span className="transfer-modal__label">{t.transfer.currentBed}</span>
            <span className="transfer-modal__value">{currentBedCode}</span>
          </div>
          <div className="transfer-modal__arrow">↓</div>
          <div className="transfer-modal__field">
            <label>{t.transfer.targetRoom}</label>
            <select className="form-field__select" value={targetRoomId || ''} onChange={e => setTargetRoomId(e.target.value ? Number(e.target.value) : null)}>
              <option value="">{t.transfer.selectRoom}</option>
              {rooms.filter(r => r.id !== currentRoomId || rooms.length === 1).map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.room_code}) — {r.total_beds - r.occupied_beds} {t.transfer.emptyCount}</option>
              ))}
              {rooms.filter(r => r.id === currentRoomId).map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.room_code}) — {t.transfer.sameRoom}</option>
              ))}
            </select>
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
