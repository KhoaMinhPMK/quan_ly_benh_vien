SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================================
-- GĐ2 Migration: Enhanced features
-- ============================================================

-- 1. Wards (Khu điều trị) — #3
CREATE TABLE IF NOT EXISTS wards (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL UNIQUE,
  description TEXT NULL,
  floor_start INT DEFAULT 1,
  floor_end INT DEFAULT 1,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Add ward_id to rooms
ALTER TABLE rooms ADD COLUMN ward_id INT NULL AFTER department_id;
ALTER TABLE rooms ADD CONSTRAINT fk_rooms_ward FOREIGN KEY (ward_id) REFERENCES wards(id) ON DELETE SET NULL;

-- 3. Enhance checklist_templates — #50, #51, #52
ALTER TABLE checklist_templates ADD COLUMN department_id INT NULL AFTER description;
ALTER TABLE checklist_templates ADD COLUMN question_type ENUM('checkbox','text','radio','number','note') DEFAULT 'checkbox' AFTER department_id;
ALTER TABLE checklist_templates ADD COLUMN options JSON NULL AFTER question_type;
ALTER TABLE checklist_templates ADD COLUMN is_required TINYINT(1) DEFAULT 0 AFTER options;
ALTER TABLE checklist_templates ADD CONSTRAINT fk_checklist_dept FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;

-- 4. Enhance admission_checklists — #47, #54
ALTER TABLE admission_checklists ADD COLUMN answer_text TEXT NULL AFTER notes;

-- 5. Discharge history view optimization — #42
-- Add index for faster discharge queries
ALTER TABLE admissions ADD INDEX idx_admissions_discharged (status, discharged_at);
ALTER TABLE admissions ADD INDEX idx_admissions_expected (status, expected_discharge);

-- 6. Seed default wards
INSERT INTO wards (name, code, description, floor_start, floor_end) VALUES
  ('Khu A - Nội khoa', 'KHU-A', 'Khu điều trị nội khoa tổng hợp', 1, 3),
  ('Khu B - Ngoại khoa', 'KHU-B', 'Khu điều trị ngoại khoa', 4, 6),
  ('Khu C - Hồi sức', 'KHU-C', 'Khu hồi sức tích cực & cấp cứu', 7, 8);

-- 7. Daily statistics snapshot table — #60 trend charts
CREATE TABLE IF NOT EXISTS daily_stats (
  id INT PRIMARY KEY AUTO_INCREMENT,
  stat_date DATE NOT NULL,
  department_id INT NULL,
  total_patients INT DEFAULT 0,
  new_admissions INT DEFAULT 0,
  discharges INT DEFAULT 0,
  total_beds INT DEFAULT 0,
  occupied_beds INT DEFAULT 0,
  waiting_queue INT DEFAULT 0,
  occupancy_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_daily_dept (stat_date, department_id),
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
