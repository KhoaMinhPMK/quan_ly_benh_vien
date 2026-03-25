import { useState, useEffect } from 'react';
import { fetchUsers, createUser, updateUser, deleteUser, resetUserPassword, fetchDepartments, type User, type Department } from '../../services/api/medboardApi';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../i18n/LanguageContext';
import Modal from '../../components/Modal/Modal';
import './AdminPages.scss';

const ROLE_LABELS_VI: Record<string, string> = { admin: 'Quản trị', doctor: 'Bác sĩ', nurse: 'Điều dưỡng', records_staff: 'Hồ sơ', receptionist: 'Lễ tân' };
const ROLE_LABELS_EN: Record<string, string> = { admin: 'Admin', doctor: 'Doctor', nurse: 'Nurse', records_staff: 'Records', receptionist: 'Reception' };

export default function UserListPage() {
  const { user: me } = useAuth();
  const { t, lang } = useTranslation();
  const roleLabels = lang === 'vi' ? ROLE_LABELS_VI : ROLE_LABELS_EN;
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
        if (!form.email || !form.password || !form.full_name) { setError(lang === 'vi' ? 'Vui lòng điền đầy đủ thông tin' : 'Please fill in all fields'); return; }
        await createUser({ email: form.email, password: form.password, full_name: form.full_name, role: form.role, department_id: form.department_id ? Number(form.department_id) : undefined });
      }
      setShowModal(false);
      load();
    } catch (e: any) { setError(e.response?.data?.error?.message || t.common.error); }
  };

  const handleDelete = async (id: number) => {
    const msg = lang === 'vi' ? 'Vô hiệu hoá tài khoản này?' : 'Disable this account?';
    if (confirm(msg)) { await deleteUser(id); load(); }
  };
  const handleResetPw = async () => { if (resetPwId && newPw.length >= 6) { await resetUserPassword(resetPwId, newPw); setResetPwId(null); setNewPw(''); } };

  if (me?.role !== 'admin') return <div className="card"><div className="empty-state"><div className="empty-state__title">{t.common.noPermission}</div></div></div>;

  const subtitle = lang === 'vi' ? `${users.length} tài khoản` : `${users.length} accounts`;

  return (
    <div>
      <div className="page-header">
        <div><h2 className="page-header__title">{t.users.title}</h2><p className="page-header__subtitle">{subtitle}</p></div>
        <div className="page-header__actions"><button className="btn btn--primary" onClick={openCreate}>{t.users.addUser}</button></div>
      </div>

      <div className="admin-filters">
        <input className="form-field__input" placeholder={t.common.search} value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 240 }} />
        <select className="form-field__input" value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ maxWidth: 160 }}>
          <option value="">{t.users.filterRole}</option>
          {Object.entries(roleLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead><tr><th>{t.users.fullName}</th><th>{t.users.email}</th><th>{t.users.role}</th><th>{t.users.department}</th><th>{t.users.status}</th><th style={{ width: 140 }}>{t.common.actions}</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32 }}>{t.common.loading}</td></tr> :
             users.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32 }}>{t.common.noData}</td></tr> :
             users.map(u => (
              <tr key={u.id}>
                <td><strong>{u.full_name}</strong></td>
                <td>{u.email}</td>
                <td><span className={`badge badge--${u.role === 'admin' ? 'info' : 'neutral'}`}>{roleLabels[u.role] || u.role}</span></td>
                <td>{u.department_name || '—'}</td>
                <td><span className={`badge badge--${u.is_active ? 'success' : 'error'}`}>{u.is_active ? t.users.active : t.users.locked}</span></td>
                <td>
                  <button className="btn btn--ghost btn--sm" onClick={() => openEdit(u)}>{t.common.edit}</button>
                  <button className="btn btn--ghost btn--sm" onClick={() => { setResetPwId(u.id); setNewPw(''); }}>{lang === 'vi' ? 'MK' : 'PW'}</button>
                  {u.id !== me?.id && <button className="btn btn--ghost btn--sm" onClick={() => handleDelete(u.id)}>{t.common.delete}</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editing ? (lang === 'vi' ? 'Sửa người dùng' : 'Edit User') : (lang === 'vi' ? 'Thêm người dùng' : 'Add User')} onClose={() => setShowModal(false)}>
          <div className="modal__body">
            {error && <div className="modal__error">{error}</div>}
            {!editing && <div className="form-field"><label className="form-field__label">Email</label><input className="form-field__input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>}
            {!editing && <div className="form-field"><label className="form-field__label">{lang === 'vi' ? 'Mật khẩu' : 'Password'}</label><input className="form-field__input" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} /></div>}
            <div className="form-field"><label className="form-field__label">{t.users.fullName}</label><input className="form-field__input" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} /></div>
            <div className="modal__row">
              <div className="form-field"><label className="form-field__label">{t.users.role}</label>
                <select className="form-field__input" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                  {Object.entries(roleLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="form-field"><label className="form-field__label">{t.users.department}</label>
                <select className="form-field__input" value={form.department_id} onChange={e => setForm({...form, department_id: e.target.value})}>
                  <option value="">{lang === 'vi' ? '-- Chọn khoa --' : '-- Select dept --'}</option>
                  {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="modal__footer">
            <button className="btn btn--secondary" onClick={() => setShowModal(false)}>{t.common.cancel}</button>
            <button className="btn btn--primary" onClick={handleSave}>{editing ? (lang === 'vi' ? 'Cập nhật' : 'Update') : t.common.create}</button>
          </div>
        </Modal>
      )}

      {resetPwId && (
        <Modal title={lang === 'vi' ? 'Đặt lại mật khẩu' : 'Reset Password'} onClose={() => setResetPwId(null)}>
          <div className="modal__body">
            <div className="form-field"><label className="form-field__label">{lang === 'vi' ? 'Mật khẩu mới' : 'New Password'}</label><input className="form-field__input" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder={lang === 'vi' ? 'Ít nhất 6 ký tự' : 'Minimum 6 characters'} /></div>
          </div>
          <div className="modal__footer">
            <button className="btn btn--secondary" onClick={() => setResetPwId(null)}>{t.common.cancel}</button>
            <button className="btn btn--primary" onClick={handleResetPw}>{lang === 'vi' ? 'Đổi mật khẩu' : 'Reset'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
