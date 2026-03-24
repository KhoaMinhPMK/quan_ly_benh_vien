import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchRoom, fetchBedsByRoom, type Room, type Bed } from '../../services/api/medboardApi';
import iconBed from '../../assets/icons/outline/bed.svg';
import './RoomDetailPage.scss';

const BED_STATUS_LABELS: Record<string, string> = {
  empty: 'Trong',
  occupied: 'Co benh nhan',
  locked: 'Khoa',
  cleaning: 'Ve sinh',
};

const BED_STATUS_CLASS: Record<string, string> = {
  empty: 'bed-card--empty',
  occupied: 'bed-card--occupied',
  locked: 'bed-card--locked',
  cleaning: 'bed-card--cleaning',
};

export default function RoomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [roomData, bedData] = await Promise.all([
        fetchRoom(Number(id)),
        fetchBedsByRoom(Number(id)),
      ]);
      setRoom(roomData);
      setBeds(bedData);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [id]);

  if (loading) {
    return (
      <div className="card card--no-hover" style={{ textAlign: 'center', padding: '64px' }}>
        <div className="loading-screen__spinner" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: '#94A3B8' }}>Dang tai thong tin phong...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="card card--no-hover">
        <div className="empty-state">
          <div className="empty-state__title">Khong tim thay phong</div>
          <div className="empty-state__text">Phong khong ton tai hoac da bi xoa.</div>
          <button className="btn btn--secondary" onClick={() => navigate('/rooms')} style={{ marginTop: '16px' }}>
            Quay lai
          </button>
        </div>
      </div>
    );
  }

  const ratio = room.total_beds > 0 ? (room.occupied_beds / room.total_beds) * 100 : 0;
  const isFull = ratio >= 100;
  const isNearFull = ratio >= 80;

  return (
    <div className="room-detail">
      {/* Header */}
      <div className="room-detail__header">
        <div>
          <button className="btn btn--ghost btn--sm" onClick={() => navigate('/rooms')} style={{ marginBottom: '8px' }}>
            ← Quay lai danh sach
          </button>
          <h2 className="page-header__title">{room.name}</h2>
          <p className="page-header__subtitle">
            {room.room_code} · {room.department_name} · Tang {room.floor}
          </p>
        </div>
        <div className="room-detail__header-stats">
          <span className={`badge ${isFull ? 'badge--error' : isNearFull ? 'badge--warning' : 'badge--success'}`}>
            {Math.round(ratio)}% cong suat
          </span>
          <span className={`badge badge--${room.status === 'active' ? 'success' : room.status === 'maintenance' ? 'warning' : 'neutral'}`}>
            {room.status === 'active' ? 'Hoat dong' : room.status === 'maintenance' ? 'Bao tri' : 'Dong'}
          </span>
        </div>
      </div>

      {/* Summary bar */}
      <div className="room-detail__summary">
        <div className="room-detail__summary-item">
          <span className="room-detail__summary-value">{room.total_beds}</span>
          <span className="room-detail__summary-label">Tong giuong</span>
        </div>
        <div className="room-detail__summary-item">
          <span className="room-detail__summary-value room-detail__summary-value--success">{beds.filter(b => b.status === 'empty').length}</span>
          <span className="room-detail__summary-label">Trong</span>
        </div>
        <div className="room-detail__summary-item">
          <span className="room-detail__summary-value room-detail__summary-value--info">{beds.filter(b => b.status === 'occupied').length}</span>
          <span className="room-detail__summary-label">Co BN</span>
        </div>
        <div className="room-detail__summary-item">
          <span className="room-detail__summary-value room-detail__summary-value--muted">{beds.filter(b => b.status === 'locked' || b.status === 'cleaning').length}</span>
          <span className="room-detail__summary-label">Khoa/VS</span>
        </div>
      </div>

      {/* Bed Grid */}
      <div className="room-detail__grid">
        {beds.length === 0 ? (
          <div className="card card--no-hover" style={{ gridColumn: '1 / -1' }}>
            <div className="empty-state">
              <img src={iconBed} alt="" className="empty-state__icon" />
              <div className="empty-state__title">Chua co giuong</div>
              <div className="empty-state__text">Phong nay chua co giuong nao.</div>
            </div>
          </div>
        ) : (
          beds.map((bed) => (
            <div key={bed.id} className={`bed-card ${BED_STATUS_CLASS[bed.status] || ''}`}>
              <div className="bed-card__header">
                <span className="bed-card__code">{bed.bed_code}</span>
                <span className={`bed-card__status-dot bed-card__status-dot--${bed.status}`} />
              </div>
              <div className="bed-card__status-text">
                {BED_STATUS_LABELS[bed.status] || bed.status}
              </div>
              {bed.patient_name && (
                <div className="bed-card__patient">
                  <div className="bed-card__patient-name">{bed.patient_name}</div>
                  <div className="bed-card__patient-code">{bed.patient_code}</div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
