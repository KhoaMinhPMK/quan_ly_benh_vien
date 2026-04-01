import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { fetchDashboardStats, fetchPatients, type DashboardStats, type Patient } from '../../services/api/medboardApi';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../i18n/LanguageContext';
import AddPatientModal from '../Patients/AddPatientModal';
import PatientAssignBedModal from '../Patients/PatientAssignBedModal';
import iconBed from '../../assets/icons/outline/bed.svg';
import iconUsers from '../../assets/icons/outline/users.svg';
import iconDoorExit from '../../assets/icons/outline/door-exit.svg';
import iconClipboardCheck from '../../assets/icons/outline/clipboard-check.svg';
import iconPlus from '../../assets/icons/outline/adjustments-plus.svg';
import { getRoleLabel } from '../../utils/roleLabels';
import './DashboardPage.scss';



export default function DashboardPage() {
  const { user } = useAuth();
  const { t, lang } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [waitingList, setWaitingList] = useState<Patient[]>([]);
  const isFirstLoad = useRef(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [assignBedPatientId, setAssignBedPatientId] = useState<number | null>(null);
  const [patientsWithNotes, setPatientsWithNotes] = useState<Patient[]>([]);

  const loadData = () => {
    if (isFirstLoad.current) setLoading(true);
    fetchDashboardStats()
      .then(data => setStats(data))
      .catch(() => {})
      .finally(() => { setLoading(false); isFirstLoad.current = false; });
    fetchPatients().then(patients => {
      setWaitingList(patients.filter(p => !p.bed_id));
      setPatientsWithNotes(patients.filter(p => p.notes && p.notes.trim() && p.status !== 'discharged'));
    }).catch(() => {});
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    const handleFocus = () => loadData();
    window.addEventListener('focus', handleFocus);
    return () => { 
      clearInterval(interval); 
      window.removeEventListener('focus', handleFocus); 
    };
  }, []);

  if (!user) return null;



  const getOccupancyLevel = (empty: number, total: number) => {
    if (total === 0) return 'success';
    const ratio = (total - empty) / total;
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
  const fullRooms = stats?.rooms.filter(r => r.total_beds > 0 && r.empty_beds === 0) || [];
  const nearFullRooms = stats?.rooms.filter(r => r.total_beds > 0 && r.empty_beds === 1) || [];

  return (
    <div className="dashboard">
      <div className="dashboard__welcome">
        <h2 className="dashboard__welcome-title">{greeting}, {user.fullName}</h2>
        <p className="dashboard__welcome-text">
          {getRoleLabel(lang, user.role)} - {dateStr}
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
                      <span className="alert-banner__tag-detail">{r.total_beds - r.empty_beds}/{r.total_beds}</span>
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
                      <span className="alert-banner__tag-detail">{r.total_beds - r.empty_beds}/{r.total_beds}</span>
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
                    <button key={p.id} className="alert-banner__tag alert-banner__tag--info"
                      style={{ cursor: 'pointer', border: 'none', textAlign: 'left' }}
                      onClick={() => setAssignBedPatientId(p.id)}>
                      {p.full_name}
                      <span className="alert-banner__tag-detail">{p.patient_code}</span>
                    </button>
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
        <Link to="/patients" className="stat-card stat-card--clickable">
          <div className="stat-card__icon"><img src={iconUsers} alt="" /></div>
          <div>
            <div className="stat-card__value">{loading ? '—' : stats?.total_patients ?? 0}</div>
            <div className="stat-card__label">{t.dashboard.totalPatients}</div>
          </div>
        </Link>

        <Link to="/rooms" className="stat-card stat-card--clickable">
          <div className="stat-card__icon"><img src={iconBed} alt="" /></div>
          <div>
            <div className="stat-card__value">{loading ? '—' : stats?.beds.empty_beds ?? 0}</div>
            <div className="stat-card__label">{t.dashboard.emptyBeds}</div>
          </div>
        </Link>

        <Link to="/discharge" className="stat-card stat-card--clickable">
          <div className="stat-card__icon"><img src={iconDoorExit} alt="" /></div>
          <div>
            <div className="stat-card__value">{loading ? '—' : stats?.discharge_pending ?? 0}</div>
            <div className="stat-card__label">{t.dashboard.dischargePending}</div>
          </div>
        </Link>

        <Link to="/patients" className="stat-card stat-card--clickable">
          <div className="stat-card__icon"><img src={iconClipboardCheck} alt="" /></div>
          <div>
            <div className="stat-card__value">{loading ? '—' : stats?.patients_missing_checklist ?? 0}</div>
            <div className="stat-card__label">{t.dashboard.missingChecklist}</div>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <h3 className="dashboard__section-title">{t.dashboard.quickActions}</h3>
      <div className="dashboard__actions">
        {/* Nhập viện mới — mở modal ngay tại dashboard */}
        <div className="action-card" style={{ cursor: 'pointer' }} onClick={() => setShowAddModal(true)}>
          <div className="action-card__icon"><img src={iconPlus} alt="" /></div>
          <div>
            <div className="action-card__text">{quickActions[0].text}</div>
            <div className="action-card__desc">{quickActions[0].desc}</div>
          </div>
        </div>
        {/* Sơ đồ phòng + Xuất viện vẫn giữ Link */}
        {quickActions.slice(1).map(a => (
          <Link to={a.to} className="action-card" key={a.to}>
            <div className="action-card__icon"><img src={a.icon} alt="" /></div>
            <div>
              <div className="action-card__text">{a.text}</div>
              <div className="action-card__desc">{a.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Patient Notes Overview */}
      {patientsWithNotes.length > 0 && (
        <>
          <h3 className="dashboard__section-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'middle',marginRight:6}}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            {t.dashboard.notesOverview || 'Ghi chú bệnh nhân'}
            <span className="dashboard__section-count">{patientsWithNotes.length}</span>
          </h3>
          <div className="dashboard__notes-grid">
            {patientsWithNotes.slice(0, 6).map(p => (
              <Link to={`/patients?edit=${p.id}`} key={p.id} className="dashboard__note-card">
                <div className="dashboard__note-card-header">
                  <strong>{p.full_name}</strong>
                  <span className="dashboard__note-card-code">{p.patient_code}</span>
                </div>
                <p className="dashboard__note-card-text">{p.notes!.length > 120 ? p.notes!.substring(0, 120) + '...' : p.notes}</p>
                <div className="dashboard__note-card-meta">
                  {p.room_code && <span>{p.room_code}</span>}
                  {p.doctor_name && <span>{p.doctor_name}</span>}
                </div>
              </Link>
            ))}
          </div>
          {patientsWithNotes.length > 6 && (
            <Link to="/patients" className="btn btn--ghost btn--sm" style={{ marginTop: 8 }}>
              {t.common.viewAll || 'Xem tất cả'} ({patientsWithNotes.length}) →
            </Link>
          )}
        </>
      )}

      {/* Room Occupancy */}
      {stats && stats.rooms.length > 0 && (
        <>
          <h3 className="dashboard__section-title">{t.dashboard.occupancyByRoom}</h3>
          <div className="dashboard__room-grid">
            {stats.rooms.map((r) => {
              const totalBeds = Number(r.total_beds) || 0;
              const emptyBeds = Number(r.empty_beds) || 0;
              // Use occupied_beds if available, otherwise fallback to total-empty
              const usedBeds = r.occupied_beds !== undefined
                ? Number(r.occupied_beds) || 0
                : totalBeds - emptyBeds;
              const ratio = totalBeds > 0 ? (usedBeds / totalBeds) * 100 : 0;
              const level = getOccupancyLevel(emptyBeds, totalBeds);
              return (
                <Link to={`/rooms/${r.id}`} key={r.id} className="room-card" style={{ textDecoration: 'none' }}>
                  <div className="room-card__header">
                    <span className="room-card__name">{r.name}</span>
                    <span className="room-card__code">{r.room_code}</span>
                  </div>
                  <div className="room-card__dept">{r.department_name}</div>
                  <div className="room-card__progress">
                    <div className="room-card__progress-bar">
                      <div
                        className={`room-card__progress-fill room-card__progress-fill--${level}`}
                        style={{ width: `${Math.min(ratio, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="room-card__stats">
                    <span><span className="room-card__stat-value">{usedBeds}</span>/{totalBeds} {bedLabel}</span>
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

      {/* Modals */}
      <AddPatientModal open={showAddModal} onClose={() => setShowAddModal(false)} onCreated={() => { setShowAddModal(false); loadData(); }} />
      <PatientAssignBedModal open={!!assignBedPatientId} patientId={assignBedPatientId} onClose={() => setAssignBedPatientId(null)} onAssigned={() => { setAssignBedPatientId(null); loadData(); }} />
    </div>
  );
}
