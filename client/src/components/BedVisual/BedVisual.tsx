import { useTranslation } from '../../i18n/LanguageContext';
import './BedVisual.scss';

interface BedVisualProps {
  bedCode: string;
  status: 'empty' | 'occupied' | 'locked' | 'cleaning';
  patientName?: string | null;
  patientCode?: string | null;
  diagnosis?: string | null;
  doctorName?: string | null;
  daysAdmitted?: number | null;
  patientStatus?: string | null;
  onClick?: () => void;
}

export default function BedVisual({
  bedCode, status, patientName, patientCode, diagnosis, doctorName,
  daysAdmitted, patientStatus, onClick,
}: BedVisualProps) {
  const { t } = useTranslation();

  const statusConfig: Record<string, { label: string; colorClass: string; iconPath: string }> = {
    empty: { label: t.beds.statusEmpty, colorClass: 'bed-visual--empty', iconPath: '' },
    occupied: { label: t.beds.statusOccupied, colorClass: 'bed-visual--occupied', iconPath: '' },
    locked: { label: t.beds.statusLocked, colorClass: 'bed-visual--locked', iconPath: 'M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4zm-2 4a2 2 0 1 1 4 0v2h-4V6z' },
    cleaning: { label: t.beds.statusCleaning, colorClass: 'bed-visual--cleaning', iconPath: '' },
  };

  const patientStatusLabels: Record<string, string> = {
    admitted: t.beds.patientStatusAdmitted,
    treating: t.beds.patientStatusTreating,
    waiting_discharge: t.beds.patientStatusWaiting,
  };

  const config = statusConfig[status] || statusConfig.empty;

  return (
    <div className={`bed-visual ${config.colorClass}`} onClick={onClick} role="button" tabIndex={0}>
      <div className="bed-visual__icon-area">
        <svg viewBox="0 0 64 48" className="bed-visual__svg" aria-hidden="true">
          <rect x="2" y="22" width="60" height="14" rx="3" className="bed-visual__frame" />
          <rect x="4" y="16" width="50" height="8" rx="2" className="bed-visual__mattress" />
          <rect x="6" y="14" width="12" height="6" rx="2" className="bed-visual__pillow" />
          <rect x="2" y="10" width="4" height="26" rx="1" className="bed-visual__headboard" />
          <rect x="58" y="18" width="4" height="18" rx="1" className="bed-visual__footboard" />
          <rect x="4" y="36" width="3" height="8" rx="1" className="bed-visual__leg" />
          <rect x="57" y="36" width="3" height="8" rx="1" className="bed-visual__leg" />
          {status === 'occupied' && (
            <>
              <ellipse cx="14" cy="11" rx="4" ry="4" className="bed-visual__person-head" />
              <rect x="10" y="16" width="36" height="6" rx="3" className="bed-visual__person-body" />
            </>
          )}
          {status === 'locked' && (
            <g transform="translate(24, 6) scale(0.7)" className="bed-visual__lock-icon">
              <path d={config.iconPath} fill="currentColor" />
            </g>
          )}
        </svg>
      </div>

      <div className="bed-visual__info">
        <div className="bed-visual__header">
          <span className="bed-visual__code">{bedCode}</span>
          <span className={`bed-visual__status-dot bed-visual__status-dot--${status}`} />
        </div>

        {status === 'occupied' && patientName ? (
          <div className="bed-visual__patient">
            <div className="bed-visual__patient-name" title={patientName}>{patientName}</div>
            <div className="bed-visual__patient-meta">
              {patientCode && <span className="bed-visual__patient-code">{patientCode}</span>}
              {daysAdmitted != null && daysAdmitted > 0 && (
                <span className="bed-visual__days">{daysAdmitted} {t.common.days}</span>
              )}
            </div>
            {diagnosis && <div className="bed-visual__diagnosis" title={diagnosis}>{diagnosis}</div>}
            {doctorName && <div className="bed-visual__doctor">BS. {doctorName}</div>}
            {patientStatus && patientStatusLabels[patientStatus] && (
              <span className={`bed-visual__badge bed-visual__badge--${patientStatus}`}>
                {patientStatusLabels[patientStatus]}
              </span>
            )}
          </div>
        ) : (
          <div className="bed-visual__empty-label">{config.label}</div>
        )}
      </div>

      {status === 'empty' && (
        <div className="bed-visual__action-hint">{t.beds.assignHint}</div>
      )}
    </div>
  );
}
