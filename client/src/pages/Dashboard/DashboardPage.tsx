import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchDashboardStats, fetchPatients, type DashboardStats, type Patient } from '../../services/api/medboardApi';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../i18n/LanguageContext';
import iconBed from '../../assets/icons/outline/bed.svg';
import iconUsers from '../../assets/icons/outline/users.svg';
import iconDoorExit from '../../assets/icons/outline/door-exit.svg';
import iconClipboardCheck from '../../assets/icons/outline/clipboard-check.svg';
import iconPlus from '../../assets/icons/outline/adjustments-plus.svg';
import './DashboardPage.scss';

const ROLE_LABELS_VI: Record<string, string> = {
  admin: 'Quản trị viên', doctor: 'Bác sĩ', nurse: 'Điều dưỡng',
  records_staff: 'Nhân viên hồ sơ', receptionist: 'Lễ tân',
};
const ROLE_LABELS_EN: Record<string, string> = {
  admin: 'Administrator', doctor: 'Doctor', nurse: 'Nurse',
  records_staff: 'Records Staff', receptionist: 'Receptionist',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { t, lang } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [waitingList, setWaitingList] = useState<Patient[]>([]);

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
    // Also fetch patients without beds
    fetchPatients({ status: 'admitted' }).then(patients => {
      setWaitingList(patients.filter(p => !p.bed_id));
    }).catch(() => {});
  }, []);

  if (!user) return null;

  const roleLabels = lang === 'vi' ? ROLE_LABELS_VI : ROLE_LABELS_EN;

  const getOccupancyLevel = (occupied: number, total: number) => {
    if (total === 0) return 'success';
    const ratio = occupied / total;
    if (ratio >= 1) return 'error';
    if (ratio >= 0.8) return 'warning';
    return 'success';
  };

  const greeting = lang === 'vi' ? 'Xin chào' : 'Hello';
  const dateStr = new Date().toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const quickActions = lang === 'vi' ? [
    { to: '/patients', icon: iconPlus, text: 'Tiếp nhận bệnh nhân', desc: 'Thêm bệnh nhân mới vào hệ thống' },
    { to: '/rooms', icon: iconBed, text: 'Quản lý phòng giường', desc: 'Xem trạng thái và xếp giường' },
    { to: '/discharge', icon: iconDoorExit, text: 'Ra viện hôm nay', desc: 'Kiểm tra hồ sơ và xác nhận' },
  ] : [
    { to: '/patients', icon: iconPlus, text: 'Admit Patient', desc: 'Add new patient to the system' },
    { to: '/rooms', icon: iconBed, text: 'Rooms & Beds', desc: 'View status and assign beds' },
    { to: '/discharge', icon: iconDoorExit, text: 'Discharge Today', desc: 'Check records and confirm' },
  ];

  const bedLabel = lang === 'vi' ? 'giường' : 'beds';

  // Detect full rooms for alerts
  const fullRooms = stats?.rooms.filter(r => r.total_beds > 0 && r.occupied_beds >= r.total_beds) || [];
  const nearFullRooms = stats?.rooms.filter(r => r.total_beds > 0 && r.occupied_beds >= r.total_beds - 1 && r.occupied_beds < r.total_beds) || [];

  return (
    <div className="dashboard">
      <div className="dashboard__welcome">
        <h2 className="dashboard__welcome-title">{greeting}, {user.fullName}</h2>
        <p className="dashboard__welcome-text">
          {roleLabels[user.role] || user.role} — {dateStr}
        </p>
      </div>

      {/* Alerts */}
      {fullRooms.length > 0 && (
        <div className="card" style={{ background: '#FEE2E2', border: '1px solid #EF4444', marginBottom: 12, padding: '12px 16px' }}>
          <div style={{ fontWeight: 600, color: '#991B1B', marginBottom: 2 }}>
            🔴 {lang === 'vi' ? `${fullRooms.length} phòng đã đầy` : `${fullRooms.length} rooms at full capacity`}
          </div>
          <div style={{ fontSize: 13, color: '#991B1B' }}>{fullRooms.map(r => `${r.name} (${r.room_code})`).join(', ')}</div>
        </div>
      )}
      {nearFullRooms.length > 0 && (
        <div className="card" style={{ background: '#FEF3C7', border: '1px solid #F59E0B', marginBottom: 12, padding: '12px 16px' }}>
          <div style={{ fontWeight: 600, color: '#92400E', marginBottom: 2 }}>
            ⚠️ {lang === 'vi' ? `${nearFullRooms.length} phòng sắp đầy (còn 1 giường)` : `${nearFullRooms.length} rooms nearly full (1 bed left)`}
          </div>
          <div style={{ fontSize: 13, color: '#92400E' }}>{nearFullRooms.map(r => `${r.name} (${r.room_code})`).join(', ')}</div>
        </div>
      )}
      {waitingList.length > 0 && (
        <div className="card" style={{ background: '#DBEAFE', border: '1px solid #3B82F6', marginBottom: 12, padding: '12px 16px' }}>
          <div style={{ fontWeight: 600, color: '#1E40AF', marginBottom: 2 }}>
            🛏️ {lang === 'vi' ? `${waitingList.length} bệnh nhân chờ xếp giường` : `${waitingList.length} patients waiting for bed assignment`}
          </div>
          <div style={{ fontSize: 13, color: '#1E40AF' }}>
            {waitingList.slice(0, 5).map(p => `${p.full_name} (${p.patient_code})`).join(', ')}{waitingList.length > 5 ? '...' : ''}
          </div>
          <Link to="/patients" style={{ fontSize: 12, color: '#2563EB', marginTop: 4, display: 'inline-block' }}>
            {lang === 'vi' ? 'Xem danh sách →' : 'View list →'}
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="dashboard__stats">
        <div className="stat-card">
          <div className="stat-card__icon"><img src={iconUsers} alt="" /></div>
          <div>
            <div className="stat-card__value">{loading ? '—' : stats?.total_patients ?? 0}</div>
            <div className="stat-card__label">{t.dashboard.totalPatients}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon"><img src={iconBed} alt="" /></div>
          <div>
            <div className="stat-card__value">{loading ? '—' : stats?.beds.empty_beds ?? 0}</div>
            <div className="stat-card__label">{t.dashboard.emptyBeds}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon"><img src={iconDoorExit} alt="" /></div>
          <div>
            <div className="stat-card__value">{loading ? '—' : stats?.discharge_pending ?? 0}</div>
            <div className="stat-card__label">{t.dashboard.dischargePending}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon"><img src={iconClipboardCheck} alt="" /></div>
          <div>
            <div className="stat-card__value">{loading ? '—' : stats?.patients_missing_checklist ?? 0}</div>
            <div className="stat-card__label">{t.dashboard.missingChecklist}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <h3 className="dashboard__section-title">{lang === 'vi' ? 'Thao tác nhanh' : 'Quick Actions'}</h3>
      <div className="dashboard__actions">
        {quickActions.map(a => (
          <Link to={a.to} className="action-card" key={a.to}>
            <div className="action-card__icon"><img src={a.icon} alt="" /></div>
            <div>
              <div className="action-card__text">{a.text}</div>
              <div className="action-card__desc">{a.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Room Occupancy */}
      {stats && stats.rooms.length > 0 && (
        <>
          <h3 className="dashboard__section-title">{t.dashboard.occupancyByRoom}</h3>
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
                    <span><span className="room-card__stat-value">{r.occupied_beds}</span>/{r.total_beds} {bedLabel}</span>
                    <span className={`badge badge--${level}`}>{Math.round(ratio)}%</span>
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
            <div className="empty-state__title">{t.dashboard.noDataYet}</div>
            <div className="empty-state__text">{t.dashboard.noDataDesc}</div>
          </div>
        </div>
      )}
    </div>
  );
}
