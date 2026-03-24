import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AxiosError } from 'axios';
import type { ApiResponse } from '@shared/types/auth';
import iconEye from '../../assets/icons/outline/eye.svg';
import iconEyeOff from '../../assets/icons/outline/eye-off.svg';
import iconAlertCircle from '../../assets/icons/outline/alert-circle.svg';
import iconBuildingHospital from '../../assets/icons/outline/building-hospital.svg';
import './LoginPage.scss';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // If already authenticated, redirect
  if (isAuthenticated) {
    navigate('/', { replace: true });
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Vui long nhap email');
      return;
    }
    if (!password.trim()) {
      setError('Vui long nhap mat khau');
      return;
    }

    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      const axiosError = err as AxiosError<ApiResponse>;
      if (axiosError.response?.data?.error) {
        setError(axiosError.response.data.error.message);
      } else if (axiosError.code === 'ERR_NETWORK') {
        setError('Khong the ket noi server. Vui long kiem tra lai.');
      } else {
        setError('Da xay ra loi, vui long thu lai.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login">
      <div className="login__card">
        {/* Brand */}
        <div className="login__brand">
          <img src={iconBuildingHospital} alt="" className="login__logo-icon" />
          <h1 className="login__title">MedBoard</h1>
          <p className="login__subtitle">He thong quan ly y te noi tru</p>
        </div>

        {/* Form */}
        <form className="login__form" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="login__error" role="alert">
              <img src={iconAlertCircle} alt="" className="login__error-icon" />
              <span>{error}</span>
            </div>
          )}

          <div className="login__field">
            <label htmlFor="login-email" className="login__label">Email</label>
            <input
              id="login-email"
              type="email"
              className="login__input"
              placeholder="admin@medboard.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="login__field">
            <label htmlFor="login-password" className="login__label">Mat khau</label>
            <div className="login__password-wrap">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="login__input"
                placeholder="Nhap mat khau"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login__toggle-pw"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'An mat khau' : 'Hien thi mat khau'}
              >
                <img
                  src={showPassword ? iconEyeOff : iconEye}
                  alt=""
                  className="login__toggle-pw-icon"
                />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`login__submit ${isSubmitting ? 'login__submit--loading' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="login__spinner" />
                Dang dang nhap...
              </>
            ) : (
              'Dang nhap'
            )}
          </button>
        </form>

        <p className="login__footer">
          MedBoard -- He thong quan ly y te noi tru
        </p>
      </div>
    </div>
  );
}
