import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../i18n/LanguageContext';
import './Sidebar.scss';

// Icons
import iconDashboard from '../../assets/icons/outline/layout-dashboard.svg';
import iconBed from '../../assets/icons/outline/bed.svg';
import iconUsers from '../../assets/icons/outline/users.svg';
import iconDoorExit from '../../assets/icons/outline/door-exit.svg';
import iconReport from '../../assets/icons/outline/report-analytics.svg';
import iconSettings from '../../assets/icons/outline/settings.svg';
import iconBuilding from '../../assets/icons/outline/building-hospital.svg';
import iconLogout from '../../assets/icons/outline/logout.svg';
import iconChevronLeft from '../../assets/icons/outline/chevron-left.svg';
import iconChevronRight from '../../assets/icons/outline/chevron-right.svg';

interface NavItem { path: string; labelKey: keyof typeof import('../../i18n/vi').default.nav; icon: string; adminOnly?: boolean; }

const navItems: NavItem[] = [
  { path: '/', labelKey: 'dashboard', icon: iconDashboard },
  { path: '/rooms', labelKey: 'rooms', icon: iconBed },
  { path: '/patients', labelKey: 'patients', icon: iconUsers },
  { path: '/discharge', labelKey: 'discharge', icon: iconDoorExit },
  { path: '/reports', labelKey: 'reports', icon: iconReport },
  { path: '/users', labelKey: 'users', icon: iconUsers, adminOnly: true },
  { path: '/admin', labelKey: 'admin', icon: iconSettings, adminOnly: true },
];

import { getRoleLabel } from '../../utils/roleLabels';

interface SidebarProps { collapsed: boolean; onToggle: () => void; mobileOpen?: boolean; }

export default function Sidebar({ collapsed, onToggle, mobileOpen }: SidebarProps) {
  const { user, logout } = useAuth();
  const { t, lang } = useTranslation();

  const visibleItems = navItems.filter(item => !item.adminOnly || user?.role === 'admin');
  const roleLabel = user?.role ? getRoleLabel(lang, user.role) : '';

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''} ${mobileOpen ? 'sidebar--mobile-open' : ''}`}>
      <div className="sidebar__brand">
        <img src={iconBuilding} alt="" className="sidebar__brand-icon" />
        {!collapsed && <span className="sidebar__brand-text">MedBoard</span>}
      </div>

      <nav className="sidebar__nav">
        {visibleItems.map((item) => (
          <NavLink key={item.path} to={item.path} end={item.path === '/'}
            className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
            title={collapsed ? t.nav[item.labelKey] : undefined}>
            <img src={item.icon} alt="" className="sidebar__link-icon" />
            {!collapsed && <span className="sidebar__link-text">{t.nav[item.labelKey]}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        {!collapsed && user && (
          <div className="sidebar__user">
            <span className="sidebar__user-name">{user.fullName}</span>
            <span className="sidebar__user-role">{roleLabel}</span>
          </div>
        )}
        <button className="sidebar__link sidebar__link--logout" onClick={logout} title={t.nav.logout}>
          <img src={iconLogout} alt="" className="sidebar__link-icon" />
          {!collapsed && <span className="sidebar__link-text">{t.nav.logout}</span>}
        </button>
      </div>

      <button className="sidebar__toggle" onClick={onToggle} title={collapsed ? t.common.expand : t.common.collapse}>
        <img src={collapsed ? iconChevronRight : iconChevronLeft} alt="" className="sidebar__toggle-icon" />
      </button>
    </aside>
  );
}
