import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
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
import './styles/index.scss';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

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
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/users" element={<UserListPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
