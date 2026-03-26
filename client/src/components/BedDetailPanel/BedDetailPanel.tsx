import { useState, useEffect } from 'react';
import { fetchChecklists, toggleChecklist, fetchBedHistory, updatePatient, type ChecklistItem, type BedHistoryEntry } from '../../services/api/medboardApi';
import { useTranslation } from '../../i18n/LanguageContext';
import './BedDetailPanel.scss';

interface PatientInfo {
  id: number; patient_code: string; full_name: string; date_of_birth?: string; gender?: string;
  phone?: string; diagnosis?: string; doctor_name?: string; admitted_at?: string;
  expected_discharge?: string; status?: string; notes?: string;
}

interface BedDetailPanelProps {
  bedId: number; bedCode: string; bedStatus: string; patient: PatientInfo | null;
  onClose: () => void; onTransfer: () => void; onRelease: () => void; onAssign: () => void;
  onRequestDischarge?: () => void;
}

type Tab = 'info' | 'checklist' | 'history' | 'notes';

export default function BedDetailPanel({ bedId, bedCode, bedStatus, patient, onClose, onTransfer, onRelease, onAssign, onRequestDischarge }: BedDetailPanelProps) {
  const { t, lang } = useTranslation();
  const locale = lang === 'vi' ? 'vi-VN' : 'en-US';
  const [tab, setTab] = useState<Tab>('info');
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [history, setHistory] = useState<BedHistoryEntry[]>([]);
  const [loadingTab, setLoadingTab] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  const tabLabels: [Tab, string][] = [
    ['info', t.bedPanel.tabInfo], ['checklist', t.bedPanel.tabChecklist],
    ['history', t.bedPanel.tabHistory], ['notes', t.bedPanel.tabNotes],
  ];

  const statusLabels: Record<string, string> = {
    admitted: t.bedPanel.statusAdmitted, treating: t.bedPanel.statusTreating,
    waiting_discharge: t.bedPanel.statusWaiting, discharged: t.bedPanel.statusDischarged,
  };

  const bedStatusLabel = bedStatus === 'empty' ? t.beds.statusEmpty : bedStatus === 'occupied' ? t.beds.statusOccupied : bedStatus === 'locked' ? t.beds.statusLocked : t.beds.statusCleaning;

  useEffect(() => {
    if (patient) setNoteText(patient.notes || '');
  }, [patient]);

  useEffect(() => {
    setLoadingTab(true);
    if (tab === 'checklist' && patient) { fetchChecklists(patient.id).then(setChecklists).catch(() => {}).finally(() => setLoadingTab(false)); }
    else if (tab === 'history') { fetchBedHistory(bedId).then(setHistory).catch(() => {}).finally(() => setLoadingTab(false)); }
    else { setLoadingTab(false); }
  }, [tab, bedId, patient]);

  const handleToggleChecklist = async (templateId: number, completed: boolean) => {
    if (!patient) return;
    try { const updated = await toggleChecklist(patient.id, templateId, completed); setChecklists(updated); } catch {}
  };

  const handleSaveNotes = async () => {
    if (!patient) return;
    setSavingNotes(true);
    try {
      await updatePatient(patient.id, { notes: noteText } as any);
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    } catch {}
    setSavingNotes(false);
  };

  const daysAdmitted = patient?.admitted_at ? Math.ceil((Date.now() - new Date(patient.admitted_at).getTime()) / 86400000) : null;

  const historyActionLabel = (a: string) => a === 'assign' ? t.bedPanel.historyAssign : a === 'release' ? t.bedPanel.historyRelease : a === 'transfer_in' ? t.bedPanel.historyTransferIn : a === 'transfer_out' ? t.bedPanel.historyTransferOut : a;

  return (
    <>
      <div className="panel-overlay" onClick={onClose} />
      <div className="bed-panel">
        <div className="bed-panel__header">
          <div>
            <h3 className="bed-panel__title">{t.bedPanel.title} {bedCode}</h3>
            <span className={`bed-panel__status bed-panel__status--${bedStatus}`}>{bedStatusLabel}</span>
          </div>
          <button className="bed-panel__close" onClick={onClose}>&times;</button>
        </div>

        <div className="bed-panel__tabs">
          {tabLabels.map(([k, v]) => (
            <button key={k} className={`bed-panel__tab ${tab === k ? 'bed-panel__tab--active' : ''}`}
              onClick={() => setTab(k)} disabled={!patient && (k === 'checklist' || k === 'notes')}>{v}</button>
          ))}
        </div>

        <div className="bed-panel__content">
          {loadingTab ? <div className="bed-panel__loading">{t.common.loading}</div> : (
            <>
              {tab === 'info' && (
                patient ? (
                  <div className="bed-panel__info">
                    <div className="bed-panel__info-row"><label>{t.bedPanel.fullName}</label><span>{patient.full_name}</span></div>
                    <div className="bed-panel__info-row"><label>{t.bedPanel.patientCode}</label><span>{patient.patient_code}</span></div>
                    <div className="bed-panel__info-row"><label>{t.bedPanel.dob}</label><span>{patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString(locale) : '—'}</span></div>
                    <div className="bed-panel__info-row"><label>{t.bedPanel.gender}</label><span>{patient.gender === 'male' ? t.bedPanel.genderMale : patient.gender === 'female' ? t.bedPanel.genderFemale : '—'}</span></div>
                    <div className="bed-panel__info-row"><label>{t.bedPanel.phone}</label><span>{patient.phone || '—'}</span></div>
                    <div className="bed-panel__info-row"><label>{t.bedPanel.diagnosis}</label><span className="bed-panel__info-highlight">{patient.diagnosis || '—'}</span></div>
                    <div className="bed-panel__info-row"><label>{t.bedPanel.doctor}</label><span>{patient.doctor_name || '—'}</span></div>
                    <div className="bed-panel__info-row"><label>{t.bedPanel.admittedAt}</label><span>{patient.admitted_at ? new Date(patient.admitted_at).toLocaleDateString(locale) : '—'}</span></div>
                    <div className="bed-panel__info-row"><label>{t.bedPanel.daysAdmitted}</label><span className="bed-panel__info-highlight">{daysAdmitted != null ? `${daysAdmitted} ${t.common.days}` : '—'}</span></div>
                    <div className="bed-panel__info-row"><label>{t.bedPanel.expectedDischarge}</label><span>{patient.expected_discharge ? new Date(patient.expected_discharge).toLocaleDateString(locale) : '—'}</span></div>
                    <div className="bed-panel__info-row"><label>{t.bedPanel.patientStatus}</label>
                      <span className={`bed-panel__badge bed-panel__badge--${patient.status}`}>{statusLabels[patient.status || ''] || patient.status}</span></div>
                    {patient.notes && <div className="bed-panel__info-notes"><label>{t.common.notes}</label><p>{patient.notes}</p></div>}
                  </div>
                ) : (
                  <div className="bed-panel__empty">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5">
                      <path d="M3 7v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V7"/><path d="M3 7l4-4h10l4 4"/><path d="M12 11v4"/><path d="M10 13h4"/>
                    </svg>
                    <p>{t.bedPanel.emptyBed}</p>
                    {bedStatus === 'empty' && <button className="btn btn--primary btn--sm" onClick={onAssign}>{t.bedPanel.assignPatient}</button>}
                  </div>
                )
              )}

              {tab === 'checklist' && patient && (
                <div className="bed-panel__checklist">
                  {checklists.length === 0 ? (
                    <p className="bed-panel__loading">{t.bedPanel.noChecklist}</p>
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
                  {history.length === 0 ? (
                    <p className="bed-panel__loading">{t.bedPanel.noHistory}</p>
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

              {tab === 'notes' && patient && (
                <div className="bed-panel__notes-area">
                  <textarea className="bed-panel__notes-input" placeholder={t.bedPanel.notesPlaceholder}
                    rows={6} value={noteText} onChange={e => setNoteText(e.target.value)} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
                    {notesSaved && <span style={{ color: '#22C55E', fontSize: 13 }}>✓ {t.common.success}</span>}
                    <button className="btn btn--primary btn--sm" onClick={handleSaveNotes} disabled={savingNotes}>
                      {savingNotes ? t.common.processing : t.bedPanel.saveNote}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="bed-panel__actions">
          {patient && (
            <>
              <button className="btn btn--secondary btn--sm" onClick={onTransfer}>{t.bedPanel.transferBed}</button>
              {patient.status !== 'waiting_discharge' && patient.status !== 'discharged' && onRequestDischarge && (
                <button className="btn btn--primary btn--sm" onClick={onRequestDischarge}>{t.bedPanel.requestDischarge || 'Cho xuất viện'}</button>
              )}
            </>
          )}
          {(bedStatus === 'cleaning' || bedStatus === 'locked' || (!patient && bedStatus !== 'empty')) && (
            <button className="btn btn--secondary btn--sm" onClick={onRelease}>{t.bedPanel.releaseBed}</button>
          )}
        </div>
      </div>
    </>
  );
}
