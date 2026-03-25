import { useState, useEffect } from 'react';
import { fetchSystemConfig, updateSystemConfig, fetchChecklistTemplates, createChecklistTemplate, fetchConfigDepartments, createDepartment, fetchAuditLogs, type SystemConfig, type AuditLog } from '../../services/api/medboardApi';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../../components/Modal/Modal';
import './AdminPages.scss';

type Tab = 'config' | 'departments' | 'checklists' | 'audit';

export default function AdminPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('config');

  if (user?.role !== 'admin') return <div className="card"><div className="empty-state"><div className="empty-state__title">Khong co quyen truy cap</div></div></div>;

  return (
    <div>
      <div className="page-header"><div><h2 className="page-header__title">Quan tri he thong</h2></div></div>
      <div className="tab-bar">
        {([['config', 'Cau hinh'], ['departments', 'Khoa/Phong ban'], ['checklists', 'Checklist'], ['audit', 'Nhat ky']] as [Tab, string][]).map(([k, v]) => (
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
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const load = () => { setLoading(true); fetchSystemConfig().then(setConfigs).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(load, []);

  const handleUpdate = async (key: string, value: string) => { await updateSystemConfig(key, value); load(); };

  return (
    <div className="card" style={{ padding: 0 }}>
      <table className="data-table">
        <thead><tr><th>Cau hinh</th><th>Gia tri</th><th>Mo ta</th><th style={{ width: 80 }}>Luu</th></tr></thead>
        <tbody>
          {loading ? <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32 }}>Dang tai...</td></tr> :
           configs.map(c => <ConfigRow key={c.config_key} cfg={c} onSave={handleUpdate} />)}
        </tbody>
      </table>
    </div>
  );
}

function ConfigRow({ cfg, onSave }: { cfg: SystemConfig; onSave: (k: string, v: string) => void }) {
  const [val, setVal] = useState(cfg.config_value);
  return (
    <tr>
      <td><strong>{cfg.config_key}</strong></td>
      <td><input className="form-field__input" value={val} onChange={e => setVal(e.target.value)} style={{ maxWidth: 200 }} /></td>
      <td style={{ fontSize: 13, color: '#6B7280' }}>{cfg.description}</td>
      <td><button className="btn btn--primary btn--sm" onClick={() => onSave(cfg.config_key, val)}>Luu</button></td>
    </tr>
  );
}

function DepartmentSection() {
  const [depts, setDepts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', description: '' });
  const load = () => { setLoading(true); fetchConfigDepartments().then(setDepts).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(load, []);

  const handleCreate = async () => { if (!form.name || !form.code) return; await createDepartment(form); setShowModal(false); setForm({ name: '', code: '', description: '' }); load(); };

  return (
    <>
      <div style={{ marginBottom: 16 }}><button className="btn btn--primary" onClick={() => setShowModal(true)}>+ Them khoa</button></div>
      <div className="card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead><tr><th>Ten khoa</th><th>Ma</th><th>Mo ta</th><th>Trang thai</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32 }}>Dang tai...</td></tr> :
             depts.map((d: any) => (
              <tr key={d.id}><td><strong>{d.name}</strong></td><td>{d.code}</td><td>{d.description || '—'}</td>
                <td><span className={`badge badge--${d.is_active ? 'success' : 'error'}`}>{d.is_active ? 'Hoat dong' : 'Tat'}</span></td></tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <Modal title="Them khoa moi" onClose={() => setShowModal(false)}>
          <div className="modal__body">
            <div className="form-field"><label className="form-field__label">Ten khoa</label><input className="form-field__input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div className="form-field"><label className="form-field__label">Ma khoa</label><input className="form-field__input" value={form.code} onChange={e => setForm({...form, code: e.target.value})} /></div>
            <div className="form-field"><label className="form-field__label">Mo ta</label><input className="form-field__input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
          </div>
          <div className="modal__footer">
            <button className="btn btn--secondary" onClick={() => setShowModal(false)}>Huy</button>
            <button className="btn btn--primary" onClick={handleCreate}>Tao</button>
          </div>
        </Modal>
      )}
    </>
  );
}

function ChecklistSection() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', sort_order: 0 });
  const load = () => { setLoading(true); fetchChecklistTemplates().then(setItems).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(load, []);

  const handleCreate = async () => { if (!form.name) return; await createChecklistTemplate(form); setShowModal(false); setForm({ name: '', description: '', sort_order: 0 }); load(); };

  return (
    <>
      <div style={{ marginBottom: 16 }}><button className="btn btn--primary" onClick={() => setShowModal(true)}>+ Them muc</button></div>
      <div className="card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead><tr><th>STT</th><th>Ten muc</th><th>Mo ta</th><th>Trang thai</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32 }}>Dang tai...</td></tr> :
             items.map((i: any) => (
              <tr key={i.id}><td>{i.sort_order}</td><td><strong>{i.name}</strong></td><td>{i.description || '—'}</td>
                <td><span className={`badge badge--${i.is_active ? 'success' : 'error'}`}>{i.is_active ? 'Bat' : 'Tat'}</span></td></tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <Modal title="Them muc checklist" onClose={() => setShowModal(false)}>
          <div className="modal__body">
            <div className="form-field"><label className="form-field__label">Ten muc</label><input className="form-field__input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div className="form-field"><label className="form-field__label">Mo ta</label><input className="form-field__input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
            <div className="form-field"><label className="form-field__label">Thu tu</label><input className="form-field__input" type="number" value={form.sort_order} onChange={e => setForm({...form, sort_order: Number(e.target.value)})} /></div>
          </div>
          <div className="modal__footer">
            <button className="btn btn--secondary" onClick={() => setShowModal(false)}>Huy</button>
            <button className="btn btn--primary" onClick={handleCreate}>Tao</button>
          </div>
        </Modal>
      )}
    </>
  );
}

function AuditSection() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { setLoading(true); fetchAuditLogs().then(setLogs).catch(() => {}).finally(() => setLoading(false)); }, []);

  return (
    <div className="card" style={{ padding: 0 }}>
      <table className="data-table">
        <thead><tr><th>Thoi gian</th><th>Nguoi dung</th><th>Hanh dong</th><th>Doi tuong</th><th>ID</th></tr></thead>
        <tbody>
          {loading ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32 }}>Dang tai...</td></tr> :
           logs.length === 0 ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32 }}>Chua co nhat ky</td></tr> :
           logs.map(l => (
            <tr key={l.id}>
              <td style={{ fontSize: 12 }}>{new Date(l.created_at).toLocaleString('vi-VN')}</td>
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
