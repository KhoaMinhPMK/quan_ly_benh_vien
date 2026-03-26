import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchRoom, fetchBedsByRoom, releaseBed, type Room, type Bed } from '../../services/api/medboardApi';
import { useTranslation } from '../../i18n/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import BedVisual from '../../components/BedVisual/BedVisual';
import BedDetailPanel from '../../components/BedDetailPanel/BedDetailPanel';
import TransferModal from '../../components/TransferModal/TransferModal';
import AssignBedModal from '../../components/AssignBedModal/AssignBedModal';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import './RoomDetailPage.scss';

const STATUS_ORDER: Record<string, number> = { occupied: 0, empty: 1, cleaning: 2, locked: 3 };

export default function RoomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [room, setRoom] = useState<Room | null>(null);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showAssign, setShowAssign] = useState<Bed | null>(null);
  const [confirmRelease, setConfirmRelease] = useState(false);
  const [releasing, setReleasing] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [roomData, bedData] = await Promise.all([fetchRoom(Number(id)), fetchBedsByRoom(Number(id))]);
      setRoom(roomData);
      setBeds([...bedData].sort((a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9)));
    } catch { /* empty state */ }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { const timer = setInterval(loadData, 30000); return () => clearInterval(timer); }, [loadData]);

  const handleBedClick = (bed: Bed) => { bed.status === 'empty' ? setShowAssign(bed) : setSelectedBed(bed); };

  const handleRelease = async () => {
    if (!selectedBed) return;
    setConfirmRelease(true);
  };

  const handleReleaseConfirm = async () => {
    if (!selectedBed) return;
    setReleasing(true);
    try {
      await releaseBed(selectedBed.id);
      setSelectedBed(null);
      setConfirmRelease(false);
      showToast(t.common.success, 'success');
      loadData();
    } catch {
      showToast(t.common.error, 'error');
    } finally {
      setReleasing(false);
    }
  };

  const handleTransferDone = () => { setShowTransfer(false); setSelectedBed(null); showToast(t.common.success, 'success'); loadData(); };
  const handleAssignDone = () => { setShowAssign(null); showToast(t.common.success, 'success'); loadData(); };

  const totalBeds = beds.length;
  const emptyBeds = beds.filter(b => b.status === 'empty').length;
  const occupiedBeds = beds.filter(b => b.status === 'occupied').length;
  const otherBeds = totalBeds - emptyBeds - occupiedBeds;
  const ratio = totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0;
  const isFull = ratio >= 100;
  const isNearFull = ratio >= 80;

  const statusLabel = (s: string) => s === 'active' ? t.rooms.statusActive : s === 'maintenance' ? t.rooms.statusMaintenance : t.rooms.statusClosed;

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '64px' }}>
        <div className="loading-screen__spinner" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: '#94A3B8' }}>{t.rooms.detail.loadingRoom}</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-state__title">{t.rooms.detail.notFound}</div>
          <div className="empty-state__text">{t.rooms.detail.notFoundDesc}</div>
          <button className="btn btn--secondary" onClick={() => navigate('/rooms')} style={{ marginTop: '16px' }}>{t.common.back}</button>
        </div>
      </div>
    );
  }

  const floorLabel = `${t.rooms.floorN} ${room.floor}`;
  const capacityLabel = t.rooms.detail.capacityLabel;

  return (
    <div className="room-detail">
      {/* Header */}
      <div className="room-detail__header">
        <div>
          <button className="btn btn--ghost btn--sm" onClick={() => navigate('/rooms')} style={{ marginBottom: '8px' }}>
            {t.rooms.detail.backToList}
          </button>
          <h2 className="page-header__title">{room.name}</h2>
          <p className="page-header__subtitle">{room.room_code} · {room.department_name} · {floorLabel}</p>
        </div>
        <div className="room-detail__header-stats">
          <span className={`badge ${isFull ? 'badge--error' : isNearFull ? 'badge--warning' : 'badge--success'}`}>
            {Math.round(ratio)}% {capacityLabel}
          </span>
          <span className={`badge badge--${room.status === 'active' ? 'success' : room.status === 'maintenance' ? 'warning' : 'neutral'}`}>
            {statusLabel(room.status)}
          </span>
        </div>
      </div>

      {/* Summary bar */}
      <div className="room-detail__summary">
        <div className="room-detail__summary-item">
          <span className="room-detail__summary-value">{totalBeds}</span>
          <span className="room-detail__summary-label">{t.rooms.detail.totalBeds}</span>
        </div>
        <div className="room-detail__summary-item">
          <span className="room-detail__summary-value room-detail__summary-value--occupied">{occupiedBeds}</span>
          <span className="room-detail__summary-label">{t.rooms.detail.occupied}</span>
        </div>
        <div className="room-detail__summary-item">
          <span className="room-detail__summary-value room-detail__summary-value--success">{emptyBeds}</span>
          <span className="room-detail__summary-label">{t.rooms.detail.empty}</span>
        </div>
        <div className="room-detail__summary-item">
          <span className="room-detail__summary-value room-detail__summary-value--muted">{otherBeds}</span>
          <span className="room-detail__summary-label">{t.rooms.detail.lockedCleaning}</span>
        </div>
        <div className="room-detail__summary-bar">
          <div className="room-detail__summary-bar-track">
            <div className="room-detail__summary-bar-fill" style={{ width: `${Math.min(ratio, 100)}%`, background: isFull ? '#EF4444' : isNearFull ? '#F59E0B' : '#10B981' }} />
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="room-detail__legend">
        <span className="room-detail__legend-item"><span className="room-detail__legend-dot room-detail__legend-dot--occupied" />{t.rooms.legend.occupied}</span>
        <span className="room-detail__legend-item"><span className="room-detail__legend-dot room-detail__legend-dot--empty" />{t.rooms.legend.empty}</span>
        <span className="room-detail__legend-item"><span className="room-detail__legend-dot room-detail__legend-dot--cleaning" />{t.rooms.legend.cleaning}</span>
        <span className="room-detail__legend-item"><span className="room-detail__legend-dot room-detail__legend-dot--locked" />{t.rooms.legend.locked}</span>
      </div>

      {/* Bed Grid */}
      <div className="room-detail__grid">
        {beds.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="empty-state">
              <div className="empty-state__title">{t.rooms.detail.noBeds}</div>
              <div className="empty-state__text">{t.rooms.detail.noBedsDesc}</div>
            </div>
          </div>
        ) : beds.map((bed) => (
          <BedVisual key={bed.id} bedCode={bed.bed_code} status={bed.status as 'empty' | 'occupied' | 'locked' | 'cleaning'}
            patientName={bed.patient_name} patientCode={bed.patient_code} diagnosis={bed.diagnosis}
            doctorName={bed.doctor_name} daysAdmitted={bed.days_admitted} patientStatus={bed.patient_status}
            onClick={() => handleBedClick(bed)} />
        ))}
      </div>

      {/* Bed Detail Panel */}
      {selectedBed && (
        <BedDetailPanel bedId={selectedBed.id} bedCode={selectedBed.bed_code} bedStatus={selectedBed.status}
          patient={selectedBed.patient_id ? {
            id: selectedBed.patient_id, patient_code: selectedBed.patient_code || '', full_name: selectedBed.patient_name || '',
            date_of_birth: selectedBed.date_of_birth || undefined, gender: selectedBed.gender || undefined,
            phone: selectedBed.phone || undefined, diagnosis: selectedBed.diagnosis || undefined,
            doctor_name: selectedBed.doctor_name || undefined, admitted_at: selectedBed.admitted_at || undefined,
            expected_discharge: selectedBed.expected_discharge || undefined, status: selectedBed.patient_status || undefined,
            notes: selectedBed.notes || undefined,
          } : null}
          onClose={() => setSelectedBed(null)} onTransfer={() => setShowTransfer(true)}
          onRelease={handleRelease} onAssign={() => setShowAssign(selectedBed)} />
      )}

      {showTransfer && selectedBed && selectedBed.patient_id && (
        <TransferModal open patientName={selectedBed.patient_name || ''} patientId={selectedBed.patient_id}
          currentBedId={selectedBed.id} currentBedCode={selectedBed.bed_code} currentRoomId={selectedBed.room_id}
          onClose={() => setShowTransfer(false)} onTransferred={handleTransferDone} />
      )}

      {showAssign && (
        <AssignBedModal open bedId={showAssign.id} bedCode={showAssign.bed_code}
          onClose={() => setShowAssign(null)} onAssigned={handleAssignDone} />
      )}

      <ConfirmDialog
        open={confirmRelease}
        title={t.rooms.confirmRelease}
        message={`${t.rooms.confirmRelease} ${selectedBed?.bed_code || ''}?`}
        variant="danger"
        onConfirm={handleReleaseConfirm}
        onCancel={() => setConfirmRelease(false)}
        loading={releasing}
      />
    </div>
  );
}
