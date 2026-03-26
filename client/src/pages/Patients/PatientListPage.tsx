import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchPatients, updatePatient, type Patient } from '../../services/api/medboardApi';
import { useTranslation } from '../../i18n/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import AddPatientModal from './AddPatientModal';
import PatientAssignBedModal from './PatientAssignBedModal';
import Modal from '../../components/Modal/Modal';
import iconSearch from '../../assets/icons/outline/search.svg';
import iconPlus from '../../assets/icons/outline/adjustments-plus.svg';
import iconMapPin from '../../assets/icons/outline/map-pin.svg';
import iconStethoscope from '../../assets/icons/outline/stethoscope.svg';
import iconUserCircle from '../../assets/icons/outline/user-circle.svg';
import iconCalendar from '../../assets/icons/outline/calendar.svg';
import './PatientListPage.scss';

const STATUS_BADGE: Record<string, string> = {
  admitted: 'badge--info', treating: 'badge--success', waiting_discharge: 'badge--warning', discharged: 'badge--neutral',
};

export default function PatientListPage() {
  const { t, lang } = useTranslation();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [filterDoctor, setFilterDoctor] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [assignBedPatientId, setAssignBedPatientId] = useState<number | null>(null);
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
      .catch(() => { showToast(t.common.error, 'error'); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPatients(); }, [filterStatus, search]);

  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && patients.length > 0) {
      const p = patients.find(x => x.id.toString() === editId);
      if (p) openEdit(p);
      setSearchParams(new URLSearchParams());
    }
  }, [searchParams, patients, setSearchParams]);

  const formatDate = (d: string | null) => {
    if (!d) return '--';
    return new Date(d).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US');
  };

  const filteredPatients = filterDoctor ? patients.filter(p => p.doctor_name?.toLowerCase().includes(filterDoctor.toLowerCase())) : patients;
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
      await updatePatient(editPatient.id, editForm as Record<string, string>);
      setEditPatient(null);
      showToast(t.common.success, 'success');
      loadPatients();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: { message?: string } } } };
      setEditError(err.response?.data?.error?.message || t.common.error);
    }
  };

  const subtitle = `${filteredPatients.length} ${t.patients.patientsCount}`;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-header__title">{t.patients.title}</h2>
          <p className="page-header__subtitle">{subtitle}</p>
        </div>
        <div className="page-header__actions">
          <button className="btn btn--primary" onClick={() => setShowAddModal(true)}>
            <img src={iconPlus} alt="" className="btn__icon btn__icon--inverted" />
            {t.patients.addPatient}
          </button>
        </div>
      </div>

      {waitingList.length > 0 && (
        <div className="alert-banner alert-banner--warning patient-list__alert">
          <div className="alert-banner__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div className="alert-banner__content">
            <div className="alert-banner__title">{`${waitingList.length} ${t.patients.waitingBedAlert}`}</div>
            <div className="alert-banner__tags">
              {waitingList.slice(0, 5).map(p => (
                <span key={p.id} className="alert-banner__tag alert-banner__tag--warning" onClick={() => setAssignBedPatientId(p.id)} style={{ cursor: 'pointer' }}>
                  {p.full_name} <span style={{fontSize:11, opacity:0.8}}> + Xếp</span>
                </span>
              ))}
              {waitingList.length > 5 && (
                <span className="alert-banner__tag alert-banner__tag--warning alert-banner__tag--more">+{waitingList.length - 5} {t.common.more}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="patient-filters">
        <div className="patient-filters__search">
          <img src={iconSearch} alt="" className="patient-filters__search-icon" />
          <input type="text" className="form-field__input" placeholder={t.patients.searchPlaceholder}
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="form-field__input patient-filters__select" value={filterStatus || ''}
          onChange={(e) => setFilterStatus(e.target.value || undefined)}>
          <option value="">{t.patients.filterStatus}</option>
          <option value="admitted">{t.patients.statusAdmitted}</option>
          <option value="treating">{t.patients.statusTreating}</option>
          <option value="waiting_discharge">{t.patients.statusWaiting}</option>
        </select>
        <input type="text" className="form-field__input patient-filters__select" placeholder={t.patients.allDoctors || 'Bác sĩ phụ trách...'}
          value={filterDoctor} onChange={(e) => setFilterDoctor(e.target.value)} />
      </div>

      {/* Summary Stats */}
      {!loading && filteredPatients.length > 0 && (
        <div className="patient-stats">
          <div className="patient-stats__item">
            <span className="patient-stats__value">{filteredPatients.length}</span>
            <span className="patient-stats__label">{t.common.total}</span>
          </div>
          <div className="patient-stats__item patient-stats__item--success">
            <span className="patient-stats__value">{filteredPatients.filter(p => p.status === 'treating').length}</span>
            <span className="patient-stats__label">{t.patients.statusTreating}</span>
          </div>
          <div className="patient-stats__item patient-stats__item--info">
            <span className="patient-stats__value">{filteredPatients.filter(p => p.status === 'admitted').length}</span>
            <span className="patient-stats__label">{t.patients.statusAdmitted}</span>
          </div>
          <div className="patient-stats__item patient-stats__item--warning">
            <span className="patient-stats__value">{filteredPatients.filter(p => p.status === 'waiting_discharge').length}</span>
            <span className="patient-stats__label">{t.patients.statusWaiting}</span>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="card patient-list__loading">
          <div className="loading-screen__spinner patient-list__spinner" />
          <p className="patient-list__loading-text">{t.common.loadingData}</p>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="card patient-list__empty">
          <p className="patient-list__empty-text">{t.patients.noPatients}</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="card patient-list__table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t.patients.patientCode}</th>
                  <th>{t.patients.fullName}</th>
                  <th>{t.patients.roomBed}</th>
                  <th>{t.patients.diagnosis}</th>
                  <th>{t.patients.doctor}</th>
                  <th>{t.patients.admitted}</th>
                  <th>{t.patients.expectedDC}</th>
                  <th>{t.patients.status}</th>
                  <th className="data-table__col-action"></th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((p) => (
                  <tr key={p.id}>
                    <td><strong>{p.patient_code}</strong></td>
                    <td>{p.full_name}</td>
                    <td>{p.room_code && p.bed_code ? `${p.room_code} / ${p.bed_code}` : <span className="text-muted">{t.patients.noBed}</span>}</td>
                    <td className="data-table__col-diagnosis">{p.diagnosis || '--'}</td>
                    <td>{p.doctor_name || '--'}</td>
                    <td>{formatDate(p.admitted_at)}</td>
                    <td>{formatDate(p.expected_discharge)}</td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[p.status] || 'badge--neutral'}`}>
                        {statusLabels[p.status] || p.status}
                      </span>
                    </td>
                    <td>
                      <div className="data-table__actions" style={{ display: 'flex', gap: 4 }}>
                        {!p.bed_id && p.status !== 'discharged' && (
                          <button className="btn btn--primary btn--sm" onClick={(e) => { e.stopPropagation(); setAssignBedPatientId(p.id); }}>+ Xếp giường</button>
                        )}
                        <button className="btn btn--ghost btn--sm" onClick={(e) => { e.stopPropagation(); openEdit(p); }}>{t.common.edit}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="patient-cards">
            {filteredPatients.map((p) => (
              <div key={p.id} className="patient-card" onClick={() => openEdit(p)}>
                <div className="patient-card__header">
                  <span className="patient-card__code">{p.patient_code}</span>
                  <span className={`badge ${STATUS_BADGE[p.status] || 'badge--neutral'}`}>
                    {statusLabels[p.status] || p.status}
                  </span>
                </div>
                <div className="patient-card__name">{p.full_name}</div>
                <div className="patient-card__details">
                  <div className="patient-card__row">
                    <img src={iconMapPin} alt="" className="patient-card__icon" />
                    <span>{p.room_code && p.bed_code ? `${p.room_code} / ${p.bed_code}` : t.patients.noBed}</span>
                  </div>
                  <div className="patient-card__row">
                    <img src={iconStethoscope} alt="" className="patient-card__icon" />
                    <span className="patient-card__diagnosis">{p.diagnosis || '--'}</span>
                  </div>
                  <div className="patient-card__row">
                    <img src={iconUserCircle} alt="" className="patient-card__icon" />
                    <span>{p.doctor_name || '--'}</span>
                  </div>
                  <div className="patient-card__row">
                    <img src={iconCalendar} alt="" className="patient-card__icon" />
                    <span>{formatDate(p.admitted_at)} → {formatDate(p.expected_discharge)}</span>
                  </div>
                </div>
                <div className="patient-card__action">
                  <button className="btn btn--ghost btn--sm">{t.common.edit} ›</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <AddPatientModal open={showAddModal} onClose={() => setShowAddModal(false)} onCreated={() => { loadPatients(); showToast(t.common.success, 'success'); }} />
      <PatientAssignBedModal open={!!assignBedPatientId} patientId={assignBedPatientId} onClose={() => setAssignBedPatientId(null)} onAssigned={() => { setAssignBedPatientId(null); loadPatients(); showToast(t.common.success, 'success'); }} />

      {/* Edit Patient Modal */}
      {editPatient && (
        <Modal title={t.patients.editPatient} onClose={() => setEditPatient(null)}>
          <div className="modal__body">
            {editError && <div className="modal__error">{editError}</div>}
            <div className="form-field"><label className="form-field__label">{t.patients.fullName}</label>
              <input className="form-field__input form-field__input--disabled" value={editPatient.full_name} disabled /></div>
            <div className="form-field"><label className="form-field__label">{t.patients.diagnosis}</label>
              <input className="form-field__input" value={editForm.diagnosis} onChange={e => setEditForm({...editForm, diagnosis: e.target.value})} /></div>
            <div className="modal__row">
              <div className="form-field"><label className="form-field__label">{t.patients.doctor}</label>
                <input className="form-field__input" value={editForm.doctor_name} onChange={e => setEditForm({...editForm, doctor_name: e.target.value})} /></div>
              <div className="form-field"><label className="form-field__label">{t.patients.expectedDC}</label>
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
            <button className="btn btn--primary" onClick={handleEditSave}>{t.common.update}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
