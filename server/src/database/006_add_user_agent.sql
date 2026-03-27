-- Migration: 006_add_user_agent
-- Thêm cột user_agent vào bảng audit_logs để ghi lại trình duyệt/thiết bị người dùng

ALTER TABLE audit_logs ADD COLUMN user_agent TEXT AFTER ip_address;
