-- ============================================================
-- Migration 009: Complete GĐ2 + GĐ3 features
-- Date: 2026-04-04
-- ============================================================

-- ── GĐ2 #7: Room type classification (already has room_type enum in 002) ──
-- Room type ENUM already exists: normal/vip/icu/isolation from 002
-- Add service type
ALTER TABLE rooms MODIFY COLUMN room_type ENUM('normal','vip','icu','isolation','service') DEFAULT 'normal';

-- ── GĐ2 #9: Room status (already has status in 002) ──
-- Already has: active/maintenance/closed — verified OK

-- ── GĐ2 #36: Internal notes for admissions ──
-- patient_notes table already exists from 004, let's enhance it
ALTER TABLE patient_notes ADD COLUMN IF NOT EXISTS admission_id INT NULL AFTER patient_id;
ALTER TABLE patient_notes ADD COLUMN IF NOT EXISTS note_type ENUM('general','clinical','admin','handover') DEFAULT 'general' AFTER content;

-- ── GĐ2 #34: Transfer/movement history ──
-- admission_bed_history already tracks this. Add notes column if missing
ALTER TABLE admission_bed_history MODIFY COLUMN notes TEXT NULL;

-- ── GĐ2 #47-49: Checklist audit & block discharge ──
-- admission_checklists already has completed_by, completed_at
-- Add checklist_review_history for #48
CREATE TABLE IF NOT EXISTS checklist_review_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admission_id INT NOT NULL,
  checklist_template_id INT NOT NULL,
  reviewed_by INT NOT NULL,
  action ENUM('check','uncheck','update') NOT NULL,
  answer_text TEXT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_crh_admission (admission_id),
  FOREIGN KEY (admission_id) REFERENCES admissions(id) ON DELETE CASCADE,
  FOREIGN KEY (checklist_template_id) REFERENCES checklist_templates(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE CASCADE
);

-- ── GĐ2 #66: Alert threshold config ──
-- system_config already exists from 004. Seed threshold configs
INSERT INTO system_config (config_key, config_value, description) VALUES
  ('alert_near_full_threshold', '1', 'Ngưỡng giường trống để cảnh báo phòng sắp đầy'),
  ('alert_overdue_hours', '24', 'Số giờ quá hạn để cảnh báo hồ sơ'),
  ('alert_waiting_hours', '4', 'Số giờ chờ giường để cảnh báo'),
  ('discharge_block_incomplete', 'true', 'Chặn ra viện khi checklist chưa hoàn tất'),
  ('max_days_trend_chart', '30', 'Số ngày hiển thị biểu đồ xu hướng')
ON DUPLICATE KEY UPDATE config_key = config_key;

-- ── GĐ3 #76: Session management ──
CREATE TABLE IF NOT EXISTS user_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  device_info VARCHAR(255) NULL,
  last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_us_user (user_id),
  INDEX idx_us_token (token_hash),
  INDEX idx_us_active (is_active, expires_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add max_concurrent_sessions to system_config
INSERT INTO system_config (config_key, config_value, description) VALUES
  ('max_concurrent_sessions', '5', 'Số phiên đăng nhập đồng thời tối đa')
ON DUPLICATE KEY UPDATE config_key = config_key;

-- ── GĐ3 #28, #68, #97, #98: Bed allocation rules & rule engine ──
CREATE TABLE IF NOT EXISTS bed_allocation_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  rule_type ENUM('gender_separation','department_priority','severity','age_group','room_type_match','custom') NOT NULL,
  priority INT DEFAULT 0,
  conditions JSON NOT NULL COMMENT '{"field":"gender","operator":"equals","value":"female"}',
  actions JSON NOT NULL COMMENT '{"prefer_room_type":"isolation","avoid_room_type":"normal"}',
  is_active BOOLEAN DEFAULT TRUE,
  department_id INT NULL,
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_bar_active (is_active, priority),
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Seed default rules
INSERT INTO bed_allocation_rules (name, rule_type, priority, conditions, actions, description) VALUES
  ('Tách giường theo giới tính', 'gender_separation', 10, '{"field":"gender","operator":"equals"}', '{"separate_by":"gender"}', 'Phân bệnh nhân nam/nữ vào phòng riêng'),
  ('Ưu tiên ICU cho ca nặng', 'severity', 20, '{"field":"severity","operator":"equals","value":"critical"}', '{"prefer_room_type":"icu"}', 'Bệnh nhân nặng ưu tiên phòng ICU'),
  ('Phòng cách ly cho bệnh truyền nhiễm', 'room_type_match', 15, '{"field":"isolation_required","operator":"equals","value":true}', '{"prefer_room_type":"isolation"}', 'Bệnh nhân cần cách ly vào phòng cách ly');

-- ── GĐ3 #53: Workflow gates ──
-- Already have discharge_block_incomplete config above
-- Add workflow_gates table for custom gates
CREATE TABLE IF NOT EXISTS workflow_gates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  gate_type ENUM('discharge','transfer','status_change') NOT NULL,
  conditions JSON NOT NULL COMMENT '{"require_all_checklists":true,"require_doctor_approval":true}',
  error_message VARCHAR(500) NULL,
  is_active BOOLEAN DEFAULT TRUE,
  department_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

INSERT INTO workflow_gates (name, gate_type, conditions, error_message) VALUES
  ('Chặn ra viện khi checklist thiếu', 'discharge', '{"require_all_checklists":true}', 'Vui lòng hoàn thành tất cả checklist trước khi ra viện'),
  ('Yêu cầu xác nhận bác sĩ', 'discharge', '{"require_status":"waiting_discharge"}', 'Bệnh nhân phải ở trạng thái chờ ra viện');

-- ── GĐ3 #69: Dashboard widgets config ──
CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  widget_key VARCHAR(100) NOT NULL UNIQUE,
  widget_name VARCHAR(255) NOT NULL,
  widget_type ENUM('stat_card','chart','table','alert','custom') NOT NULL,
  default_enabled BOOLEAN DEFAULT TRUE,
  default_order INT DEFAULT 0,
  config_schema JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dashboard_widget_config (
  id INT AUTO_INCREMENT PRIMARY KEY,
  widget_id INT NOT NULL,
  tenant_id INT NULL,
  user_id INT NULL,
  is_visible BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  settings JSON NULL,
  UNIQUE KEY uk_dwc (widget_id, tenant_id, user_id),
  FOREIGN KEY (widget_id) REFERENCES dashboard_widgets(id) ON DELETE CASCADE
);

INSERT INTO dashboard_widgets (widget_key, widget_name, widget_type, default_order) VALUES
  ('total_patients', 'Tổng bệnh nhân', 'stat_card', 1),
  ('empty_beds', 'Giường trống', 'stat_card', 2),
  ('discharge_pending', 'Chờ ra viện', 'stat_card', 3),
  ('missing_checklist', 'Hồ sơ thiếu', 'stat_card', 4),
  ('alerts', 'Cảnh báo', 'alert', 5),
  ('room_occupancy', 'Công suất phòng', 'table', 6),
  ('trend_chart', 'Biểu đồ xu hướng', 'chart', 7),
  ('quick_actions', 'Thao tác nhanh', 'custom', 8),
  ('patient_notes', 'Ghi chú bệnh nhân', 'table', 9);

-- ── GĐ3 #81: Reports by department/doctor ── 
-- Already supported by existing reports with department_id filter
-- Add doctor dimension to daily_stats
ALTER TABLE daily_stats ADD COLUMN IF NOT EXISTS doctor_name VARCHAR(255) NULL AFTER department_id;

-- ── GĐ3 #90-92: SaaS plan management ──
-- Tenants table already exists from 004. Enhance it.
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS subdomain VARCHAR(100) NULL UNIQUE AFTER name;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS custom_domain VARCHAR(255) NULL AFTER subdomain;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500) NULL AFTER custom_domain;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE AFTER settings;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS billing_email VARCHAR(255) NULL AFTER is_active;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP NULL AFTER billing_email;

-- Service plans table
CREATE TABLE IF NOT EXISTS service_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plan_code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  max_users INT DEFAULT 10,
  max_departments INT DEFAULT 3,
  max_rooms INT DEFAULT 20,
  max_beds INT DEFAULT 100,
  features JSON NOT NULL COMMENT '["dashboard","rooms","beds","patients","discharge","reports"]',
  price_monthly DECIMAL(12,2) DEFAULT 0,
  price_yearly DECIMAL(12,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO service_plans (plan_code, name, description, max_users, max_departments, max_rooms, max_beds, features, price_monthly, price_yearly, sort_order) VALUES
  ('basic', 'Basic', 'Gói cơ bản cho phòng khám nhỏ', 5, 2, 10, 30, '["dashboard","rooms","beds","patients","discharge"]', 500000, 5000000, 1),
  ('pro', 'Professional', 'Gói chuyên nghiệp cho bệnh viện', 30, 10, 50, 200, '["dashboard","rooms","beds","patients","discharge","reports","checklists","notifications","access"]', 2000000, 20000000, 2),
  ('enterprise', 'Enterprise', 'Gói doanh nghiệp không giới hạn', 999, 999, 999, 9999, '["dashboard","rooms","beds","patients","discharge","reports","checklists","notifications","access","audit","config","wards","his_integration","ai_engine"]', 5000000, 50000000, 3);

-- Resource usage tracking
CREATE TABLE IF NOT EXISTS tenant_resource_usage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  resource_type ENUM('users','departments','rooms','beds') NOT NULL,
  current_count INT DEFAULT 0,
  checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_tru (tenant_id, resource_type),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- ── GĐ3 #93: HIS/EMR Integration ──
CREATE TABLE IF NOT EXISTS his_integrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  integration_name VARCHAR(255) NOT NULL,
  integration_type ENUM('hl7_fhir','rest_api','soap','file_import','custom') NOT NULL,
  endpoint_url VARCHAR(500) NULL,
  auth_config JSON NULL COMMENT '{"type":"bearer","token":"..."}',
  field_mapping JSON NULL COMMENT '{"patient_id":"MRN","full_name":"patient.name"}',
  sync_direction ENUM('inbound','outbound','bidirectional') DEFAULT 'inbound',
  sync_interval_minutes INT DEFAULT 60,
  is_active BOOLEAN DEFAULT FALSE,
  last_sync_at TIMESTAMP NULL,
  last_sync_status ENUM('success','error','partial') NULL,
  last_sync_message TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS his_sync_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  integration_id INT NOT NULL,
  direction ENUM('inbound','outbound') NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT NULL,
  external_id VARCHAR(255) NULL,
  status ENUM('success','error','skipped') NOT NULL,
  details JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_hsl_integration (integration_id, created_at),
  FOREIGN KEY (integration_id) REFERENCES his_integrations(id) ON DELETE CASCADE
);

-- ── GĐ3 #96: QR codes ──
CREATE TABLE IF NOT EXISTS qr_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entity_type ENUM('room','bed') NOT NULL,
  entity_id INT NOT NULL,
  qr_data VARCHAR(500) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_qr (entity_type, entity_id)
);

-- ── GĐ3 #99: SLA tracking ──
CREATE TABLE IF NOT EXISTS sla_definitions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sla_type ENUM('admission_to_bed','checklist_completion','discharge_processing','bed_turnaround') NOT NULL,
  target_hours DECIMAL(6,1) NOT NULL,
  warning_threshold_pct INT DEFAULT 80 COMMENT 'Warn at 80% of target time',
  department_id INT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS sla_tracking (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sla_definition_id INT NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT NOT NULL,
  started_at TIMESTAMP NOT NULL,
  target_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP NULL,
  status ENUM('on_track','warning','breached','completed') DEFAULT 'on_track',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_st_status (status, target_at),
  FOREIGN KEY (sla_definition_id) REFERENCES sla_definitions(id) ON DELETE CASCADE
);

INSERT INTO sla_definitions (name, sla_type, target_hours) VALUES
  ('Phân giường sau nhập viện', 'admission_to_bed', 2),
  ('Hoàn thành checklist', 'checklist_completion', 24),
  ('Xử lý ra viện', 'discharge_processing', 4),
  ('Dọn giường sau ra viện', 'bed_turnaround', 1);

-- ── GĐ3 #100: Advanced audit ──
-- Enhance existing audit_logs
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS old_value JSON NULL AFTER details;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS new_value JSON NULL AFTER old_value;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS tenant_id INT NULL AFTER user_id;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_al_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_al_user ON audit_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_al_action ON audit_logs(action, created_at);
