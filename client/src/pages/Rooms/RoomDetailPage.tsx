import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchRoom, fetchRooms, fetchBedsByRoom, releaseBed, markBedClean, type Room, type Bed } from '../../services/api/medboardApi';
import { useTranslation } from '../../i18n/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import BedVisual from '../../components/BedVisual/BedVisual';
import PatientDrawer from '../../components/PatientDrawer/PatientDrawer';
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
  const [allRooms, setAllRooms] = useState<Room[]>([]);

  const isFirstLoad = useRef(true);

  // Fetch all rooms for room-to-room navigation
  useEffect(() => {
    fetchRooms().then(setAllRooms).catch(() => {});
  }, []);

  const loadData = useCallback(async () => {
    if (!id) return;
    if (isFirstLoad.current) setLoading(true);
    try {
      const [roomData, bedData] = await Promise.all([fetchRoom(Number(id)), fetchBedsByRoom(Number(id))]);
      setRoom(roomData);
      setBeds([...bedData].sort((a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9)));
    } catch { /* empty state */ }
    finally { setLoading(false); isFirstLoad.current = false; }
  }, [id]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!id) return;
      if (isFirstLoad.current) setLoading(true);
      try {
        const [roomData, bedData] = await Promise.all([fetchRoom(Number(id)), fetchBedsByRoom(Number(id))]);
        if (active) {
          setRoom(roomData);
          setBeds([...bedData].sort((a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9)));
        }
      } catch { /* empty state */ }
      finally { if (active) { setLoading(false); isFirstLoad.current = false; } }
    };
    load();
    const timer = setInterval(load, 30000);
    const handlePullRefresh = () => load();
    window.addEventListener('pullrefresh', handlePullRefresh);
    return () => { active = false; clearInterval(timer); window.removeEventListener('pullrefresh', handlePullRefresh); };
  }, [id]);

  const handleBedClick = (bed: Bed) => {
    if (bed.status === 'empty') {
      setShowAssign(bed);
    } else {
      setSelectedBed(bed);
    }
  };

  // Remove the old handleRequestDischarge — PatientDrawer handles this now

  const handleMarkClean = async (bedId: number) => {
    try {
      await markBedClean(bedId);
      showToast(t.common.success, 'success');
      setSelectedBed(null);
      loadData();
    } catch {
      showToast(t.common.error, 'error');
    }
  };

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
  const ratio = totalBeds > 0 ? ((totalBeds - emptyBeds) / totalBeds) * 100 : 0;
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

  // Room-to-room navigation
  const currentRoomIdx = allRooms.findIndex(r => r.id === room.id);
  const prevRoom = currentRoomIdx > 0 ? allRooms[currentRoomIdx - 1] : null;
  const nextRoom = currentRoomIdx >= 0 && currentRoomIdx < allRooms.length - 1 ? allRooms[currentRoomIdx + 1] : null;

  return (
    <div className="room-detail">
      {/* Header */}
      <div className="room-detail__header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <button className="btn btn--ghost btn--sm" onClick={() => navigate('/rooms')}>
              {t.rooms.detail.backToList}
            </button>
            {allRooms.length > 1 && (
              <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
                <button className="btn btn--ghost btn--sm" disabled={!prevRoom} style={{ padding: '4px 8px', opacity: prevRoom ? 1 : 0.3 }}
                  onClick={() => prevRoom && navigate(`/rooms/${prevRoom.id}`)} title={prevRoom ? prevRoom.name : ''}>
                  ◀ {prevRoom?.room_code || ''}
                </button>
                <button className="btn btn--ghost btn--sm" disabled={!nextRoom} style={{ padding: '4px 8px', opacity: nextRoom ? 1 : 0.3 }}
                  onClick={() => nextRoom && navigate(`/rooms/${nextRoom.id}`)} title={nextRoom ? nextRoom.name : ''}>
                  {nextRoom?.room_code || ''} ▶
                </button>
              </div>
            )}
          </div>
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

      {/* Patient Drawer (unified from BedDetailPanel) */}
      {selectedBed && selectedBed.patient_id && (() => {
        const occupiedBeds = beds.filter(b => b.status === 'occupied' && b.patient_id);
        const currentIdx = occupiedBeds.findIndex(b => b.id === selectedBed.id);
        return (
          <PatientDrawer
            patientId={selectedBed.patient_id}
            bedCode={selectedBed.bed_code}
            bedStatus={selectedBed.status}
            onClose={() => setSelectedBed(null)}
            onUpdated={loadData}
            onTransfer={() => setShowTransfer(true)}
            onRelease={handleRelease}
            onMarkClean={() => handleMarkClean(selectedBed.id)}
            hasPrevBed={currentIdx > 0}
            hasNextBed={currentIdx < occupiedBeds.length - 1}
            onPrevBed={currentIdx > 0 ? () => setSelectedBed(occupiedBeds[currentIdx - 1]) : undefined}
            onNextBed={currentIdx < occupiedBeds.length - 1 ? () => setSelectedBed(occupiedBeds[currentIdx + 1]) : undefined}
          />
        );
      })()}

      {/* Non-patient bed panel (empty/locked/cleaning beds) */}
      {selectedBed && !selectedBed.patient_id && (
        <>
          <div className="panel-overlay" onClick={() => setSelectedBed(null)} />
          <div className="bed-panel">
            <div className="bed-panel__header">
              <div>
                <h3 className="bed-panel__title">{t.bedPanel?.title || 'Giường'} {selectedBed.bed_code}</h3>
                <span className={`bed-panel__status bed-panel__status--${selectedBed.status}`}>
                  {selectedBed.status === 'empty' ? t.beds?.statusEmpty : selectedBed.status === 'locked' ? t.beds?.statusLocked : selectedBed.status === 'cleaning' ? t.beds?.statusCleaning : selectedBed.status}
                </span>
              </div>
              <button className="bed-panel__close" onClick={() => setSelectedBed(null)}>&times;</button>
            </div>
            <div className="bed-panel__content">
              <div className="bed-panel__empty" style={{ textAlign: 'center', padding: '32px 16px' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5">
                  <path d="M3 7v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V7"/><path d="M3 7l4-4h10l4 4"/><path d="M12 11v4"/><path d="M10 13h4"/>
                </svg>
                <p style={{ marginTop: 12, color: '#6B7280' }}>{t.bedPanel?.emptyBed || 'Giường trống'}</p>
              </div>
            </div>
            <div className="bed-panel__actions">
              {selectedBed.status === 'empty' && (
                <button className="btn btn--primary btn--sm" onClick={() => setShowAssign(selectedBed)}>{t.bedPanel?.assignPatient || 'Gán bệnh nhân'}</button>
              )}
              {selectedBed.status === 'cleaning' && (
                <button className="btn btn--primary btn--sm" onClick={() => handleMarkClean(selectedBed.id)}>{t.bedPanel?.markClean || 'Đã dọn xong'}</button>
              )}
              {selectedBed.status === 'locked' && (
                <button className="btn btn--secondary btn--sm" onClick={handleRelease}>{t.bedPanel?.releaseBed || 'Mở khóa'}</button>
              )}
            </div>
          </div>
        </>
      )}

      {showTransfer && selectedBed && selectedBed.patient_id && (
        <TransferModal open patientName={selectedBed.patient_name || ''} patientId={selectedBed.patient_id}
          currentBedId={selectedBed.id} currentBedCode={selectedBed.bed_code} currentRoomId={selectedBed.room_id}
          currentRoomCode={room?.room_code} patientStatus={selectedBed.patient_status || undefined}
          onClose={() => setShowTransfer(false)} onTransferred={handleTransferDone} />
      )}

      {showAssign && (
        <AssignBedModal open bedId={showAssign.id} bedCode={showAssign.bed_code}
          roomBeds={beds}
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
