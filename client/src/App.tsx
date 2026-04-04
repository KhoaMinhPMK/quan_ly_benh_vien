import { BrowserRouter, Routes, Route, Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AccessProvider } from './contexts/AccessContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import AppLayout from './components/Layout/AppLayout';
import LoginPage from './pages/Login/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import RoomListPage from './pages/Rooms/RoomListPage';
import RoomDetailPage from './pages/Rooms/RoomDetailPage';
import PatientListPage from './pages/Patients/PatientListPage';
import DischargeListPage from './pages/Discharge/DischargeListPage';
import UserListPage from './pages/Admin/UserListPage';
import ReportsPage from './pages/Admin/ReportsPage';
import AdminPage from './pages/Admin/AdminPage';
import AccessCenterPage from './pages/Admin/AccessCenterPage';
import SaasAdminPage from './pages/Admin/SaasAdminPage';
import './styles/index.scss';
import { useEffect } from 'react';
import httpClient from './services/httpClient';

// QR scan redirect: /scan?type=bed&id=5 → resolve room and navigate
function ScanRedirect() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  useEffect(() => {
    const type = params.get('type');
    const id = params.get('id');
    if (type === 'bed' && id) {
      httpClient.get(`/beds/${id}`)
        .then(res => {
          const bed = res.data?.data;
          if (bed?.room_id) navigate(`/rooms/${bed.room_id}`, { replace: true });
          else navigate('/', { replace: true });
        })
        .catch(() => navigate('/', { replace: true }));
    } else if (type === 'room' && id) {
      navigate(`/rooms/${id}`, { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  }, [params, navigate]);
  return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <div className="loading-screen__spinner" />
  </div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
      <AuthProvider>
        <AccessProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* QR Scan redirect (protected) */}
          <Route path="/scan" element={<ProtectedRoute><ScanRedirect /></ProtectedRoute>} />

          {/* Protected — with AppLayout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/rooms" element={<RoomListPage />} />
            <Route path="/rooms/:id" element={<RoomDetailPage />} />
            <Route path="/patients" element={<PatientListPage />} />
            <Route path="/discharge" element={<DischargeListPage />} />
            <Route path="/reports" element={<ProtectedRoute allowedRoles={['admin']}><ReportsPage /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute allowedRoles={['admin']}><UserListPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminPage /></ProtectedRoute>} />
            <Route path="/access" element={<ProtectedRoute allowedRoles={['admin']}><AccessCenterPage /></ProtectedRoute>} />
            <Route path="/saas" element={<ProtectedRoute allowedRoles={['admin']}><SaasAdminPage /></ProtectedRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </AccessProvider>
      </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
