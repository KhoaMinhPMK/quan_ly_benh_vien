import { useState, useEffect } from 'react';
import { fetchDashboardStats, type DashboardStats } from '../../services/api/medboardApi';
import { useAuth } from '../../contexts/AuthContext';
import iconBed from '../../assets/icons/outline/bed.svg';
import iconUsers from '../../assets/icons/outline/users.svg';
import iconDoorExit from '../../assets/icons/outline/door-exit.svg';
import iconClipboardCheck from '../../assets/icons/outline/clipboard-check.svg';
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

  return (
    <div className="dashboard">
      <div className="dashboard__welcome">
        <h2 className="dashboard__welcome-title">
          Xin chao, {user.fullName}
        </h2>
        <p className="dashboard__welcome-text">
          {ROLE_LABELS[user.role] || user.role} -- {user.email}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="dashboard__stats">
        <div className="stat-card">
          <div className="stat-card__icon" style={{ background: '#EFF6FF' }}>
            <img src={iconUsers} alt="" style={{ opacity: 0.8 }} />
          </div>
          <div>
            <div className="stat-card__value">{loading ? '--' : stats?.total_patients ?? 0}</div>
            <div className="stat-card__label">Benh nhan noi tru</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon" style={{ background: '#ECFDF5' }}>
            <img src={iconBed} alt="" style={{ opacity: 0.8 }} />
          </div>
          <div>
            <div className="stat-card__value">{loading ? '--' : stats?.beds.empty_beds ?? 0}</div>
            <div className="stat-card__label">Giuong trong</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon" style={{ background: '#FFFBEB' }}>
            <img src={iconDoorExit} alt="" style={{ opacity: 0.8 }} />
          </div>
          <div>
            <div className="stat-card__value">{loading ? '--' : stats?.discharge_pending ?? 0}</div>
            <div className="stat-card__label">Du kien ra vien</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon" style={{ background: '#FEF2F2' }}>
            <img src={iconClipboardCheck} alt="" style={{ opacity: 0.8 }} />
          </div>
          <div>
            <div className="stat-card__value">{loading ? '--' : stats?.patients_missing_checklist ?? 0}</div>
            <div className="stat-card__label">Ho so can kiem tra</div>
          </div>
        </div>
      </div>

      {/* Room occupancy */}
      {stats && stats.rooms.length > 0 && (
        <div className="card">
          <div className="card__header">
            <h3 className="card__title">Cong suat phong</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Ma phong</th>
                <th>Ten phong</th>
                <th>Giuong</th>
                <th>Cong suat</th>
              </tr>
            </thead>
            <tbody>
              {stats.rooms.map((r) => {
                const ratio = r.total_beds > 0 ? (r.occupied_beds / r.total_beds) * 100 : 0;
                const badgeClass = ratio >= 100 ? 'badge--error' : ratio >= 80 ? 'badge--warning' : 'badge--success';
                return (
                  <tr key={r.id}>
                    <td><strong>{r.room_code}</strong></td>
                    <td>{r.name}</td>
                    <td>{r.occupied_beds}/{r.total_beds}</td>
                    <td><span className={`badge ${badgeClass}`}>{Math.round(ratio)}%</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && (!stats || stats.rooms.length === 0) && (
        <div className="dashboard__grid">
          <div className="card">
            <div className="card__header">
              <h3 className="card__title">Phong gan day</h3>
            </div>
            <p style={{ color: '#6B7280', fontSize: '14px' }}>
              Chua co du lieu. He thong se hien thi trang thai phong khi duoc cau hinh.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
