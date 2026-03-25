import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { fetchNotifications, fetchUnreadCount, markAllNotificationsRead, globalSearch, type Notification, type SearchResults } from '../../services/api/medboardApi';
import ChangePasswordModal from '../ChangePasswordModal/ChangePasswordModal';
import iconSearch from '../../assets/icons/outline/search.svg';
import iconUser from '../../assets/icons/outline/user-circle.svg';
import './Header.scss';

const ROLE_LABELS: Record<string, Record<string, string>> = {
  vi: { admin: 'Quản trị viên', doctor: 'Bác sĩ', nurse: 'Điều dưỡng', records_staff: 'Nhân viên hồ sơ', receptionist: 'Lễ tân' },
  en: { admin: 'Administrator', doctor: 'Doctor', nurse: 'Nurse', records_staff: 'Records Staff', receptionist: 'Receptionist' },
};

interface HeaderProps { onMenuToggle?: () => void; }

export default function Header({ onMenuToggle }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t, toggleLang, lang } = useTranslation();
  const [unread, setUnread] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPwModal, setShowPwModal] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const basePath = '/' + (location.pathname.split('/')[1] || '');
  const pageTitle = (t.header.titles as Record<string, string>)[basePath] || 'MedBoard';

  // Poll unread count
  useEffect(() => {
    const load = () => fetchUnreadCount().then(setUnread).catch(() => {});
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const openNotifications = async () => {
    setShowNotif(!showNotif);
    setShowUserMenu(false);
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

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearch(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="header">
        <div className="header__left">
          {onMenuToggle && (
            <button className="header__menu-btn" onClick={onMenuToggle} aria-label="Menu">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
          )}
          <h1 className="header__title">{pageTitle}</h1>
        </div>

        <div className="header__right">
          {/* Global Search */}
          <div className="header__search" ref={searchRef}>
            <img src={iconSearch} alt="" className="header__search-icon" />
            <input type="text" className="header__search-input" placeholder={t.header.searchPlaceholder}
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onFocus={() => searchResults && setShowSearch(true)} />
            {showSearch && searchResults && (
              <div className="header__search-dropdown">
                {searchResults.patients.length > 0 && (
                  <div className="header__search-group">
                    <div className="header__search-group-title">{t.header.searchGroupPatient}</div>
                    {searchResults.patients.map(p => (
                      <div key={p.id} className="header__search-item" onClick={() => { navigate('/patients'); setShowSearch(false); setSearchQuery(''); }}>
                        <strong>{p.full_name}</strong> — {p.patient_code}
                      </div>
                    ))}
                  </div>
                )}
                {searchResults.rooms.length > 0 && (
                  <div className="header__search-group">
                    <div className="header__search-group-title">{t.header.searchGroupRoom}</div>
                    {searchResults.rooms.map(r => (
                      <div key={r.id} className="header__search-item" onClick={() => { navigate(`/rooms/${r.id}`); setShowSearch(false); setSearchQuery(''); }}>
                        <strong>{r.room_code}</strong> — {r.name}
                      </div>
                    ))}
                  </div>
                )}
                {searchResults.beds.length > 0 && (
                  <div className="header__search-group">
                    <div className="header__search-group-title">{t.header.searchGroupBed}</div>
                    {searchResults.beds.map(b => (
                      <div key={b.id} className="header__search-item">
                        <strong>{b.bed_code}</strong> — {b.room_name}
                      </div>
                    ))}
                  </div>
                )}
                {searchResults.patients.length === 0 && searchResults.rooms.length === 0 && searchResults.beds.length === 0 && (
                  <div className="header__search-item" style={{ color: '#9CA3AF' }}>{t.header.noResults}</div>
                )}
              </div>
            )}
          </div>

          {/* Language Switch */}
          <button className="header__lang-btn" onClick={toggleLang} title={t.header.languageSwitch}>
            {lang === 'vi' ? '🇻🇳' : '🇬🇧'} {lang.toUpperCase()}
          </button>

          {/* Notification Bell */}
          <div className="header__notif-wrap" style={{ position: 'relative' }}>
            <button className="header__notif-btn" onClick={openNotifications} title={t.header.notifications}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 5a2 2 0 1 1 4 0 7 7 0 0 1 4 6v3a4 4 0 0 0 2 3H4a4 4 0 0 0 2-3v-3a7 7 0 0 1 4-6"/><path d="M9 17v1a3 3 0 0 0 6 0v-1"/></svg>
              {unread > 0 && <span className="header__notif-badge">{unread > 9 ? '9+' : unread}</span>}
            </button>
            {showNotif && (
              <div className="header__notif-dropdown">
                <div className="header__notif-header">
                  <strong>{t.header.notifications}</strong>
                  {unread > 0 && <button className="btn btn--ghost btn--sm" onClick={handleMarkAllRead}>{t.header.markAllRead}</button>}
                </div>
                {notifications.length === 0 ? (
                  <div className="header__notif-empty">{t.header.noNotifications}</div>
                ) : notifications.map(n => (
                  <div key={n.id} className={`header__notif-item ${!n.is_read ? 'header__notif-item--unread' : ''}`}>
                    <div className="header__notif-item-title">{n.title}</div>
                    <div className="header__notif-item-msg">{n.message}</div>
                    <div className="header__notif-item-time">{new Date(n.created_at).toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US')}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="header__user" ref={userMenuRef} style={{ position: 'relative', cursor: 'pointer' }} onClick={() => { setShowUserMenu(!showUserMenu); setShowNotif(false); }}>
            <img src={iconUser} alt="" className="header__user-avatar" />
            <span className="header__user-name">{user?.fullName || 'Admin'}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: 4 }}><path d="M6 9l6 6 6-6"/></svg>

            {showUserMenu && (
              <div className="header__user-dropdown">
                <div className="header__user-dropdown-info">
                  <div style={{ fontWeight: 600 }}>{user?.fullName}</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF' }}>{user?.email}</div>
                  <div style={{ fontSize: 11, color: '#6366F1', textTransform: 'uppercase', marginTop: 4 }}>{user?.role ? (ROLE_LABELS[lang]?.[user.role] || user.role) : ''}</div>
                </div>
                <div className="header__user-dropdown-divider" />
                <button className="header__user-dropdown-item" onClick={(e) => { e.stopPropagation(); setShowPwModal(true); setShowUserMenu(false); }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  {t.header.changePassword}
                </button>
                <button className="header__user-dropdown-item header__user-dropdown-item--danger" onClick={(e) => { e.stopPropagation(); handleLogout(); }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  {t.nav.logout}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <ChangePasswordModal open={showPwModal} onClose={() => setShowPwModal(false)} />
    </>
  );
}
