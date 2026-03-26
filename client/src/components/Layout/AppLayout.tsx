import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import BottomNav from './BottomNav';
import './AppLayout.scss';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close mobile sidebar on navigation
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Close mobile sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => { if (window.innerWidth > 768) setMobileOpen(false); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`layout ${collapsed ? 'layout--collapsed' : ''} ${mobileOpen ? 'layout--mobile-open' : ''}`}>
      {mobileOpen && <div className="layout__overlay" onClick={() => setMobileOpen(false)} />}
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} mobileOpen={mobileOpen} />
      <Header onMenuToggle={() => setMobileOpen(!mobileOpen)} />
      <main className="layout__main">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
