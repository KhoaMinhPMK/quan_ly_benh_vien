import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPatient, fetchChecklists, toggleChecklist, fetchBedHistory, updatePatient, fetchPatientNotes, createPatientNote, fetchChecklistHistory, fetchTransferHistory } from '../../services/api/medboardApi';
import type { Patient, ChecklistItem, BedHistoryEntry, PatientNote, ChecklistReviewEntry } from '../../services/api/medboardApi';
import { useTranslation } from '../../i18n/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import Select from '../Select/Select';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog';
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
  const { user } = useAuth();
  const navigate = useNavigate();
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
  const [notesList, setNotesList] = useState<PatientNote[]>([]);
  const [noteType, setNoteType] = useState(() => {
    // F5: Auto-default note type based on user role
    if (!user) return 'general';
    if (user.role === 'doctor') return 'clinical';
    if (user.role === 'nurse') return 'nursing';
    return 'general';
  });
  const [checklistHistory, setChecklistHistory] = useState<ChecklistReviewEntry[]>([]);
  const [transferHistory, setTransferHistory] = useState<BedHistoryEntry[]>([]);

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ diagnosis: '', doctor_name: '', expected_discharge: '', status: '', notes: '' });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // C1: Confirm dialog state for status changes
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<string | null>(null);

  // C2: Allow revert waiting_discharge → treating (mirrors backend)
  const VALID_TRANSITIONS: Record<string, string[]> = {
    admitted: ['treating', 'waiting_discharge'],
    treating: ['waiting_discharge'],
    waiting_discharge: ['treating'],
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
      fetchChecklistHistory(patient.id).then(setChecklistHistory).catch(() => {});
    } else if (tab === 'history') {
      if (patient.bed_id) fetchBedHistory(patient.bed_id).then(setHistory).catch(() => {});
      fetchTransferHistory(patient.id).then(setTransferHistory).catch(() => {});
      setLoadingTab(false);
    } else if (tab === 'notes') {
      fetchPatientNotes(patient.id).then(setNotesList).catch(() => {}).finally(() => setLoadingTab(false));
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
  void handleSaveNotes; // keep for future use

  // C1: If status changed in edit form, require confirm first
  const handleEditSave = async () => {
    if (!patient || editSaving) return;
    // If status is being changed, show confirm dialog first
    if (editForm.status && editForm.status !== patient.status) {
      setPendingStatusChange('edit');
      setStatusConfirmOpen(true);
      return;
    }
    await doEditSave();
  };

  const doEditSave = async () => {
    if (!patient || editSaving) return;
    setEditError('');
    setEditSaving(true);
    try {
      await updatePatient(patient.id, editForm as Record<string, string>);
      setEditing(false);
      showToast(t.common?.success || 'Thành công', 'success');
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

  // C1: Handle confirm for quick-action status change
  const handleQuickStatusChange = (newStatus: string) => {
    setPendingStatusChange(newStatus);
    setStatusConfirmOpen(true);
  };

  const handleStatusConfirm = async () => {
    setStatusConfirmOpen(false);
    if (pendingStatusChange === 'edit') {
      await doEditSave();
    } else if (pendingStatusChange && patient) {
      try {
        await updatePatient(patient.id, { status: pendingStatusChange } as Record<string, string>);
        showToast(t.common?.success || 'Thành công', 'success');
        const updated = await fetchPatient(patientId);
        setPatient(updated);
        if (onUpdated) onUpdated();
      } catch { showToast(t.common?.error || 'Lỗi', 'error'); }
    }
    setPendingStatusChange(null);
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
                      {isOverdue && <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" style={{verticalAlign:'middle',marginLeft:4}}><path d="M12 9v4M12 17h.01M10.29 3.86l-8.8 15.23A2 2 0 0 0 3.24 22h17.52a2 2 0 0 0 1.75-2.91l-8.8-15.23a2 2 0 0 0-3.42 0z"/></svg> Quá hạn</>}
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
                        <Select value={editForm.status} onChange={val => setEditForm({...editForm, status: val})}
                          options={[
                            { value: patient.status, label: `${statusLabels[patient.status]} (Hiện tại)` },
                            ...allowedStatuses.map(s => ({ value: s, label: statusLabels[s] }))
                          ]}
                        /></div>
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
                  ) : (() => {
                    const done = checklists.filter(c => c.is_completed);
                    const pending = checklists.filter(c => !c.is_completed);
                    const pct = Math.round((done.length / checklists.length) * 100);
                    const r = 18; const circ = 2 * Math.PI * r; const offset = circ - (pct / 100) * circ;
                    return (
                      <>
                        {/* Progress ring header */}
                        <div className="bed-panel__check-progress">
                          <svg width="48" height="48" viewBox="0 0 48 48">
                            <circle cx="24" cy="24" r={r} fill="none" stroke="#E5E7EB" strokeWidth="4" />
                            <circle cx="24" cy="24" r={r} fill="none" stroke={pct === 100 ? '#22C55E' : '#2563EB'} strokeWidth="4"
                              strokeDasharray={circ} strokeDashoffset={offset}
                              strokeLinecap="round" transform="rotate(-90 24 24)" style={{ transition: 'stroke-dashoffset 0.4s ease' }} />
                            <text x="24" y="24" textAnchor="middle" dominantBaseline="central"
                              fill={pct === 100 ? '#22C55E' : '#2563EB'} fontSize="11" fontWeight="700">{pct}%</text>
                          </svg>
                          <div>
                            <div className="bed-panel__check-progress-label">{done.length}/{checklists.length} {t.bedPanel?.checklistCompleted || 'hoàn thành'}</div>
                            {pct === 100 && <div className="bed-panel__check-progress-done">✓ {t.bedPanel?.checklistAllDone || 'Đã hoàn tất'}</div>}
                          </div>
                        </div>
                        {/* Pending items */}
                        {pending.length > 0 && (
                          <div className="bed-panel__check-group">
                            <div className="bed-panel__check-group-title">{t.bedPanel?.checklistPending || 'Chưa hoàn thành'} ({pending.length})</div>
                            {pending.map(c => (
                              <label key={c.template_id} className="bed-panel__check-card">
                                <input type="checkbox" checked={false} onChange={() => handleToggleChecklist(c.template_id, true)} />
                                <div className="bed-panel__check-card-content">
                                  <div className="bed-panel__check-name">{c.name}</div>
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                        {/* Done items */}
                        {done.length > 0 && (
                          <div className="bed-panel__check-group">
                            <div className="bed-panel__check-group-title bed-panel__check-group-title--done">{t.bedPanel?.checklistDone || 'Đã hoàn thành'} ({done.length})</div>
                            {done.map(c => (
                              <label key={c.template_id} className="bed-panel__check-card bed-panel__check-card--done">
                                <input type="checkbox" checked={true} onChange={() => handleToggleChecklist(c.template_id, false)} />
                                <div className="bed-panel__check-card-content">
                                  <div className="bed-panel__check-name">{c.name}</div>
                                  {c.completed_by_name && (
                                    <div className="bed-panel__check-meta">{c.completed_by_name} · {c.completed_at ? new Date(c.completed_at).toLocaleString(locale) : ''}</div>
                                  )}
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                        {/* Checklist Review History */}
                        {checklistHistory.length > 0 && (
                          <div className="bed-panel__check-group">
                            <div className="bed-panel__check-group-title" style={{ marginTop: 8 }}>Lịch sử review ({checklistHistory.length})</div>
                            {checklistHistory.slice(0, 10).map(h => (
                              <div key={h.id} style={{ padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: 12 }}>
                                <span style={{ fontWeight: 600 }}>{h.reviewed_by_name}</span>
                                <span style={{ color: '#64748b' }}> — {h.checklist_name} — </span>
                                <span style={{ color: h.action === 'complete' ? '#22C55E' : '#EF4444' }}>{h.action === 'complete' ? '✓ Hoàn thành' : '✗ Bỏ đánh dấu'}</span>
                                <div style={{ color: '#94a3b8', fontSize: 11 }}>{new Date(h.created_at).toLocaleString(locale)}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}

              {tab === 'history' && (
                <div className="bed-panel__history">
                  {history.length === 0 && transferHistory.length === 0 ? (
                    <p className="bed-panel__loading">{t.bedPanel?.noHistory || 'Chưa có lịch sử'}</p>
                  ) : (
                    <>
                      {history.map(h => (
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
                      {transferHistory.length > 0 && (
                        <>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', margin: '12px 0 8px', textTransform: 'uppercase' }}>Lịch sử chuyển giường</div>
                          {transferHistory.map((h, i) => (
                            <div key={`tr-${i}`} className="bed-panel__history-item">
                              <div className="bed-panel__history-dot" />
                              <div>
                                <div className="bed-panel__history-action"><strong>{historyActionLabel(h.action)}</strong></div>
                                <div className="bed-panel__history-meta">{h.performed_by_name || '—'} · {new Date(h.created_at).toLocaleString(locale)}</div>
                                {h.notes && <div className="bed-panel__history-note">{h.notes}</div>}
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </>
                  )}
                </div>
              )}

              {tab === 'notes' && (
                <div className="bed-panel__notes-area">
                  {/* Existing notes list */}
                  {notesList.length > 0 && (
                    <div style={{ marginBottom: 12, maxHeight: 200, overflowY: 'auto' }}>
                      {notesList.map(n => (
                        <div key={n.id} style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontWeight: 600 }}>{n.created_by_name}</span>
                            <span style={{ color: '#94a3b8', fontSize: 12 }}>{new Date(n.created_at).toLocaleString(locale)}</span>
                          </div>
                          <span style={{ display: 'inline-block', padding: '1px 6px', background: '#f1f5f9', borderRadius: 4, fontSize: 11, marginBottom: 4 }}>{n.note_type}</span>
                          <p style={{ margin: 0 }}>{n.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Add new note */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <select className="form-field__input" value={noteType} onChange={e => setNoteType(e.target.value)} style={{ maxWidth: 140 }}>
                      <option value="general">Chung</option>
                      <option value="clinical">Lâm sàng</option>
                      <option value="nursing">Điều dưỡng</option>
                      <option value="discharge">Ra viện</option>
                    </select>
                  </div>
                  <textarea className="bed-panel__notes-input" placeholder={t.bedPanel?.notesPlaceholder || 'Ghi chú lâm sàng...'}
                    rows={4} value={noteText} onChange={e => setNoteText(e.target.value)} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
                    {notesSaved && <span style={{ color: '#22C55E', fontSize: 13 }}>✓ {t.common?.success || 'Đã lưu'}</span>}
                    <button className="btn btn--primary btn--sm" onClick={async () => {
                      if (!noteText.trim() || !patient) return;
                      setSavingNotes(true);
                      try {
                        await createPatientNote(patient.id, noteText, noteType);
                        setNoteText('');
                        setNotesSaved(true);
                        setTimeout(() => setNotesSaved(false), 2000);
                        fetchPatientNotes(patient.id).then(setNotesList).catch(() => {});
                      } catch {}
                      setSavingNotes(false);
                    }} disabled={savingNotes || !noteText.trim()}>
                      {savingNotes ? (t.common?.processing || 'Đang lưu...') : (t.bedPanel?.saveNote || 'Thêm ghi chú')}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="bed-panel__actions">
          {/* Quick action buttons based on patient status */}
          {!editing && patient.status !== 'discharged' && (
            <div className="bed-panel__quick-actions">
              {patient.room_code && (
                <button className="btn btn--ghost btn--sm" onClick={() => { onClose(); navigate(`/rooms/${(patient as any).room_id || ''}`); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'middle',marginRight:4}}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  {t.bedPanel?.viewRoom || 'Xem phòng'}
                </button>
              )}
              {(patient.status === 'treating' || patient.status === 'admitted') && (
                <button className="btn btn--warning btn--sm" onClick={() => handleQuickStatusChange('waiting_discharge')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'middle',marginRight:4}}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  {t.bedPanel?.requestDischarge || 'Yêu cầu XV'}
                </button>
              )}
              {/* C2: Allow revert waiting_discharge → treating */}
              {patient.status === 'waiting_discharge' && (
                <button className="btn btn--ghost btn--sm" onClick={() => handleQuickStatusChange('treating')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'middle',marginRight:4}}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
                  {'Quay lại Đang điều trị'}
                </button>
              )}
              {patient.status === 'waiting_discharge' && (
                <button className="btn btn--primary btn--sm" onClick={() => { onClose(); navigate('/discharge'); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'middle',marginRight:4}}><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                  {t.bedPanel?.goDischarge || 'Đi đến XV'}
                </button>
              )}
            </div>
          )}
          {!editing ? (
            <button className="btn btn--primary btn--sm" onClick={() => setEditing(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'middle',marginRight:4}}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>{t.common?.edit || 'Chỉnh sửa'}
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

      {/* C1: Confirm dialog for status change */}
      <ConfirmDialog
        open={statusConfirmOpen}
        title="Xác nhận đổi trạng thái"
        message={`Bạn có chắc muốn chuyển trạng thái bệnh nhân ${patient.full_name} sang "${statusLabels[pendingStatusChange === 'edit' ? editForm.status : (pendingStatusChange || '')] || pendingStatusChange}"?`}
        confirmLabel="Xác nhận"
        variant="warning"
        onConfirm={handleStatusConfirm}
        onCancel={() => { setStatusConfirmOpen(false); setPendingStatusChange(null); }}
      />
    </>
  );
}
