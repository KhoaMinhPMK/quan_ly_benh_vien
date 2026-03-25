import { useState, useEffect } from 'react';
import { fetchDischargeList, fetchChecklists, toggleChecklist, dischargePatient, type Patient, type ChecklistItem } from '../../services/api/medboardApi';
import { useTranslation } from '../../i18n/LanguageContext';
import iconClipboardCheck from '../../assets/icons/outline/clipboard-check.svg';
import './DischargeListPage.scss';

export default function DischargeListPage() {
  const { t, lang } = useTranslation();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [checklistLoading, setChecklistLoading] = useState(false);

  const statusLabels: Record<string, string> = {
    treating: t.patients.statusTreating, waiting_discharge: t.patients.statusWaiting,
  };

  const loadList = () => {
    setLoading(true);
    fetchDischargeList()
      .then(setPatients)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadList(); }, []);

  const openChecklist = async (patient: Patient) => {
    setSelectedPatient(patient);
    setChecklistLoading(true);
    try {
      const items = await fetchChecklists(patient.id);
      setChecklists(items);
    } catch { setChecklists([]); }
    finally { setChecklistLoading(false); }
  };

  const handleToggle = async (templateId: number, completed: boolean) => {
    if (!selectedPatient) return;
    try {
      const updated = await toggleChecklist(selectedPatient.id, templateId, completed);
      setChecklists(updated);
    } catch { /* ignore */ }
  };

  const allChecked = checklists.length > 0 && checklists.every((c) => c.is_completed);

  const handleDischarge = async () => {
    if (!selectedPatient) return;
    if (!allChecked) {
      alert(t.discharge.blockDischargeMsg);
      return;
    }
    const msg = `${t.discharge.confirmDischargeMsg} ${selectedPatient.full_name}?`;
    if (!confirm(msg)) return;
    try {
      await dischargePatient(selectedPatient.id);
      setSelectedPatient(null);
      loadList();
    } catch { alert(t.common.error); }
  };

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US') : '--';

  // Checklist progress
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

      <div className="discharge__layout">
        {/* Left: patient list */}
        <div className="discharge__list">
          {loading ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
              <div className="loading-screen__spinner" style={{ margin: '0 auto 16px' }} />
              <p style={{ color: '#6B7280' }}>{t.common.loading}</p>
            </div>
          ) : patients.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
              <p style={{ color: '#6B7280' }}>{t.discharge.noDischarge}</p>
            </div>
          ) : (
            <div className="card" style={{ padding: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t.discharge.patientCode}</th>
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
                      <td>{p.full_name}</td>
                      <td>{p.room_code || '--'}</td>
                      <td>{formatDate(p.expected_discharge)}</td>
                      <td>
                        <span className={`badge ${p.status === 'waiting_discharge' ? 'badge--warning' : 'badge--info'}`}>
                          {statusLabels[p.status] || p.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn--secondary btn--sm" onClick={() => openChecklist(p)}>
                          <img src={iconClipboardCheck} alt="" style={{ width: 14, height: 14 }} />
                          {t.discharge.checklist}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: checklist panel */}
        {selectedPatient && (
          <div className="discharge__panel">
            <div className="card">
              <div className="card__header">
                <h3 className="card__title">{t.discharge.checklistTitle}: {selectedPatient.full_name}</h3>
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span>{t.discharge.checklistProgress}</span>
                  <span style={{ fontWeight: 600, color: progressPct === 100 ? '#10B981' : '#F59E0B' }}>{completedCount}/{checklists.length} ({progressPct}%)</span>
                </div>
                <div style={{ height: 6, background: '#E5E7EB', borderRadius: 3 }}>
                  <div style={{ height: '100%', width: `${progressPct}%`, background: progressPct === 100 ? '#10B981' : '#F59E0B', borderRadius: 3, transition: 'width 0.3s' }} />
                </div>
              </div>

              {checklistLoading ? (
                <p style={{ color: '#6B7280' }}>{t.discharge.loadingChecklist}</p>
              ) : (
                <div className="discharge__checklist">
                  {checklists.map((item) => (
                    <label key={item.template_id} className="discharge__check-item">
                      <input type="checkbox" checked={item.is_completed} onChange={(e) => handleToggle(item.template_id, e.target.checked)} />
                      <div>
                        <span className={`discharge__check-name ${item.is_completed ? 'discharge__check-name--done' : ''}`}>{item.name}</span>
                        {item.description && <span className="discharge__check-desc">{item.description}</span>}
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <div style={{ marginTop: '24px', display: 'flex', gap: '8px' }}>
                <button className="btn btn--primary" disabled={!allChecked} onClick={handleDischarge}
                  title={!allChecked ? t.discharge.blockDischargeMsg : ''}>
                  {t.discharge.confirmDischarge}
                </button>
                <button className="btn btn--secondary" onClick={() => setSelectedPatient(null)}>{t.common.close}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
