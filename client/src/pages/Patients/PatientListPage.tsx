import { useState, useEffect } from 'react';
import { fetchPatients, updatePatient, type Patient } from '../../services/api/medboardApi';
import { useTranslation } from '../../i18n/LanguageContext';
import AddPatientModal from './AddPatientModal';
import Modal from '../../components/Modal/Modal';
import iconSearch from '../../assets/icons/outline/search.svg';
import iconPlus from '../../assets/icons/outline/adjustments-plus.svg';
import './PatientListPage.scss';

const STATUS_BADGE: Record<string, string> = {
  admitted: 'badge--info', treating: 'badge--success', waiting_discharge: 'badge--warning', discharged: 'badge--neutral',
};

export default function PatientListPage() {
  const { t, lang } = useTranslation();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [filterDoctor, setFilterDoctor] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  const [editForm, setEditForm] = useState({ diagnosis: '', doctor_name: '', expected_discharge: '', status: '', notes: '' });
  const [editError, setEditError] = useState('');

  const statusLabels: Record<string, string> = {
    admitted: t.patients.statusAdmitted, treating: t.patients.statusTreating,
    waiting_discharge: t.patients.statusWaiting, discharged: t.patients.statusDischarged,
  };

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
    return new Date(d).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US');
  };

  // Get unique doctor list for filter
  const doctors = [...new Set(patients.map(p => p.doctor_name).filter(Boolean))];
  const filteredPatients = filterDoctor ? patients.filter(p => p.doctor_name === filterDoctor) : patients;

  // Waiting list = admitted patients without beds
  const waitingList = patients.filter(p => !p.bed_id && p.status !== 'discharged');

  const openEdit = (p: Patient) => {
    setEditPatient(p);
    setEditForm({
      diagnosis: p.diagnosis || '',
      doctor_name: p.doctor_name || '',
      expected_discharge: p.expected_discharge ? p.expected_discharge.split('T')[0] : '',
      status: p.status,
      notes: p.notes || '',
    });
    setEditError('');
  };

  const handleEditSave = async () => {
    if (!editPatient) return;
    setEditError('');
    try {
      await updatePatient(editPatient.id, editForm as any);
      setEditPatient(null);
      loadPatients();
    } catch (e: any) { setEditError(e.response?.data?.error?.message || t.common.error); }
  };

  const subtitle = lang === 'vi' ? `${filteredPatients.length} bệnh nhân` : `${filteredPatients.length} patients`;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-header__title">{t.patients.title}</h2>
          <p className="page-header__subtitle">{subtitle}</p>
        </div>
        <div className="page-header__actions">
          <button className="btn btn--primary" onClick={() => setShowAddModal(true)}>
            <img src={iconPlus} alt="" className="btn__icon" style={{ filter: 'brightness(0) invert(1)' }} />
            {t.patients.addPatient}
          </button>
        </div>
      </div>

      {/* Waiting list warning */}
      {waitingList.length > 0 && (
        <div className="card" style={{ background: '#FEF3C7', border: '1px solid #F59E0B', marginBottom: 16, padding: '12px 16px' }}>
          <div style={{ fontWeight: 600, color: '#92400E', marginBottom: 4 }}>
            ⚠️ {lang === 'vi' ? `${waitingList.length} bệnh nhân chưa xếp giường` : `${waitingList.length} patients waiting for bed`}
          </div>
          <div style={{ fontSize: 13, color: '#92400E' }}>
            {waitingList.slice(0, 5).map(p => p.full_name).join(', ')}{waitingList.length > 5 ? '...' : ''}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="room-filters">
        <div className="room-filters__search">
          <img src={iconSearch} alt="" className="room-filters__search-icon" />
          <input type="text" className="form-field__input" placeholder={t.patients.searchPlaceholder}
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="form-field__input" value={filterStatus || ''}
          onChange={(e) => setFilterStatus(e.target.value || undefined)} style={{ width: '200px' }}>
          <option value="">{t.patients.filterStatus}</option>
          <option value="admitted">{t.patients.statusAdmitted}</option>
          <option value="treating">{t.patients.statusTreating}</option>
          <option value="waiting_discharge">{t.patients.statusWaiting}</option>
        </select>
        <select className="form-field__input" value={filterDoctor}
          onChange={(e) => setFilterDoctor(e.target.value)} style={{ width: '200px' }}>
          <option value="">{lang === 'vi' ? 'Tất cả bác sĩ' : 'All doctors'}</option>
          {doctors.map(d => <option key={d} value={d!}>{d}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <div className="loading-screen__spinner" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: '#6B7280' }}>{t.common.loadingData}</p>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ color: '#6B7280' }}>{t.patients.noPatients}</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>{t.patients.patientCode}</th>
                <th>{t.patients.fullName}</th>
                <th>{t.patients.roomBed}</th>
                <th>{t.patients.diagnosis}</th>
                <th>{t.patients.doctor}</th>
                <th>{lang === 'vi' ? 'Ngày nhập viện' : 'Admitted'}</th>
                <th>{lang === 'vi' ? 'Dự kiến ra viện' : 'Expected DC'}</th>
                <th>{t.patients.status}</th>
                <th style={{ width: 70 }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.patient_code}</strong></td>
                  <td>{p.full_name}</td>
                  <td>{p.room_code && p.bed_code ? `${p.room_code} / ${p.bed_code}` : <span style={{ color: '#9CA3AF' }}>{t.patients.noBed}</span>}</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.diagnosis || '--'}</td>
                  <td>{p.doctor_name || '--'}</td>
                  <td>{formatDate(p.admitted_at)}</td>
                  <td>{formatDate(p.expected_discharge)}</td>
                  <td>
                    <span className={`badge ${STATUS_BADGE[p.status] || 'badge--neutral'}`}>
                      {statusLabels[p.status] || p.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn--ghost btn--sm" onClick={(e) => { e.stopPropagation(); openEdit(p); }}>{t.common.edit}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddPatientModal open={showAddModal} onClose={() => setShowAddModal(false)} onCreated={loadPatients} />

      {/* Edit Patient Modal */}
      {editPatient && (
        <Modal title={lang === 'vi' ? 'Cập nhật bệnh nhân' : 'Edit Patient'} onClose={() => setEditPatient(null)}>
          <div className="modal__body">
            {editError && <div className="modal__error">{editError}</div>}
            <div className="form-field"><label className="form-field__label">{t.patients.fullName}</label>
              <input className="form-field__input" value={editPatient.full_name} disabled style={{ opacity: 0.6 }} /></div>
            <div className="form-field"><label className="form-field__label">{t.patients.diagnosis}</label>
              <input className="form-field__input" value={editForm.diagnosis} onChange={e => setEditForm({...editForm, diagnosis: e.target.value})} /></div>
            <div className="modal__row">
              <div className="form-field"><label className="form-field__label">{t.patients.doctor}</label>
                <input className="form-field__input" value={editForm.doctor_name} onChange={e => setEditForm({...editForm, doctor_name: e.target.value})} /></div>
              <div className="form-field"><label className="form-field__label">{lang === 'vi' ? 'Dự kiến ra viện' : 'Expected Discharge'}</label>
                <input className="form-field__input" type="date" value={editForm.expected_discharge} onChange={e => setEditForm({...editForm, expected_discharge: e.target.value})} /></div>
            </div>
            <div className="form-field"><label className="form-field__label">{t.patients.status}</label>
              <select className="form-field__input" value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}>
                <option value="admitted">{t.patients.statusAdmitted}</option>
                <option value="treating">{t.patients.statusTreating}</option>
                <option value="waiting_discharge">{t.patients.statusWaiting}</option>
              </select></div>
            <div className="form-field"><label className="form-field__label">{t.common.notes}</label>
              <textarea className="form-field__input" value={editForm.notes} onChange={e => setEditForm({...editForm, notes: e.target.value})} rows={3} /></div>
          </div>
          <div className="modal__footer">
            <button className="btn btn--secondary" onClick={() => setEditPatient(null)}>{t.common.cancel}</button>
            <button className="btn btn--primary" onClick={handleEditSave}>{lang === 'vi' ? 'Cập nhật' : 'Update'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
