import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import AppLayout from './components/Layout/AppLayout';
import LoginPage from './pages/Login/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import RoomListPage from './pages/Rooms/RoomListPage';
import PatientListPage from './pages/Patients/PatientListPage';
import DischargeListPage from './pages/Discharge/DischargeListPage';
import './styles/index.scss';

// Placeholder for Sprint 7
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-header__title">{title}</h2>
          <p className="page-header__subtitle">Module nay dang duoc phat trien</p>
        </div>
      </div>
      <div className="card">
        <p style={{ color: '#6B7280', fontSize: '14px' }}>
          Noi dung se duoc cap nhat trong Sprint tiep theo.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
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
            <Route path="/patients" element={<PatientListPage />} />
            <Route path="/discharge" element={<DischargeListPage />} />
            <Route path="/records" element={<PlaceholderPage title="Kiem tra ho so" />} />
            <Route path="/admin" element={<PlaceholderPage title="Quan tri he thong" />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
