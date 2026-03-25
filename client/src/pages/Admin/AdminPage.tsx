import { useState, useEffect } from 'react';
import { fetchSystemConfig, updateSystemConfig, fetchChecklistTemplates, createChecklistTemplate, updateChecklistTemplate, fetchConfigDepartments, createDepartment, updateDepartment, fetchAuditLogs, type SystemConfig, type AuditLog } from '../../services/api/medboardApi';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../i18n/LanguageContext';
import Modal from '../../components/Modal/Modal';
import './AdminPages.scss';

type Tab = 'config' | 'departments' | 'checklists' | 'audit';

export default function AdminPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('config');

  if (user?.role !== 'admin') return <div className="card"><div className="empty-state"><div className="empty-state__title">{t.common.noPermission}</div></div></div>;

  return (
    <div>
      <div className="page-header"><div><h2 className="page-header__title">{t.admin.title}</h2></div></div>
      <div className="tab-bar">
        {([['config', t.admin.tabConfig], ['departments', t.admin.tabDepartments], ['checklists', t.admin.tabChecklists], ['audit', t.admin.tabAudit]] as [Tab, string][]).map(([k, v]) => (
          <button key={k} className={`tab-bar__item ${tab === k ? 'tab-bar__item--active' : ''}`} onClick={() => setTab(k)}>{v}</button>
        ))}
      </div>
      {tab === 'config' && <ConfigSection />}
      {tab === 'departments' && <DepartmentSection />}
      {tab === 'checklists' && <ChecklistSection />}
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

  return (
    <div className="card" style={{ padding: 0 }}>
      <table className="data-table">
        <thead><tr><th>{t.admin.configKey}</th><th>{t.admin.configValue}</th><th>{t.admin.configDesc}</th><th style={{ width: 80 }}>{t.common.save}</th></tr></thead>
        <tbody>
          {loading ? <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32 }}>{t.common.loading}</td></tr> :
           configs.map(c => <ConfigRow key={c.config_key} cfg={c} onSave={handleUpdate} />)}
        </tbody>
      </table>
    </div>
  );
}

function ConfigRow({ cfg, onSave }: { cfg: SystemConfig; onSave: (k: string, v: string) => void }) {
  const { t } = useTranslation();
  const [val, setVal] = useState(cfg.config_value);
  return (
    <tr>
      <td><strong>{cfg.config_key}</strong></td>
      <td><input className="form-field__input" value={val} onChange={e => setVal(e.target.value)} style={{ maxWidth: 200 }} /></td>
      <td style={{ fontSize: 13, color: '#6B7280' }}>{cfg.description}</td>
      <td><button className="btn btn--primary btn--sm" onClick={() => onSave(cfg.config_key, val)}>{t.common.save}</button></td>
    </tr>
  );
}

function DepartmentSection() {
  const { t, lang } = useTranslation();
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
        <Modal title={editing ? (lang === 'vi' ? 'Sửa khoa' : 'Edit Department') : t.admin.addDeptTitle} onClose={() => setShowModal(false)}>
          <div className="modal__body">
            <div className="form-field"><label className="form-field__label">{t.admin.deptName}</label><input className="form-field__input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div className="form-field"><label className="form-field__label">{t.admin.deptCode}</label><input className="form-field__input" value={form.code} onChange={e => setForm({...form, code: e.target.value})} disabled={!!editing} style={editing ? { opacity: 0.6 } : {}} /></div>
            <div className="form-field"><label className="form-field__label">{t.admin.deptDesc}</label><input className="form-field__input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
          </div>
          <div className="modal__footer">
            <button className="btn btn--secondary" onClick={() => setShowModal(false)}>{t.common.cancel}</button>
            <button className="btn btn--primary" onClick={handleSave}>{editing ? (lang === 'vi' ? 'Cập nhật' : 'Update') : t.common.create}</button>
          </div>
        </Modal>
      )}
    </>
  );
}

function ChecklistSection() {
  const { t, lang } = useTranslation();
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
        <Modal title={editing ? (lang === 'vi' ? 'Sửa mục checklist' : 'Edit Checklist Item') : t.admin.addChecklistTitle} onClose={() => setShowModal(false)}>
          <div className="modal__body">
            <div className="form-field"><label className="form-field__label">{t.admin.checklistName}</label><input className="form-field__input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div className="form-field"><label className="form-field__label">{t.admin.checklistDesc}</label><input className="form-field__input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
            <div className="form-field"><label className="form-field__label">{t.admin.sortOrder}</label><input className="form-field__input" type="number" value={form.sort_order} onChange={e => setForm({...form, sort_order: Number(e.target.value)})} /></div>
          </div>
          <div className="modal__footer">
            <button className="btn btn--secondary" onClick={() => setShowModal(false)}>{t.common.cancel}</button>
            <button className="btn btn--primary" onClick={handleSave}>{editing ? (lang === 'vi' ? 'Cập nhật' : 'Update') : t.common.create}</button>
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
  useEffect(() => { setLoading(true); fetchAuditLogs().then(setLogs).catch(() => {}).finally(() => setLoading(false)); }, []);

  return (
    <div className="card" style={{ padding: 0 }}>
      <table className="data-table">
        <thead><tr><th>{t.admin.auditTime}</th><th>{t.admin.auditUser}</th><th>{t.admin.auditAction}</th><th>{t.admin.auditEntity}</th><th>{t.admin.auditId}</th></tr></thead>
        <tbody>
          {loading ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32 }}>{t.common.loading}</td></tr> :
           logs.length === 0 ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32 }}>{t.admin.noAuditLogs}</td></tr> :
           logs.map(l => (
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
  );
}
