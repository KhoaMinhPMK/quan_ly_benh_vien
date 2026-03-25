import { useState, useEffect } from 'react';
import { fetchChecklists, toggleChecklist, fetchBedHistory, type ChecklistItem, type BedHistoryEntry } from '../../services/api/medboardApi';
import './BedDetailPanel.scss';

interface PatientInfo {
  id: number;
  patient_code: string;
  full_name: string;
  date_of_birth?: string;
  gender?: string;
  phone?: string;
  diagnosis?: string;
  doctor_name?: string;
  admitted_at?: string;
  expected_discharge?: string;
  status?: string;
  notes?: string;
}

interface BedDetailPanelProps {
  bedId: number;
  bedCode: string;
  bedStatus: string;
  patient: PatientInfo | null;
  onClose: () => void;
  onTransfer: () => void;
  onRelease: () => void;
  onAssign: () => void;
}

type Tab = 'info' | 'checklist' | 'history' | 'notes';

const TAB_LABELS: [Tab, string][] = [
  ['info', 'Thông tin'],
  ['checklist', 'Checklist'],
  ['history', 'Lịch sử'],
  ['notes', 'Ghi chú'],
];

const STATUS_LABELS: Record<string, string> = {
  admitted: 'Mới nhập viện',
  treating: 'Đang điều trị',
  waiting_discharge: 'Chờ ra viện',
  discharged: 'Đã ra viện',
};

export default function BedDetailPanel({
  bedId, bedCode, bedStatus, patient, onClose, onTransfer, onRelease, onAssign,
}: BedDetailPanelProps) {
  const [tab, setTab] = useState<Tab>('info');
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [history, setHistory] = useState<BedHistoryEntry[]>([]);
  const [loadingTab, setLoadingTab] = useState(false);

  useEffect(() => {
    setLoadingTab(true);
    if (tab === 'checklist' && patient) {
      fetchChecklists(patient.id).then(setChecklists).catch(() => {}).finally(() => setLoadingTab(false));
    } else if (tab === 'history') {
      fetchBedHistory(bedId).then(setHistory).catch(() => {}).finally(() => setLoadingTab(false));
    } else {
      setLoadingTab(false);
    }
  }, [tab, bedId, patient]);

  const handleToggleChecklist = async (templateId: number, completed: boolean) => {
    if (!patient) return;
    try {
      const updated = await toggleChecklist(patient.id, templateId, completed);
      setChecklists(updated);
    } catch {}
  };

  const daysAdmitted = patient?.admitted_at
    ? Math.ceil((Date.now() - new Date(patient.admitted_at).getTime()) / 86400000)
    : null;

  return (
    <>
      <div className="panel-overlay" onClick={onClose} />
      <div className="bed-panel">
        {/* Header */}
        <div className="bed-panel__header">
          <div>
            <h3 className="bed-panel__title">Giường {bedCode}</h3>
            <span className={`bed-panel__status bed-panel__status--${bedStatus}`}>
              {bedStatus === 'empty' ? 'Trống' : bedStatus === 'occupied' ? 'Có BN' : bedStatus === 'locked' ? 'Khoá' : 'Vệ sinh'}
            </span>
          </div>
          <button className="bed-panel__close" onClick={onClose}>&times;</button>
        </div>

        {/* Tabs */}
        <div className="bed-panel__tabs">
          {TAB_LABELS.map(([k, v]) => (
            <button key={k} className={`bed-panel__tab ${tab === k ? 'bed-panel__tab--active' : ''}`}
              onClick={() => setTab(k)} disabled={!patient && (k === 'checklist' || k === 'notes')}>
              {v}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bed-panel__content">
          {loadingTab ? (
            <div className="bed-panel__loading">Đang tải…</div>
          ) : (
            <>
              {/* Info Tab */}
              {tab === 'info' && (
                patient ? (
                  <div className="bed-panel__info">
                    <div className="bed-panel__info-row">
                      <label>Họ tên</label>
                      <span>{patient.full_name}</span>
                    </div>
                    <div className="bed-panel__info-row">
                      <label>Mã BN</label>
                      <span>{patient.patient_code}</span>
                    </div>
                    <div className="bed-panel__info-row">
                      <label>Ngày sinh</label>
                      <span>{patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString('vi-VN') : '—'}</span>
                    </div>
                    <div className="bed-panel__info-row">
                      <label>Giới tính</label>
                      <span>{patient.gender === 'male' ? 'Nam' : patient.gender === 'female' ? 'Nữ' : '—'}</span>
                    </div>
                    <div className="bed-panel__info-row">
                      <label>SĐT</label>
                      <span>{patient.phone || '—'}</span>
                    </div>
                    <div className="bed-panel__info-row">
                      <label>Chẩn đoán</label>
                      <span className="bed-panel__info-highlight">{patient.diagnosis || '—'}</span>
                    </div>
                    <div className="bed-panel__info-row">
                      <label>BS phụ trách</label>
                      <span>{patient.doctor_name || '—'}</span>
                    </div>
                    <div className="bed-panel__info-row">
                      <label>Ngày nhập viện</label>
                      <span>{patient.admitted_at ? new Date(patient.admitted_at).toLocaleDateString('vi-VN') : '—'}</span>
                    </div>
                    <div className="bed-panel__info-row">
                      <label>Số ngày nằm</label>
                      <span className="bed-panel__info-highlight">{daysAdmitted != null ? `${daysAdmitted} ngày` : '—'}</span>
                    </div>
                    <div className="bed-panel__info-row">
                      <label>Dự kiến ra viện</label>
                      <span>{patient.expected_discharge ? new Date(patient.expected_discharge).toLocaleDateString('vi-VN') : '—'}</span>
                    </div>
                    <div className="bed-panel__info-row">
                      <label>Trạng thái</label>
                      <span className={`bed-panel__badge bed-panel__badge--${patient.status}`}>
                        {STATUS_LABELS[patient.status || ''] || patient.status}
                      </span>
                    </div>
                    {patient.notes && (
                      <div className="bed-panel__info-notes">
                        <label>Ghi chú</label>
                        <p>{patient.notes}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bed-panel__empty">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5">
                      <path d="M3 7v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V7"/>
                      <path d="M3 7l4-4h10l4 4"/>
                      <path d="M12 11v4"/><path d="M10 13h4"/>
                    </svg>
                    <p>Giường đang trống</p>
                    {bedStatus === 'empty' && (
                      <button className="btn btn--primary btn--sm" onClick={onAssign}>Xếp bệnh nhân</button>
                    )}
                  </div>
                )
              )}

              {/* Checklist Tab */}
              {tab === 'checklist' && patient && (
                <div className="bed-panel__checklist">
                  {checklists.length === 0 ? (
                    <p className="bed-panel__loading">Không có mục checklist</p>
                  ) : checklists.map(c => (
                    <label key={c.template_id} className={`bed-panel__check-item ${c.is_completed ? 'bed-panel__check-item--done' : ''}`}>
                      <input type="checkbox" checked={c.is_completed}
                        onChange={() => handleToggleChecklist(c.template_id, !c.is_completed)} />
                      <div>
                        <div className="bed-panel__check-name">{c.name}</div>
                        {c.is_completed && c.completed_by_name && (
                          <div className="bed-panel__check-meta">{c.completed_by_name} · {c.completed_at ? new Date(c.completed_at).toLocaleString('vi-VN') : ''}</div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {/* History Tab */}
              {tab === 'history' && (
                <div className="bed-panel__history">
                  {history.length === 0 ? (
                    <p className="bed-panel__loading">Chưa có lịch sử</p>
                  ) : history.map(h => (
                    <div key={h.id} className="bed-panel__history-item">
                      <div className="bed-panel__history-dot" />
                      <div>
                        <div className="bed-panel__history-action">
                          <strong>{h.action === 'assign' ? 'Xếp giường' : h.action === 'release' ? 'Giải phóng' : h.action === 'transfer_in' ? 'Chuyển đến' : h.action === 'transfer_out' ? 'Chuyển đi' : h.action}</strong>
                          {' '}— {h.patient_name} ({h.patient_code})
                        </div>
                        <div className="bed-panel__history-meta">
                          {h.performed_by_name || '—'} · {new Date(h.created_at).toLocaleString('vi-VN')}
                        </div>
                        {h.notes && <div className="bed-panel__history-note">{h.notes}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Notes Tab */}
              {tab === 'notes' && patient && (
                <div className="bed-panel__notes-area">
                  <textarea className="bed-panel__notes-input" placeholder="Ghi chú nhanh về bệnh nhân..." rows={4} />
                  <button className="btn btn--primary btn--sm" style={{ marginTop: 8, alignSelf: 'flex-end' }}>Lưu ghi chú</button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        {patient && (
          <div className="bed-panel__actions">
            <button className="btn btn--secondary btn--sm" onClick={onTransfer}>Chuyển giường</button>
            <button className="btn btn--secondary btn--sm" onClick={onRelease}>Giải phóng</button>
          </div>
        )}
      </div>
    </>
  );
}
