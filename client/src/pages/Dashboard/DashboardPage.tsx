import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchDashboardStats, type DashboardStats } from '../../services/api/medboardApi';
import { useAuth } from '../../contexts/AuthContext';
import iconBed from '../../assets/icons/outline/bed.svg';
import iconUsers from '../../assets/icons/outline/users.svg';
import iconDoorExit from '../../assets/icons/outline/door-exit.svg';
import iconClipboardCheck from '../../assets/icons/outline/clipboard-check.svg';
import iconPlus from '../../assets/icons/outline/adjustments-plus.svg';
import './DashboardPage.scss';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Quan tri vien',
  doctor: 'Bac si',
  nurse: 'Dieu duong',
  records_staff: 'Nhan vien ho so',
  receptionist: 'Le tan',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!user) return null;

  const getOccupancyLevel = (occupied: number, total: number) => {
    if (total === 0) return 'success';
    const ratio = occupied / total;
    if (ratio >= 1) return 'error';
    if (ratio >= 0.8) return 'warning';
    return 'success';
  };

  return (
    <div className="dashboard">
      <div className="dashboard__welcome">
        <h2 className="dashboard__welcome-title">
          Xin chao, {user.fullName}
        </h2>
        <p className="dashboard__welcome-text">
          {ROLE_LABELS[user.role] || user.role} — {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="dashboard__stats">
        <div className="stat-card">
          <div className="stat-card__icon">
            <img src={iconUsers} alt="" />
          </div>
          <div>
            <div className="stat-card__value">{loading ? '—' : stats?.total_patients ?? 0}</div>
            <div className="stat-card__label">Benh nhan noi tru</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon">
            <img src={iconBed} alt="" />
          </div>
          <div>
            <div className="stat-card__value">{loading ? '—' : stats?.beds.empty_beds ?? 0}</div>
            <div className="stat-card__label">Giuong trong</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon">
            <img src={iconDoorExit} alt="" />
          </div>
          <div>
            <div className="stat-card__value">{loading ? '—' : stats?.discharge_pending ?? 0}</div>
            <div className="stat-card__label">Du kien ra vien</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon">
            <img src={iconClipboardCheck} alt="" />
          </div>
          <div>
            <div className="stat-card__value">{loading ? '—' : stats?.patients_missing_checklist ?? 0}</div>
            <div className="stat-card__label">Ho so can kiem tra</div>
          </div>
        </div>
      </div>

      {/* Quick Actions — uniform icon bg */}
      <h3 className="dashboard__section-title">Thao tac nhanh</h3>
      <div className="dashboard__actions">
        <Link to="/patients" className="action-card">
          <div className="action-card__icon">
            <img src={iconPlus} alt="" />
          </div>
          <div>
            <div className="action-card__text">Tiep nhan benh nhan</div>
            <div className="action-card__desc">Them benh nhan moi vao he thong</div>
          </div>
        </Link>
        <Link to="/rooms" className="action-card">
          <div className="action-card__icon">
            <img src={iconBed} alt="" />
          </div>
          <div>
            <div className="action-card__text">Quan ly phong giuong</div>
            <div className="action-card__desc">Xem trang thai va xep giuong</div>
          </div>
        </Link>
        <Link to="/discharge" className="action-card">
          <div className="action-card__icon">
            <img src={iconDoorExit} alt="" />
          </div>
          <div>
            <div className="action-card__text">Ra vien hom nay</div>
            <div className="action-card__desc">Kiem tra ho so va xac nhan</div>
          </div>
        </Link>
      </div>

      {/* Room Occupancy */}
      {stats && stats.rooms.length > 0 && (
        <>
          <h3 className="dashboard__section-title">Cong suat phong</h3>
          <div className="dashboard__room-grid">
            {stats.rooms.map((r) => {
              const ratio = r.total_beds > 0 ? (r.occupied_beds / r.total_beds) * 100 : 0;
              const level = getOccupancyLevel(r.occupied_beds, r.total_beds);
              return (
                <Link to={`/rooms/${r.id}`} key={r.id} className="room-card" style={{ textDecoration: 'none' }}>
                  <div className="room-card__header">
                    <span className="room-card__name">{r.name}</span>
                    <span className="room-card__code">{r.room_code}</span>
                  </div>
                  <div className="room-card__progress">
                    <div className="room-card__progress-bar">
                      <div
                        className={`room-card__progress-fill room-card__progress-fill--${level}`}
                        style={{ width: `${Math.min(ratio, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="room-card__stats">
                    <span><span className="room-card__stat-value">{r.occupied_beds}</span>/{r.total_beds} giuong</span>
                    <span className={`badge badge--${level}`}>
                      {Math.round(ratio)}%
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}

      {!loading && (!stats || stats.rooms.length === 0) && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state__title">Chua co du lieu</div>
            <div className="empty-state__text">He thong se hien thi trang thai phong khi duoc cau hinh.</div>
          </div>
        </div>
      )}
    </div>
  );
}
