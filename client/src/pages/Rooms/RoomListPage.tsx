import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchRooms, fetchDepartments, updateRoom, type Room, type Department } from '../../services/api/medboardApi';
import { useTranslation } from '../../i18n/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import AddRoomModal from './AddRoomModal';
import Modal from '../../components/Modal/Modal';
import iconSearch from '../../assets/icons/outline/search.svg';
import iconPlus from '../../assets/icons/outline/adjustments-plus.svg';
import Select from '../../components/Select/Select';
import './RoomListPage.scss';

const TYPE_LABELS_VI: Record<string, string> = { normal: 'Thường', vip: 'VIP', icu: 'ICU', isolation: 'Cách ly' };
const TYPE_LABELS_EN: Record<string, string> = { normal: 'Standard', vip: 'VIP', icu: 'ICU', isolation: 'Isolation' };
const TYPE_BADGE: Record<string, string> = { normal: 'badge--neutral', vip: 'badge--warning', icu: 'badge--error', isolation: 'badge--info' };

export default function RoomListPage() {
  const navigate = useNavigate();
  const { t, lang } = useTranslation();
  const { showToast } = useToast();
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
  const [quickFilter, setQuickFilter] = useState<'' | 'full' | 'near_full' | 'has_empty'>('');

  useEffect(() => { fetchDepartments().then(setDepartments).catch(() => { showToast(t.common.error, 'error'); }); }, []);

  const loadRooms = () => {
    setLoading(true);
    fetchRooms({ department_id: filterDept, status: filterStatus, search: search || undefined })
      .then(setRooms)
      .catch(() => { showToast(t.common.error, 'error'); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadRooms(); }, [filterDept, filterStatus, search]);

  // Auto-refresh every 30s
  useEffect(() => {
    const timer = setInterval(loadRooms, 30000);
    return () => clearInterval(timer);
  }, [filterDept, filterStatus, search]);

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
      await updateRoom(editRoom.id, editForm as Record<string, unknown>);
      setEditRoom(null);
      showToast(t.common.success, 'success');
      loadRooms();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: { message?: string } } } };
      setEditError(err.response?.data?.error?.message || t.common.error);
    }
  };

  const subtitle = `${rooms.length} ${t.rooms.roomsInSystem}`;

  // Apply quick filter
  const displayRooms = rooms.filter(r => {
    if (quickFilter === 'full') return r.total_beds > 0 && r.empty_beds === 0;
    if (quickFilter === 'near_full') return r.total_beds > 0 && r.empty_beds === 1;
    if (quickFilter === 'has_empty') return r.empty_beds > 0;
    return true;
  });

  const fullCount = rooms.filter(r => r.total_beds > 0 && r.empty_beds === 0).length;
  const nearFullCount = rooms.filter(r => r.total_beds > 0 && r.empty_beds === 1).length;
  const hasEmptyCount = rooms.filter(r => r.empty_beds > 0).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-header__title">{t.rooms.title}</h2>
          <p className="page-header__subtitle">{subtitle}</p>
        </div>
        <div className="page-header__actions">
          <button className="btn btn--primary" onClick={() => setShowAddModal(true)}>
            <img src={iconPlus} alt="" className="btn__icon btn__icon--inverted" />
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
        <Select className="room-filters__select" value={String(filterDept || '')}
          onChange={(val) => setFilterDept(val ? Number(val) : undefined)}
          placeholder={t.rooms.filterDepartment}
          options={[
            { value: '', label: t.rooms.filterDepartment },
            ...departments.map((d) => ({ value: String(d.id), label: d.name }))
          ]}
        />
        <Select className="room-filters__select" value={filterStatus || ''}
          onChange={(val) => setFilterStatus(val || undefined)}
          placeholder={t.rooms.filterStatus}
          options={[
            { value: '', label: t.rooms.filterStatus },
            { value: 'active', label: t.rooms.statusActive },
            { value: 'maintenance', label: t.rooms.statusMaintenance },
            { value: 'closed', label: t.rooms.statusClosed },
          ]}
        />
      </div>

      {/* Quick context chips */}
      {!loading && rooms.length > 0 && (
        <div className="room-chips">
          <button className={`room-chips__chip ${quickFilter === '' ? 'room-chips__chip--active' : ''}`} onClick={() => setQuickFilter('')}>
            {t.common.all} <span className="room-chips__count">{rooms.length}</span>
          </button>
          {fullCount > 0 && (
            <button className={`room-chips__chip room-chips__chip--error ${quickFilter === 'full' ? 'room-chips__chip--active' : ''}`} onClick={() => setQuickFilter(quickFilter === 'full' ? '' : 'full')}>
              {t.dashboard.roomsFull} <span className="room-chips__count">{fullCount}</span>
            </button>
          )}
          {nearFullCount > 0 && (
            <button className={`room-chips__chip room-chips__chip--warning ${quickFilter === 'near_full' ? 'room-chips__chip--active' : ''}`} onClick={() => setQuickFilter(quickFilter === 'near_full' ? '' : 'near_full')}>
              {t.dashboard.roomsNearFull} <span className="room-chips__count">{nearFullCount}</span>
            </button>
          )}
          <button className={`room-chips__chip room-chips__chip--success ${quickFilter === 'has_empty' ? 'room-chips__chip--active' : ''}`} onClick={() => setQuickFilter(quickFilter === 'has_empty' ? '' : 'has_empty')}>
            {t.rooms.hasEmpty} <span className="room-chips__count">{hasEmptyCount}</span>
          </button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="card card--no-hover room-list__loading">
          <div className="loading-screen__spinner room-list__spinner" />
          <p className="room-list__loading-text">{t.common.loadingData}</p>
        </div>
      ) : displayRooms.length === 0 ? (
        <div className="card card--no-hover">
          <div className="empty-state">
            <div className="empty-state__title">{t.rooms.noRooms}</div>
            <div className="empty-state__text">{t.rooms.noRoomsDesc}</div>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="card card--no-hover room-list__table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t.rooms.roomCode}</th>
                  <th>{t.rooms.roomName}</th>
                  <th>{t.dashboard.department}</th>
                  <th>{t.rooms.roomType}</th>
                  <th>{t.rooms.floor}</th>
                  <th>{t.rooms.bedsHeader}</th>
                  <th className="room-list__col-occupancy">{t.rooms.occupancy}</th>
                  <th>{t.rooms.statusLabel}</th>
                  <th className="data-table__col-action"></th>
                </tr>
              </thead>
              <tbody>
                {displayRooms.map((room) => {
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

          {/* Mobile Cards */}
          <div className="room-cards">
            {displayRooms.map((room) => {
              const { fill } = getOccupancyColor(room);
              const ratio = room.total_beds > 0 ? (room.occupied_beds / room.total_beds) * 100 : 0;
              return (
                <div key={room.id} className="room-card" onClick={() => navigate(`/rooms/${room.id}`)}>
                  <div className="room-card__header">
                    <div>
                      <span className="room-card__code">{room.room_code}</span>
                      <span className="room-card__name">{room.name}</span>
                    </div>
                    <span className={`badge ${statusBadge(room.status)}`}>{statusLabel(room.status)}</span>
                  </div>
                  <div className="room-card__meta">
                    <span>{room.department_name}</span>
                    <span>·</span>
                    <span className={`badge badge--sm ${TYPE_BADGE[room.room_type] || 'badge--neutral'}`}>
                      {typeLabels[room.room_type] || room.room_type}
                    </span>
                    <span>·</span>
                    <span>{t.rooms.floorN} {room.floor}</span>
                  </div>
                  <div className="room-card__occupancy">
                    <div className="occupancy-bar">
                      <div className="occupancy-bar__track">
                        <div className="occupancy-bar__fill" style={{ width: `${Math.min(ratio, 100)}%`, background: fill }} />
                      </div>
                      <span className="occupancy-bar__text" style={{ color: fill }}>{Math.round(ratio)}%</span>
                    </div>
                    <span className="room-card__beds"><strong>{room.occupied_beds}</strong>/{room.total_beds} {t.dashboard.beds}</span>
                  </div>
                  <div className="room-card__action">
                    <button className="btn btn--ghost btn--sm" onClick={(e) => openEdit(room, e)}>{t.common.edit}</button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <AddRoomModal open={showAddModal} onClose={() => setShowAddModal(false)} onCreated={() => { loadRooms(); showToast(t.common.success, 'success'); }} />

      {/* Edit Room Modal */}
      {editRoom && (
        <Modal title={t.rooms.editRoom} onClose={() => setEditRoom(null)}>
          <div className="modal__body">
            {editError && <div className="modal__error">{editError}</div>}
            <div className="form-field"><label className="form-field__label">{t.rooms.roomCode}</label>
              <input className="form-field__input form-field__input--disabled" value={editRoom.room_code} disabled /></div>
            <div className="form-field"><label className="form-field__label">{t.rooms.roomName}</label>
              <input className="form-field__input" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} /></div>
            <div className="modal__row">
              <div className="form-field"><label className="form-field__label">{t.rooms.roomType}</label>
                <Select value={editForm.room_type} onChange={val => setEditForm({...editForm, room_type: val})}
                  options={[
                    { value: 'normal', label: typeLabels.normal },
                    { value: 'vip', label: typeLabels.vip },
                    { value: 'icu', label: typeLabels.icu },
                    { value: 'isolation', label: typeLabels.isolation },
                  ]}
                /></div>
              <div className="form-field"><label className="form-field__label">{t.rooms.maxBedsLabel}</label>
                <input className="form-field__input" type="number" min={1} max={20} value={editForm.max_beds} onChange={e => setEditForm({...editForm, max_beds: Number(e.target.value)})} /></div>
            </div>
            <div className="form-field"><label className="form-field__label">{t.rooms.statusLabel}</label>
              <Select value={editForm.status} onChange={val => setEditForm({...editForm, status: val})}
                options={[
                  { value: 'active', label: t.rooms.statusActive },
                  { value: 'maintenance', label: t.rooms.statusMaintenance },
                  { value: 'closed', label: t.rooms.statusClosed },
                ]}
              /></div>
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
