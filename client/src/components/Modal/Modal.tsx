import { useEffect, type ReactNode } from 'react';
import './Modal.scss';

interface ModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  width?: number;
}

export default function Modal({ title, children, onClose, width }: ModalProps) {
  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={width ? { maxWidth: width } : undefined} onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <h3 className="modal__title">{title}</h3>
          <button className="modal__close" onClick={onClose}>&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}
