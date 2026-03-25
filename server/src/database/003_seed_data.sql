-- ============================================================
-- 003_seed_data.sql -- Dữ liệu test cho MedBoard
-- ============================================================

-- Rooms (5 khoa x 2-3 phòng = 12 phòng)
INSERT INTO rooms (room_code, name, department_id, room_type, max_beds, floor, status) VALUES
('P101', 'Phòng 101', 1, 'normal', 6, 1, 'active'),
('P102', 'Phòng 102', 1, 'normal', 4, 1, 'active'),
('P201', 'Phòng 201', 2, 'normal', 6, 2, 'active'),
('P202', 'Phòng 202 VIP', 2, 'vip', 2, 2, 'active'),
('P301', 'Phòng 301', 3, 'normal', 4, 3, 'active'),
('P302', 'Phòng 302', 3, 'normal', 6, 3, 'active'),
('P401', 'Phòng 401 ICU', 4, 'icu', 4, 4, 'active'),
('P402', 'Phòng 402', 4, 'normal', 6, 4, 'active'),
('P501', 'Phòng 501', 5, 'normal', 4, 5, 'active'),
('P502', 'Phòng 502 Cách ly', 5, 'isolation', 2, 5, 'active'),
('P103', 'Phòng 103', 1, 'normal', 4, 1, 'maintenance'),
('P303', 'Phòng 303', 3, 'normal', 6, 3, 'closed');

-- Beds (3-6 giường mỗi phòng)
INSERT INTO beds (bed_code, room_id, status) VALUES
-- P101 (6 giường)
('G101-1', 1, 'occupied'), ('G101-2', 1, 'occupied'), ('G101-3', 1, 'empty'),
('G101-4', 1, 'empty'), ('G101-5', 1, 'occupied'), ('G101-6', 1, 'empty'),
-- P102 (4 giường)
('G102-1', 2, 'occupied'), ('G102-2', 2, 'empty'), ('G102-3', 2, 'occupied'), ('G102-4', 2, 'empty'),
-- P201 (6 giường)
('G201-1', 3, 'occupied'), ('G201-2', 3, 'occupied'), ('G201-3', 3, 'empty'),
('G201-4', 3, 'occupied'), ('G201-5', 3, 'empty'), ('G201-6', 3, 'empty'),
-- P202 VIP (2 giường)
('G202-1', 4, 'occupied'), ('G202-2', 4, 'empty'),
-- P301 (4 giường)
('G301-1', 5, 'occupied'), ('G301-2', 5, 'occupied'), ('G301-3', 5, 'empty'), ('G301-4', 5, 'empty'),
-- P302 (6 giường)
('G302-1', 6, 'occupied'), ('G302-2', 6, 'empty'), ('G302-3', 6, 'empty'),
('G302-4', 6, 'occupied'), ('G302-5', 6, 'empty'), ('G302-6', 6, 'empty'),
-- P401 ICU (4 giường)
('G401-1', 7, 'occupied'), ('G401-2', 7, 'occupied'), ('G401-3', 7, 'occupied'), ('G401-4', 7, 'empty'),
-- P402 (6 giường)
('G402-1', 8, 'occupied'), ('G402-2', 8, 'empty'), ('G402-3', 8, 'empty'),
('G402-4', 8, 'empty'), ('G402-5', 8, 'occupied'), ('G402-6', 8, 'empty'),
-- P501 (4 giường)
('G501-1', 9, 'occupied'), ('G501-2', 9, 'empty'), ('G501-3', 9, 'empty'), ('G501-4', 9, 'occupied'),
-- P502 Cách ly (2 giường)
('G502-1', 10, 'occupied'), ('G502-2', 10, 'empty');

-- Patients (20 bệnh nhân với các trạng thái khác nhau)
INSERT INTO patients (patient_code, full_name, date_of_birth, gender, phone, address, diagnosis, doctor_name, bed_id, status, admitted_at, expected_discharge, notes) VALUES
-- Đang điều trị (10 bệnh nhân)
('BN001', 'Nguyễn Văn An', '1965-03-15', 'male', '0901234567', '12 Nguyễn Huệ, Q1, TP.HCM', 'Viêm phổi cấp', 'BS. Trần Minh Đức', 1, 'treating', '2026-03-18 08:00:00', '2026-03-28 08:00:00', 'Theo dõi nhiệt độ mỗi 4h'),
('BN002', 'Lê Thị Bích', '1978-07-22', 'female', '0912345678', '45 Lê Lợi, Q1, TP.HCM', 'Sốt xuất huyết', 'BS. Phạm Hồng Hạnh', 2, 'treating', '2026-03-19 10:30:00', '2026-03-27 10:00:00', NULL),
('BN003', 'Trần Văn Cường', '1990-11-01', 'male', '0923456789', '78 Trần Hưng Đạo, Q5', 'Gãy xương đùi phải', 'BS. Nguyễn Thanh Long', 7, 'treating', '2026-03-20 14:00:00', '2026-04-05 08:00:00', 'Hậu phẫu ngày 2'),
('BN004', 'Phạm Thị Dung', '1955-01-30', 'female', '0934567890', '23 Võ Văn Tần, Q3', 'Tăng huyết áp độ 3', 'BS. Trần Minh Đức', 11, 'treating', '2026-03-17 09:00:00', '2026-03-26 08:00:00', 'Cần giám sát liên tục'),
('BN005', 'Hoàng Văn Em', '1982-05-14', 'male', '0945678901', '56 Nguyễn Trãi, Q5', 'Viêm ruột thừa cấp', 'BS. Lê Văn Sỹ', 17, 'treating', '2026-03-21 16:00:00', '2026-03-29 08:00:00', 'Đã phẫu thuật'),
('BN006', 'Võ Thị Phương', '1970-09-08', 'female', '0956789012', '89 CMT8, Q10', 'Suy thận mạn tính', 'BS. Phạm Hồng Hạnh', 5, 'treating', '2026-03-15 08:00:00', '2026-04-01 08:00:00', 'Chạy thận mỗi 2 ngày/lần'),
('BN007', 'Đặng Văn Giang', '1988-12-25', 'male', '0967890123', '34 Lý Tự Trọng, Q1', 'Viêm gan B', 'BS. Nguyễn Thanh Long', 19, 'treating', '2026-03-22 11:00:00', '2026-03-30 08:00:00', NULL),
('BN008', 'Bùi Thị Hoa', '1995-04-17', 'female', '0978901234', '67 Hai Bà Trưng, Q3', 'Chấn thương sọ não', 'BS. Lê Văn Sỹ', 31, 'treating', '2026-03-20 13:00:00', '2026-04-03 08:00:00', 'Cần CT scan theo dõi'),
('BN009', 'Lý Văn Ích', '1960-08-03', 'male', '0989012345', '12 Pasteur, Q1', 'Nhồi máu cơ tim', 'BS. Trần Minh Đức', 32, 'treating', '2026-03-19 06:00:00', '2026-04-02 08:00:00', 'ICU, theo dõi 24/7'),
('BN010', 'Ngô Thị Kim', '1975-02-28', 'female', '0990123456', '45 NTMK, Q1', 'Viêm phế quản mạn', 'BS. Phạm Hồng Hạnh', 35, 'treating', '2026-03-21 09:00:00', '2026-03-31 08:00:00', NULL),

-- Mới nhập viện (3 bệnh nhân)
('BN011', 'Dương Văn Lâm', '1992-06-19', 'male', '0901111222', '23 Lê Lai, Q1', 'Đau bụng cấp', 'BS. Lê Văn Sỹ', 9, 'admitted', '2026-03-24 07:00:00', '2026-03-30 08:00:00', 'Đang chờ kết quả xét nghiệm'),
('BN012', 'Trương Thị Mai', '1985-10-11', 'female', '0902222333', '56 Nguyễn Du, Q1', 'Đau đầu dữ dội', 'BS. Nguyễn Thanh Long', 14, 'admitted', '2026-03-24 10:00:00', '2026-03-28 08:00:00', 'Cần MRI não'),
('BN013', 'Cao Văn Nam', '1998-03-05', 'male', '0903333444', '89 Ba Tháng Hai, Q10', 'Sốt cao liên tục 3 ngày', 'BS. Phạm Hồng Hạnh', 25, 'admitted', '2026-03-24 14:00:00', '2026-03-28 08:00:00', NULL),

-- Chờ ra viện (5 bệnh nhân - dự kiến ra viện hôm nay/ngày mai)
('BN014', 'Lê Văn Oanh', '1968-04-20', 'male', '0904444555', '12 Phạm Ngũ Lão, Q1', 'Viêm phổi - đã hồi phục', 'BS. Trần Minh Đức', 20, 'waiting_discharge', '2026-03-14 08:00:00', '2026-03-24 08:00:00', 'Đủ điều kiện ra viện'),
('BN015', 'Phan Thị Phương', '1980-11-15', 'female', '0905555666', '45 Đề Thám, Q1', 'Phẫu thuật ruột thừa - ổn định', 'BS. Lê Văn Sỹ', 33, 'waiting_discharge', '2026-03-16 10:00:00', '2026-03-24 08:00:00', 'Vết mổ lành tốt'),
('BN016', 'Hà Văn Quang', '1972-07-08', 'male', '0906666777', '78 Trần Quang Khải, Q1', 'Gãy tay - đã bỏ bột', 'BS. Nguyễn Thanh Long', 39, 'waiting_discharge', '2026-03-10 09:00:00', '2026-03-25 08:00:00', NULL),
('BN017', 'Mai Thị Rạng', '1963-09-30', 'female', '0907777888', '23 Nguyễn An Ninh, Q1', 'Tăng huyết áp - đã ổn định', 'BS. Trần Minh Đức', 41, 'waiting_discharge', '2026-03-12 08:00:00', '2026-03-25 08:00:00', 'Hẹn tái khám sau 1 tuần'),
('BN018', 'Vũ Văn Sơn', '1950-12-01', 'male', '0908888999', '56 Lý Chính Thắng, Q3', 'Ho mạn tính - đã điều trị', 'BS. Phạm Hồng Hạnh', 44, 'waiting_discharge', '2026-03-13 11:00:00', '2026-03-25 08:00:00', 'Uống thuốc tại nhà'),

-- Đã ra viện (2 bệnh nhân)
('BN019', 'Đinh Văn Tuấn', '1987-01-14', 'male', '0909999000', '89 Võ Thị Sáu, Q3', 'Viêm dạ dày - đã khỏi', 'BS. Lê Văn Sỹ', NULL, 'discharged', '2026-03-05 08:00:00', '2026-03-20 08:00:00', 'Ra viện với toa thuốc'),
('BN020', 'Lương Thị Uyên', '1993-08-22', 'female', '0900000111', '12 NKKN, Q3', 'Sốt rét - đã điều trị xong', 'BS. Nguyễn Thanh Long', NULL, 'discharged', '2026-03-08 10:00:00', '2026-03-22 08:00:00', NULL);

-- Bed history cho các bệnh nhân đã ra viện
INSERT INTO bed_history (bed_id, patient_id, action, performed_by, notes) VALUES
(3, 19, 'assign', 1, 'Nhập viện'),
(3, 19, 'release', 1, 'Ra viện'),
(16, 20, 'assign', 1, 'Nhập viện'),
(16, 20, 'release', 1, 'Ra viện');

-- Checklists cho bệnh nhân chờ ra viện
INSERT INTO patient_checklists (patient_id, checklist_template_id, is_completed, completed_at, completed_by) VALUES
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
