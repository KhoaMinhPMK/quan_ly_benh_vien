import { useState, useEffect, useCallback, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import BottomNav from './BottomNav';
import './AppLayout.scss';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pullRefreshing, setPullRefreshing] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef<HTMLElement>(null);
  const pullStartY = useRef<number | null>(null);

  // Close mobile sidebar on navigation
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Close mobile sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => { if (window.innerWidth > 768) setMobileOpen(false); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // F8: Global keyboard shortcuts
  const handleKeyboard = useCallback((e: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      // Navigate to patients page with add modal flag
      navigate('/patients?action=add');
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      // Focus the global search input
      const searchInput = document.querySelector('.header__search-input') as HTMLInputElement;
      if (searchInput) searchInput.focus();
    }
  }, [navigate]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, [handleKeyboard]);

  // Pull-to-refresh for mobile
  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    const onTouchStart = (e: TouchEvent) => {
      if (main.scrollTop <= 0) pullStartY.current = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (pullStartY.current !== null) {
        const diff = e.changedTouches[0].clientY - pullStartY.current;
        if (diff > 80 && main.scrollTop <= 0) {
          setPullRefreshing(true);
          // Dispatch a custom event that pages can listen to
          window.dispatchEvent(new CustomEvent('pullrefresh'));
          setTimeout(() => setPullRefreshing(false), 1000);
        }
        pullStartY.current = null;
      }
    };
    main.addEventListener('touchstart', onTouchStart, { passive: true });
    main.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => { main.removeEventListener('touchstart', onTouchStart); main.removeEventListener('touchend', onTouchEnd); };
  }, []);

  return (
    <div className={`layout ${collapsed ? 'layout--collapsed' : ''} ${mobileOpen ? 'layout--mobile-open' : ''}`}>
      {mobileOpen && <div className="layout__overlay" onClick={() => setMobileOpen(false)} />}
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} mobileOpen={mobileOpen} />
      <Header onMenuToggle={() => setMobileOpen(!mobileOpen)} />
      <main className="layout__main" ref={mainRef}>
        {pullRefreshing && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
            <div className="loading-screen__spinner" style={{ width: 20, height: 20 }} />
          </div>
        )}
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
