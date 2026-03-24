import { useState, useEffect } from 'react';
import { fetchDischargeList, fetchChecklists, toggleChecklist, dischargePatient, type Patient, type ChecklistItem } from '../../services/api/medboardApi';
import iconClipboardCheck from '../../assets/icons/outline/clipboard-check.svg';
import './DischargeListPage.scss';

const STATUS_LABELS: Record<string, string> = {
  treating: 'Dang dieu tri',
  waiting_discharge: 'Cho ra vien',
};

export default function DischargeListPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [checklistLoading, setChecklistLoading] = useState(false);

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

  const handleDischarge = async () => {
    if (!selectedPatient) return;
    if (!confirm(`Xac nhan ra vien benh nhan ${selectedPatient.full_name}?`)) return;
    try {
      await dischargePatient(selectedPatient.id);
      setSelectedPatient(null);
      loadList();
    } catch { alert('Co loi xay ra'); }
  };

  const allChecked = checklists.length > 0 && checklists.every((c) => c.is_completed);

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString('vi-VN') : '--';

  return (
    <div className="discharge">
      <div className="page-header">
        <div>
          <h2 className="page-header__title">Ra vien</h2>
          <p className="page-header__subtitle">Benh nhan du kien ra vien hom nay/ngay mai</p>
        </div>
      </div>

      <div className="discharge__layout">
        {/* Left: patient list */}
        <div className="discharge__list">
          {loading ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
              <div className="loading-screen__spinner" style={{ margin: '0 auto 16px' }} />
              <p style={{ color: '#6B7280' }}>Dang tai...</p>
            </div>
          ) : patients.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
              <p style={{ color: '#6B7280' }}>Khong co benh nhan du kien ra vien.</p>
            </div>
          ) : (
            <div className="card" style={{ padding: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ma BN</th>
                    <th>Ho ten</th>
                    <th>Phong</th>
                    <th>Du kien</th>
                    <th>Trang thai</th>
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
                          {STATUS_LABELS[p.status] || p.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn--secondary btn--sm" onClick={() => openChecklist(p)}>
                          <img src={iconClipboardCheck} alt="" style={{ width: 14, height: 14 }} />
                          Ho so
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
                <h3 className="card__title">Checklist ra vien: {selectedPatient.full_name}</h3>
              </div>

              {checklistLoading ? (
                <p style={{ color: '#6B7280' }}>Dang tai checklist...</p>
              ) : (
                <div className="discharge__checklist">
                  {checklists.map((item) => (
                    <label key={item.template_id} className="discharge__check-item">
                      <input
                        type="checkbox"
                        checked={item.is_completed}
                        onChange={(e) => handleToggle(item.template_id, e.target.checked)}
                      />
                      <div>
                        <span className={`discharge__check-name ${item.is_completed ? 'discharge__check-name--done' : ''}`}>
                          {item.name}
                        </span>
                        {item.description && (
                          <span className="discharge__check-desc">{item.description}</span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <div style={{ marginTop: '24px', display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn--primary"
                  disabled={!allChecked}
                  onClick={handleDischarge}
                >
                  Xac nhan ra vien
                </button>
                <button className="btn btn--secondary" onClick={() => setSelectedPatient(null)}>
                  Dong
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
