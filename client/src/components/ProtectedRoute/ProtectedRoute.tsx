import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../i18n/LanguageContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-screen__spinner" />
        <p>{t.common.loading}</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
