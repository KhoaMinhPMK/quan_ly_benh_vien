import { useState, useEffect } from 'react';
import { fetchPatients, type Patient } from '../../services/api/medboardApi';
import AddPatientModal from './AddPatientModal';
import iconSearch from '../../assets/icons/outline/search.svg';
import iconPlus from '../../assets/icons/outline/adjustments-plus.svg';
import './PatientListPage.scss';

const STATUS_LABELS: Record<string, string> = {
  admitted: 'Moi nhap vien',
  treating: 'Dang dieu tri',
  waiting_discharge: 'Cho ra vien',
  discharged: 'Da ra vien',
};

const STATUS_BADGE: Record<string, string> = {
  admitted: 'badge--info',
  treating: 'badge--success',
  waiting_discharge: 'badge--warning',
  discharged: 'badge--neutral',
};

export default function PatientListPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [showAddModal, setShowAddModal] = useState(false);

  const loadPatients = () => {
    setLoading(true);
    fetchPatients({ status: filterStatus, search: search || undefined })
      .then(setPatients)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPatients(); }, [filterStatus, search]);

  const formatDate = (d: string | null) => {
    if (!d) return '--';
    return new Date(d).toLocaleDateString('vi-VN');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-header__title">Benh nhan noi tru</h2>
          <p className="page-header__subtitle">{patients.length} benh nhan</p>
        </div>
        <div className="page-header__actions">
          <button className="btn btn--primary" onClick={() => setShowAddModal(true)}>
            <img src={iconPlus} alt="" className="btn__icon" style={{ filter: 'brightness(0) invert(1)' }} />
            Them benh nhan
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="room-filters">
        <div className="room-filters__search">
          <img src={iconSearch} alt="" className="room-filters__search-icon" />
          <input
            type="text"
            className="form-field__input"
            placeholder="Tim kiem ten, ma benh nhan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-field__input"
          value={filterStatus || ''}
          onChange={(e) => setFilterStatus(e.target.value || undefined)}
          style={{ width: '200px' }}
        >
          <option value="">Tat ca trang thai</option>
          <option value="admitted">Moi nhap vien</option>
          <option value="treating">Dang dieu tri</option>
          <option value="waiting_discharge">Cho ra vien</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <div className="loading-screen__spinner" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: '#6B7280' }}>Dang tai du lieu...</p>
        </div>
      ) : patients.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ color: '#6B7280' }}>Chua co benh nhan nao.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Ma BN</th>
                <th>Ho ten</th>
                <th>Phong / Giuong</th>
                <th>Chan doan</th>
                <th>BS phu trach</th>
                <th>Ngay nhap vien</th>
                <th>Du kien ra vien</th>
                <th>Trang thai</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.patient_code}</strong></td>
                  <td>{p.full_name}</td>
                  <td>{p.room_code && p.bed_code ? `${p.room_code} / ${p.bed_code}` : '--'}</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.diagnosis || '--'}</td>
                  <td>{p.doctor_name || '--'}</td>
                  <td>{formatDate(p.admitted_at)}</td>
                  <td>{formatDate(p.expected_discharge)}</td>
                  <td>
                    <span className={`badge ${STATUS_BADGE[p.status] || 'badge--neutral'}`}>
                      {STATUS_LABELS[p.status] || p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddPatientModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreated={loadPatients}
      />
    </div>
  );
}
