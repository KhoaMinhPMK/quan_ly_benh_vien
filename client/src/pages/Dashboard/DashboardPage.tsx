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

  const greeting = t.dashboard.greeting;
  const dateStr = new Date().toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const quickActions = [
    { to: '/patients', icon: iconPlus, text: t.dashboard.qaAdmit, desc: t.dashboard.qaAdmitDesc },
    { to: '/rooms', icon: iconBed, text: t.dashboard.qaRooms, desc: t.dashboard.qaRoomsDesc },
    { to: '/discharge', icon: iconDoorExit, text: t.dashboard.qaDischarge, desc: t.dashboard.qaDischargeDesc },
  ];

  const bedLabel = t.dashboard.beds;

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
      {(fullRooms.length > 0 || nearFullRooms.length > 0 || waitingList.length > 0) && (
        <div className="dashboard__alerts">
          {fullRooms.length > 0 && (
            <div className="alert-banner alert-banner--error">
              <div className="alert-banner__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              </div>
              <div className="alert-banner__content">
                <div className="alert-banner__title">
                  {`${fullRooms.length} ${t.dashboard.roomsFull}`}
                </div>
                <div className="alert-banner__tags">
                  {fullRooms.map(r => (
                    <Link to={`/rooms/${r.id}`} key={r.id} className="alert-banner__tag alert-banner__tag--error">
                      {r.room_code} · {r.name}
                      <span className="alert-banner__tag-detail">{r.occupied_beds}/{r.total_beds}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {nearFullRooms.length > 0 && (
            <div className="alert-banner alert-banner--warning">
              <div className="alert-banner__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <div className="alert-banner__content">
                <div className="alert-banner__title">
                  {`${nearFullRooms.length} ${t.dashboard.roomsNearFull}`}
                  <span className="alert-banner__subtitle">{t.dashboard.oneBedRemaining}</span>
                </div>
                <div className="alert-banner__tags">
                  {nearFullRooms.map(r => (
                    <Link to={`/rooms/${r.id}`} key={r.id} className="alert-banner__tag alert-banner__tag--warning">
                      {r.room_code} · {r.name}
                      <span className="alert-banner__tag-detail">{r.occupied_beds}/{r.total_beds}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {waitingList.length > 0 && (
            <div className="alert-banner alert-banner--info">
              <div className="alert-banner__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div className="alert-banner__content">
                <div className="alert-banner__title">
                  {`${waitingList.length} ${t.dashboard.patientsWaitingBed}`}
                </div>
                <div className="alert-banner__tags">
                  {waitingList.slice(0, 6).map(p => (
                    <span key={p.id} className="alert-banner__tag alert-banner__tag--info">
                      {p.full_name}
                      <span className="alert-banner__tag-detail">{p.patient_code}</span>
                    </span>
                  ))}
                  {waitingList.length > 6 && (
                    <Link to="/patients" className="alert-banner__tag alert-banner__tag--info alert-banner__tag--more">
                      +{waitingList.length - 6} {t.common.more}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
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
      <h3 className="dashboard__section-title">{t.dashboard.quickActions}</h3>
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
