import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchRooms, fetchDepartments, type Room, type Department } from '../../services/api/medboardApi';
import AddRoomModal from './AddRoomModal';
import iconSearch from '../../assets/icons/outline/search.svg';
import iconPlus from '../../assets/icons/outline/adjustments-plus.svg';
import './RoomListPage.scss';

const TYPE_LABELS: Record<string, string> = {
  normal: 'Thuong',
  vip: 'VIP',
  icu: 'ICU',
  isolation: 'Cach ly',
};

const TYPE_BADGE: Record<string, string> = {
  normal: 'badge--neutral',
  vip: 'badge--warning',
  icu: 'badge--error',
  isolation: 'badge--info',
};

export default function RoomListPage() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState<number | undefined>();
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchDepartments().then(setDepartments).catch(() => {});
  }, []);

  const loadRooms = () => {
    setLoading(true);
    fetchRooms({ department_id: filterDept, status: filterStatus, search: search || undefined })
      .then(setRooms)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadRooms(); }, [filterDept, filterStatus, search]);

  const getOccupancyColor = (room: Room) => {
    if (room.total_beds === 0) return { cls: 'badge--neutral', fill: '#94A3B8' };
    const ratio = room.occupied_beds / room.total_beds;
    if (ratio >= 1) return { cls: 'badge--error', fill: '#EF4444' };
    if (ratio >= 0.8) return { cls: 'badge--warning', fill: '#F59E0B' };
    return { cls: 'badge--success', fill: '#10B981' };
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-header__title">Phong — Giuong</h2>
          <p className="page-header__subtitle">{rooms.length} phong trong he thong</p>
        </div>
        <div className="page-header__actions">
          <button className="btn btn--primary" onClick={() => setShowAddModal(true)}>
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
        <div className="card card--no-hover" style={{ textAlign: 'center', padding: '64px' }}>
          <div className="loading-screen__spinner" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: '#94A3B8' }}>Dang tai du lieu...</p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="card card--no-hover">
          <div className="empty-state">
            <div className="empty-state__title">Chua co phong nao</div>
            <div className="empty-state__text">Hay tao phong moi de bat dau.</div>
          </div>
        </div>
      ) : (
        <div className="card card--no-hover" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Ma phong</th>
                <th>Ten phong</th>
                <th>Khoa</th>
                <th>Loai</th>
                <th>Tang</th>
                <th>Giuong</th>
                <th style={{ minWidth: '120px' }}>Cong suat</th>
                <th>Trang thai</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => {
                const { fill } = getOccupancyColor(room);
                const ratio = room.total_beds > 0 ? (room.occupied_beds / room.total_beds) * 100 : 0;
                return (
                  <tr key={room.id} onClick={() => navigate(`/rooms/${room.id}`)}>
                    <td><strong>{room.room_code}</strong></td>
                    <td>{room.name}</td>
                    <td>{room.department_name}</td>
                    <td>
                      <span className={`badge ${TYPE_BADGE[room.room_type] || 'badge--neutral'}`}>
                        {TYPE_LABELS[room.room_type] || room.room_type}
                      </span>
                    </td>
                    <td>{room.floor}</td>
                    <td><strong>{room.occupied_beds}</strong>/{room.total_beds}</td>
                    <td>
                      <div className="occupancy-bar">
                        <div className="occupancy-bar__track">
                          <div className="occupancy-bar__fill" style={{ width: `${Math.min(ratio, 100)}%`, background: fill }} />
                        </div>
                        <span className={`occupancy-bar__text`} style={{ color: fill }}>
                          {Math.round(ratio)}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${room.status === 'active' ? 'badge--success' : room.status === 'maintenance' ? 'badge--warning' : 'badge--neutral'}`}>
                        {room.status === 'active' ? 'Hoat dong' : room.status === 'maintenance' ? 'Bao tri' : 'Dong'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <AddRoomModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreated={loadRooms}
      />
    </div>
  );
}
