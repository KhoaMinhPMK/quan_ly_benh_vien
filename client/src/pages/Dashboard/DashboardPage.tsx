import { useAuth } from '../../contexts/AuthContext';
import './DashboardPage.scss';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Quản trị viên',
  doctor: 'Bác sĩ',
  nurse: 'Điều dưỡng',
  records_staff: 'Nhân viên hồ sơ',
  receptionist: 'Lễ tân',
};

export default function DashboardPage() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div className="dashboard__brand">
          <svg viewBox="0 0 32 32" fill="none" className="dashboard__logo-icon">
            <rect width="32" height="32" rx="8" fill="#1a73e8" />
            <path d="M10 16h12M16 10v12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <span className="dashboard__brand-text">MedBoard</span>
        </div>

        <div className="dashboard__user-info">
          <div className="dashboard__user-details">
            <span className="dashboard__user-name">{user.fullName}</span>
            <span className="dashboard__user-role">{ROLE_LABELS[user.role] || user.role}</span>
          </div>
          <button className="dashboard__logout" onClick={logout}>
            Đăng xuất
          </button>
        </div>
      </header>

      <main className="dashboard__main">
        <div className="dashboard__welcome">
          <h1 className="dashboard__welcome-title">
            Xin chào, {user.fullName}! 👋
          </h1>
          <p className="dashboard__welcome-text">
            Chào mừng bạn đến với hệ thống quản lý y tế nội trú MedBoard.
          </p>
        </div>

        <div className="dashboard__cards">
          <div className="dashboard__card">
            <div className="dashboard__card-icon dashboard__card-icon--blue">🏥</div>
            <div className="dashboard__card-content">
              <h3 className="dashboard__card-title">Quản lý giường</h3>
              <p className="dashboard__card-desc">Xem sơ đồ phòng – giường bệnh</p>
            </div>
            <span className="dashboard__card-badge">Sắp ra mắt</span>
          </div>

          <div className="dashboard__card">
            <div className="dashboard__card-icon dashboard__card-icon--green">👤</div>
            <div className="dashboard__card-content">
              <h3 className="dashboard__card-title">Bệnh nhân</h3>
              <p className="dashboard__card-desc">Quản lý danh sách bệnh nhân nội trú</p>
            </div>
            <span className="dashboard__card-badge">Sắp ra mắt</span>
          </div>

          <div className="dashboard__card">
            <div className="dashboard__card-icon dashboard__card-icon--orange">📋</div>
            <div className="dashboard__card-content">
              <h3 className="dashboard__card-title">Ra viện</h3>
              <p className="dashboard__card-desc">Checklist và xác nhận ra viện</p>
            </div>
            <span className="dashboard__card-badge">Sắp ra mắt</span>
          </div>

          <div className="dashboard__card">
            <div className="dashboard__card-icon dashboard__card-icon--purple">📊</div>
            <div className="dashboard__card-content">
              <h3 className="dashboard__card-title">Báo cáo</h3>
              <p className="dashboard__card-desc">Thống kê công suất, hiệu suất</p>
            </div>
            <span className="dashboard__card-badge">Sắp ra mắt</span>
          </div>
        </div>

        <div className="dashboard__info">
          <h2>Thông tin hệ thống</h2>
          <table className="dashboard__table">
            <tbody>
              <tr><td>Tài khoản</td><td>{user.email}</td></tr>
              <tr><td>Vai trò</td><td>{ROLE_LABELS[user.role] || user.role}</td></tr>
              <tr><td>Trạng thái</td><td><span className="dashboard__status-badge">Đang hoạt động</span></td></tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
