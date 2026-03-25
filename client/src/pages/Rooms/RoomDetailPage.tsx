import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchRoom, fetchBedsByRoom, releaseBed, type Room, type Bed } from '../../services/api/medboardApi';
import BedVisual from '../../components/BedVisual/BedVisual';
import BedDetailPanel from '../../components/BedDetailPanel/BedDetailPanel';
import TransferModal from '../../components/TransferModal/TransferModal';
import AssignBedModal from '../../components/AssignBedModal/AssignBedModal';
import './RoomDetailPage.scss';

const STATUS_ORDER: Record<string, number> = { occupied: 0, empty: 1, cleaning: 2, locked: 3 };

export default function RoomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [loading, setLoading] = useState(true);

  // Panel / Modal state
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showAssign, setShowAssign] = useState<Bed | null>(null);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [roomData, bedData] = await Promise.all([
        fetchRoom(Number(id)),
        fetchBedsByRoom(Number(id)),
      ]);
      setRoom(roomData);
      // Sort: occupied first, then empty, cleaning, locked
      setBeds([...bedData].sort((a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9)));
    } catch {
      /* handled by empty state */
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  // Auto-refresh every 30s
  useEffect(() => {
    const timer = setInterval(loadData, 30000);
    return () => clearInterval(timer);
  }, [loadData]);

  const handleBedClick = (bed: Bed) => {
    if (bed.status === 'empty') {
      setShowAssign(bed);
    } else {
      setSelectedBed(bed);
    }
  };

  const handleRelease = async () => {
    if (!selectedBed) return;
    if (!window.confirm(`Giải phóng giường ${selectedBed.bed_code}?`)) return;
    try {
      await releaseBed(selectedBed.id);
      setSelectedBed(null);
      loadData();
    } catch { /* ignore */ }
  };

  const handleTransferDone = () => {
    setShowTransfer(false);
    setSelectedBed(null);
    loadData();
  };

  const handleAssignDone = () => {
    setShowAssign(null);
    loadData();
  };

  // Stats
  const totalBeds = beds.length;
  const emptyBeds = beds.filter(b => b.status === 'empty').length;
  const occupiedBeds = beds.filter(b => b.status === 'occupied').length;
  const otherBeds = totalBeds - emptyBeds - occupiedBeds;
  const ratio = totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0;
  const isFull = ratio >= 100;
  const isNearFull = ratio >= 80;

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '64px' }}>
        <div className="loading-screen__spinner" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: '#94A3B8' }}>Đang tải thông tin phòng...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-state__title">Không tìm thấy phòng</div>
          <div className="empty-state__text">Phòng không tồn tại hoặc đã bị xóa.</div>
          <button className="btn btn--secondary" onClick={() => navigate('/rooms')} style={{ marginTop: '16px' }}>
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="room-detail">
      {/* Header */}
      <div className="room-detail__header">
        <div>
          <button className="btn btn--ghost btn--sm" onClick={() => navigate('/rooms')} style={{ marginBottom: '8px' }}>
            ← Quay lại danh sách
          </button>
          <h2 className="page-header__title">{room.name}</h2>
          <p className="page-header__subtitle">
            {room.room_code} · {room.department_name} · Tầng {room.floor}
          </p>
        </div>
        <div className="room-detail__header-stats">
          <span className={`badge ${isFull ? 'badge--error' : isNearFull ? 'badge--warning' : 'badge--success'}`}>
            {Math.round(ratio)}% công suất
          </span>
          <span className={`badge badge--${room.status === 'active' ? 'success' : room.status === 'maintenance' ? 'warning' : 'neutral'}`}>
            {room.status === 'active' ? 'Hoạt động' : room.status === 'maintenance' ? 'Bảo trì' : 'Đóng'}
          </span>
        </div>
      </div>

      {/* Summary bar */}
      <div className="room-detail__summary">
        <div className="room-detail__summary-item">
          <span className="room-detail__summary-value">{totalBeds}</span>
          <span className="room-detail__summary-label">Tổng giường</span>
        </div>
        <div className="room-detail__summary-item">
          <span className="room-detail__summary-value room-detail__summary-value--occupied">{occupiedBeds}</span>
          <span className="room-detail__summary-label">Có BN</span>
        </div>
        <div className="room-detail__summary-item">
          <span className="room-detail__summary-value room-detail__summary-value--success">{emptyBeds}</span>
          <span className="room-detail__summary-label">Trống</span>
        </div>
        <div className="room-detail__summary-item">
          <span className="room-detail__summary-value room-detail__summary-value--muted">{otherBeds}</span>
          <span className="room-detail__summary-label">Khoá/VS</span>
        </div>
        {/* Progress bar */}
        <div className="room-detail__summary-bar">
          <div className="room-detail__summary-bar-track">
            <div className="room-detail__summary-bar-fill"
              style={{ width: `${Math.min(ratio, 100)}%`, background: isFull ? '#EF4444' : isNearFull ? '#F59E0B' : '#10B981' }} />
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="room-detail__legend">
        <span className="room-detail__legend-item"><span className="room-detail__legend-dot room-detail__legend-dot--occupied" />Có BN</span>
        <span className="room-detail__legend-item"><span className="room-detail__legend-dot room-detail__legend-dot--empty" />Trống</span>
        <span className="room-detail__legend-item"><span className="room-detail__legend-dot room-detail__legend-dot--cleaning" />Vệ sinh</span>
        <span className="room-detail__legend-item"><span className="room-detail__legend-dot room-detail__legend-dot--locked" />Khoá</span>
      </div>

      {/* Bed Grid — Visual */}
      <div className="room-detail__grid">
        {beds.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="empty-state">
              <div className="empty-state__title">Chưa có giường</div>
              <div className="empty-state__text">Phòng này chưa có giường nào.</div>
            </div>
          </div>
        ) : (
          beds.map((bed) => (
            <BedVisual
              key={bed.id}
              bedCode={bed.bed_code}
              status={bed.status as 'empty' | 'occupied' | 'locked' | 'cleaning'}
              patientName={bed.patient_name}
              patientCode={bed.patient_code}
              diagnosis={bed.diagnosis}
              doctorName={bed.doctor_name}
              daysAdmitted={bed.days_admitted}
              patientStatus={bed.patient_status}
              onClick={() => handleBedClick(bed)}
            />
          ))
        )}
      </div>

      {/* Bed Detail Panel (Slide-in) */}
      {selectedBed && (
        <BedDetailPanel
          bedId={selectedBed.id}
          bedCode={selectedBed.bed_code}
          bedStatus={selectedBed.status}
          patient={selectedBed.patient_id ? {
            id: selectedBed.patient_id,
            patient_code: selectedBed.patient_code || '',
            full_name: selectedBed.patient_name || '',
            date_of_birth: selectedBed.date_of_birth || undefined,
            gender: selectedBed.gender || undefined,
            phone: selectedBed.phone || undefined,
            diagnosis: selectedBed.diagnosis || undefined,
            doctor_name: selectedBed.doctor_name || undefined,
            admitted_at: selectedBed.admitted_at || undefined,
            expected_discharge: selectedBed.expected_discharge || undefined,
            status: selectedBed.patient_status || undefined,
            notes: selectedBed.notes || undefined,
          } : null}
          onClose={() => setSelectedBed(null)}
          onTransfer={() => setShowTransfer(true)}
          onRelease={handleRelease}
          onAssign={() => setShowAssign(selectedBed)}
        />
      )}

      {/* Transfer Modal */}
      {showTransfer && selectedBed && selectedBed.patient_id && (
        <TransferModal
          open
          patientName={selectedBed.patient_name || ''}
          patientId={selectedBed.patient_id}
          currentBedId={selectedBed.id}
          currentBedCode={selectedBed.bed_code}
          currentRoomId={selectedBed.room_id}
          onClose={() => setShowTransfer(false)}
          onTransferred={handleTransferDone}
        />
      )}

      {/* Assign Modal */}
      {showAssign && (
        <AssignBedModal
          open
          bedId={showAssign.id}
          bedCode={showAssign.bed_code}
          onClose={() => setShowAssign(null)}
          onAssigned={handleAssignDone}
        />
      )}
    </div>
  );
}
