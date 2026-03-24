import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AxiosError } from 'axios';
import type { ApiResponse } from '@shared/types/auth';
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

    // Client-side validation
    if (!email.trim()) {
      setError('Vui lòng nhập email');
      return;
    }
    if (!password.trim()) {
      setError('Vui lòng nhập mật khẩu');
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
        setError('Không thể kết nối server. Vui lòng kiểm tra lại.');
      } else {
        setError('Đã xảy ra lỗi, vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login">
      {/* Decorative background */}
      <div className="login__bg">
        <div className="login__bg-orb login__bg-orb--1" />
        <div className="login__bg-orb login__bg-orb--2" />
        <div className="login__bg-orb login__bg-orb--3" />
      </div>

      <div className="login__card">
        {/* Logo / Brand */}
        <div className="login__brand">
          <div className="login__logo">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="10" fill="#1a73e8" />
              <path d="M12 20h16M20 12v16" stroke="white" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="login__title">MedBoard</h1>
          <p className="login__subtitle">Hệ thống quản lý y tế nội trú</p>
        </div>

        {/* Form */}
        <form className="login__form" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="login__error" role="alert">
              <svg viewBox="0 0 20 20" fill="currentColor" className="login__error-icon">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
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
            <label htmlFor="login-password" className="login__label">Mật khẩu</label>
            <div className="login__password-wrap">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="login__input"
                placeholder="Nhập mật khẩu"
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
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
              >
                {showPassword ? '🙈' : '👁️'}
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
                Đang đăng nhập...
              </>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>

        <p className="login__footer">
          © 2026 MedBoard — SaaS Y tế Nội trú
        </p>
      </div>
    </div>
  );
}
