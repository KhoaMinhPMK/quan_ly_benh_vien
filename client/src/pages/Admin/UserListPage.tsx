import { useState, useEffect } from 'react';
import { fetchUsers, createUser, updateUser, deleteUser, resetUserPassword, fetchDepartments, type User, type Department } from '../../services/api/medboardApi';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../../components/Modal/Modal';
import './AdminPages.scss';

const ROLE_LABELS: Record<string, string> = { admin: 'Quan tri', doctor: 'Bac si', nurse: 'Dieu duong', records_staff: 'Ho so', receptionist: 'Le tan' };

export default function UserListPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [depts, setDepts] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({ email: '', password: '', full_name: '', role: 'nurse', department_id: '' });
  const [error, setError] = useState('');
  const [resetPwId, setResetPwId] = useState<number | null>(null);
  const [newPw, setNewPw] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([fetchUsers({ search, role: roleFilter }), fetchDepartments()])
      .then(([u, d]) => { setUsers(u); setDepts(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, [search, roleFilter]);

  const openCreate = () => { setEditing(null); setForm({ email: '', password: '', full_name: '', role: 'nurse', department_id: '' }); setError(''); setShowModal(true); };
  const openEdit = (u: User) => { setEditing(u); setForm({ email: u.email, password: '', full_name: u.full_name, role: u.role, department_id: u.department_id ? String(u.department_id) : '' }); setError(''); setShowModal(true); };

  const handleSave = async () => {
    setError('');
    try {
      if (editing) {
        await updateUser(editing.id, { full_name: form.full_name, role: form.role as any, department_id: form.department_id ? Number(form.department_id) : null });
      } else {
        if (!form.email || !form.password || !form.full_name) { setError('Vui long dien day du thong tin'); return; }
        await createUser({ email: form.email, password: form.password, full_name: form.full_name, role: form.role, department_id: form.department_id ? Number(form.department_id) : undefined });
      }
      setShowModal(false);
      load();
    } catch (e: any) { setError(e.response?.data?.error?.message || 'Loi he thong'); }
  };

  const handleDelete = async (id: number) => { if (confirm('Vo hieu hoa tai khoan nay?')) { await deleteUser(id); load(); } };
  const handleResetPw = async () => { if (resetPwId && newPw.length >= 6) { await resetUserPassword(resetPwId, newPw); setResetPwId(null); setNewPw(''); } };

  if (me?.role !== 'admin') return <div className="card"><div className="empty-state"><div className="empty-state__title">Khong co quyen truy cap</div></div></div>;

  return (
    <div>
      <div className="page-header">
        <div><h2 className="page-header__title">Quan ly nguoi dung</h2><p className="page-header__subtitle">{users.length} tai khoan</p></div>
        <div className="page-header__actions"><button className="btn btn--primary" onClick={openCreate}>+ Them nguoi dung</button></div>
      </div>

      <div className="admin-filters">
        <input className="form-field__input" placeholder="Tim kiem..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 240 }} />
        <select className="form-field__input" value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ maxWidth: 160 }}>
          <option value="">Tat ca vai tro</option>
          {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead><tr><th>Ho ten</th><th>Email</th><th>Vai tro</th><th>Khoa</th><th>Trang thai</th><th style={{ width: 140 }}>Thao tac</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32 }}>Dang tai...</td></tr> :
             users.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32 }}>Khong co du lieu</td></tr> :
             users.map(u => (
              <tr key={u.id}>
                <td><strong>{u.full_name}</strong></td>
                <td>{u.email}</td>
                <td><span className={`badge badge--${u.role === 'admin' ? 'info' : 'neutral'}`}>{ROLE_LABELS[u.role] || u.role}</span></td>
                <td>{u.department_name || '—'}</td>
                <td><span className={`badge badge--${u.is_active ? 'success' : 'error'}`}>{u.is_active ? 'Hoat dong' : 'Vo hieu'}</span></td>
                <td>
                  <button className="btn btn--ghost btn--sm" onClick={() => openEdit(u)}>Sua</button>
                  <button className="btn btn--ghost btn--sm" onClick={() => { setResetPwId(u.id); setNewPw(''); }}>MK</button>
                  {u.id !== me?.id && <button className="btn btn--ghost btn--sm" onClick={() => handleDelete(u.id)}>Xoa</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editing ? 'Sua nguoi dung' : 'Them nguoi dung'} onClose={() => setShowModal(false)}>
          <div className="modal__body">
            {error && <div className="modal__error">{error}</div>}
            {!editing && <div className="form-field"><label className="form-field__label">Email</label><input className="form-field__input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>}
            {!editing && <div className="form-field"><label className="form-field__label">Mat khau</label><input className="form-field__input" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} /></div>}
            <div className="form-field"><label className="form-field__label">Ho ten</label><input className="form-field__input" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} /></div>
            <div className="modal__row">
              <div className="form-field"><label className="form-field__label">Vai tro</label>
                <select className="form-field__input" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                  {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="form-field"><label className="form-field__label">Khoa</label>
                <select className="form-field__input" value={form.department_id} onChange={e => setForm({...form, department_id: e.target.value})}>
                  <option value="">-- Chon khoa --</option>
                  {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="modal__footer">
            <button className="btn btn--secondary" onClick={() => setShowModal(false)}>Huy</button>
            <button className="btn btn--primary" onClick={handleSave}>{editing ? 'Cap nhat' : 'Tao'}</button>
          </div>
        </Modal>
      )}

      {resetPwId && (
        <Modal title="Reset mat khau" onClose={() => setResetPwId(null)}>
          <div className="modal__body">
            <div className="form-field"><label className="form-field__label">Mat khau moi</label><input className="form-field__input" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="It nhat 6 ky tu" /></div>
          </div>
          <div className="modal__footer">
            <button className="btn btn--secondary" onClick={() => setResetPwId(null)}>Huy</button>
            <button className="btn btn--primary" onClick={handleResetPw}>Doi mat khau</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
