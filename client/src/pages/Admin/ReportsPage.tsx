import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchOccupancyReport, fetchDischargeReport, fetchMissingRecordsReport, fetchDepartmentReport, type OccupancyReport, type DischargeReport } from '../../services/api/medboardApi';
import { useTranslation } from '../../i18n/LanguageContext';
import PatientDrawer from '../../components/PatientDrawer/PatientDrawer';
import './AdminPages.scss';

type Tab = 'occupancy' | 'discharge' | 'missing' | 'department';

export default function ReportsPage() {
  const { t, lang } = useTranslation();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('occupancy');
  const [occupancy, setOccupancy] = useState<OccupancyReport[]>([]);
  const [discharge, setDischarge] = useState<DischargeReport[]>([]);
  const [missing, setMissing] = useState<any[]>([]);
  const [department, setDepartment] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [drawerPatientId, setDrawerPatientId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    const load = async () => {
      try {
        if (tab === 'occupancy') setOccupancy(await fetchOccupancyReport());
        if (tab === 'discharge') setDischarge(await fetchDischargeReport(dateFrom || undefined, dateTo || undefined));
        if (tab === 'missing') setMissing(await fetchMissingRecordsReport());
        if (tab === 'department') setDepartment(await fetchDepartmentReport());
      } catch {}
      setLoading(false);
    };
    load();
  }, [tab, dateFrom, dateTo]);

  const exportCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','), 
      ...data.map(r => headers.map(h => {
        const val = String(r[h] ?? '');
        return `"${val.replace(/"/g, '""')}"`;
      }).join(','))
    ].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${filename}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const locale = lang === 'vi' ? 'vi-VN' : 'en-US';

  const tabItems: [Tab, string][] = [
    ['occupancy', t.reports.tabOccupancy], ['discharge', t.reports.tabDischarge],
    ['missing', t.reports.tabMissing], ['department', t.reports.tabDepartment],
  ];

  return (
    <div>
      <div className="page-header">
        <div><h2 className="page-header__title">{t.reports.title}</h2></div>
      </div>

      <div className="tab-bar">
        {tabItems.map(([k, v]) => (
          <button key={k} className={`tab-bar__item ${tab === k ? 'tab-bar__item--active' : ''}`} onClick={() => setTab(k)}>{v}</button>
        ))}
      </div>

      {tab === 'discharge' && (
        <div className="admin-filters">
          <input type="date" className="form-field__input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ maxWidth: 160 }} />
          <span style={{ color: '#9CA3AF' }}>{t.reports.toLabel}</span>
          <input type="date" className="form-field__input" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ maxWidth: 160 }} />
        </div>
      )}

      {loading ? <div style={{ textAlign: 'center', padding: 48, color: '#9CA3AF' }}>{t.common.loading}</div> : (
        <>
          {tab === 'occupancy' && (
            <div className="card" style={{ padding: 0 }}>
              <div className="card__header" style={{ padding: '12px 20px' }}>
                <span className="card__title">{t.reports.occupancyTitle}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn--secondary btn--sm" onClick={handlePrint}>{t.common.print}</button>
                  <button className="btn btn--secondary btn--sm" onClick={() => exportCSV(occupancy, 'occupancy-report')}>{t.reports.exportCSV}</button>
                </div>
              </div>
              <table className="data-table">
                <thead><tr><th>{t.reports.room}</th><th>{t.reports.department}</th><th>{t.reports.totalBeds}</th><th>{t.reports.used}</th><th>{t.reports.empty}</th><th>{t.reports.rate}</th></tr></thead>
                <tbody>
                  {occupancy.map(r => (
                    <tr key={r.id}>
                      <td><button className="btn btn--ghost btn--sm" style={{ padding: 0, fontWeight: 600 }} onClick={() => navigate(`/rooms/${r.id}`)}>{r.room_code}</button> — {r.name}</td>
                      <td>{r.department_name}</td>
                      <td>{r.total_beds}</td>
                      <td>{r.occupied_beds}</td>
                      <td>{r.empty_beds}</td>
                      <td><span className={`badge badge--${r.occupancy_rate >= 100 ? 'error' : r.occupancy_rate >= 80 ? 'warning' : 'success'}`}>{r.occupancy_rate}%</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'discharge' && (
            <div className="card" style={{ padding: 0 }}>
              <div className="card__header" style={{ padding: '12px 20px' }}>
                <span className="card__title">{`${t.reports.dischargeTitle} (${discharge.length})`}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn--secondary btn--sm" onClick={handlePrint}>{t.common.print}</button>
                  <button className="btn btn--secondary btn--sm" onClick={() => exportCSV(discharge, 'discharge-report')}>{t.reports.exportCSV}</button>
                </div>
              </div>
              <table className="data-table">
                <thead><tr><th>{t.reports.patientCode}</th><th>{t.reports.patientName}</th><th>{t.reports.diagnosis}</th><th>{t.reports.doctor}</th><th>{t.reports.admittedAt}</th><th>{t.reports.dischargedAt}</th></tr></thead>
                <tbody>
                  {discharge.map(r => (
                    <tr key={r.id}>
                      <td>{r.patient_code}</td>
                      <td><button className="btn btn--ghost btn--sm" style={{ padding: 0, fontWeight: 600 }} onClick={() => setDrawerPatientId(r.id)}>{r.full_name}</button></td>
                      <td>{r.diagnosis}</td>
                      <td>{r.doctor_name}</td>
                      <td>{r.admitted_at ? new Date(r.admitted_at).toLocaleDateString(locale) : '—'}</td>
                      <td>{r.discharged_at ? new Date(r.discharged_at).toLocaleDateString(locale) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'missing' && (
            <div className="card" style={{ padding: 0 }}>
              <div className="card__header" style={{ padding: '12px 20px' }}>
                <span className="card__title">{`${t.reports.missingTitle} (${missing.length})`}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn--secondary btn--sm" onClick={handlePrint}>{t.common.print}</button>
                  <button className="btn btn--secondary btn--sm" onClick={() => exportCSV(missing, 'missing-records')}>{t.reports.exportCSV}</button>
                </div>
              </div>
              <table className="data-table">
                <thead><tr><th>{t.reports.patientCode}</th><th>{t.reports.patientName}</th><th>{t.reports.doctor}</th><th>{t.common.total}</th><th>{t.discharge.complete}</th><th>{t.reports.missingCount}</th></tr></thead>
                <tbody>
                  {missing.map((r: any) => (
                    <tr key={r.id}>
                      <td>{r.patient_code}</td>
                      <td><button className="btn btn--ghost btn--sm" style={{ padding: 0, fontWeight: 600 }} onClick={() => setDrawerPatientId(r.id)}>{r.full_name}</button></td>
                      <td>{r.doctor_name}</td>
                      <td>{r.total_items}</td>
                      <td>{r.completed_items}</td>
                      <td><span className="badge badge--error">{r.missing_items}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'department' && (
            <div className="card" style={{ padding: 0 }}>
              <div className="card__header" style={{ padding: '12px 20px' }}>
                <span className="card__title">{t.reports.departmentTitle}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn--secondary btn--sm" onClick={handlePrint}>{t.common.print}</button>
                  <button className="btn btn--secondary btn--sm" onClick={() => exportCSV(department, 'department-stats')}>{t.reports.exportCSV}</button>
                </div>
              </div>
              <table className="data-table">
                <thead><tr><th>{t.reports.department}</th><th>{t.common.code}</th><th>{t.reports.room}</th><th>{t.reports.totalBeds}</th><th>{t.reports.used}</th><th>{t.reports.totalPatients}</th></tr></thead>
                <tbody>
                  {department.map((r: any) => (
                    <tr key={r.id}>
                      <td><button className="btn btn--ghost btn--sm" style={{ padding: 0, fontWeight: 600 }} onClick={() => navigate('/rooms')}>{r.name}</button></td>
                      <td>{r.code}</td>
                      <td>{r.total_rooms}</td>
                      <td>{r.total_beds}</td>
                      <td>{r.occupied_beds}</td>
                      <td>{r.active_patients}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {drawerPatientId && (
        <PatientDrawer
          patientId={drawerPatientId}
          onClose={() => setDrawerPatientId(null)}
        />
      )}
    </div>
  );
}
