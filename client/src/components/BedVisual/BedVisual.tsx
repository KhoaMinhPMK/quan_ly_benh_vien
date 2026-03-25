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

const STATUS_CONFIG: Record<string, { label: string; colorClass: string; iconPath: string }> = {
  empty: {
    label: 'Trống',
    colorClass: 'bed-visual--empty',
    iconPath: '',
  },
  occupied: {
    label: 'Có BN',
    colorClass: 'bed-visual--occupied',
    iconPath: '',
  },
  locked: {
    label: 'Khoá',
    colorClass: 'bed-visual--locked',
    iconPath: 'M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4zm-2 4a2 2 0 1 1 4 0v2h-4V6z',
  },
  cleaning: {
    label: 'Vệ sinh',
    colorClass: 'bed-visual--cleaning',
    iconPath: '',
  },
};

const PATIENT_STATUS_LABELS: Record<string, string> = {
  admitted: 'Mới nhập',
  treating: 'Đang ĐTrị',
  waiting_discharge: 'Chờ ra viện',
};

export default function BedVisual({
  bedCode, status, patientName, patientCode, diagnosis, doctorName,
  daysAdmitted, patientStatus, onClick,
}: BedVisualProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.empty;

  return (
    <div className={`bed-visual ${config.colorClass}`} onClick={onClick} role="button" tabIndex={0}>
      {/* Bed SVG shape */}
      <div className="bed-visual__icon-area">
        <svg viewBox="0 0 64 48" className="bed-visual__svg" aria-hidden="true">
          {/* Bed frame */}
          <rect x="2" y="22" width="60" height="14" rx="3" className="bed-visual__frame" />
          {/* Mattress */}
          <rect x="4" y="16" width="50" height="8" rx="2" className="bed-visual__mattress" />
          {/* Pillow */}
          <rect x="6" y="14" width="12" height="6" rx="2" className="bed-visual__pillow" />
          {/* Headboard */}
          <rect x="2" y="10" width="4" height="26" rx="1" className="bed-visual__headboard" />
          {/* Footboard */}
          <rect x="58" y="18" width="4" height="18" rx="1" className="bed-visual__footboard" />
          {/* Legs */}
          <rect x="4" y="36" width="3" height="8" rx="1" className="bed-visual__leg" />
          <rect x="57" y="36" width="3" height="8" rx="1" className="bed-visual__leg" />
          {/* Person silhouette (only if occupied) */}
          {status === 'occupied' && (
            <>
              <ellipse cx="14" cy="11" rx="4" ry="4" className="bed-visual__person-head" />
              <rect x="10" y="16" width="36" height="6" rx="3" className="bed-visual__person-body" />
            </>
          )}
          {/* Lock icon overlay */}
          {status === 'locked' && (
            <g transform="translate(24, 6) scale(0.7)" className="bed-visual__lock-icon">
              <path d={config.iconPath} fill="currentColor" />
            </g>
          )}
        </svg>
      </div>

      {/* Bed info */}
      <div className="bed-visual__info">
        <div className="bed-visual__header">
          <span className="bed-visual__code">{bedCode}</span>
          <span className={`bed-visual__status-dot bed-visual__status-dot--${status}`} />
        </div>

        {status === 'occupied' && patientName ? (
          <div className="bed-visual__patient">
            <div className="bed-visual__patient-name" title={patientName}>
              {patientName}
            </div>
            <div className="bed-visual__patient-meta">
              {patientCode && <span className="bed-visual__patient-code">{patientCode}</span>}
              {daysAdmitted != null && daysAdmitted > 0 && (
                <span className="bed-visual__days">{daysAdmitted} ngày</span>
              )}
            </div>
            {diagnosis && (
              <div className="bed-visual__diagnosis" title={diagnosis}>
                {diagnosis}
              </div>
            )}
            {doctorName && (
              <div className="bed-visual__doctor">
                BS. {doctorName}
              </div>
            )}
            {patientStatus && PATIENT_STATUS_LABELS[patientStatus] && (
              <span className={`bed-visual__badge bed-visual__badge--${patientStatus}`}>
                {PATIENT_STATUS_LABELS[patientStatus]}
              </span>
            )}
          </div>
        ) : (
          <div className="bed-visual__empty-label">
            {config.label}
          </div>
        )}
      </div>

      {/* Click hint */}
      {status === 'empty' && (
        <div className="bed-visual__action-hint">+ Xếp giường</div>
      )}
    </div>
  );
}
