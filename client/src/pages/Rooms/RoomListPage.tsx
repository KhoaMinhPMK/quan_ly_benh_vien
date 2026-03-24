import { useState, useEffect } from 'react';
import { fetchRooms, fetchDepartments, type Room, type Department } from '../../services/api/medboardApi';
import iconSearch from '../../assets/icons/outline/search.svg';
import iconPlus from '../../assets/icons/outline/adjustments-plus.svg';
import './RoomListPage.scss';

const TYPE_LABELS: Record<string, string> = {
  normal: 'Thuong',
  vip: 'VIP',
  icu: 'ICU',
  isolation: 'Cach ly',
};

export default function RoomListPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState<number | undefined>();
  const [filterStatus, setFilterStatus] = useState<string | undefined>();

  useEffect(() => {
    fetchDepartments().then(setDepartments).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchRooms({ department_id: filterDept, status: filterStatus, search: search || undefined })
      .then(setRooms)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filterDept, filterStatus, search]);

  const getOccupancyClass = (room: Room) => {
    if (room.total_beds === 0) return '';
    const ratio = room.occupied_beds / room.total_beds;
    if (ratio >= 1) return 'badge--error';
    if (ratio >= 0.8) return 'badge--warning';
    return 'badge--success';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-header__title">Phong - Giuong</h2>
          <p className="page-header__subtitle">{rooms.length} phong</p>
        </div>
        <div className="page-header__actions">
          <button className="btn btn--primary">
            <img src={iconPlus} alt="" className="btn__icon" style={{ filter: 'brightness(0) invert(1)' }} />
            Them phong
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
            placeholder="Tim kiem phong..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-field__input"
          value={filterDept || ''}
          onChange={(e) => setFilterDept(e.target.value ? Number(e.target.value) : undefined)}
          style={{ width: '200px' }}
        >
          <option value="">Tat ca khoa</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <select
          className="form-field__input"
          value={filterStatus || ''}
          onChange={(e) => setFilterStatus(e.target.value || undefined)}
          style={{ width: '160px' }}
        >
          <option value="">Tat ca trang thai</option>
          <option value="active">Hoat dong</option>
          <option value="maintenance">Bao tri</option>
          <option value="closed">Dong</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <div className="loading-screen__spinner" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: '#6B7280' }}>Dang tai du lieu...</p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ color: '#6B7280' }}>Chua co phong nao. Hay tao phong moi.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Ma phong</th>
                <th>Ten phong</th>
                <th>Khoa</th>
                <th>Loai</th>
                <th>Tang</th>
                <th>Giuong</th>
                <th>Cong suat</th>
                <th>Trang thai</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td><strong>{room.room_code}</strong></td>
                  <td>{room.name}</td>
                  <td>{room.department_name}</td>
                  <td>{TYPE_LABELS[room.room_type] || room.room_type}</td>
                  <td>{room.floor}</td>
                  <td>{room.occupied_beds}/{room.total_beds}</td>
                  <td>
                    <span className={`badge ${getOccupancyClass(room)}`}>
                      {room.total_beds > 0 ? Math.round((room.occupied_beds / room.total_beds) * 100) : 0}%
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${room.status === 'active' ? 'badge--success' : room.status === 'maintenance' ? 'badge--warning' : 'badge--neutral'}`}>
                      {room.status === 'active' ? 'Hoat dong' : room.status === 'maintenance' ? 'Bao tri' : 'Dong'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
