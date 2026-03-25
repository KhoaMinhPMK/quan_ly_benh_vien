-- Migration: 004_add_features
-- User management enhancements + notifications + system config + audit + patient notes

-- Add department_id to users for scope-based access
ALTER TABLE users ADD COLUMN department_id INT NULL AFTER role;
ALTER TABLE users ADD CONSTRAINT fk_users_dept FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('room_full', 'discharge_pending', 'record_missing', 'bed_assigned', 'general') NOT NULL DEFAULT 'general',
  title VARCHAR(255) NOT NULL,
  message TEXT,
  target_user_id INT NULL,
  target_role VARCHAR(50) NULL,
  is_read BOOLEAN DEFAULT FALSE,
  reference_type VARCHAR(50) NULL,
  reference_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notif_user (target_user_id),
  INDEX idx_notif_read (is_read),
  INDEX idx_notif_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  user_name VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT NULL,
  details JSON,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_audit_user (user_id),
  INDEX idx_audit_entity (entity_type, entity_id),
  INDEX idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Patient notes
CREATE TABLE IF NOT EXISTS patient_notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  user_id INT NULL,
  user_name VARCHAR(255),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_notes_patient (patient_id),
  INDEX idx_notes_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- System configuration
CREATE TABLE IF NOT EXISTS system_config (
  id INT AUTO_INCREMENT PRIMARY KEY,
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value TEXT,
  description VARCHAR(500),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default config
INSERT INTO system_config (config_key, config_value, description) VALUES
  ('warning_threshold', '1', 'Số giường còn lại để cảnh báo phòng sắp đầy'),
  ('default_checklist_enabled', 'true', 'Bật checklist hồ sơ ra viện mặc định'),
  ('session_timeout_minutes', '480', 'Thời gian hết hạn phiên đăng nhập (phút)')
ON DUPLICATE KEY UPDATE config_value = VALUES(config_value);

-- Tenants table (GD3 prep, created now for schema readiness)
CREATE TABLE IF NOT EXISTS tenants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  subdomain VARCHAR(100) UNIQUE,
  plan ENUM('basic', 'pro', 'enterprise') DEFAULT 'basic',
  is_active BOOLEAN DEFAULT TRUE,
  max_users INT DEFAULT 50,
  max_departments INT DEFAULT 10,
  settings JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tenant_code (code),
  INDEX idx_tenant_subdomain (subdomain)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed a default tenant
INSERT INTO tenants (name, code, subdomain) VALUES
  ('Benh vien Da khoa', 'BVDK', 'default')
ON DUPLICATE KEY UPDATE name = VALUES(name);
