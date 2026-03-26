import { useEffect, useRef } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import './ConfirmDialog.scss';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const VARIANT_ICONS: Record<string, string> = {
  danger: '⚠',
  warning: '⚠',
  info: 'ℹ',
};

export default function ConfirmDialog({
  open, title, message, confirmLabel, cancelLabel,
  variant = 'danger', onConfirm, onCancel, loading,
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => confirmBtnRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={e => e.stopPropagation()} role="alertdialog" aria-modal="true">
        <div className={`confirm-dialog__icon confirm-dialog__icon--${variant}`}>
          {VARIANT_ICONS[variant]}
        </div>
        <h3 className="confirm-dialog__title">{title}</h3>
        <p className="confirm-dialog__message">{message}</p>
        <div className="confirm-dialog__actions">
          <button className="btn btn--ghost" onClick={onCancel} disabled={loading}>
            {cancelLabel || t.common.cancel}
          </button>
          <button
            ref={confirmBtnRef}
            className={`btn ${variant === 'danger' ? 'btn--danger' : 'btn--primary'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? t.common.processing : (confirmLabel || t.common.confirm)}
          </button>
        </div>
      </div>
    </div>
  );
}
