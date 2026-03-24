-- Migration: 002_create_core_tables
-- Tao bang phong, giuong, benh nhan, discharge, history

-- Departments (khoa)
CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_dept_code (code),
  INDEX idx_dept_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Rooms (phong benh)
CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  department_id INT NOT NULL,
  room_type ENUM('normal', 'vip', 'icu', 'isolation') NOT NULL DEFAULT 'normal',
  max_beds INT NOT NULL DEFAULT 4,
  status ENUM('active', 'maintenance', 'closed') NOT NULL DEFAULT 'active',
  floor INT DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id),
  INDEX idx_room_code (room_code),
  INDEX idx_room_dept (department_id),
  INDEX idx_room_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Beds (giuong)
CREATE TABLE IF NOT EXISTS beds (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bed_code VARCHAR(50) UNIQUE NOT NULL,
  room_id INT NOT NULL,
  status ENUM('empty', 'occupied', 'locked', 'cleaning') NOT NULL DEFAULT 'empty',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id),
  INDEX idx_bed_code (bed_code),
  INDEX idx_bed_room (room_id),
  INDEX idx_bed_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Patients (benh nhan noi tru)
CREATE TABLE IF NOT EXISTS patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_code VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  date_of_birth DATE,
  gender ENUM('male', 'female', 'other') DEFAULT 'male',
  phone VARCHAR(20),
  address TEXT,
  id_number VARCHAR(20),
  insurance_number VARCHAR(30),
  diagnosis TEXT,
  doctor_name VARCHAR(255),
  bed_id INT,
  status ENUM('admitted', 'treating', 'waiting_discharge', 'discharged') NOT NULL DEFAULT 'admitted',
  admitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expected_discharge DATE,
  discharged_at TIMESTAMP NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (bed_id) REFERENCES beds(id) ON DELETE SET NULL,
  INDEX idx_patient_code (patient_code),
  INDEX idx_patient_name (full_name),
  INDEX idx_patient_status (status),
  INDEX idx_patient_bed (bed_id),
  INDEX idx_patient_discharge (expected_discharge)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Discharge checklist items (template)
CREATE TABLE IF NOT EXISTS checklist_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Patient checklist status
CREATE TABLE IF NOT EXISTS patient_checklists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  checklist_template_id INT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_by INT,
  completed_at TIMESTAMP NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (checklist_template_id) REFERENCES checklist_templates(id),
  FOREIGN KEY (completed_by) REFERENCES users(id),
  UNIQUE KEY uq_patient_checklist (patient_id, checklist_template_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bed history (lich su giuong)
CREATE TABLE IF NOT EXISTS bed_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  bed_id INT NOT NULL,
  action ENUM('assign', 'transfer', 'release') NOT NULL,
  performed_by INT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (bed_id) REFERENCES beds(id),
  FOREIGN KEY (performed_by) REFERENCES users(id),
  INDEX idx_bh_patient (patient_id),
  INDEX idx_bh_bed (bed_id),
  INDEX idx_bh_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed departments
INSERT INTO departments (name, code) VALUES
  ('Noi khoa', 'NK'),
  ('Ngoai khoa', 'NGK'),
  ('Nhi khoa', 'NHK'),
  ('San khoa', 'SK'),
  ('Cap cuu', 'CC')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Seed checklist templates
INSERT INTO checklist_templates (name, description, sort_order) VALUES
  ('Ho so benh an', 'Kiem tra ho so benh an day du', 1),
  ('Phieu xet nghiem', 'Ket qua xet nghiem da co', 2),
  ('Phieu chup X-quang', 'Ket qua X-quang/CT/MRI', 3),
  ('Don thuoc ra vien', 'Bac si da ke don thuoc ra vien', 4),
  ('Giay ra vien', 'Giay ra vien da ky', 5),
  ('Thanh toan vien phi', 'Benh nhan da thanh toan day du', 6),
  ('Huong dan tai kham', 'Da huong dan benh nhan tai kham', 7);
