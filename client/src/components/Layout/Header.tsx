import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import iconSearch from '../../assets/icons/outline/search.svg';
import iconUser from '../../assets/icons/outline/user-circle.svg';
import './Header.scss';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/rooms': 'Phong - Giuong',
  '/patients': 'Benh nhan noi tru',
  '/discharge': 'Ra vien',
  '/records': 'Kiem tra ho so',
  '/admin': 'Quan tri he thong',
};

export default function Header() {
  const location = useLocation();
  const { user } = useAuth();

  // Determine page title from current path
  const basePath = '/' + (location.pathname.split('/')[1] || '');
  const pageTitle = pageTitles[basePath] || 'MedBoard';

  return (
    <header className="header">
      <div className="header__left">
        <h1 className="header__title">{pageTitle}</h1>
      </div>

      <div className="header__right">
        {/* Search */}
        <div className="header__search">
          <img src={iconSearch} alt="" className="header__search-icon" />
          <input
            type="text"
            className="header__search-input"
            placeholder="Tim kiem benh nhan, phong..."
          />
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
