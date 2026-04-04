import { useState, useEffect } from 'react';
import { fetchSystemConfig, updateSystemConfig, fetchChecklistTemplates, createChecklistTemplate, updateChecklistTemplate, fetchConfigDepartments, createDepartment, updateDepartment, fetchAuditLogs, fetchWards, createWard, updateWard, deleteWard, type SystemConfig, type AuditLog, type Ward } from '../../services/api/medboardApi';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../i18n/LanguageContext';
import Modal from '../../components/Modal/Modal';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import './AdminPages.scss';

type Tab = 'config' | 'departments' | 'wards' | 'checklists' | 'statuses' | 'audit';

export default function AdminPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('config');

  if (user?.role !== 'admin') return <div className="card"><div className="empty-state"><div className="empty-state__title">{t.common.noPermission}</div></div></div>;

  return (
    <div>
      <div className="page-header"><div><h2 className="page-header__title">{t.admin.title}</h2></div></div>
      <div className="tab-bar">
        {([['config', t.admin.tabConfig], ['departments', t.admin.tabDepartments], ['wards', t.admin.tabWards || 'Khu điều trị'], ['checklists', t.admin.tabChecklists], ['statuses', t.admin.tabStatuses], ['audit', t.admin.tabAudit]] as [Tab, string][]).map(([k, v]) => (
          <button key={k} className={`tab-bar__item ${tab === k ? 'tab-bar__item--active' : ''}`} onClick={() => setTab(k)}>{v}</button>
        ))}
      </div>
      {tab === 'config' && <ConfigSection />}
      {tab === 'departments' && <DepartmentSection />}
      {tab === 'wards' && <WardSection />}
      {tab === 'checklists' && <ChecklistSection />}
      {tab === 'statuses' && <StatusSection />}
      {tab === 'audit' && <AuditSection />}
    </div>
  );
}

function ConfigSection() {
  const { t } = useTranslation();
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const load = () => { setLoading(true); fetchSystemConfig().then(setConfigs).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(load, []);

  const handleUpdate = async (key: string, value: string) => { await updateSystemConfig(key, value); load(); };

  if (loading) return <div className="card" style={{ textAlign: 'center', padding: 32 }}>{t.common.loading}</div>;

  return (
    <div className="admin-config-grid">
      {configs.map(c => <ConfigCard key={c.config_key} cfg={c} onSave={handleUpdate} />)}
    </div>
  );
}

function ConfigCard({ cfg, onSave }: { cfg: SystemConfig; onSave: (k: string, v: string) => void }) {
  const { t } = useTranslation();
  const [val, setVal] = useState(cfg.config_value);
  const [saving, setSaving] = useState(false);
  const changed = val !== cfg.config_value;

  const handleSave = async () => {
    setSaving(true);
    await onSave(cfg.config_key, val);
    setSaving(false);
  };

  return (
    <div className="admin-config-card">
      <div className="admin-config-card__header">
        <span className="admin-config-card__key">{cfg.config_key}</span>
        {changed && <span className="admin-config-card__changed">*</span>}
      </div>
      {cfg.description && <p className="admin-config-card__desc">{cfg.description}</p>}
      <div className="admin-config-card__input-row">
        <input className="form-field__input" value={val} onChange={e => setVal(e.target.value)} />
        <button className="btn btn--primary btn--sm" onClick={handleSave} disabled={!changed || saving}>
          {saving ? '...' : t.common.save}
        </button>
      </div>
    </div>
  );
}

function DepartmentSection() {
  const { t } = useTranslation();
  const [depts, setDepts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', code: '', description: '' });
  const load = () => { setLoading(true); fetchConfigDepartments().then(setDepts).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(load, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', code: '', description: '' }); setShowModal(true); };
  const openEdit = (d: any) => { setEditing(d); setForm({ name: d.name, code: d.code, description: d.description || '' }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.code) return;
    if (editing) { await updateDepartment(editing.id, form); }
    else { await createDepartment(form); }
    setShowModal(false);
    load();
  };

  return (
    <>
      <div style={{ marginBottom: 16 }}><button className="btn btn--primary" onClick={openCreate}>{t.admin.addDept}</button></div>
      <div className="card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead><tr><th>{t.admin.deptName}</th><th>{t.admin.deptCode}</th><th>{t.admin.deptDesc}</th><th>{t.admin.deptStatus}</th><th style={{ width: 70 }}></th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32 }}>{t.common.loading}</td></tr> :
             depts.map((d: any) => (
              <tr key={d.id}>
                <td><strong>{d.name}</strong></td>
                <td>{d.code}</td>
                <td>{d.description || '—'}</td>
                <td><span className={`badge badge--${d.is_active ? 'success' : 'error'}`}>{d.is_active ? t.common.active : t.common.inactive}</span></td>
                <td><button className="btn btn--ghost btn--sm" onClick={() => openEdit(d)}>{t.common.edit}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <Modal title={editing ? t.admin.editDeptTitle : t.admin.addDeptTitle} onClose={() => setShowModal(false)}>
          <div className="modal__body">
            <div className="form-field"><label className="form-field__label">{t.admin.deptName}</label><input className="form-field__input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div className="form-field"><label className="form-field__label">{t.admin.deptCode}</label><input className="form-field__input" value={form.code} onChange={e => setForm({...form, code: e.target.value})} disabled={!!editing} style={editing ? { opacity: 0.6 } : {}} /></div>
            <div className="form-field"><label className="form-field__label">{t.admin.deptDesc}</label><input className="form-field__input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
          </div>
          <div className="modal__footer">
            <button className="btn btn--secondary" onClick={() => setShowModal(false)}>{t.common.cancel}</button>
            <button className="btn btn--primary" onClick={handleSave}>{editing ? t.common.update : t.common.create}</button>
          </div>
        </Modal>
      )}
    </>
  );
}

function ChecklistSection() {
  const { t } = useTranslation();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '', sort_order: 0 });
  const load = () => { setLoading(true); fetchChecklistTemplates().then(setItems).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(load, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', description: '', sort_order: 0 }); setShowModal(true); };
  const openEdit = (i: any) => { setEditing(i); setForm({ name: i.name, description: i.description || '', sort_order: i.sort_order }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name) return;
    if (editing) { await updateChecklistTemplate(editing.id, form); }
    else { await createChecklistTemplate(form); }
    setShowModal(false);
    load();
  };

  return (
    <>
      <div style={{ marginBottom: 16 }}><button className="btn btn--primary" onClick={openCreate}>{t.admin.addChecklist}</button></div>
      <div className="card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead><tr><th>{t.admin.checklistOrder}</th><th>{t.admin.checklistName}</th><th>{t.admin.checklistDesc}</th><th>{t.admin.checklistStatus}</th><th style={{ width: 70 }}></th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32 }}>{t.common.loading}</td></tr> :
             items.map((i: any) => (
              <tr key={i.id}>
                <td>{i.sort_order}</td>
                <td><strong>{i.name}</strong></td>
                <td>{i.description || '—'}</td>
                <td><span className={`badge badge--${i.is_active ? 'success' : 'error'}`}>{i.is_active ? t.admin.on : t.admin.off}</span></td>
                <td><button className="btn btn--ghost btn--sm" onClick={() => openEdit(i)}>{t.common.edit}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <Modal title={editing ? t.admin.editChecklistTitle : t.admin.addChecklistTitle} onClose={() => setShowModal(false)}>
          <div className="modal__body">
            <div className="form-field"><label className="form-field__label">{t.admin.checklistName}</label><input className="form-field__input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div className="form-field"><label className="form-field__label">{t.admin.checklistDesc}</label><input className="form-field__input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
            <div className="form-field"><label className="form-field__label">{t.admin.sortOrder}</label><input className="form-field__input" type="number" value={form.sort_order} onChange={e => setForm({...form, sort_order: Number(e.target.value)})} /></div>
          </div>
          <div className="modal__footer">
            <button className="btn btn--secondary" onClick={() => setShowModal(false)}>{t.common.cancel}</button>
            <button className="btn btn--primary" onClick={handleSave}>{editing ? t.common.update : t.common.create}</button>
          </div>
        </Modal>
      )}
    </>
  );
}

function AuditSection() {
  const { t, lang } = useTranslation();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 20;

  useEffect(() => { setLoading(true); fetchAuditLogs().then(setLogs).catch(() => {}).finally(() => setLoading(false)); }, []);

  const filtered = logs.filter(l => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (l.user_name || '').toLowerCase().includes(q) || l.action.toLowerCase().includes(q) || l.entity_type.toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <div className="admin-filters" style={{ marginBottom: 16 }}>
        <input className="form-field__input" placeholder={t.common.search} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ maxWidth: 280 }} />
        <span style={{ fontSize: 13, color: '#6B7280' }}>{filtered.length} {t.admin.auditCount || 'bản ghi'}</span>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead><tr><th>{t.admin.auditTime}</th><th>{t.admin.auditUser}</th><th>{t.admin.auditAction}</th><th>{t.admin.auditEntity}</th><th>{t.admin.auditId}</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32 }}>{t.common.loading}</td></tr> :
             paged.length === 0 ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32 }}>{t.admin.noAuditLogs}</td></tr> :
             paged.map(l => (
              <tr key={l.id}>
                <td style={{ fontSize: 12 }}>{new Date(l.created_at).toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US')}</td>
                <td>{l.user_name || '—'}</td>
                <td><span className="badge badge--neutral">{l.action}</span></td>
                <td>{l.entity_type}</td>
                <td>{l.entity_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="admin-pagination">
          <button className="btn btn--ghost btn--sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← {t.common.prev || 'Trước'}</button>
          <span className="admin-pagination__info">{page}/{totalPages}</span>
          <button className="btn btn--ghost btn--sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>{t.common.next || 'Tiếp'} →</button>
        </div>
      )}
    </>
  );
}

const BED_STATUSES = [
  { key: 'empty', badge: 'success' },
  { key: 'occupied', badge: 'error' },
  { key: 'locked', badge: 'neutral' },
  { key: 'cleaning', badge: 'warning' },
] as const;

const PATIENT_STATUSES = [
  { key: 'admitted', badge: 'info' },
  { key: 'treating', badge: 'success' },
  { key: 'waiting_discharge', badge: 'warning' },
  { key: 'discharged', badge: 'neutral' },
] as const;

function StatusSection() {
  const { t } = useTranslation();

  const bedLabels: Record<string, string> = {
    empty: t.beds.statusEmpty,
    occupied: t.beds.statusOccupied,
    locked: t.beds.statusLocked,
    cleaning: t.beds.statusCleaning,
  };

  const patientLabels: Record<string, string> = {
    admitted: t.bedPanel.statusAdmitted,
    treating: t.bedPanel.statusTreating,
    waiting_discharge: t.bedPanel.statusWaiting,
    discharged: t.bedPanel.statusDischarged,
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
      <div className="card">
        <div className="card__header"><h3 className="card__title">{t.admin.bedStatuses}</h3></div>
        <table className="data-table">
          <thead><tr><th>{t.admin.statusKey}</th><th>{t.admin.statusLabel}</th><th>{t.admin.statusPreview}</th></tr></thead>
          <tbody>
            {BED_STATUSES.map(s => (
              <tr key={s.key}>
                <td><code>{s.key}</code></td>
                <td>{bedLabels[s.key]}</td>
                <td><span className={`badge badge--${s.badge}`}>{bedLabels[s.key]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card">
        <div className="card__header"><h3 className="card__title">{t.admin.patientStatuses}</h3></div>
        <table className="data-table">
          <thead><tr><th>{t.admin.statusKey}</th><th>{t.admin.statusLabel}</th><th>{t.admin.statusPreview}</th></tr></thead>
          <tbody>
            {PATIENT_STATUSES.map(s => (
              <tr key={s.key}>
                <td><code>{s.key}</code></td>
                <td>{patientLabels[s.key]}</td>
                <td><span className={`badge badge--${s.badge}`}>{patientLabels[s.key]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Ward Section (#3) ──
function WardSection() {
  const { t } = useTranslation();
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editWd, setEditWd] = useState<Ward | null>(null);
  const [form, setForm] = useState({ name: '', code: '', description: '', floor_start: 1, floor_end: 1 });
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState<Ward | null>(null);

  const load = () => { setLoading(true); fetchWards().then(setWards).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(load, []);

  const openAdd = () => { setEditWd(null); setForm({ name: '', code: '', description: '', floor_start: 1, floor_end: 1 }); setShowModal(true); };
  const openEdit = (w: Ward) => { setEditWd(w); setForm({ name: w.name, code: w.code, description: w.description || '', floor_start: w.floor_start, floor_end: w.floor_end }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.code) return;
    setSaving(true);
    try {
      if (editWd) { await updateWard(editWd.id, form); }
      else { await createWard(form); }
      setShowModal(false); load();
    } catch {}
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirmDel) return;
    try { await deleteWard(confirmDel.id); setConfirmDel(null); load(); } catch {}
  };

  const handleToggle = async (w: Ward) => {
    try { await updateWard(w.id, { is_active: !w.is_active } as any); load(); } catch {}
  };

  if (loading) return <div className="card" style={{ textAlign: 'center', padding: 32 }}>{t.common.loading}</div>;

  return (
    <>
      <div className="card" style={{ padding: 0 }}>
        <div className="card__header" style={{ padding: '12px 20px' }}>
          <span className="card__title">{t.admin.tabWards || 'Khu điều trị'} ({wards.length})</span>
          <button className="btn btn--primary btn--sm" onClick={openAdd}>+ {t.common.create}</button>
        </div>
        <table className="data-table">
          <thead><tr><th>{t.common.code}</th><th>{t.common.name}</th><th>{t.common.description}</th><th>Tầng</th><th>Phòng</th><th>Giường</th><th>{t.common.status}</th><th>{t.common.actions}</th></tr></thead>
          <tbody>
            {wards.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: '#9CA3AF' }}>{t.common.noData}</td></tr>
            ) : wards.map(w => (
              <tr key={w.id}>
                <td><code>{w.code}</code></td>
                <td style={{ fontWeight: 600 }}>{w.name}</td>
                <td>{w.description || '—'}</td>
                <td>{w.floor_start === w.floor_end ? `Tầng ${w.floor_start}` : `Tầng ${w.floor_start}–${w.floor_end}`}</td>
                <td>{w.room_count}</td>
                <td>{w.bed_count}</td>
                <td>
                  <button className={`badge badge--${w.is_active ? 'success' : 'default'}`} style={{ cursor: 'pointer', border: 'none' }} onClick={() => handleToggle(w)}>
                    {w.is_active ? t.common.active : t.common.inactive}
                  </button>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn--ghost btn--sm" onClick={() => openEdit(w)}>{t.common.edit}</button>
                    <button className="btn btn--ghost btn--sm" style={{ color: '#EF4444' }} onClick={() => setConfirmDel(w)}>{t.common.delete}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
      <Modal onClose={() => setShowModal(false)} title={editWd ? 'Sửa khu điều trị' : 'Thêm khu điều trị'}>
        <div className="form-stack">
          <div className="form-field">
            <label className="form-field__label">{t.common.name} *</label>
            <input className="form-field__input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Khu A - Nội khoa" />
          </div>
          <div className="form-field">
            <label className="form-field__label">{t.common.code} *</label>
            <input className="form-field__input" value={form.code} onChange={e => setForm({...form, code: e.target.value})} placeholder="KHU-A" />
          </div>
          <div className="form-field">
            <label className="form-field__label">{t.common.description}</label>
            <input className="form-field__input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-field">
              <label className="form-field__label">Tầng bắt đầu</label>
              <input className="form-field__input" type="number" min={1} value={form.floor_start} onChange={e => setForm({...form, floor_start: Number(e.target.value)})} />
            </div>
            <div className="form-field">
              <label className="form-field__label">Tầng kết thúc</label>
              <input className="form-field__input" type="number" min={1} value={form.floor_end} onChange={e => setForm({...form, floor_end: Number(e.target.value)})} />
            </div>
          </div>
          <button className="btn btn--primary" style={{ width: '100%' }} onClick={handleSave} disabled={saving}>
            {saving ? t.common.processing : t.common.save}
          </button>
        </div>
      </Modal>
      )}

      {confirmDel && (
      <ConfirmDialog
        open={!!confirmDel}
        title={`Xoá khu "${confirmDel?.name}"?`}
        message="Các phòng thuộc khu này sẽ bị gỡ liên kết. Hành động này không thể hoàn tác."
        confirmLabel={t.common.delete}
        cancelLabel={t.common.cancel}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDel(null)}
      />
      )}
    </>
  );
}
