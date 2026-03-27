-- Migration: 005_refactor_admissions
-- Tách cấu trúc: patients (nhân khẩu học) và admissions (hồ sơ nhập viện)

-- 1. Create admissions table
CREATE TABLE IF NOT EXISTS admissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  admission_code VARCHAR(50) UNIQUE NOT NULL,
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
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (bed_id) REFERENCES beds(id) ON DELETE SET NULL,
  INDEX idx_admission_code (admission_code),
  INDEX idx_admission_patient (patient_id),
  INDEX idx_admission_status (status),
  INDEX idx_admission_bed (bed_id),
  INDEX idx_admission_discharge (expected_discharge)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Migrate existing data from patients -> admissions
INSERT INTO admissions (patient_id, admission_code, diagnosis, doctor_name, bed_id, status, admitted_at, expected_discharge, discharged_at, notes, created_at, updated_at)
SELECT id, CONCAT('BA-', patient_code), diagnosis, doctor_name, bed_id, status, admitted_at, expected_discharge, discharged_at, notes, created_at, updated_at
FROM patients
ON DUPLICATE KEY UPDATE patient_id=VALUES(patient_id);

-- 3. Replace patient_checklists with admission_checklists
CREATE TABLE IF NOT EXISTS admission_checklists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admission_id INT NOT NULL,
  checklist_template_id INT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_by INT,
  completed_at TIMESTAMP NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (admission_id) REFERENCES admissions(id) ON DELETE CASCADE,
  FOREIGN KEY (checklist_template_id) REFERENCES checklist_templates(id),
  FOREIGN KEY (completed_by) REFERENCES users(id),
  UNIQUE KEY uq_admission_checklist (admission_id, checklist_template_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO admission_checklists (id, admission_id, checklist_template_id, is_completed, completed_by, completed_at, notes, created_at, updated_at)
SELECT pc.id, a.id, pc.checklist_template_id, pc.is_completed, pc.completed_by, pc.completed_at, pc.notes, pc.created_at, pc.updated_at
FROM patient_checklists pc
JOIN admissions a ON pc.patient_id = a.patient_id
ON DUPLICATE KEY UPDATE admission_id=VALUES(admission_id);

DROP TABLE IF EXISTS patient_checklists;

-- 4. Replace bed_history with admission_bed_history
CREATE TABLE IF NOT EXISTS admission_bed_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admission_id INT NOT NULL,
  bed_id INT NOT NULL,
  action ENUM('assign', 'transfer', 'release') NOT NULL,
  performed_by INT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admission_id) REFERENCES admissions(id) ON DELETE CASCADE,
  FOREIGN KEY (bed_id) REFERENCES beds(id),
  FOREIGN KEY (performed_by) REFERENCES users(id),
  INDEX idx_abh_admission (admission_id),
  INDEX idx_abh_bed (bed_id),
  INDEX idx_abh_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO admission_bed_history (id, admission_id, bed_id, action, performed_by, notes, created_at)
SELECT bh.id, a.id, bh.bed_id, bh.action, bh.performed_by, bh.notes, bh.created_at
FROM bed_history bh
JOIN admissions a ON bh.patient_id = a.patient_id
ON DUPLICATE KEY UPDATE admission_id=VALUES(admission_id);

DROP TABLE IF EXISTS bed_history;

-- 5. Drop admission-specific columns from patients table
DELIMITER //
CREATE PROCEDURE DropPatientsFK()
BEGIN
    DECLARE fk_name VARCHAR(64);
    
    SELECT CONSTRAINT_NAME INTO fk_name 
    FROM information_schema.KEY_COLUMN_USAGE 
    WHERE TABLE_NAME = 'patients' AND COLUMN_NAME = 'bed_id' AND TABLE_SCHEMA = DATABASE();
    
    IF fk_name IS NOT NULL THEN
        SET @sql = CONCAT('ALTER TABLE patients DROP FOREIGN KEY ', fk_name);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //
DELIMITER ;

CALL DropPatientsFK();
DROP PROCEDURE DropPatientsFK;

ALTER TABLE patients 
  DROP COLUMN diagnosis,
  DROP COLUMN doctor_name,
  DROP COLUMN bed_id,
  DROP COLUMN status,
  DROP COLUMN admitted_at,
  DROP COLUMN expected_discharge,
  DROP COLUMN discharged_at,
  DROP COLUMN notes;
