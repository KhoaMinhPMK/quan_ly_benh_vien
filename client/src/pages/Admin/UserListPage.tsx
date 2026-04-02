import { useState, useEffect } from 'react';
import { fetchUsers, createUser, updateUser, deleteUser, resetUserPassword, fetchDepartments, type User, type Department } from '../../services/api/medboardApi';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import Modal from '../../components/Modal/Modal';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import Select from '../../components/Select/Select';
import './AdminPages.scss';
import { ROLE_LABELS } from '../../utils/roleLabels';

export default function UserListPage() {
  const { user: me } = useAuth();
  const { t, lang } = useTranslation();
  const roleLabels = ROLE_LABELS[lang] || ROLE_LABELS['vi'];
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
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

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
        if (!form.email || !form.password || !form.full_name) { setError(t.common.fillAllFields); return; }
        await createUser({ email: form.email, password: form.password, full_name: form.full_name, role: form.role, department_id: form.department_id ? Number(form.department_id) : undefined });
      }
      setShowModal(false);
      load();
    } catch (e: any) { setError(e.response?.data?.error?.message || t.common.error); }
  };

  const handleDelete = async (id: number) => {
    setConfirmDeleteId(id);
  };
  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId) return;
    setDeleting(true);
    try {
      await deleteUser(confirmDeleteId);
      load();
      showToast(t.common.success, 'success');
    } catch {
      showToast(t.common.error, 'error');
    } finally {
      setDeleting(false);
      setConfirmDeleteId(null);
    }
  };
  const handleResetPw = async () => { if (resetPwId && newPw.length >= 6) { await resetUserPassword(resetPwId, newPw); setResetPwId(null); setNewPw(''); } };

  if (me?.role !== 'admin') return <div className="card"><div className="empty-state"><div className="empty-state__title">{t.common.noPermission}</div></div></div>;

  const subtitle = `${users.length} ${t.users.accountsCount}`;

  return (
    <div>
      <div className="page-header">
        <div><h2 className="page-header__title">{t.users.title}</h2><p className="page-header__subtitle">{subtitle}</p></div>
        <div className="page-header__actions"><button className="btn btn--primary" onClick={openCreate}>{t.users.addUser}</button></div>
      </div>

      <div className="admin-filters">
        <input className="form-field__input" placeholder={t.common.search} value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 240 }} />
        <Select value={roleFilter} onChange={val => setRoleFilter(val)}
          placeholder={t.users.filterRole}
          style={{ maxWidth: 160 }}
          options={[
            { value: '', label: t.users.filterRole },
            ...Object.entries(roleLabels).map(([k, v]) => ({ value: k, label: v }))
          ]}
        />
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
                  <button className="btn btn--ghost btn--sm" onClick={() => { setResetPwId(u.id); setNewPw(''); }}>{t.users.pwButton}</button>
                  {u.id !== me?.id && <button className="btn btn--ghost btn--sm" onClick={() => handleDelete(u.id)}>{t.common.delete}</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editing ? t.users.editUserTitle : t.users.addUserTitle} onClose={() => setShowModal(false)}>
          <div className="modal__body">
            {error && <div className="modal__error">{error}</div>}
            {!editing && <div className="form-field"><label className="form-field__label">{t.users.email}</label><input className="form-field__input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>}
            {!editing && <div className="form-field"><label className="form-field__label">{t.users.password}</label><input className="form-field__input" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} /></div>}
            <div className="form-field"><label className="form-field__label">{t.users.fullName}</label><input className="form-field__input" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} /></div>
            <div className="modal__row">
              <div className="form-field"><label className="form-field__label">{t.users.role}</label>
                <Select value={form.role} onChange={val => setForm({...form, role: val})}
                  options={Object.entries(roleLabels).map(([k, v]) => ({ value: k, label: v }))}
                />
              </div>
              <div className="form-field"><label className="form-field__label">{t.users.department}</label>
                <Select value={form.department_id} onChange={val => setForm({...form, department_id: val})}
                  placeholder={t.users.selectDept}
                  options={[
                    { value: '', label: t.users.selectDept },
                    ...depts.map(d => ({ value: String(d.id), label: d.name }))
                  ]}
                />
              </div>
            </div>
          </div>
          <div className="modal__footer">
            <button className="btn btn--secondary" onClick={() => setShowModal(false)}>{t.common.cancel}</button>
            <button className="btn btn--primary" onClick={handleSave}>{editing ? t.common.update : t.common.create}</button>
          </div>
        </Modal>
      )}

      {resetPwId && (
        <Modal title={t.users.resetPasswordTitle} onClose={() => setResetPwId(null)}>
          <div className="modal__body">
            <div className="form-field"><label className="form-field__label">{t.users.newPassword}</label><input className="form-field__input" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder={t.users.minChars} /></div>
          </div>
          <div className="modal__footer">
            <button className="btn btn--secondary" onClick={() => setResetPwId(null)}>{t.common.cancel}</button>
            <button className="btn btn--primary" onClick={handleResetPw}>{t.users.changePassword}</button>
          </div>
        </Modal>
      )}

      <ConfirmDialog
        open={!!confirmDeleteId}
        title={t.users.confirmDisable}
        message={t.users.confirmDisable}
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDeleteId(null)}
        loading={deleting}
      />
    </div>
  );
}
