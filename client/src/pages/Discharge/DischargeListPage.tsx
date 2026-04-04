import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDischargeList, fetchChecklists, toggleChecklist, dischargePatient, fetchDepartments, type Patient, type ChecklistItem, type Department } from '../../services/api/medboardApi';
import { useTranslation } from '../../i18n/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import PatientDrawer from '../../components/PatientDrawer/PatientDrawer';
import iconClipboardCheck from '../../assets/icons/outline/clipboard-check.svg';
import iconMapPin from '../../assets/icons/outline/map-pin.svg';
import iconCalendar from '../../assets/icons/outline/calendar.svg';
import './DischargeListPage.scss';

export default function DischargeListPage() {
  const { t, lang } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [checklistLoading, setChecklistLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [discharging, setDischarging] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [dateFilter, setDateFilter] = useState<string>('');
  const [drawerPatientId, setDrawerPatientId] = useState<number | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [deptFilter, setDeptFilter] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const statusLabels: Record<string, string> = {
    treating: t.patients.statusTreating, waiting_discharge: t.patients.statusWaiting,
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const loadList = () => {
    setLoading(true);
    fetchDischargeList(dateFilter || undefined, {
      department_id: deptFilter ? Number(deptFilter) : undefined,
      doctor_name: doctorFilter || undefined,
      search: searchFilter || undefined,
    })
      .then(setPatients)
      .catch(() => { showToast(t.common.error, 'error'); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadList(); }, [dateFilter, deptFilter, doctorFilter, searchFilter]);

  useEffect(() => { fetchDepartments().then(setDepartments).catch(() => {}); }, []);

  // Auto-refresh every 30s
  useEffect(() => {
    const timer = setInterval(loadList, 30000);
    return () => clearInterval(timer);
  }, [dateFilter]);

  const openChecklist = async (patient: Patient) => {
    setSelectedPatient(patient);
    setChecklistLoading(true);
    try {
      const items = await fetchChecklists(patient.id);
      setChecklists(items);
    } catch {
      setChecklists([]);
      showToast(t.common.error, 'error');
    }
    finally { setChecklistLoading(false); }
  };

  const handleToggle = async (templateId: number, completed: boolean) => {
    if (!selectedPatient) return;
    setTogglingId(templateId);
    try {
      const updated = await toggleChecklist(selectedPatient.id, templateId, completed);
      setChecklists(updated);
    } catch {
      showToast(t.common.error, 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const allChecked = checklists.length > 0 && checklists.every((c) => c.is_completed);

  const handleDischargeClick = () => {
    if (!selectedPatient) return;
    if (!allChecked) {
      showToast(t.discharge.blockDischargeMsg, 'warning');
      return;
    }
    setConfirmOpen(true);
  };

  const handleDischargeConfirm = async () => {
    if (!selectedPatient) return;
    setDischarging(true);
    try {
      await dischargePatient(selectedPatient.id);
      setSelectedPatient(null);
      setConfirmOpen(false);
      showToast(t.common.success, 'success');
      loadList();
    } catch {
      showToast(t.common.error, 'error');
    } finally {
      setDischarging(false);
    }
  };

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US') : '--';

  const completedCount = checklists.filter(c => c.is_completed).length;
  const progressPct = checklists.length > 0 ? Math.round((completedCount / checklists.length) * 100) : 0;

  return (
    <div className="discharge">
      <div className="page-header">
        <div>
          <h2 className="page-header__title">{t.discharge.title}</h2>
          <p className="page-header__subtitle">{t.discharge.subtitle}</p>
        </div>
      </div>

      {/* Date filter chips */}
      <div className="discharge__date-filters">
        <button className={`discharge__date-chip ${!dateFilter ? 'discharge__date-chip--active' : ''}`} onClick={() => setDateFilter('')}>
          {t.common.all}
        </button>
        <button className={`discharge__date-chip ${dateFilter === todayStr ? 'discharge__date-chip--active' : ''}`} onClick={() => setDateFilter(todayStr)}>
          {t.common.today}
        </button>
        <button className={`discharge__date-chip ${dateFilter === tomorrowStr ? 'discharge__date-chip--active' : ''}`} onClick={() => setDateFilter(tomorrowStr)}>
          {t.common.tomorrow}
        </button>
        <input
          type="date"
          className="discharge__date-input"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
        <select className="discharge__date-input" style={{ maxWidth: 160 }} value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
          <option value="">{t.rooms.filterDepartment}</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <input
          type="text"
          className="discharge__date-input"
          placeholder={t.discharge.filterDoctor}
          value={doctorFilter}
          onChange={e => setDoctorFilter(e.target.value)}
          style={{ maxWidth: 160 }}
        />
        <input
          type="text"
          className="discharge__date-input"
          placeholder={t.common.search}
          value={searchFilter}
          onChange={e => setSearchFilter(e.target.value)}
          style={{ maxWidth: 180 }}
        />
      </div>

      <div className="discharge__layout">
        {/* Left: patient list */}
        <div className="discharge__list">
          {loading ? (
            <div className="card discharge__empty">
              <div className="loading-screen__spinner discharge__spinner" />
              <p>{t.common.loading}</p>
            </div>
          ) : patients.length === 0 ? (
            <div className="card discharge__empty">
              <p>{t.discharge.noDischarge}</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="card discharge__table-card">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t.discharge.patientCode}</th>
                      <th>{t.patients.admissionCode}</th>
                      <th>{t.discharge.fullName}</th>
                      <th>{t.discharge.room}</th>
                      <th>{t.discharge.expectedDate}</th>
                      <th>{t.common.status}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((p) => (
                      <tr key={p.id} className={selectedPatient?.id === p.id ? 'discharge__row--active' : ''}>
                        <td><strong>{p.patient_code}</strong></td>
                        <td style={{ fontSize: 12, color: '#6B7280' }}>{p.admission_code || '—'}</td>
                        <td><button className="btn btn--ghost btn--sm" style={{ padding: 0, fontWeight: 500 }} onClick={() => setDrawerPatientId(p.id)}>{p.full_name}</button></td>
                        <td>{p.room_code ? <button className="btn btn--ghost btn--sm" style={{ padding: 0 }} onClick={() => navigate(`/rooms/${(p as any).room_id || ''}`)}>{p.room_code}</button> : '--'}</td>
                        <td>{formatDate(p.expected_discharge)}</td>
                        <td>
                          <span className={`badge ${p.status === 'waiting_discharge' ? 'badge--warning' : 'badge--info'}`}>
                            {statusLabels[p.status] || p.status}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn--secondary btn--sm" onClick={() => openChecklist(p)}>
                            <img src={iconClipboardCheck} alt="" className="discharge__check-icon" />
                            {t.discharge.checklist}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="discharge-cards">
                {patients.map((p) => (
                  <div
                    key={p.id}
                    className={`discharge-card ${selectedPatient?.id === p.id ? 'discharge-card--active' : ''}`}
                    onClick={() => openChecklist(p)}
                  >
                    <div className="discharge-card__header">
                      <span className="discharge-card__code">{p.patient_code}</span>
                      <span className={`badge ${p.status === 'waiting_discharge' ? 'badge--warning' : 'badge--info'}`}>
                        {statusLabels[p.status] || p.status}
                      </span>
                    </div>
                    <div className="discharge-card__name">{p.full_name}</div>
                    <div className="discharge-card__meta">
                      <span><img src={iconMapPin} alt="" className="discharge-card__icon" /> {p.room_code || '--'}</span>
                      <span><img src={iconCalendar} alt="" className="discharge-card__icon" /> {formatDate(p.expected_discharge)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right: checklist panel */}
        {selectedPatient && (
          <div className="discharge__panel">
            <div className="card">
              <div className="card__header">
                <h3 className="card__title">{t.discharge.checklistTitle}: {selectedPatient.full_name}</h3>
              </div>

              {/* Clinical Summary */}
              <div style={{ padding: '12px 20px', background: 'var(--bg-secondary, #F8FAFC)', borderBottom: '1px solid var(--border-color, #E2E8F0)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', fontSize: 13 }}>
                <div><span style={{ color: '#6B7280' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'middle',marginRight:4}}><path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16"/></svg>{t.discharge.diagnosisLabel}</span> <strong>{selectedPatient.diagnosis || '—'}</strong></div>
                <div><span style={{ color: '#6B7280' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'middle',marginRight:4}}><path d="M8 7a4 4 0 108 0 4 4 0 00-8 0M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/></svg>{t.discharge.doctorLabel}</span> <strong>{selectedPatient.doctor_name || '—'}</strong></div>
                <div><span style={{ color: '#6B7280' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'middle',marginRight:4}}><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M16 3v4M8 3v4M4 11h16"/></svg>{t.discharge.admittedLabel}</span> {selectedPatient.admitted_at ? new Date(selectedPatient.admitted_at).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US') : '—'}
                  {selectedPatient.admitted_at && <span style={{ color: '#3B82F6', marginLeft: 4 }}>({Math.ceil((Date.now() - new Date(selectedPatient.admitted_at).getTime()) / 86400000)} {t.common.days})</span>}
                </div>
                <div><span style={{ color: '#6B7280' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'middle',marginRight:4}}><path d="M3 7v11m0-4.5h18M21 7v11M12 3v4"/></svg>{t.discharge.roomBedLabel}</span> {selectedPatient.room_code || '—'} / {selectedPatient.bed_code || '—'}</div>
              </div>
              <div className="discharge__progress-wrap">
                <div className="discharge__progress-header">
                  <span>{t.discharge.checklistProgress}</span>
                  <span className={`discharge__progress-value discharge__progress-value--${progressPct === 100 ? 'complete' : 'pending'}`}>{completedCount}/{checklists.length} ({progressPct}%)</span>
                </div>
                <div className="discharge__progress-track">
                  <div className={`discharge__progress-fill discharge__progress-fill--${progressPct === 100 ? 'complete' : 'pending'}`} style={{ width: `${progressPct}%` }} />
                </div>
              </div>

              {checklistLoading ? (
                <p className="discharge__loading-text">{t.discharge.loadingChecklist}</p>
              ) : (
                <div className="discharge__checklist">
                  {checklists.map((item) => (
                    <label key={item.template_id} className="discharge__check-item">
                      <input type="checkbox" checked={item.is_completed} disabled={togglingId === item.template_id} onChange={(e) => handleToggle(item.template_id, e.target.checked)} />
                      <div>
                        <span className={`discharge__check-name ${item.is_completed ? 'discharge__check-name--done' : ''}`}>{item.name}</span>
                        {item.description && <span className="discharge__check-desc">{item.description}</span>}
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <div className="discharge__actions">
                <button className="btn btn--primary" onClick={handleDischargeClick}>
                  {t.discharge.confirmDischarge}
                </button>
                <button className="btn btn--secondary" onClick={() => setSelectedPatient(null)}>{t.common.close}</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title={t.discharge.confirmDischarge}
        message={`${t.discharge.confirmDischargeMsg} ${selectedPatient?.full_name || ''}?`}
        confirmLabel={t.discharge.confirmDischarge}
        variant="warning"
        onConfirm={handleDischargeConfirm}
        onCancel={() => setConfirmOpen(false)}
        loading={discharging}
      />

      {/* Patient Detail Drawer */}
      {drawerPatientId && (
        <PatientDrawer
          patientId={drawerPatientId}
          onClose={() => setDrawerPatientId(null)}
          onUpdated={() => loadList()}
        />
      )}
    </div>
  );
}
