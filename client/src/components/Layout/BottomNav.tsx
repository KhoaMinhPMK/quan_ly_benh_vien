import { NavLink } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import './BottomNav.scss';

interface TabItem {
  path: string;
  labelKey: 'dashboard' | 'rooms' | 'patients' | 'discharge';
}

const tabs: TabItem[] = [
  { path: '/', labelKey: 'dashboard' },
  { path: '/rooms', labelKey: 'rooms' },
  { path: '/patients', labelKey: 'patients' },
  { path: '/discharge', labelKey: 'discharge' },
];

const TabIcon = ({ labelKey }: { labelKey: string }) => {
  const props = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (labelKey) {
    case 'dashboard':
      return <svg {...props}><path d="M4 4h6v8H4zM4 16h6v4H4zM14 12h6v8h-6zM14 4h6v4h-6z" /></svg>;
    case 'rooms':
      return <svg {...props}><path d="M3 21V7a2 2 0 012-2h6v16M21 21V11a2 2 0 00-2-2h-4v12M7 9v.01M7 13v.01M7 17v.01M15 13v.01M15 17v.01" /></svg>;
    case 'patients':
      return <svg {...props}><path d="M9 7a4 4 0 108 0 4 4 0 00-8 0M3 21v-2a4 4 0 014-4h10a4 4 0 014 4v2" /></svg>;
    case 'discharge':
      return <svg {...props}><path d="M14 8V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h7a2 2 0 002-2v-2M9 12h12M18 9l3 3-3 3" /></svg>;
    default:
      return null;
  }
};

export default function BottomNav() {
  const { t } = useTranslation();

  return (
    <nav className="bottom-nav">
      {tabs.map(tab => (
        <NavLink
          key={tab.path}
          to={tab.path}
          end={tab.path === '/'}
          className={({ isActive }) => `bottom-nav__tab ${isActive ? 'bottom-nav__tab--active' : ''}`}
        >
          <span className="bottom-nav__icon"><TabIcon labelKey={tab.labelKey} /></span>
          <span className="bottom-nav__label">{t.nav[tab.labelKey]}</span>
        </NavLink>
      ))}
    </nav>
  );
}
