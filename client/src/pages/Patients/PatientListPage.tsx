import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchPatients, fetchWaitingQueue, type Patient, type WaitingPatient } from '../../services/api/medboardApi';
import { useTranslation } from '../../i18n/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import AddPatientModal from './AddPatientModal';
import PatientAssignBedModal from './PatientAssignBedModal';
import PatientDrawer from '../../components/PatientDrawer/PatientDrawer';
import iconSearch from '../../assets/icons/outline/search.svg';
import iconPlus from '../../assets/icons/outline/adjustments-plus.svg';
import iconMapPin from '../../assets/icons/outline/map-pin.svg';
import iconStethoscope from '../../assets/icons/outline/stethoscope.svg';
import iconUserCircle from '../../assets/icons/outline/user-circle.svg';
import iconCalendar from '../../assets/icons/outline/calendar.svg';
import './PatientListPage.scss';

const STATUS_BADGE: Record<string, string> = {
  admitted: 'badge--info', treating: 'badge--success', waiting_discharge: 'badge--warning', discharged: 'badge--neutral',
};

export default function PatientListPage() {
  const { t, lang } = useTranslation();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [waitingQueue, setWaitingQueue] = useState<WaitingPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [filterDoctor, setFilterDoctor] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [assignBedPatientId, setAssignBedPatientId] = useState<number | null>(null);
  const [selectedDrawerPatientId, setSelectedDrawerPatientId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'waiting'>('all');

  const statusLabels: Record<string, string> = {
    admitted: t.patients.statusAdmitted, treating: t.patients.statusTreating,
    waiting_discharge: t.patients.statusWaiting, discharged: t.patients.statusDischarged,
  };

  const loadPatients = () => {
    setLoading(true);
    Promise.all([
      fetchPatients({ status: filterStatus, search: search || undefined, doctor_name: filterDoctor || undefined }),
      fetchWaitingQueue(search || undefined),
    ])
      .then(([p, wq]) => { setPatients(p); setWaitingQueue(wq); })
      .catch(() => { showToast(t.common.error, 'error'); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPatients(); }, [filterStatus, search, filterDoctor]);

  // Auto-refresh every 30s
  useEffect(() => {
    const timer = setInterval(loadPatients, 30000);
    return () => clearInterval(timer);
  }, [filterStatus, search, filterDoctor]);

  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && patients.length > 0) {
      const p = patients.find(x => x.id.toString() === editId);
      if (p) setSelectedDrawerPatientId(p.id);
      setSearchParams(new URLSearchParams());
    }
  }, [searchParams, patients, setSearchParams]);

  const formatDate = (d: string | null) => {
    if (!d) return '--';
    return new Date(d).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US');
  };

  const filteredPatients = patients;

  const formatHoursWaiting = (hours: number) => {
    if (hours < 1) return '< 1h';
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}${t.common.day}`;
  };

  const subtitle = `${filteredPatients.length} ${t.patients.patientsCount}`;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-header__title">{t.patients.title}</h2>
          <p className="page-header__subtitle">{subtitle}</p>
        </div>
        <div className="page-header__actions">
          <button className="btn btn--primary" onClick={() => setShowAddModal(true)}>
            <img src={iconPlus} alt="" className="btn__icon btn__icon--inverted" />
            {t.patients.addPatient}
          </button>
        </div>
      </div>

      {/* Segment Switcher */}
      <div className="patient-segments">
        <button className={`patient-segments__btn ${viewMode === 'all' ? 'patient-segments__btn--active' : ''}`} onClick={() => setViewMode('all')}>
          {t.patients.title} <span className="patient-segments__count">{filteredPatients.length}</span>
        </button>
        <button className={`patient-segments__btn patient-segments__btn--warning ${viewMode === 'waiting' ? 'patient-segments__btn--active' : ''}`} onClick={() => setViewMode('waiting')}>
          {t.patients.waitingList} <span className="patient-segments__count">{waitingQueue.length}</span>
        </button>
      </div>

      {viewMode === 'waiting' ? (
        /* ── Waiting Queue View ── */
        <div className="waiting-queue">
          {loading ? (
            <div className="card patient-list__loading">
              <div className="loading-screen__spinner patient-list__spinner" />
              <p className="patient-list__loading-text">{t.common.loadingData}</p>
            </div>
          ) : waitingQueue.length === 0 ? (
            <div className="card patient-list__empty">
              <p className="patient-list__empty-text">{t.assign.noPatients}</p>
            </div>
          ) : (
            <>
              <div className="card" style={{ padding: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t.patients.patientCode}</th>
                      <th>{t.patients.fullName}</th>
                      <th>{t.patients.diagnosis}</th>
                      <th>{t.patients.doctor}</th>
                      <th>{t.patients.admitted}</th>
                      <th>{t.patients.waitingList}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {waitingQueue.map((p) => (
                      <tr key={p.id}>
                        <td><strong>{p.patient_code}</strong></td>
                        <td>{p.full_name}</td>
                        <td className="data-table__col-diagnosis">{p.diagnosis || '--'}</td>
                        <td>{p.doctor_name || '--'}</td>
                        <td>{formatDate(p.admitted_at)}</td>
                        <td>
                          <span className={`badge ${p.hours_waiting >= 24 ? 'badge--error' : 'badge--warning'}`}>
                            {formatHoursWaiting(p.hours_waiting)}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn--primary btn--sm" onClick={() => setAssignBedPatientId(p.id)}>
                            + {t.patients.assignBed}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile cards for waiting queue */}
              <div className="patient-cards">
                {waitingQueue.map((p) => (
                  <div key={p.id} className="patient-card">
                    <div className="patient-card__header">
                      <span className="patient-card__code">{p.patient_code}</span>
                      <span className={`badge ${p.hours_waiting >= 24 ? 'badge--error' : 'badge--warning'}`}>
                        {formatHoursWaiting(p.hours_waiting)}
                      </span>
                    </div>
                    <div className="patient-card__name">{p.full_name}</div>
                    <div className="patient-card__details">
                      <div className="patient-card__row">
                        <img src={iconStethoscope} alt="" className="patient-card__icon" />
                        <span className="patient-card__diagnosis">{p.diagnosis || '--'}</span>
                      </div>
                      <div className="patient-card__row">
                        <img src={iconUserCircle} alt="" className="patient-card__icon" />
                        <span>{p.doctor_name || '--'}</span>
                      </div>
                      <div className="patient-card__row">
                        <img src={iconCalendar} alt="" className="patient-card__icon" />
                        <span>{formatDate(p.admitted_at)}</span>
                      </div>
                    </div>
                    <div className="patient-card__action">
                      <button className="btn btn--primary btn--sm" onClick={() => setAssignBedPatientId(p.id)}>+ {t.patients.assignBed}</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
      <>

      {waitingQueue.length > 0 && (
        <div className="alert-banner alert-banner--warning patient-list__alert">
          <div className="alert-banner__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div className="alert-banner__content">
            <div className="alert-banner__title">{`${waitingQueue.length} ${t.patients.waitingBedAlert}`}</div>
            <div className="alert-banner__tags">
              {waitingQueue.slice(0, 5).map(p => (
                <span key={p.id} className="alert-banner__tag alert-banner__tag--warning" onClick={() => setAssignBedPatientId(p.id)} style={{ cursor: 'pointer' }}>
                  {p.full_name} <span style={{fontSize:11, opacity:0.8}}>+ {t.patients.assignBed}</span>
                </span>
              ))}
              {waitingQueue.length > 5 && (
                <span className="alert-banner__tag alert-banner__tag--warning alert-banner__tag--more">+{waitingQueue.length - 5} {t.common.more}</span>
              )}
            </div>
            <button className="btn btn--ghost btn--sm" onClick={() => setViewMode('waiting')} style={{ marginTop: 8 }}>
              {t.patients.waitingList} →
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="patient-filters">
        <div className="patient-filters__search">
          <img src={iconSearch} alt="" className="patient-filters__search-icon" />
          <input type="text" className="form-field__input" placeholder={t.patients.searchPlaceholder}
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="form-field__select patient-filters__select" value={filterStatus || ''}
          onChange={(e) => setFilterStatus(e.target.value || undefined)}>
          <option value="">{t.patients.filterStatus}</option>
          <option value="admitted">{t.patients.statusAdmitted}</option>
          <option value="treating">{t.patients.statusTreating}</option>
          <option value="waiting_discharge">{t.patients.statusWaiting}</option>
        </select>
        <input type="text" className="form-field__input patient-filters__select" placeholder={t.patients.allDoctors}
          value={filterDoctor} onChange={(e) => setFilterDoctor(e.target.value)} />
      </div>

      {/* Summary Stats */}
      {!loading && filteredPatients.length > 0 && (
        <div className="patient-stats">
          <div className="patient-stats__item">
            <span className="patient-stats__value">{filteredPatients.length}</span>
            <span className="patient-stats__label">{t.common.total}</span>
          </div>
          <div className="patient-stats__item patient-stats__item--success">
            <span className="patient-stats__value">{filteredPatients.filter(p => p.status === 'treating').length}</span>
            <span className="patient-stats__label">{t.patients.statusTreating}</span>
          </div>
          <div className="patient-stats__item patient-stats__item--info">
            <span className="patient-stats__value">{filteredPatients.filter(p => p.status === 'admitted').length}</span>
            <span className="patient-stats__label">{t.patients.statusAdmitted}</span>
          </div>
          <div className="patient-stats__item patient-stats__item--warning">
            <span className="patient-stats__value">{filteredPatients.filter(p => p.status === 'waiting_discharge').length}</span>
            <span className="patient-stats__label">{t.patients.statusWaiting}</span>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="card patient-list__loading">
          <div className="loading-screen__spinner patient-list__spinner" />
          <p className="patient-list__loading-text">{t.common.loadingData}</p>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="card patient-list__empty">
          <p className="patient-list__empty-text">{t.patients.noPatients}</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="card patient-list__table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t.patients.patientCode}</th>
                  <th>{t.patients.admissionCode}</th>
                  <th>{t.patients.fullName}</th>
                  <th>{t.patients.roomBed}</th>
                  <th>{t.patients.diagnosis}</th>
                  <th>{t.patients.doctor}</th>
                  <th>{t.patients.admitted}</th>
                  <th>{t.patients.expectedDC}</th>
                  <th>{t.patients.status}</th>
                  <th className="data-table__col-action"></th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((p) => (
                  <tr key={p.id} onClick={() => setSelectedDrawerPatientId(p.id)} style={{ cursor: 'pointer' }}>
                    <td><strong>{p.patient_code}</strong></td>
                    <td style={{ fontSize: 12, color: '#6B7280' }}>{p.admission_code || '—'}</td>
                    <td>{p.full_name}</td>
                    <td>{p.room_code && p.bed_code ? `${p.room_code} / ${p.bed_code}` : <span className="text-muted">{t.patients.noBed}</span>}</td>
                    <td className="data-table__col-diagnosis">{p.diagnosis || '--'}</td>
                    <td>{p.doctor_name || '--'}</td>
                    <td>{formatDate(p.admitted_at)}</td>
                    <td style={p.expected_discharge && new Date(p.expected_discharge) <= new Date() ? { color: '#EF4444', fontWeight: 600 } : {}}>
                      {formatDate(p.expected_discharge)}
                      {p.expected_discharge && new Date(p.expected_discharge) <= new Date() && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" style={{verticalAlign:'middle',marginLeft:4}}><path d="M12 9v4M12 17h.01M10.29 3.86l-8.8 15.23A2 2 0 0 0 3.24 22h17.52a2 2 0 0 0 1.75-2.91l-8.8-15.23a2 2 0 0 0-3.42 0z"/></svg>}
                    </td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[p.status] || 'badge--neutral'}`}>
                        {statusLabels[p.status] || p.status}
                      </span>
                    </td>
                    <td>
                      <div className="data-table__actions" style={{ display: 'flex', gap: 4 }}>
                        {!p.bed_id && p.status !== 'discharged' && (
                          <button className="btn btn--primary btn--sm" onClick={(e) => { e.stopPropagation(); setAssignBedPatientId(p.id); }}>+ {t.patients.assignBed}</button>
                        )}
                        <button className="btn btn--ghost btn--sm" onClick={(e) => { e.stopPropagation(); setSelectedDrawerPatientId(p.id); }}>{t.common.edit}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="patient-cards">
            {filteredPatients.map((p) => (
              <div key={p.id} className="patient-card" onClick={() => setSelectedDrawerPatientId(p.id)}>
                <div className="patient-card__header">
                  <span className="patient-card__code">{p.patient_code}</span>
                  <span className={`badge ${STATUS_BADGE[p.status] || 'badge--neutral'}`}>
                    {statusLabels[p.status] || p.status}
                  </span>
                </div>
                <div className="patient-card__name">{p.full_name}</div>
                <div className="patient-card__details">
                  <div className="patient-card__row">
                    <img src={iconMapPin} alt="" className="patient-card__icon" />
                    <span>{p.room_code && p.bed_code ? `${p.room_code} / ${p.bed_code}` : t.patients.noBed}</span>
                  </div>
                  <div className="patient-card__row">
                    <img src={iconStethoscope} alt="" className="patient-card__icon" />
                    <span className="patient-card__diagnosis">{p.diagnosis || '--'}</span>
                  </div>
                  <div className="patient-card__row">
                    <img src={iconUserCircle} alt="" className="patient-card__icon" />
                    <span>{p.doctor_name || '--'}</span>
                  </div>
                  <div className="patient-card__row">
                    <img src={iconCalendar} alt="" className="patient-card__icon" />
                    <span>{formatDate(p.admitted_at)} → {formatDate(p.expected_discharge)}</span>
                  </div>
                </div>
                <div className="patient-card__action">
                  <button className="btn btn--ghost btn--sm">{t.common.edit} ›</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      </>
      )}

      <AddPatientModal open={showAddModal} onClose={() => setShowAddModal(false)} onCreated={() => { loadPatients(); showToast(t.common.success, 'success'); }} />
      <PatientAssignBedModal open={!!assignBedPatientId} patientId={assignBedPatientId} onClose={() => setAssignBedPatientId(null)} onAssigned={() => { setAssignBedPatientId(null); loadPatients(); showToast(t.common.success, 'success'); }} />

      {/* Patient Detail Drawer */}
      {selectedDrawerPatientId && (
        <PatientDrawer
          patientId={selectedDrawerPatientId}
          onClose={() => setSelectedDrawerPatientId(null)}
          onUpdated={() => loadPatients()}
        />
      )}
    </div>
  );
}
