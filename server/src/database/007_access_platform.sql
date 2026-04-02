-- Migration: 007_access_platform
-- Nền tảng phân quyền động: module + capability + scope + rule engine

-- ============================================================
-- 1. Feature Modules — danh mục phân hệ
-- ============================================================
CREATE TABLE IF NOT EXISTS feature_modules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  module_key VARCHAR(80) UNIQUE NOT NULL,
  module_name VARCHAR(255) NOT NULL,
  description TEXT,
  parent_id INT NULL,
  icon VARCHAR(100),
  sort_order INT DEFAULT 0,
  is_core BOOLEAN DEFAULT FALSE,
  dependencies JSON COMMENT '["module_key_1","module_key_2"]',
  default_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES feature_modules(id) ON DELETE SET NULL,
  INDEX idx_fm_key (module_key),
  INDEX idx_fm_parent (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. Capabilities — hành động cụ thể trong module
-- ============================================================
CREATE TABLE IF NOT EXISTS capabilities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  capability_key VARCHAR(120) UNIQUE NOT NULL,
  module_id INT NOT NULL,
  description VARCHAR(500),
  action_group VARCHAR(50) COMMENT 'view | create | update | delete | manage | export',
  is_sensitive BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (module_id) REFERENCES feature_modules(id) ON DELETE CASCADE,
  INDEX idx_cap_key (capability_key),
  INDEX idx_cap_module (module_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. Role Templates — preset vai trò mặc định
-- ============================================================
CREATE TABLE IF NOT EXISTS role_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Capabilities mặc định theo role template
CREATE TABLE IF NOT EXISTS role_template_capabilities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_template_id INT NOT NULL,
  capability_key VARCHAR(120) NOT NULL,
  effect ENUM('allow', 'deny') NOT NULL DEFAULT 'allow',
  FOREIGN KEY (role_template_id) REFERENCES role_templates(id) ON DELETE CASCADE,
  UNIQUE KEY uq_rtc (role_template_id, capability_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. User Groups — nhóm vận hành
-- ============================================================
CREATE TABLE IF NOT EXISTS user_groups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NULL,
  code VARCHAR(80) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  group_type ENUM('operational', 'department', 'shift', 'custom') DEFAULT 'custom',
  priority INT DEFAULT 0 COMMENT 'Cao hơn thắng khi xung đột giữa các nhóm',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  UNIQUE KEY uq_group_code (tenant_id, code),
  INDEX idx_ug_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Thành viên nhóm
CREATE TABLE IF NOT EXISTS group_memberships (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_id INT NOT NULL,
  user_id INT NOT NULL,
  starts_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ends_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES user_groups(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_gm (group_id, user_id),
  INDEX idx_gm_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. Module Entitlements — bật/tắt module theo subject
-- ============================================================
CREATE TABLE IF NOT EXISTS module_entitlements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject_type ENUM('plan', 'tenant', 'department', 'group', 'user') NOT NULL,
  subject_id INT NOT NULL,
  module_key VARCHAR(80) NOT NULL,
  effect ENUM('enabled', 'disabled', 'inherit') NOT NULL DEFAULT 'inherit',
  reason VARCHAR(500),
  updated_by INT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY uq_me (subject_type, subject_id, module_key),
  INDEX idx_me_module (module_key),
  INDEX idx_me_subject (subject_type, subject_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. Policy Assignments — allow/deny capability theo subject
-- ============================================================
CREATE TABLE IF NOT EXISTS policy_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject_type ENUM('plan', 'tenant', 'department', 'group', 'user', 'role_template') NOT NULL,
  subject_id INT NOT NULL,
  capability_key VARCHAR(120) NOT NULL,
  effect ENUM('allow', 'deny', 'inherit') NOT NULL DEFAULT 'inherit',
  scope_json JSON COMMENT '{"departmentIds":[1,3],"patientRelation":"all"}',
  conditions_json JSON COMMENT '{"expires_at":"2026-12-31","reason":"..."}',
  source VARCHAR(100) COMMENT 'Nguồn: admin_manual, role_template, migration',
  is_active BOOLEAN DEFAULT TRUE,
  updated_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY uq_pa (subject_type, subject_id, capability_key),
  INDEX idx_pa_cap (capability_key),
  INDEX idx_pa_subject (subject_type, subject_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. Effective Access Snapshots — cache quyền hiệu lực
-- ============================================================
CREATE TABLE IF NOT EXISTS effective_access_snapshots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  tenant_id INT NULL,
  version INT NOT NULL DEFAULT 1,
  modules_json JSON COMMENT '{"dashboard":true,"reports":false}',
  capabilities_json JSON COMMENT '{"patients.view":{"effect":"allow","scopes":{...}}}',
  scopes_json JSON,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_eas (user_id, tenant_id),
  INDEX idx_eas_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Version tracker để invalid cache
CREATE TABLE IF NOT EXISTS access_versions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  scope_type ENUM('global', 'tenant', 'department', 'group', 'user') NOT NULL,
  scope_id INT NULL,
  version INT NOT NULL DEFAULT 1,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_av (scope_type, scope_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. Rule Definitions — rule nghiệp vụ
-- ============================================================
CREATE TABLE IF NOT EXISTS rule_definitions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rule_key VARCHAR(120) UNIQUE NOT NULL,
  rule_name VARCHAR(255) NOT NULL,
  category ENUM('workflow', 'validation', 'visibility', 'recommendation') NOT NULL,
  module_key VARCHAR(80) NOT NULL,
  description TEXT,
  config_schema JSON COMMENT 'JSON Schema mô tả các field cấu hình',
  default_config JSON,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Gán rule theo subject
CREATE TABLE IF NOT EXISTS rule_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject_type ENUM('tenant', 'department', 'group', 'user') NOT NULL,
  subject_id INT NOT NULL,
  rule_key VARCHAR(120) NOT NULL,
  config_json JSON NOT NULL COMMENT 'Cấu hình cụ thể cho subject này',
  is_active BOOLEAN DEFAULT TRUE,
  updated_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY uq_ra (subject_type, subject_id, rule_key),
  INDEX idx_ra_rule (rule_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. Access Audit Log — riêng cho thay đổi quyền
-- ============================================================
CREATE TABLE IF NOT EXISTS access_audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  user_name VARCHAR(255),
  action ENUM('module_change', 'capability_change', 'scope_change', 'rule_change', 'group_change', 'publish') NOT NULL,
  subject_type VARCHAR(50),
  subject_id INT,
  target_key VARCHAR(120),
  before_value JSON,
  after_value JSON,
  reason VARCHAR(500),
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_aal_user (user_id),
  INDEX idx_aal_subject (subject_type, subject_id),
  INDEX idx_aal_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 10. Add tenant_id to core tables
-- ============================================================
ALTER TABLE departments ADD COLUMN tenant_id INT NULL AFTER id;
ALTER TABLE departments ADD CONSTRAINT fk_dept_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
UPDATE departments SET tenant_id = 1 WHERE tenant_id IS NULL;

ALTER TABLE users ADD COLUMN tenant_id INT NULL AFTER department_id;
ALTER TABLE users ADD CONSTRAINT fk_users_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
UPDATE users SET tenant_id = 1 WHERE tenant_id IS NULL;

-- ============================================================
-- 11. Seed Module Catalog
-- ============================================================
INSERT INTO feature_modules (module_key, module_name, description, icon, sort_order, is_core, default_enabled) VALUES
  ('dashboard',      'Dashboard',             'Tổng quan điều hành',                       'layout-dashboard',   1,  TRUE,  TRUE),
  ('rooms',          'Quản lý phòng',         'Quản lý phòng bệnh và giường',              'bed',                2,  TRUE,  TRUE),
  ('beds',           'Quản lý giường',        'Xếp giường, chuyển giường, giải phóng',      'bed',                3,  TRUE,  TRUE),
  ('patients',       'Bệnh nhân',             'Quản lý bệnh nhân nội trú',                 'users',              4,  TRUE,  TRUE),
  ('discharge',      'Xuất viện',             'Quy trình dự kiến và xuất viện',             'door-exit',          5,  TRUE,  TRUE),
  ('checklists',     'Checklist hồ sơ',       'Quản lý checklist ra viện',                  'checklist',          6,  FALSE, TRUE),
  ('reports',        'Báo cáo',               'Báo cáo công suất, ra viện, hồ sơ thiếu',   'report-analytics',   7,  FALSE, TRUE),
  ('users_mgmt',     'Quản lý người dùng',    'Tài khoản, vai trò, nhóm',                  'users',              8,  FALSE, TRUE),
  ('config',         'Cấu hình hệ thống',     'Cấu hình chung, khoa, checklist template',  'settings',           9,  FALSE, TRUE),
  ('audit',          'Nhật ký hoạt động',     'Audit log hệ thống',                         'clipboard-list',     10, FALSE, TRUE),
  ('notifications',  'Thông báo',             'Thông báo realtime và push',                 'bell',               11, FALSE, TRUE),
  ('access',         'Quản lý quyền',         'Access Center: module, capability, scope',   'shield-lock',        12, FALSE, TRUE)
ON DUPLICATE KEY UPDATE module_name = VALUES(module_name);

-- ============================================================
-- 12. Seed Capabilities
-- ============================================================
INSERT INTO capabilities (capability_key, module_id, description, action_group) VALUES
  -- Dashboard
  ('dashboard.view',                (SELECT id FROM feature_modules WHERE module_key='dashboard'),   'Xem dashboard',                        'view'),
  -- Rooms
  ('rooms.view',                    (SELECT id FROM feature_modules WHERE module_key='rooms'),       'Xem danh sách phòng',                  'view'),
  ('rooms.manage',                  (SELECT id FROM feature_modules WHERE module_key='rooms'),       'Tạo/sửa/xóa phòng',                   'manage'),
  -- Beds
  ('beds.view',                     (SELECT id FROM feature_modules WHERE module_key='beds'),        'Xem giường',                           'view'),
  ('beds.assign',                   (SELECT id FROM feature_modules WHERE module_key='beds'),        'Xếp giường cho bệnh nhân',             'create'),
  ('beds.transfer',                 (SELECT id FROM feature_modules WHERE module_key='beds'),        'Chuyển giường',                        'update'),
  ('beds.release',                  (SELECT id FROM feature_modules WHERE module_key='beds'),        'Giải phóng giường',                    'delete'),
  -- Patients
  ('patients.view',                 (SELECT id FROM feature_modules WHERE module_key='patients'),    'Xem danh sách bệnh nhân',              'view'),
  ('patients.create',               (SELECT id FROM feature_modules WHERE module_key='patients'),    'Tạo hồ sơ bệnh nhân',                 'create'),
  ('patients.update',               (SELECT id FROM feature_modules WHERE module_key='patients'),    'Cập nhật bệnh nhân',                   'update'),
  -- Discharge
  ('discharge.view',                (SELECT id FROM feature_modules WHERE module_key='discharge'),   'Xem danh sách dự kiến ra viện',        'view'),
  ('discharge.request',             (SELECT id FROM feature_modules WHERE module_key='discharge'),   'Yêu cầu ra viện',                      'create'),
  ('discharge.approve',             (SELECT id FROM feature_modules WHERE module_key='discharge'),   'Phê duyệt ra viện',                    'manage'),
  -- Checklists
  ('checklists.view',               (SELECT id FROM feature_modules WHERE module_key='checklists'),  'Xem checklist bệnh nhân',              'view'),
  ('checklists.complete',           (SELECT id FROM feature_modules WHERE module_key='checklists'),  'Đánh dấu hoàn thành checklist',        'update'),
  ('checklists.manage_template',    (SELECT id FROM feature_modules WHERE module_key='checklists'),  'Quản lý mẫu checklist',                'manage'),
  -- Reports
  ('reports.view',                  (SELECT id FROM feature_modules WHERE module_key='reports'),     'Xem báo cáo',                          'view'),
  ('reports.export',                (SELECT id FROM feature_modules WHERE module_key='reports'),     'Xuất báo cáo',                         'export'),
  -- Users management
  ('users.view',                    (SELECT id FROM feature_modules WHERE module_key='users_mgmt'),  'Xem danh sách người dùng',             'view'),
  ('users.manage',                  (SELECT id FROM feature_modules WHERE module_key='users_mgmt'),  'Tạo/sửa/xóa người dùng',              'manage'),
  -- Config
  ('config.view',                   (SELECT id FROM feature_modules WHERE module_key='config'),      'Xem cấu hình',                        'view'),
  ('config.manage',                 (SELECT id FROM feature_modules WHERE module_key='config'),      'Sửa cấu hình',                        'manage'),
  -- Audit
  ('audit.view',                    (SELECT id FROM feature_modules WHERE module_key='audit'),       'Xem audit log',                        'view'),
  -- Notifications
  ('notifications.view',            (SELECT id FROM feature_modules WHERE module_key='notifications'),'Xem thông báo',                       'view'),
  ('notifications.manage',          (SELECT id FROM feature_modules WHERE module_key='notifications'),'Quản lý thông báo',                   'manage'),
  -- Access
  ('access.view',                   (SELECT id FROM feature_modules WHERE module_key='access'),      'Xem Access Center',                    'view'),
  ('access.manage',                 (SELECT id FROM feature_modules WHERE module_key='access'),      'Quản lý quyền, module, rule',          'manage'),
  ('access.preview',                (SELECT id FROM feature_modules WHERE module_key='access'),      'Preview effective access',              'view')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- ============================================================
-- 13. Seed Role Templates (from existing roles)
-- ============================================================
INSERT INTO role_templates (code, name, description, is_system) VALUES
  ('admin',         'Quản trị viên',     'Toàn quyền hệ thống',                                   TRUE),
  ('doctor',        'Bác sĩ',            'Xem/sửa bệnh nhân, yêu cầu ra viện, phê duyệt',        TRUE),
  ('nurse',         'Điều dưỡng',        'Xếp giường, chuyển giường, tạo bệnh nhân',               TRUE),
  ('records_staff', 'Nhân viên hồ sơ',   'Rà checklist, xem báo cáo',                              TRUE),
  ('receptionist',  'Tiếp nhận',         'Tạo hồ sơ bệnh nhân, tra cứu',                          TRUE)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Admin: all capabilities
INSERT INTO role_template_capabilities (role_template_id, capability_key, effect)
SELECT rt.id, c.capability_key, 'allow'
FROM role_templates rt CROSS JOIN capabilities c
WHERE rt.code = 'admin'
ON DUPLICATE KEY UPDATE effect = 'allow';

-- Doctor
INSERT INTO role_template_capabilities (role_template_id, capability_key, effect)
SELECT rt.id, c.capability_key, 'allow'
FROM role_templates rt, capabilities c
WHERE rt.code = 'doctor' AND c.capability_key IN (
  'dashboard.view', 'rooms.view', 'beds.view', 'patients.view', 'patients.create', 'patients.update',
  'discharge.view', 'discharge.request', 'discharge.approve',
  'checklists.view', 'checklists.complete', 'notifications.view'
)
ON DUPLICATE KEY UPDATE effect = 'allow';

-- Nurse
INSERT INTO role_template_capabilities (role_template_id, capability_key, effect)
SELECT rt.id, c.capability_key, 'allow'
FROM role_templates rt, capabilities c
WHERE rt.code = 'nurse' AND c.capability_key IN (
  'dashboard.view', 'rooms.view', 'beds.view', 'beds.assign', 'beds.transfer', 'beds.release',
  'patients.view', 'patients.create', 'patients.update',
  'discharge.view', 'checklists.view', 'checklists.complete', 'notifications.view'
)
ON DUPLICATE KEY UPDATE effect = 'allow';

-- Records staff
INSERT INTO role_template_capabilities (role_template_id, capability_key, effect)
SELECT rt.id, c.capability_key, 'allow'
FROM role_templates rt, capabilities c
WHERE rt.code = 'records_staff' AND c.capability_key IN (
  'dashboard.view', 'rooms.view', 'beds.view', 'patients.view',
  'discharge.view', 'checklists.view', 'checklists.complete',
  'reports.view', 'notifications.view'
)
ON DUPLICATE KEY UPDATE effect = 'allow';

-- Receptionist
INSERT INTO role_template_capabilities (role_template_id, capability_key, effect)
SELECT rt.id, c.capability_key, 'allow'
FROM role_templates rt, capabilities c
WHERE rt.code = 'receptionist' AND c.capability_key IN (
  'dashboard.view', 'rooms.view', 'beds.view',
  'patients.view', 'patients.create',
  'notifications.view'
)
ON DUPLICATE KEY UPDATE effect = 'allow';

-- ============================================================
-- 14. Seed default access version
-- ============================================================
INSERT INTO access_versions (scope_type, scope_id, version) VALUES
  ('global', NULL, 1)
ON DUPLICATE KEY UPDATE version = version;

-- ============================================================
-- 15. Seed default rule definitions
-- ============================================================
INSERT INTO rule_definitions (rule_key, rule_name, category, module_key, description, default_config) VALUES
  ('discharge.checklist_profile',    'Checklist ra viện theo khoa',         'workflow',      'checklists',    'Chọn bộ checklist phù hợp với từng khoa',                    '{"profile":"default"}'),
  ('patients.mandatory_fields',      'Trường bắt buộc theo khoa',          'validation',    'patients',      'Danh sách field bắt buộc có thể khác nhau theo khoa',        '{"fields":["full_name","diagnosis","doctor_name"]}'),
  ('beds.warning_threshold',         'Ngưỡng cảnh báo giường',             'recommendation','beds',          'Số giường trống tối thiểu trước khi cảnh báo',               '{"threshold":1}'),
  ('notifications.routing',          'Định tuyến thông báo',               'workflow',      'notifications', 'Ai nhận thông báo nào theo nhóm/khoa',                       '{"targets":["assigned_group"]}'),
  ('discharge.require_doctor',       'Bắt buộc BS xác nhận trước XV',      'workflow',      'discharge',     'Khoa nào bắt buộc có bác sĩ xác nhận trước khi ra viện',     '{"required":true}')
ON DUPLICATE KEY UPDATE rule_name = VALUES(rule_name);
