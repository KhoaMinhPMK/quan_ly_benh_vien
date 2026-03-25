import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchRooms, fetchDepartments, updateRoom, type Room, type Department } from '../../services/api/medboardApi';
import { useTranslation } from '../../i18n/LanguageContext';
import AddRoomModal from './AddRoomModal';
import Modal from '../../components/Modal/Modal';
import iconSearch from '../../assets/icons/outline/search.svg';
import iconPlus from '../../assets/icons/outline/adjustments-plus.svg';
import './RoomListPage.scss';

const TYPE_LABELS_VI: Record<string, string> = { normal: 'Thường', vip: 'VIP', icu: 'ICU', isolation: 'Cách ly' };
const TYPE_LABELS_EN: Record<string, string> = { normal: 'Standard', vip: 'VIP', icu: 'ICU', isolation: 'Isolation' };
const TYPE_BADGE: Record<string, string> = { normal: 'badge--neutral', vip: 'badge--warning', icu: 'badge--error', isolation: 'badge--info' };

export default function RoomListPage() {
  const navigate = useNavigate();
  const { t, lang } = useTranslation();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState<number | undefined>();
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [editForm, setEditForm] = useState({ name: '', room_type: '', max_beds: 0, status: '', notes: '' });
  const [editError, setEditError] = useState('');

  useEffect(() => { fetchDepartments().then(setDepartments).catch(() => {}); }, []);

  const loadRooms = () => {
    setLoading(true);
    fetchRooms({ department_id: filterDept, status: filterStatus, search: search || undefined })
      .then(setRooms)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadRooms(); }, [filterDept, filterStatus, search]);

  const typeLabels = lang === 'vi' ? TYPE_LABELS_VI : TYPE_LABELS_EN;

  const getOccupancyColor = (room: Room) => {
    if (room.total_beds === 0) return { cls: 'badge--neutral', fill: '#94A3B8' };
    const ratio = room.occupied_beds / room.total_beds;
    if (ratio >= 1) return { cls: 'badge--error', fill: '#EF4444' };
    if (ratio >= 0.8) return { cls: 'badge--warning', fill: '#F59E0B' };
    return { cls: 'badge--success', fill: '#10B981' };
  };

  const statusLabel = (s: string) => s === 'active' ? t.rooms.statusActive : s === 'maintenance' ? t.rooms.statusMaintenance : t.rooms.statusClosed;
  const statusBadge = (s: string) => s === 'active' ? 'badge--success' : s === 'maintenance' ? 'badge--warning' : 'badge--neutral';

  const openEdit = (room: Room, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditRoom(room);
    setEditForm({ name: room.name, room_type: room.room_type, max_beds: room.max_beds, status: room.status, notes: room.notes || '' });
    setEditError('');
  };

  const handleEditSave = async () => {
    if (!editRoom) return;
    setEditError('');
    try {
      await updateRoom(editRoom.id, editForm as any);
      setEditRoom(null);
      loadRooms();
    } catch (e: any) { setEditError(e.response?.data?.error?.message || t.common.error); }
  };

  const subtitle = `${rooms.length} ${t.rooms.roomsInSystem}`;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-header__title">{t.rooms.title}</h2>
          <p className="page-header__subtitle">{subtitle}</p>
        </div>
        <div className="page-header__actions">
          <button className="btn btn--primary" onClick={() => setShowAddModal(true)}>
            <img src={iconPlus} alt="" className="btn__icon" style={{ filter: 'brightness(0) invert(1)' }} />
            {t.rooms.addRoom}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="room-filters">
        <div className="room-filters__search">
          <img src={iconSearch} alt="" className="room-filters__search-icon" />
          <input type="text" className="form-field__input" placeholder={t.rooms.searchPlaceholder}
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="form-field__input" value={filterDept || ''}
          onChange={(e) => setFilterDept(e.target.value ? Number(e.target.value) : undefined)} style={{ width: '200px' }}>
          <option value="">{t.rooms.filterDepartment}</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select className="form-field__input" value={filterStatus || ''}
          onChange={(e) => setFilterStatus(e.target.value || undefined)} style={{ width: '160px' }}>
          <option value="">{t.rooms.filterStatus}</option>
          <option value="active">{t.rooms.statusActive}</option>
          <option value="maintenance">{t.rooms.statusMaintenance}</option>
          <option value="closed">{t.rooms.statusClosed}</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="card card--no-hover" style={{ textAlign: 'center', padding: '64px' }}>
          <div className="loading-screen__spinner" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: '#94A3B8' }}>{t.common.loadingData}</p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="card card--no-hover">
          <div className="empty-state">
            <div className="empty-state__title">{t.rooms.noRooms}</div>
            <div className="empty-state__text">{t.rooms.noRoomsDesc}</div>
          </div>
        </div>
      ) : (
        <div className="card card--no-hover" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>{t.rooms.roomCode}</th>
                <th>{t.rooms.roomName}</th>
                <th>{t.dashboard.department}</th>
                <th>{t.rooms.roomType}</th>
                <th>{t.rooms.floor}</th>
                <th>{t.rooms.bedsHeader}</th>
                <th style={{ minWidth: '120px' }}>{t.rooms.occupancy}</th>
                <th>{t.rooms.statusLabel}</th>
                <th style={{ width: 70 }}></th>
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
                        {typeLabels[room.room_type] || room.room_type}
                      </span>
                    </td>
                    <td>{room.floor}</td>
                    <td><strong>{room.occupied_beds}</strong>/{room.total_beds}</td>
                    <td>
                      <div className="occupancy-bar">
                        <div className="occupancy-bar__track">
                          <div className="occupancy-bar__fill" style={{ width: `${Math.min(ratio, 100)}%`, background: fill }} />
                        </div>
                        <span className="occupancy-bar__text" style={{ color: fill }}>{Math.round(ratio)}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${statusBadge(room.status)}`}>{statusLabel(room.status)}</span>
                    </td>
                    <td>
                      <button className="btn btn--ghost btn--sm" onClick={(e) => openEdit(room, e)}>{t.common.edit}</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <AddRoomModal open={showAddModal} onClose={() => setShowAddModal(false)} onCreated={loadRooms} />

      {/* Edit Room Modal */}
      {editRoom && (
        <Modal title={t.rooms.editRoom} onClose={() => setEditRoom(null)}>
          <div className="modal__body">
            {editError && <div className="modal__error">{editError}</div>}
            <div className="form-field"><label className="form-field__label">{t.rooms.roomCode}</label>
              <input className="form-field__input" value={editRoom.room_code} disabled style={{ opacity: 0.6 }} /></div>
            <div className="form-field"><label className="form-field__label">{t.rooms.roomName}</label>
              <input className="form-field__input" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} /></div>
            <div className="modal__row">
              <div className="form-field"><label className="form-field__label">{t.rooms.roomType}</label>
                <select className="form-field__input" value={editForm.room_type} onChange={e => setEditForm({...editForm, room_type: e.target.value})}>
                  <option value="normal">{typeLabels.normal}</option>
                  <option value="vip">{typeLabels.vip}</option>
                  <option value="icu">{typeLabels.icu}</option>
                  <option value="isolation">{typeLabels.isolation}</option>
                </select></div>
              <div className="form-field"><label className="form-field__label">{t.rooms.maxBedsLabel}</label>
                <input className="form-field__input" type="number" min={1} max={20} value={editForm.max_beds} onChange={e => setEditForm({...editForm, max_beds: Number(e.target.value)})} /></div>
            </div>
            <div className="form-field"><label className="form-field__label">{t.rooms.statusLabel}</label>
              <select className="form-field__input" value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}>
                <option value="active">{t.rooms.statusActive}</option>
                <option value="maintenance">{t.rooms.statusMaintenance}</option>
                <option value="closed">{t.rooms.statusClosed}</option>
              </select></div>
            <div className="form-field"><label className="form-field__label">{t.common.notes}</label>
              <textarea className="form-field__input" value={editForm.notes} onChange={e => setEditForm({...editForm, notes: e.target.value})} rows={2} /></div>
          </div>
          <div className="modal__footer">
            <button className="btn btn--secondary" onClick={() => setEditRoom(null)}>{t.common.cancel}</button>
            <button className="btn btn--primary" onClick={handleEditSave}>{t.common.update}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
