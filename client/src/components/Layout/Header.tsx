import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { fetchNotifications, fetchUnreadCount, markAllNotificationsRead, globalSearch, type Notification, type SearchResults } from '../../services/api/medboardApi';
import iconSearch from '../../assets/icons/outline/search.svg';
import iconUser from '../../assets/icons/outline/user-circle.svg';
import './Header.scss';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard', '/rooms': 'Phong - Giuong', '/patients': 'Benh nhan noi tru',
  '/discharge': 'Ra vien', '/reports': 'Bao cao', '/users': 'Nguoi dung', '/admin': 'Quan tri he thong',
};

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const basePath = '/' + (location.pathname.split('/')[1] || '');
  const pageTitle = pageTitles[basePath] || 'MedBoard';

  // Poll unread count
  useEffect(() => {
    const load = () => fetchUnreadCount().then(setUnread).catch(() => {});
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const openNotifications = async () => {
    setShowNotif(!showNotif);
    if (!showNotif) {
      try { setNotifications(await fetchNotifications()); } catch {}
    }
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setUnread(0);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  // Global search
  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults(null); return; }
    const timer = setTimeout(async () => {
      try { const r = await globalSearch(searchQuery); setSearchResults(r); setShowSearch(true); } catch {}
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearch(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="header">
      <div className="header__left">
        <h1 className="header__title">{pageTitle}</h1>
      </div>

      <div className="header__right">
        {/* Global Search */}
        <div className="header__search" ref={searchRef}>
          <img src={iconSearch} alt="" className="header__search-icon" />
          <input type="text" className="header__search-input" placeholder="Tim kiem benh nhan, phong..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onFocus={() => searchResults && setShowSearch(true)} />
          {showSearch && searchResults && (
            <div className="header__search-dropdown">
              {searchResults.patients.length > 0 && (
                <div className="header__search-group">
                  <div className="header__search-group-title">Benh nhan</div>
                  {searchResults.patients.map(p => (
                    <div key={p.id} className="header__search-item" onClick={() => { navigate('/patients'); setShowSearch(false); setSearchQuery(''); }}>
                      <strong>{p.full_name}</strong> — {p.patient_code}
                    </div>
                  ))}
                </div>
              )}
              {searchResults.rooms.length > 0 && (
                <div className="header__search-group">
                  <div className="header__search-group-title">Phong</div>
                  {searchResults.rooms.map(r => (
                    <div key={r.id} className="header__search-item" onClick={() => { navigate(`/rooms/${r.id}`); setShowSearch(false); setSearchQuery(''); }}>
                      <strong>{r.room_code}</strong> — {r.name}
                    </div>
                  ))}
                </div>
              )}
              {searchResults.beds.length > 0 && (
                <div className="header__search-group">
                  <div className="header__search-group-title">Giuong</div>
                  {searchResults.beds.map(b => (
                    <div key={b.id} className="header__search-item">
                      <strong>{b.bed_code}</strong> — {b.room_name}
                    </div>
                  ))}
                </div>
              )}
              {searchResults.patients.length === 0 && searchResults.rooms.length === 0 && searchResults.beds.length === 0 && (
                <div className="header__search-item" style={{ color: '#9CA3AF' }}>Khong tim thay ket qua</div>
              )}
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div className="header__notif-wrap" style={{ position: 'relative' }}>
          <button className="header__notif-btn" onClick={openNotifications} title="Thong bao">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 5a2 2 0 1 1 4 0 7 7 0 0 1 4 6v3a4 4 0 0 0 2 3H4a4 4 0 0 0 2-3v-3a7 7 0 0 1 4-6"/><path d="M9 17v1a3 3 0 0 0 6 0v-1"/></svg>
            {unread > 0 && <span className="header__notif-badge">{unread > 9 ? '9+' : unread}</span>}
          </button>
          {showNotif && (
            <div className="header__notif-dropdown">
              <div className="header__notif-header">
                <strong>Thong bao</strong>
                {unread > 0 && <button className="btn btn--ghost btn--sm" onClick={handleMarkAllRead}>Doc tat ca</button>}
              </div>
              {notifications.length === 0 ? (
                <div className="header__notif-empty">Khong co thong bao</div>
              ) : notifications.map(n => (
                <div key={n.id} className={`header__notif-item ${!n.is_read ? 'header__notif-item--unread' : ''}`}>
                  <div className="header__notif-item-title">{n.title}</div>
                  <div className="header__notif-item-msg">{n.message}</div>
                  <div className="header__notif-item-time">{new Date(n.created_at).toLocaleString('vi-VN')}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User info */}
        <div className="header__user">
          <img src={iconUser} alt="" className="header__user-avatar" />
          <span className="header__user-name">{user?.fullName || 'Admin'}</span>
        </div>
      </div>
    </header>
  );
}
