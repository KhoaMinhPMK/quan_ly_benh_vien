import { useState, useEffect } from 'react';
import { fetchPatient, fetchChecklists, toggleChecklist, fetchBedHistory, updatePatient, type Patient, type ChecklistItem, type BedHistoryEntry } from '../../services/api/medboardApi';
import { useTranslation } from '../../i18n/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import '../BedDetailPanel/BedDetailPanel.scss';

interface PatientDrawerProps {
  patientId: number;
  onClose: () => void;
  onUpdated?: () => void;
}

type Tab = 'info' | 'checklist' | 'history' | 'notes';

export default function PatientDrawer({ patientId, onClose, onUpdated }: PatientDrawerProps) {
  const { t, lang } = useTranslation();
  const { showToast } = useToast();
  const locale = lang === 'vi' ? 'vi-VN' : 'en-US';
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('info');
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [history, setHistory] = useState<BedHistoryEntry[]>([]);
  const [loadingTab, setLoadingTab] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ diagnosis: '', doctor_name: '', expected_discharge: '', status: '', notes: '' });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Status transition rules (mirrors backend)
  const VALID_TRANSITIONS: Record<string, string[]> = {
    admitted: ['treating', 'waiting_discharge'],
    treating: ['waiting_discharge'],
    waiting_discharge: [],
    discharged: [],
  };

  const statusLabels: Record<string, string> = {
    admitted: t.bedPanel?.statusAdmitted || 'Nhập viện',
    treating: t.bedPanel?.statusTreating || 'Đang điều trị',
    waiting_discharge: t.bedPanel?.statusWaiting || 'Chờ xuất viện',
    discharged: t.bedPanel?.statusDischarged || 'Đã xuất viện',
  };

  const tabLabels: [Tab, string][] = [
    ['info', t.bedPanel?.tabInfo || 'Thông tin'],
    ['checklist', t.bedPanel?.tabChecklist || 'Checklist'],
    ['history', t.bedPanel?.tabHistory || 'Lịch sử'],
    ['notes', t.bedPanel?.tabNotes || 'Ghi chú'],
  ];

  useEffect(() => {
    setLoading(true);
    setTab('info');
    setEditing(false);
    fetchPatient(patientId)
      .then(p => {
        setPatient(p);
        setNoteText(p?.notes || '');
        setEditForm({
          diagnosis: p?.diagnosis || '',
          doctor_name: p?.doctor_name || '',
          expected_discharge: p?.expected_discharge ? p.expected_discharge.split('T')[0] : '',
          status: p?.status || '',
          notes: p?.notes || '',
        });
      })
      .catch(() => { showToast(t.common?.error || 'Lỗi', 'error'); })
      .finally(() => setLoading(false));
  }, [patientId]);

  useEffect(() => {
    if (!patient) return;
    setLoadingTab(true);
    if (tab === 'checklist') {
      fetchChecklists(patient.id).then(setChecklists).catch(() => {}).finally(() => setLoadingTab(false));
    } else if (tab === 'history' && patient.bed_id) {
      fetchBedHistory(patient.bed_id).then(setHistory).catch(() => {}).finally(() => setLoadingTab(false));
    } else {
      setLoadingTab(false);
    }
  }, [tab, patient]);

  const handleToggleChecklist = async (templateId: number, completed: boolean) => {
    if (!patient) return;
    try {
      const updated = await toggleChecklist(patient.id, templateId, completed);
      setChecklists(updated);
    } catch { showToast(t.common?.error || 'Lỗi', 'error'); }
  };

  const handleSaveNotes = async () => {
    if (!patient) return;
    setSavingNotes(true);
    try {
      await updatePatient(patient.id, { notes: noteText } as any);
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
      if (onUpdated) onUpdated();
    } catch {}
    setSavingNotes(false);
  };

  const handleEditSave = async () => {
    if (!patient || editSaving) return;
    setEditError('');
    setEditSaving(true);
    try {
      await updatePatient(patient.id, editForm as Record<string, string>);
      setEditing(false);
      showToast(t.common?.success || 'Thành công', 'success');
      // Reload patient data
      const updated = await fetchPatient(patientId);
      setPatient(updated);
      if (onUpdated) onUpdated();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: { message?: string } } } };
      setEditError(err.response?.data?.error?.message || t.common?.error || 'Lỗi');
    } finally {
      setEditSaving(false);
    }
  };

  const daysAdmitted = patient?.admitted_at ? Math.ceil((Date.now() - new Date(patient.admitted_at).getTime()) / 86400000) : null;

  const isOverdue = patient?.expected_discharge && new Date(patient.expected_discharge) <= new Date();

  const historyActionLabel = (a: string) =>
    a === 'assign' ? (t.bedPanel?.historyAssign || 'Gán giường')
    : a === 'release' ? (t.bedPanel?.historyRelease || 'Trả giường')
    : a === 'transfer_in' ? (t.bedPanel?.historyTransferIn || 'Chuyển đến')
    : a === 'transfer_out' ? (t.bedPanel?.historyTransferOut || 'Chuyển đi')
    : a;

  const allowedStatuses = patient ? (VALID_TRANSITIONS[patient.status] || []) : [];

  if (loading) {
    return (
      <>
        <div className="panel-overlay" onClick={onClose} />
        <div className="bed-panel">
          <div className="bed-panel__header">
            <h3 className="bed-panel__title">Đang tải...</h3>
            <button className="bed-panel__close" onClick={onClose}>&times;</button>
          </div>
          <div className="bed-panel__content"><div className="bed-panel__loading">{t.common?.loading || 'Đang tải...'}</div></div>
        </div>
      </>
    );
  }

  if (!patient) {
    return (
      <>
        <div className="panel-overlay" onClick={onClose} />
        <div className="bed-panel">
          <div className="bed-panel__header">
            <h3 className="bed-panel__title">Không tìm thấy</h3>
            <button className="bed-panel__close" onClick={onClose}>&times;</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="panel-overlay" onClick={onClose} />
      <div className="bed-panel">
        <div className="bed-panel__header">
          <div>
            <h3 className="bed-panel__title">{patient.full_name}</h3>
            <span className={`bed-panel__status bed-panel__status--${patient.status}`}>
              {statusLabels[patient.status] || patient.status}
            </span>
          </div>
          <button className="bed-panel__close" onClick={onClose}>&times;</button>
        </div>

        <div className="bed-panel__tabs">
          {tabLabels.map(([k, v]) => (
            <button key={k} className={`bed-panel__tab ${tab === k ? 'bed-panel__tab--active' : ''}`}
              onClick={() => setTab(k)}>{v}</button>
          ))}
        </div>

        <div className="bed-panel__content">
          {loadingTab ? <div className="bed-panel__loading">{t.common?.loading || 'Đang tải...'}</div> : (
            <>
              {tab === 'info' && !editing && (
                <div className="bed-panel__info">
                  <div className="bed-panel__info-row"><label>{t.bedPanel?.patientCode || 'Mã BN'}</label><span>{patient.patient_code}</span></div>
                  <div className="bed-panel__info-row"><label>{'Mã bệnh án'}</label><span>{patient.admission_code || '—'}</span></div>
                  <div className="bed-panel__info-row"><label>{t.bedPanel?.fullName || 'Họ tên'}</label><span>{patient.full_name}</span></div>
                  <div className="bed-panel__info-row"><label>{t.bedPanel?.dob || 'Ngày sinh'}</label><span>{patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString(locale) : '—'}</span></div>
                  <div className="bed-panel__info-row"><label>{t.bedPanel?.gender || 'Giới tính'}</label><span>{patient.gender === 'male' ? (t.bedPanel?.genderMale || 'Nam') : patient.gender === 'female' ? (t.bedPanel?.genderFemale || 'Nữ') : '—'}</span></div>
                  <div className="bed-panel__info-row"><label>{t.bedPanel?.phone || 'SĐT'}</label><span>{patient.phone || '—'}</span></div>
                  <div className="bed-panel__info-row"><label>{t.bedPanel?.diagnosis || 'Chẩn đoán'}</label><span className="bed-panel__info-highlight">{patient.diagnosis || '—'}</span></div>
                  <div className="bed-panel__info-row"><label>{t.bedPanel?.doctor || 'Bác sĩ'}</label><span>{patient.doctor_name || '—'}</span></div>
                  <div className="bed-panel__info-row"><label>{'Phòng / Giường'}</label><span>{patient.room_code && patient.bed_code ? `${patient.room_code} / ${patient.bed_code}` : '— Chưa gán giường'}</span></div>
                  <div className="bed-panel__info-row"><label>{t.bedPanel?.admittedAt || 'Ngày nhập viện'}</label><span>{patient.admitted_at ? new Date(patient.admitted_at).toLocaleDateString(locale) : '—'}</span></div>
                  <div className="bed-panel__info-row"><label>{t.bedPanel?.daysAdmitted || 'Số ngày'}</label><span className="bed-panel__info-highlight">{daysAdmitted != null ? `${daysAdmitted} ${t.common?.days || 'ngày'}` : '—'}</span></div>
                  <div className="bed-panel__info-row">
                    <label>{t.bedPanel?.expectedDischarge || 'Dự kiến XV'}</label>
                    <span style={isOverdue ? { color: '#EF4444', fontWeight: 600 } : {}}>
                      {patient.expected_discharge ? new Date(patient.expected_discharge).toLocaleDateString(locale) : '—'}
                      {isOverdue && ' ⚠️ Quá hạn'}
                    </span>
                  </div>
                  <div className="bed-panel__info-row"><label>{t.bedPanel?.patientStatus || 'Trạng thái'}</label>
                    <span className={`bed-panel__badge bed-panel__badge--${patient.status}`}>{statusLabels[patient.status] || patient.status}</span>
                  </div>
                  {patient.notes && <div className="bed-panel__info-notes"><label>{t.common?.notes || 'Ghi chú'}</label><p>{patient.notes}</p></div>}
                </div>
              )}

              {tab === 'info' && editing && (
                <div className="bed-panel__info">
                  {editError && <div style={{ color: '#EF4444', fontSize: 13, marginBottom: 12, padding: '8px 12px', background: '#FEF2F2', borderRadius: 8 }}>{editError}</div>}
                  <div className="bed-panel__info-row"><label>{t.bedPanel?.fullName || 'Họ tên'}</label><span style={{ fontWeight: 600 }}>{patient.full_name}</span></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="form-field"><label className="form-field__label">{t.bedPanel?.diagnosis || 'Chẩn đoán'}</label>
                      <input className="form-field__input" value={editForm.diagnosis} onChange={e => setEditForm({...editForm, diagnosis: e.target.value})} /></div>
                    <div className="form-field"><label className="form-field__label">{t.bedPanel?.doctor || 'Bác sĩ'}</label>
                      <input className="form-field__input" value={editForm.doctor_name} onChange={e => setEditForm({...editForm, doctor_name: e.target.value})} /></div>
                    <div className="form-field"><label className="form-field__label">{t.bedPanel?.expectedDischarge || 'Ngày dự kiến XV'}</label>
                      <input className="form-field__input" type="date" value={editForm.expected_discharge} onChange={e => setEditForm({...editForm, expected_discharge: e.target.value})} /></div>
                    {allowedStatuses.length > 0 && (
                      <div className="form-field"><label className="form-field__label">{t.bedPanel?.patientStatus || 'Trạng thái'}</label>
                        <select className="form-field__input" value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}>
                          <option value={patient.status}>{statusLabels[patient.status]} (Hiện tại)</option>
                          {allowedStatuses.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
                        </select></div>
                    )}
                    <div className="form-field"><label className="form-field__label">{t.common?.notes || 'Ghi chú'}</label>
                      <textarea className="form-field__input" value={editForm.notes} onChange={e => setEditForm({...editForm, notes: e.target.value})} rows={3} /></div>
                  </div>
                </div>
              )}

              {tab === 'checklist' && (
                <div className="bed-panel__checklist">
                  {checklists.length === 0 ? (
                    <p className="bed-panel__loading">{t.bedPanel?.noChecklist || 'Chưa có checklist'}</p>
                  ) : checklists.map(c => (
                    <label key={c.template_id} className={`bed-panel__check-item ${c.is_completed ? 'bed-panel__check-item--done' : ''}`}>
                      <input type="checkbox" checked={c.is_completed} onChange={() => handleToggleChecklist(c.template_id, !c.is_completed)} />
                      <div>
                        <div className="bed-panel__check-name">{c.name}</div>
                        {c.is_completed && c.completed_by_name && (
                          <div className="bed-panel__check-meta">{c.completed_by_name} · {c.completed_at ? new Date(c.completed_at).toLocaleString(locale) : ''}</div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {tab === 'history' && (
                <div className="bed-panel__history">
                  {!patient.bed_id ? (
                    <p className="bed-panel__loading">Chưa được gán giường — không có lịch sử chuyển giường</p>
                  ) : history.length === 0 ? (
                    <p className="bed-panel__loading">{t.bedPanel?.noHistory || 'Chưa có lịch sử'}</p>
                  ) : history.map(h => (
                    <div key={h.id} className="bed-panel__history-item">
                      <div className="bed-panel__history-dot" />
                      <div>
                        <div className="bed-panel__history-action">
                          <strong>{historyActionLabel(h.action)}</strong> — {h.patient_name} ({h.patient_code})
                        </div>
                        <div className="bed-panel__history-meta">{h.performed_by_name || '—'} · {new Date(h.created_at).toLocaleString(locale)}</div>
                        {h.notes && <div className="bed-panel__history-note">{h.notes}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === 'notes' && (
                <div className="bed-panel__notes-area">
                  <textarea className="bed-panel__notes-input" placeholder={t.bedPanel?.notesPlaceholder || 'Ghi chú lâm sàng...'}
                    rows={6} value={noteText} onChange={e => setNoteText(e.target.value)} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
                    {notesSaved && <span style={{ color: '#22C55E', fontSize: 13 }}>✓ {t.common?.success || 'Đã lưu'}</span>}
                    <button className="btn btn--primary btn--sm" onClick={handleSaveNotes} disabled={savingNotes}>
                      {savingNotes ? (t.common?.processing || 'Đang lưu...') : (t.bedPanel?.saveNote || 'Lưu ghi chú')}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="bed-panel__actions">
          {!editing ? (
            <button className="btn btn--primary btn--sm" onClick={() => setEditing(true)}>
              ✏️ {t.common?.edit || 'Chỉnh sửa'}
            </button>
          ) : (
            <>
              <button className="btn btn--secondary btn--sm" onClick={() => setEditing(false)}>
                {t.common?.cancel || 'Hủy'}
              </button>
              <button className="btn btn--primary btn--sm" onClick={handleEditSave} disabled={editSaving}>
                {editSaving ? (t.common?.processing || 'Đang lưu...') : (t.common?.update || 'Cập nhật')}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
