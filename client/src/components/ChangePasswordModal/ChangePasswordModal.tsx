import { useState } from 'react';
import { changePassword } from '../../services/api/medboardApi';
import { useTranslation } from '../../i18n/LanguageContext';

interface Props { open: boolean; onClose: () => void; }

export default function ChangePasswordModal({ open, onClose }: Props) {
  const { t } = useTranslation();
  const [current, setCurrent] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!current || !newPw || !confirm) { setError(t.passwordChange.errorRequired); return; }
    if (newPw.length < 6) { setError(t.passwordChange.errorMinLength); return; }
    if (newPw !== confirm) { setError(t.passwordChange.errorMismatch); return; }
    setLoading(true);
    try {
      await changePassword(current, newPw);
      setSuccess(true);
      setTimeout(() => { onClose(); setSuccess(false); setCurrent(''); setNewPw(''); setConfirm(''); }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || t.common.error);
    } finally { setLoading(false); }
  };

  const handleClose = () => { onClose(); setError(''); setSuccess(false); setCurrent(''); setNewPw(''); setConfirm(''); };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div className="modal__header">
          <h3 className="modal__title">{t.passwordChange.title}</h3>
          <button className="modal__close" onClick={handleClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal__body">
            {success && <div className="alert alert--success" style={{ marginBottom: 16 }}>{t.passwordChange.success}</div>}
            {error && <div className="alert alert--error" style={{ marginBottom: 16 }}>{error}</div>}
            <div className="form-group">
              <label className="form-label">{t.passwordChange.currentPassword}</label>
              <input type="password" className="form-input" value={current} onChange={e => setCurrent(e.target.value)} autoComplete="current-password" />
            </div>
            <div className="form-group">
              <label className="form-label">{t.passwordChange.newPassword}</label>
              <input type="password" className="form-input" value={newPw} onChange={e => setNewPw(e.target.value)} autoComplete="new-password" />
            </div>
            <div className="form-group">
              <label className="form-label">{t.passwordChange.confirmPassword}</label>
              <input type="password" className="form-input" value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" />
            </div>
          </div>
          <div className="modal__footer">
            <button type="button" className="btn btn--secondary" onClick={handleClose}>{t.common.cancel}</button>
            <button type="submit" className="btn btn--primary" disabled={loading}>{loading ? t.common.processing : t.passwordChange.submit}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
