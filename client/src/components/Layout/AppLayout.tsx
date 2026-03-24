import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import './AppLayout.scss';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`layout ${collapsed ? 'layout--collapsed' : ''}`}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <Header />
      <main className="layout__main">
        <Outlet />
      </main>
    </div>
  );
}
