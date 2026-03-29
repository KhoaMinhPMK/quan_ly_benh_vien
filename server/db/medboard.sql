-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Mar 29, 2026 at 12:24 AM
-- Server version: 8.0.44
-- PHP Version: 8.4.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `medboard`
--

-- --------------------------------------------------------

--
-- Table structure for table `admissions`
--

CREATE TABLE `admissions` (
  `id` int NOT NULL,
  `patient_id` int NOT NULL,
  `admission_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `diagnosis` text COLLATE utf8mb4_unicode_ci,
  `doctor_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bed_id` int DEFAULT NULL,
  `status` enum('admitted','treating','waiting_discharge','discharged') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'admitted',
  `admitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expected_discharge` date DEFAULT NULL,
  `discharged_at` timestamp NULL DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admissions`
--

INSERT INTO `admissions` (`id`, `patient_id`, `admission_code`, `diagnosis`, `doctor_name`, `bed_id`, `status`, `admitted_at`, `expected_discharge`, `discharged_at`, `notes`, `created_at`, `updated_at`) VALUES
(1, 1, 'BA-20260328-0001', 'viêm phổi', 'BS Nguyễn văn A', 19, 'admitted', '2026-03-28 04:01:31', '2027-11-11', NULL, 'ttt', '2026-03-28 04:01:31', '2026-03-28 04:01:48');

-- --------------------------------------------------------

--
-- Table structure for table `admission_bed_history`
--

CREATE TABLE `admission_bed_history` (
  `id` int NOT NULL,
  `admission_id` int NOT NULL,
  `bed_id` int NOT NULL,
  `action` enum('assign','transfer','release') COLLATE utf8mb4_unicode_ci NOT NULL,
  `performed_by` int DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admission_bed_history`
--

INSERT INTO `admission_bed_history` (`id`, `admission_id`, `bed_id`, `action`, `performed_by`, `notes`, `created_at`) VALUES
(1, 1, 3, 'assign', NULL, NULL, '2026-03-28 04:01:31'),
(2, 1, 3, 'release', 1, 'Chuyển giường', '2026-03-28 04:01:48'),
(3, 1, 19, 'transfer', 1, NULL, '2026-03-28 04:01:48');

-- --------------------------------------------------------

--
-- Table structure for table `admission_checklists`
--

CREATE TABLE `admission_checklists` (
  `id` int NOT NULL,
  `admission_id` int NOT NULL,
  `checklist_template_id` int NOT NULL,
  `is_completed` tinyint(1) DEFAULT '0',
  `completed_by` int DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `user_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` int DEFAULT NULL,
  `details` json DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `beds`
--

CREATE TABLE `beds` (
  `id` int NOT NULL,
  `bed_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `room_id` int NOT NULL,
  `status` enum('empty','occupied','locked','cleaning') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'empty',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `beds`
--

INSERT INTO `beds` (`id`, `bed_code`, `room_id`, `status`, `notes`, `created_at`, `updated_at`) VALUES
(1, 'G101-1', 1, 'empty', NULL, '2026-03-26 06:15:12', '2026-03-28 03:52:37'),
(2, 'G101-2', 1, 'empty', NULL, '2026-03-26 06:15:12', '2026-03-28 03:52:37'),
(3, 'G101-3', 1, 'empty', NULL, '2026-03-26 06:15:12', '2026-03-28 04:01:48'),
(4, 'G101-4', 1, 'empty', NULL, '2026-03-26 06:15:12', '2026-03-26 06:15:12'),
(5, 'G101-5', 1, 'empty', NULL, '2026-03-26 06:15:12', '2026-03-28 03:52:37'),
(6, 'G101-6', 1, 'empty', NULL, '2026-03-26 06:15:12', '2026-03-26 06:15:12'),
(7, 'G102-1', 2, 'empty', NULL, '2026-03-26 06:15:12', '2026-03-28 03:52:37'),
(8, 'G102-2', 2, 'empty', NULL, '2026-03-26 06:15:12', '2026-03-26 06:15:12'),
(9, 'G102-3', 2, 'empty', NULL, '2026-03-26 06:15:12', '2026-03-28 03:52:37'),
(10, 'G102-4', 2, 'empty', NULL, '2026-03-26 06:15:12', '2026-03-26 06:15:12'),
(11, 'G201-1', 3, 'empty', NULL, '2026-03-26 06:15:12', '2026-03-28 03:52:37'),
(12, 'G201-2', 3, 'empty', NULL, '2026-03-26 06:15:12', '2026-03-27 07:56:05'),
(13, 'G201-3', 3, 'empty', NULL, '2026-03-26 06:15:12', '2026-03-26 06:15:12'),
(14, 'G201-4', 3, 'empty', NULL, '2026-03-26 06:15:12', '2026-03-28 03:52:37'),
(15, 'G201-5', 3, 'empty', NULL, '2026-03-26 06:15:12', '2026-03-26 06:15:12'),
(16, 'G201-6', 3, 'empty', NULL, '2026-03-26 06:15:12', '2026-03-26 06:15:12'),
(17, 'G202-1', 4, 'empty', NULL, '2026-03-26 06:15:12', '2026-03-28 03:52:37'),
(18, 'G202-2', 4, 'empty', NULL, '2026-03-26 06:15:12', '2026-03-26 06:15:12'),
(19, 'G301-1', 5, 'occupied', NULL, '2026-03-26 06:15:12', '2026-03-28 04:01:48'),
(20, 'G301-2', 5, 'empty', NULL, '2026-03-26 06:15:12', '2026-03-28 02:25:33'),
(21, 'G301-3', 5, 'empty', NULL, '2026-03-26 06:15:12', '2026-03-26 06:15:12'),
(22, 'G301-4', 5, 'empty', NULL, '2026-03-26 06:15:12', '2026-03-26 06:15:12'),
(23, 'G302-1', 6, 'empty', NULL, '2026-03-26 06:15:12', '2026-03-27 07:56:05'),
(24, 'G302-2', 6, 'empty', NULL, '2026-03-26 06:15:12', '2026-03-26 06:15:12'),
(25, 'G302-3', 6, 'empty', NULL, '2026-03-26 06:15:12', '2026-03-26 06:15:12'),
(26, 'G302-4', 6, 'empty', NULL, '2026-03-26 06:15:12', '2026-03-27 07:56:05'),
(27, 'G302-5', 6, 'empty', NULL, '2026-03-26 06:15:12', '2026-03-26 06:15:12'),
(28, 'G302-6', 6, 'empty', NULL, '2026-03-26 06:15:12', '2026-03-26 06:15:12'),
(29, 'G401-1', 7, 'empty', NULL, '2026-03-26 06:15:12', '2026-03-27 07:56:05'),
(30, 'G401-2', 7, 'empty', NULL, '2026-03-26 06:15:12', '2026-03-27 07:56:05'),
(31, 'G401-3', 7, 'empty', NULL, '2026-03-26 06:15:12', '2026-03-28 03:52:37'),
(32, 'G401-4', 7, 'empty', NULL, '2026-03-26 06:15:12', '2026-03-26 06:15:12'),
(33, 'G402-1', 8, 'empty', NULL, '2026-03-26 06:15:12', '2026-03-28 03:52:37'),
(34, 'G402-2', 8, 'empty', NULL, '2026-03-26 06:15:12', '2026-03-26 06:15:12'),
(35, 'G402-3', 8, 'empty', NULL, '2026-03-26 06:15:12', '2026-03-26 06:15:12'),
(36, 'G402-4', 8, 'empty', NULL, '2026-03-26 06:15:12', '2026-03-26 06:15:12'),
(37, 'G402-5', 8, 'empty', NULL, '2026-03-26 06:15:12', '2026-03-27 07:56:05'),
(38, 'G402-6', 8, 'empty', NULL, '2026-03-26 06:15:12', '2026-03-26 06:15:12'),
(39, 'G501-1', 9, 'empty', NULL, '2026-03-26 06:15:12', '2026-03-28 03:52:37'),
(40, 'G501-2', 9, 'empty', NULL, '2026-03-26 06:15:12', '2026-03-26 06:15:12'),
(41, 'G501-3', 9, 'empty', NULL, '2026-03-26 06:15:12', '2026-03-26 06:15:12'),
(42, 'G501-4', 9, 'empty', NULL, '2026-03-26 06:15:12', '2026-03-27 07:56:05'),
(43, 'G502-1', 10, 'empty', NULL, '2026-03-26 06:15:12', '2026-03-27 07:56:05'),
(44, 'G502-2', 10, 'empty', NULL, '2026-03-26 06:15:12', '2026-03-26 06:15:12');

-- --------------------------------------------------------

--
-- Table structure for table `checklist_templates`
--

CREATE TABLE `checklist_templates` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `sort_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `checklist_templates`
--

INSERT INTO `checklist_templates` (`id`, `name`, `description`, `sort_order`, `is_active`, `created_at`) VALUES
(1, 'Hồ sơ bệnh án', 'Kiểm tra hồ sơ bệnh án đầy đủ', 1, 1, '2026-03-26 06:15:12'),
(2, 'Phiếu xét nghiệm', 'Kết quả xét nghiệm đã có', 2, 1, '2026-03-26 06:15:12'),
(3, 'Phiếu chụp X-quang', 'Kết quả X-quang/CT/MRI', 3, 1, '2026-03-26 06:15:12'),
(4, 'Đơn thuốc ra viện', 'Bác sĩ đã kê đơn thuốc ra viện', 4, 1, '2026-03-26 06:15:12'),
(5, 'Giấy ra viện', 'Giấy ra viện đã ký', 5, 1, '2026-03-26 06:15:12'),
(6, 'Thanh toán viện phí', 'Bệnh nhân đã thanh toán đầy đủ', 6, 1, '2026-03-26 06:15:12'),
(7, 'Hướng dẫn tái khám', 'Đã hướng dẫn bệnh nhân tái khám', 7, 1, '2026-03-26 06:15:12');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `name`, `code`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Nội khoa', 'NK', NULL, 1, '2026-03-26 06:15:12', '2026-03-26 06:15:12'),
(2, 'Ngoại khoa', 'NGK', NULL, 1, '2026-03-26 06:15:12', '2026-03-26 06:15:12'),
(3, 'Nhi khoa', 'NHK', NULL, 1, '2026-03-26 06:15:12', '2026-03-26 06:15:12'),
(4, 'Sản khoa', 'SK', NULL, 1, '2026-03-26 06:15:12', '2026-03-26 06:15:12'),
(5, 'Cấp cứu', 'CC', NULL, 1, '2026-03-26 06:15:12', '2026-03-26 06:15:12');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int NOT NULL,
  `type` enum('room_full','discharge_pending','record_missing','bed_assigned','general') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'general',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci,
  `target_user_id` int DEFAULT NULL,
  `target_role` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `reference_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

CREATE TABLE `push_subscriptions` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `endpoint` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `keys_p256dh` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `keys_auth` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_agent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `patients`
--

CREATE TABLE `patients` (
  `id` int NOT NULL,
  `patient_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female','other') COLLATE utf8mb4_unicode_ci DEFAULT 'male',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `id_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `insurance_number` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `patients`
--

INSERT INTO `patients` (`id`, `patient_code`, `full_name`, `date_of_birth`, `gender`, `phone`, `address`, `id_number`, `insurance_number`, `created_at`, `updated_at`) VALUES
(1, 'BN-20260328-0001', 'Phùng Minh Khoa', '2000-12-01', 'male', '1234567890', NULL, NULL, NULL, '2026-03-28 04:01:31', '2026-03-28 04:01:31');

-- --------------------------------------------------------

--
-- Table structure for table `patient_notes`
--

CREATE TABLE `patient_notes` (
  `id` int NOT NULL,
  `patient_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `user_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `id` int NOT NULL,
  `room_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `department_id` int NOT NULL,
  `room_type` enum('normal','vip','icu','isolation') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'normal',
  `max_beds` int NOT NULL DEFAULT '4',
  `status` enum('active','maintenance','closed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `floor` int DEFAULT '1',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`id`, `room_code`, `name`, `department_id`, `room_type`, `max_beds`, `status`, `floor`, `notes`, `created_at`, `updated_at`) VALUES
(1, 'P101', 'Phòng 101', 1, 'normal', 6, 'active', 1, NULL, '2026-03-26 06:15:12', '2026-03-26 06:15:12'),
(2, 'P102', 'Phòng 102', 1, 'normal', 4, 'active', 1, NULL, '2026-03-26 06:15:12', '2026-03-26 06:15:12'),
(3, 'P201', 'Phòng 201', 2, 'normal', 6, 'active', 2, NULL, '2026-03-26 06:15:12', '2026-03-26 06:15:12'),
(4, 'P202', 'Phòng 202 VIP', 2, 'vip', 2, 'active', 2, NULL, '2026-03-26 06:15:12', '2026-03-26 06:15:12'),
(5, 'P301', 'Phòng 301', 3, 'normal', 4, 'active', 3, NULL, '2026-03-26 06:15:12', '2026-03-26 06:15:12'),
(6, 'P302', 'Phòng 302', 3, 'normal', 6, 'active', 3, NULL, '2026-03-26 06:15:12', '2026-03-26 06:15:12'),
(7, 'P401', 'Phòng 401 ICU', 4, 'icu', 4, 'active', 4, NULL, '2026-03-26 06:15:12', '2026-03-26 06:15:12'),
(8, 'P402', 'Phòng 402', 4, 'normal', 6, 'active', 4, NULL, '2026-03-26 06:15:12', '2026-03-26 06:15:12'),
(9, 'P501', 'Phòng 501', 5, 'normal', 4, 'active', 5, NULL, '2026-03-26 06:15:12', '2026-03-26 06:15:12'),
(10, 'P502', 'Phòng 502 Cách ly', 5, 'isolation', 2, 'active', 5, NULL, '2026-03-26 06:15:12', '2026-03-26 06:15:12'),
(11, 'P103', 'Phòng 103', 1, 'normal', 4, 'maintenance', 1, NULL, '2026-03-26 06:15:12', '2026-03-26 06:15:12'),
(12, 'P303', 'Phòng 303', 3, 'normal', 6, 'closed', 3, NULL, '2026-03-26 06:15:12', '2026-03-26 06:15:12');

-- --------------------------------------------------------

--
-- Table structure for table `system_config`
--

CREATE TABLE `system_config` (
  `id` int NOT NULL,
  `config_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `config_value` text COLLATE utf8mb4_unicode_ci,
  `description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_config`
--

INSERT INTO `system_config` (`id`, `config_key`, `config_value`, `description`, `updated_at`) VALUES
(1, 'warning_threshold', '1', 'So giuong con lai de canh bao phong sap day', '2026-03-24 23:40:27'),
(2, 'default_checklist_enabled', 'true', 'Bat checklist ho so ra vien mac dinh', '2026-03-24 23:40:27'),
(3, 'session_timeout_minutes', '480', 'Thoi gian het han phien dang nhap (phut)', '2026-03-24 23:40:27');

-- --------------------------------------------------------

--
-- Table structure for table `tenants`
--

CREATE TABLE `tenants` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subdomain` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `plan` enum('basic','pro','enterprise') COLLATE utf8mb4_unicode_ci DEFAULT 'basic',
  `is_active` tinyint(1) DEFAULT '1',
  `max_users` int DEFAULT '50',
  `max_departments` int DEFAULT '10',
  `settings` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tenants`
--

INSERT INTO `tenants` (`id`, `name`, `code`, `subdomain`, `plan`, `is_active`, `max_users`, `max_departments`, `settings`, `created_at`, `updated_at`) VALUES
(1, 'Benh vien Da khoa', 'BVDK', 'default', 'basic', 1, 50, 10, NULL, '2026-03-24 23:40:27', '2026-03-24 23:40:27');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','doctor','nurse','records_staff','receptionist') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'nurse',
  `department_id` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `role`, `department_id`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'admin@medboard.vn', '$2a$10$ntFuBFd7bH.XunYFpCVY.uaXB.ePjXYWOB9IwARREuImpd4g/36Tq', 'Admin MedBoard', 'admin', NULL, 1, '2026-03-24 14:21:10', '2026-03-24 14:21:10'),
(2, 'bacsi@medboard.vn', '$2a$10$HJD7IQ4VoXrLidv9M/x3Aev9eSpQzDvl23vW7pL5L6FgseNmre7oS', 'BS. Nguyễn Văn A', 'doctor', NULL, 1, '2026-03-24 14:21:10', '2026-03-24 14:21:10'),
(3, 'dieuduong@medboard.vn', '$2a$10$RB7277Gr7PnQZq5112sVx.ycuP1KDnoBGmJc9JnCskbF4iScGdAQu', 'ĐD. Trần Thị B', 'nurse', NULL, 1, '2026-03-24 14:21:10', '2026-03-24 14:21:10'),
(4, 'hoso@medboard.vn', '$2a$10$1oZYizlTYqehYjzzhm1FQOH81L3Z3fHmdvX.Q1ym4Qf4ly5EUlgU2', 'NV. Lê Văn C', 'records_staff', NULL, 1, '2026-03-24 14:21:10', '2026-03-24 14:21:10');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admissions`
--
ALTER TABLE `admissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `admission_code` (`admission_code`),
  ADD KEY `idx_admission_code` (`admission_code`),
  ADD KEY `idx_admission_patient` (`patient_id`),
  ADD KEY `idx_admission_status` (`status`),
  ADD KEY `idx_admission_bed` (`bed_id`),
  ADD KEY `idx_admission_discharge` (`expected_discharge`);

--
-- Indexes for table `admission_bed_history`
--
ALTER TABLE `admission_bed_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `performed_by` (`performed_by`),
  ADD KEY `idx_abh_admission` (`admission_id`),
  ADD KEY `idx_abh_bed` (`bed_id`),
  ADD KEY `idx_abh_created` (`created_at`);

--
-- Indexes for table `admission_checklists`
--
ALTER TABLE `admission_checklists`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_admission_checklist` (`admission_id`,`checklist_template_id`),
  ADD KEY `checklist_template_id` (`checklist_template_id`),
  ADD KEY `completed_by` (`completed_by`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_audit_user` (`user_id`),
  ADD KEY `idx_audit_entity` (`entity_type`,`entity_id`),
  ADD KEY `idx_audit_created` (`created_at`);

--
-- Indexes for table `beds`
--
ALTER TABLE `beds`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `bed_code` (`bed_code`),
  ADD KEY `idx_bed_code` (`bed_code`),
  ADD KEY `idx_bed_room` (`room_id`),
  ADD KEY `idx_bed_status` (`status`);

--
-- Indexes for table `checklist_templates`
--
ALTER TABLE `checklist_templates`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_dept_code` (`code`),
  ADD KEY `idx_dept_active` (`is_active`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_notif_user` (`target_user_id`),
  ADD KEY `idx_notif_read` (`is_read`),
  ADD KEY `idx_notif_created` (`created_at`);

--
-- Indexes for table `push_subscriptions`
--
ALTER TABLE `push_subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_endpoint` (`endpoint`(255)),
  ADD KEY `idx_push_user` (`user_id`);

--
-- Indexes for table `patients`
--
ALTER TABLE `patients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `patient_code` (`patient_code`),
  ADD KEY `idx_patient_code` (`patient_code`),
  ADD KEY `idx_patient_name` (`full_name`);

--
-- Indexes for table `patient_notes`
--
ALTER TABLE `patient_notes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_notes_patient` (`patient_id`),
  ADD KEY `idx_notes_created` (`created_at`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `room_code` (`room_code`),
  ADD KEY `idx_room_code` (`room_code`),
  ADD KEY `idx_room_dept` (`department_id`),
  ADD KEY `idx_room_status` (`status`);

--
-- Indexes for table `system_config`
--
ALTER TABLE `system_config`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `config_key` (`config_key`);

--
-- Indexes for table `tenants`
--
ALTER TABLE `tenants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD UNIQUE KEY `subdomain` (`subdomain`),
  ADD KEY `idx_tenant_code` (`code`),
  ADD KEY `idx_tenant_subdomain` (`subdomain`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_email` (`email`),
  ADD KEY `idx_users_role` (`role`),
  ADD KEY `idx_users_is_active` (`is_active`),
  ADD KEY `fk_users_dept` (`department_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admissions`
--
ALTER TABLE `admissions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `admission_bed_history`
--
ALTER TABLE `admission_bed_history`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `admission_checklists`
--
ALTER TABLE `admission_checklists`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `beds`
--
ALTER TABLE `beds`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `checklist_templates`
--
ALTER TABLE `checklist_templates`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `push_subscriptions`
--
ALTER TABLE `push_subscriptions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `patients`
--
ALTER TABLE `patients`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `patient_notes`
--
ALTER TABLE `patient_notes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `system_config`
--
ALTER TABLE `system_config`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tenants`
--
ALTER TABLE `tenants`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admissions`
--
ALTER TABLE `admissions`
  ADD CONSTRAINT `admissions_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `admissions_ibfk_2` FOREIGN KEY (`bed_id`) REFERENCES `beds` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `admission_bed_history`
--
ALTER TABLE `admission_bed_history`
  ADD CONSTRAINT `admission_bed_history_ibfk_1` FOREIGN KEY (`admission_id`) REFERENCES `admissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `admission_bed_history_ibfk_2` FOREIGN KEY (`bed_id`) REFERENCES `beds` (`id`),
  ADD CONSTRAINT `admission_bed_history_ibfk_3` FOREIGN KEY (`performed_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `admission_checklists`
--
ALTER TABLE `admission_checklists`
  ADD CONSTRAINT `admission_checklists_ibfk_1` FOREIGN KEY (`admission_id`) REFERENCES `admissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `admission_checklists_ibfk_2` FOREIGN KEY (`checklist_template_id`) REFERENCES `checklist_templates` (`id`),
  ADD CONSTRAINT `admission_checklists_ibfk_3` FOREIGN KEY (`completed_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `beds`
--
ALTER TABLE `beds`
  ADD CONSTRAINT `beds_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`);

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`target_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `push_subscriptions`
--
ALTER TABLE `push_subscriptions`
  ADD CONSTRAINT `push_subscriptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `patient_notes`
--
ALTER TABLE `patient_notes`
  ADD CONSTRAINT `patient_notes_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `patient_notes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `rooms`
--
ALTER TABLE `rooms`
  ADD CONSTRAINT `rooms_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_dept` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
