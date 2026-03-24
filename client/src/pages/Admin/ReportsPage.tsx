import { useState, useEffect } from 'react';
import { fetchOccupancyReport, fetchDischargeReport, fetchMissingRecordsReport, fetchDepartmentReport, type OccupancyReport, type DischargeReport } from '../../services/api/medboardApi';
import './AdminPages.scss';

type Tab = 'occupancy' | 'discharge' | 'missing' | 'department';

export default function ReportsPage() {
  const [tab, setTab] = useState<Tab>('occupancy');
  const [occupancy, setOccupancy] = useState<OccupancyReport[]>([]);
  const [discharge, setDischarge] = useState<DischargeReport[]>([]);
  const [missing, setMissing] = useState<any[]>([]);
  const [department, setDepartment] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

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
    const csv = [headers.join(','), ...data.map(r => headers.map(h => `"${r[h] ?? ''}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${filename}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="page-header">
        <div><h2 className="page-header__title">Bao cao</h2></div>
      </div>

      <div className="tab-bar">
        {([['occupancy', 'Cong suat'], ['discharge', 'Ra vien'], ['missing', 'Ho so thieu'], ['department', 'Theo khoa']] as [Tab, string][]).map(([k, v]) => (
          <button key={k} className={`tab-bar__item ${tab === k ? 'tab-bar__item--active' : ''}`} onClick={() => setTab(k)}>{v}</button>
        ))}
      </div>

      {tab === 'discharge' && (
        <div className="admin-filters">
          <input type="date" className="form-field__input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ maxWidth: 160 }} />
          <span style={{ color: '#9CA3AF' }}>den</span>
          <input type="date" className="form-field__input" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ maxWidth: 160 }} />
        </div>
      )}

      {loading ? <div style={{ textAlign: 'center', padding: 48, color: '#9CA3AF' }}>Dang tai...</div> : (
        <>
          {tab === 'occupancy' && (
            <div className="card" style={{ padding: 0 }}>
              <div className="card__header" style={{ padding: '12px 20px' }}>
                <span className="card__title">Cong suat giuong theo phong</span>
                <button className="btn btn--secondary btn--sm" onClick={() => exportCSV(occupancy, 'bao-cao-cong-suat')}>Xuat CSV</button>
              </div>
              <table className="data-table">
                <thead><tr><th>Phong</th><th>Khoa</th><th>Tong giuong</th><th>Da dung</th><th>Trong</th><th>Ty le</th></tr></thead>
                <tbody>
                  {occupancy.map(r => (
                    <tr key={r.id}>
                      <td><strong>{r.room_code}</strong> — {r.name}</td>
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
                <span className="card__title">Danh sach da ra vien ({discharge.length})</span>
                <button className="btn btn--secondary btn--sm" onClick={() => exportCSV(discharge, 'bao-cao-ra-vien')}>Xuat CSV</button>
              </div>
              <table className="data-table">
                <thead><tr><th>Ma BN</th><th>Ho ten</th><th>Chan doan</th><th>BS phu trach</th><th>Ngay nhap</th><th>Ngay ra</th></tr></thead>
                <tbody>
                  {discharge.map(r => (
                    <tr key={r.id}>
                      <td>{r.patient_code}</td>
                      <td><strong>{r.full_name}</strong></td>
                      <td>{r.diagnosis}</td>
                      <td>{r.doctor_name}</td>
                      <td>{r.admitted_at ? new Date(r.admitted_at).toLocaleDateString('vi-VN') : '—'}</td>
                      <td>{r.discharged_at ? new Date(r.discharged_at).toLocaleDateString('vi-VN') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'missing' && (
            <div className="card" style={{ padding: 0 }}>
              <div className="card__header" style={{ padding: '12px 20px' }}>
                <span className="card__title">Ho so thieu ({missing.length} benh nhan)</span>
                <button className="btn btn--secondary btn--sm" onClick={() => exportCSV(missing, 'ho-so-thieu')}>Xuat CSV</button>
              </div>
              <table className="data-table">
                <thead><tr><th>Ma BN</th><th>Ho ten</th><th>BS phu trach</th><th>Tong muc</th><th>Da xong</th><th>Con thieu</th></tr></thead>
                <tbody>
                  {missing.map((r: any) => (
                    <tr key={r.id}>
                      <td>{r.patient_code}</td>
                      <td><strong>{r.full_name}</strong></td>
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
                <span className="card__title">Thong ke theo khoa</span>
                <button className="btn btn--secondary btn--sm" onClick={() => exportCSV(department, 'thong-ke-khoa')}>Xuat CSV</button>
              </div>
              <table className="data-table">
                <thead><tr><th>Khoa</th><th>Ma</th><th>So phong</th><th>Tong giuong</th><th>Dang dung</th><th>BN dang DTri</th></tr></thead>
                <tbody>
                  {department.map((r: any) => (
                    <tr key={r.id}>
                      <td><strong>{r.name}</strong></td>
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
    </div>
  );
}
