import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Sidebar.scss';

// Icon imports — Tabler outline SVGs
import iconDashboard from '../../assets/icons/outline/layout-dashboard.svg';
import iconBed from '../../assets/icons/outline/bed.svg';
import iconUsers from '../../assets/icons/outline/users.svg';
import iconDoorExit from '../../assets/icons/outline/door-exit.svg';

import iconBuilding from '../../assets/icons/outline/building-hospital.svg';
import iconLogout from '../../assets/icons/outline/logout.svg';
import iconChevronLeft from '../../assets/icons/outline/chevron-left.svg';
import iconChevronRight from '../../assets/icons/outline/chevron-right.svg';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: iconDashboard },
  { path: '/rooms', label: 'Phong - Giuong', icon: iconBed },
  { path: '/patients', label: 'Benh nhan', icon: iconUsers },
  { path: '/discharge', label: 'Ra vien', icon: iconDoorExit },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuth();

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar__brand">
        <img src={iconBuilding} alt="" className="sidebar__brand-icon" />
        {!collapsed && <span className="sidebar__brand-text">MedBoard</span>}
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <img src={item.icon} alt="" className="sidebar__link-icon" />
            {!collapsed && <span className="sidebar__link-text">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar__footer">
        {!collapsed && user && (
          <div className="sidebar__user">
            <span className="sidebar__user-name">{user.fullName}</span>
            <span className="sidebar__user-role">{user.role}</span>
          </div>
        )}
        <button
          className="sidebar__link sidebar__link--logout"
          onClick={logout}
          title="Dang xuat"
        >
          <img src={iconLogout} alt="" className="sidebar__link-icon" />
          {!collapsed && <span className="sidebar__link-text">Dang xuat</span>}
        </button>
      </div>

      {/* Toggle */}
      <button className="sidebar__toggle" onClick={onToggle} title="Thu gon">
        <img
          src={collapsed ? iconChevronRight : iconChevronLeft}
          alt=""
          className="sidebar__toggle-icon"
        />
      </button>
    </aside>
  );
}
