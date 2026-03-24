-- ============================================================
-- 003_seed_data.sql -- Du lieu test cho MedBoard
-- ============================================================

-- Rooms (5 khoa x 2-3 phong = 12 phong)
INSERT INTO rooms (room_code, name, department_id, room_type, max_beds, floor, status) VALUES
('P101', 'Phong 101', 1, 'normal', 6, 1, 'active'),
('P102', 'Phong 102', 1, 'normal', 4, 1, 'active'),
('P201', 'Phong 201', 2, 'normal', 6, 2, 'active'),
('P202', 'Phong 202 VIP', 2, 'vip', 2, 2, 'active'),
('P301', 'Phong 301', 3, 'normal', 4, 3, 'active'),
('P302', 'Phong 302', 3, 'normal', 6, 3, 'active'),
('P401', 'Phong 401 ICU', 4, 'icu', 4, 4, 'active'),
('P402', 'Phong 402', 4, 'normal', 6, 4, 'active'),
('P501', 'Phong 501', 5, 'normal', 4, 5, 'active'),
('P502', 'Phong 502 Cach ly', 5, 'isolation', 2, 5, 'active'),
('P103', 'Phong 103', 1, 'normal', 4, 1, 'maintenance'),
('P303', 'Phong 303', 3, 'normal', 6, 3, 'closed');

-- Beds (3-6 giuong moi phong)
INSERT INTO beds (bed_code, room_id, status) VALUES
-- P101 (6 giuong)
('G101-1', 1, 'occupied'), ('G101-2', 1, 'occupied'), ('G101-3', 1, 'empty'),
('G101-4', 1, 'empty'), ('G101-5', 1, 'occupied'), ('G101-6', 1, 'empty'),
-- P102 (4 giuong)
('G102-1', 2, 'occupied'), ('G102-2', 2, 'empty'), ('G102-3', 2, 'occupied'), ('G102-4', 2, 'empty'),
-- P201 (6 giuong)
('G201-1', 3, 'occupied'), ('G201-2', 3, 'occupied'), ('G201-3', 3, 'empty'),
('G201-4', 3, 'occupied'), ('G201-5', 3, 'empty'), ('G201-6', 3, 'empty'),
-- P202 VIP (2 giuong)
('G202-1', 4, 'occupied'), ('G202-2', 4, 'empty'),
-- P301 (4 giuong)
('G301-1', 5, 'occupied'), ('G301-2', 5, 'occupied'), ('G301-3', 5, 'empty'), ('G301-4', 5, 'empty'),
-- P302 (6 giuong)
('G302-1', 6, 'occupied'), ('G302-2', 6, 'empty'), ('G302-3', 6, 'empty'),
('G302-4', 6, 'occupied'), ('G302-5', 6, 'empty'), ('G302-6', 6, 'empty'),
-- P401 ICU (4 giuong)
('G401-1', 7, 'occupied'), ('G401-2', 7, 'occupied'), ('G401-3', 7, 'occupied'), ('G401-4', 7, 'empty'),
-- P402 (6 giuong)
('G402-1', 8, 'occupied'), ('G402-2', 8, 'empty'), ('G402-3', 8, 'empty'),
('G402-4', 8, 'empty'), ('G402-5', 8, 'occupied'), ('G402-6', 8, 'empty'),
-- P501 (4 giuong)
('G501-1', 9, 'occupied'), ('G501-2', 9, 'empty'), ('G501-3', 9, 'empty'), ('G501-4', 9, 'occupied'),
-- P502 Cach ly (2 giuong)
('G502-1', 10, 'occupied'), ('G502-2', 10, 'empty');

-- Patients (20 benh nhan voi cac trang thai khac nhau)
INSERT INTO patients (patient_code, full_name, date_of_birth, gender, phone, address, diagnosis, doctor_name, bed_id, status, admitted_at, expected_discharge, notes) VALUES
-- Dang dieu tri (10 benh nhan)
('BN001', 'Nguyen Van An', '1965-03-15', 'male', '0901234567', '12 Nguyen Hue, Q1, TP.HCM', 'Viem phoi cap', 'BS. Tran Minh Duc', 1, 'treating', '2026-03-18 08:00:00', '2026-03-28 08:00:00', 'Theo doi nhiet do moi 4h'),
('BN002', 'Le Thi Bich', '1978-07-22', 'female', '0912345678', '45 Le Loi, Q1, TP.HCM', 'Sot xuat huyet', 'BS. Pham Hong Hanh', 2, 'treating', '2026-03-19 10:30:00', '2026-03-27 10:00:00', NULL),
('BN003', 'Tran Van Cuong', '1990-11-01', 'male', '0923456789', '78 Tran Hung Dao, Q5', 'Gay xuong dui phai', 'BS. Nguyen Thanh Long', 7, 'treating', '2026-03-20 14:00:00', '2026-04-05 08:00:00', 'Hau phau ngay 2'),
('BN004', 'Pham Thi Dung', '1955-01-30', 'female', '0934567890', '23 Vo Van Tan, Q3', 'Tang huyet ap do 3', 'BS. Tran Minh Duc', 11, 'treating', '2026-03-17 09:00:00', '2026-03-26 08:00:00', 'Can giam sat lien tuc'),
('BN005', 'Hoang Van Em', '1982-05-14', 'male', '0945678901', '56 Nguyen Trai, Q5', 'Viem ruot thua cap', 'BS. Le Van Sy', 17, 'treating', '2026-03-21 16:00:00', '2026-03-29 08:00:00', 'Da phau thuat'),
('BN006', 'Vo Thi Phuong', '1970-09-08', 'female', '0956789012', '89 CMT8, Q10', 'Suy than man tinh', 'BS. Pham Hong Hanh', 5, 'treating', '2026-03-15 08:00:00', '2026-04-01 08:00:00', 'Chan thau moi 2 ngay/lan'),
('BN007', 'Dang Van Giang', '1988-12-25', 'male', '0967890123', '34 Ly Tu Trong, Q1', 'Viem gan B', 'BS. Nguyen Thanh Long', 19, 'treating', '2026-03-22 11:00:00', '2026-03-30 08:00:00', NULL),
('BN008', 'Bui Thi Hoa', '1995-04-17', 'female', '0978901234', '67 Hai Ba Trung, Q3', 'Chan thuong so nao', 'BS. Le Van Sy', 31, 'treating', '2026-03-20 13:00:00', '2026-04-03 08:00:00', 'Can CT scan theo doi'),
('BN009', 'Ly Van Ich', '1960-08-03', 'male', '0989012345', '12 Pasteur, Q1', 'Nhoi mau co tim', 'BS. Tran Minh Duc', 32, 'treating', '2026-03-19 06:00:00', '2026-04-02 08:00:00', 'ICU, theo doi 24/7'),
('BN010', 'Ngo Thi Kim', '1975-02-28', 'female', '0990123456', '45 NTMK, Q1', 'Viem phe quan man', 'BS. Pham Hong Hanh', 35, 'treating', '2026-03-21 09:00:00', '2026-03-31 08:00:00', NULL),

-- Moi nhap vien (3 benh nhan)
('BN011', 'Duong Van Lam', '1992-06-19', 'male', '0901111222', '23 Le Lai, Q1', 'Dau bung cap', 'BS. Le Van Sy', 9, 'admitted', '2026-03-24 07:00:00', '2026-03-30 08:00:00', 'Dang cho ket qua xet nghiem'),
('BN012', 'Truong Thi Mai', '1985-10-11', 'female', '0902222333', '56 Nguyen Du, Q1', 'Dau dau du doi', 'BS. Nguyen Thanh Long', 14, 'admitted', '2026-03-24 10:00:00', '2026-03-28 08:00:00', 'Can MRI nao'),
('BN013', 'Cao Van Nam', '1998-03-05', 'male', '0903333444', '89 Ba Thang Hai, Q10', 'Sot cao lien tuc 3 ngay', 'BS. Pham Hong Hanh', 25, 'admitted', '2026-03-24 14:00:00', '2026-03-28 08:00:00', NULL),

-- Cho ra vien (5 benh nhan - du kien ra vien hom nay/ngay mai)
('BN014', 'Le Van Oanh', '1968-04-20', 'male', '0904444555', '12 Pham Ngu Lao, Q1', 'Viem phoi - da hoi phuc', 'BS. Tran Minh Duc', 20, 'waiting_discharge', '2026-03-14 08:00:00', '2026-03-24 08:00:00', 'Du dieu kien ra vien'),
('BN015', 'Phan Thi Phuong', '1980-11-15', 'female', '0905555666', '45 De Tham, Q1', 'Phau thuat ruot thua - on dinh', 'BS. Le Van Sy', 33, 'waiting_discharge', '2026-03-16 10:00:00', '2026-03-24 08:00:00', 'Vet mo lanh tot'),
('BN016', 'Ha Van Quang', '1972-07-08', 'male', '0906666777', '78 Tran Quang Khai, Q1', 'Gay tay - da bo bot', 'BS. Nguyen Thanh Long', 39, 'waiting_discharge', '2026-03-10 09:00:00', '2026-03-25 08:00:00', NULL),
('BN017', 'Mai Thi Rang', '1963-09-30', 'female', '0907777888', '23 Nguyen An Ninh, Q1', 'Tang huyet ap - da on dinh', 'BS. Tran Minh Duc', 41, 'waiting_discharge', '2026-03-12 08:00:00', '2026-03-25 08:00:00', 'Hen tai kham sau 1 tuan'),
('BN018', 'Vu Van Son', '1950-12-01', 'male', '0908888999', '56 Ly Chinh Thang, Q3', 'Ho man tinh - da dieu tri', 'BS. Pham Hong Hanh', 44, 'waiting_discharge', '2026-03-13 11:00:00', '2026-03-25 08:00:00', 'Uong thuoc tai nha'),

-- Da ra vien (2 benh nhan)
('BN019', 'Dinh Van Tuan', '1987-01-14', 'male', '0909999000', '89 Vo Thi Sau, Q3', 'Viem da day - da khoi', 'BS. Le Van Sy', NULL, 'discharged', '2026-03-05 08:00:00', '2026-03-20 08:00:00', 'Ra vien voi toa thuoc'),
('BN020', 'Luong Thi Uyen', '1993-08-22', 'female', '0900000111', '12 NKKN, Q3', 'Sot ret - da dieu tri xong', 'BS. Nguyen Thanh Long', NULL, 'discharged', '2026-03-08 10:00:00', '2026-03-22 08:00:00', NULL);

-- Bed history cho cac benh nhan da ra vien
INSERT INTO bed_history (bed_id, patient_id, assigned_at, released_at) VALUES
(3, 19, '2026-03-05 08:00:00', '2026-03-20 10:00:00'),
(16, 20, '2026-03-08 10:00:00', '2026-03-22 09:00:00');

-- Checklists cho benh nhan cho ra vien
INSERT INTO patient_checklists (patient_id, template_id, is_completed, completed_at, completed_by) VALUES
-- BN014: 5/7 checklist done
(14, 1, TRUE, '2026-03-24 08:00:00', 1),
(14, 2, TRUE, '2026-03-24 08:30:00', 1),
(14, 3, TRUE, '2026-03-24 09:00:00', 1),
(14, 4, TRUE, '2026-03-24 09:30:00', 1),
(14, 5, TRUE, '2026-03-24 10:00:00', 1),
(14, 6, FALSE, NULL, NULL),
(14, 7, FALSE, NULL, NULL),
-- BN015: 3/7 done
(15, 1, TRUE, '2026-03-24 08:00:00', 1),
(15, 2, TRUE, '2026-03-24 08:30:00', 1),
(15, 3, TRUE, '2026-03-24 09:00:00', 1),
(15, 4, FALSE, NULL, NULL),
(15, 5, FALSE, NULL, NULL),
(15, 6, FALSE, NULL, NULL),
(15, 7, FALSE, NULL, NULL),
-- BN016: 0/7 done
(16, 1, FALSE, NULL, NULL),
(16, 2, FALSE, NULL, NULL),
(16, 3, FALSE, NULL, NULL),
(16, 4, FALSE, NULL, NULL),
(16, 5, FALSE, NULL, NULL),
(16, 6, FALSE, NULL, NULL),
(16, 7, FALSE, NULL, NULL);
