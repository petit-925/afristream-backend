-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 27, 2025 at 12:16 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `afristream_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `addresses`
--

CREATE TABLE `addresses` (
  `id` int(11) NOT NULL,
  `client_user_id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `street` varchar(255) NOT NULL,
  `city` varchar(100) NOT NULL,
  `region` varchar(100) NOT NULL,
  `zip_code` varchar(20) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `is_default` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `addresses`
--

INSERT INTO `addresses` (`id`, `client_user_id`, `full_name`, `street`, `city`, `region`, `zip_code`, `phone`, `is_default`, `created_at`, `updated_at`) VALUES
(1, 6, 'Adu ', 'koforidua', 'Accra', 'Greater Accra', 'GA-001', '+233 (243) 495-616', 1, '2025-10-29 11:54:26', '2025-10-29 11:54:26');

-- --------------------------------------------------------

--
-- Table structure for table `admin_users`
--

CREATE TABLE `admin_users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','editor','contributor') DEFAULT 'admin',
  `status` enum('active','inactive','pending','suspended') DEFAULT 'active',
  `phone` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `two_factor_enabled` tinyint(1) DEFAULT 0,
  `company` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `experience` varchar(255) DEFAULT NULL,
  `specialties` varchar(255) DEFAULT NULL,
  `skills` text DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_users`
--

INSERT INTO `admin_users` (`id`, `name`, `email`, `password`, `role`, `status`, `phone`, `address`, `avatar_url`, `two_factor_enabled`, `company`, `location`, `bio`, `website`, `experience`, `specialties`, `skills`, `last_login`, `created_at`, `updated_at`) VALUES
(6, 'Adu ', 'afristream@gmail.com', '$2a$12$OWBY.Ovfly7JIaaKP7yVMufYIOE8vumZGUP/H6pEtQSl/vcNH98du', 'admin', 'active', '+233 (243) 495-616', NULL, '/uploads/1758757449700-63a1b915.jpg', 0, 'Afristream', 'koforidua', '', 'https://afristream.com', '8+ years', 'Brand Identity, Digital Design, Creative Direction', 'Logo Design, Web Design, Brand Identity, UI/UX Design, Print Design, Illustration', '2025-11-21 13:39:18', '2025-08-23 19:17:44', '2025-11-21 13:39:18');

-- --------------------------------------------------------

--
-- Table structure for table `blog_posts`
--

CREATE TABLE `blog_posts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `slug` varchar(100) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `slug`, `parent_id`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Templates', 'Website and application templates', 'templates', NULL, 0, 1, '2025-09-15 12:32:19', '2025-09-15 12:32:19'),
(2, 'Graphics', 'Graphic design assets and resources', 'graphics', NULL, 0, 1, '2025-09-15 12:32:19', '2025-09-15 12:32:19'),
(3, 'Branding', 'Brand identity and logo design', 'branding', NULL, 0, 1, '2025-09-15 12:32:19', '2025-09-15 12:32:19'),
(4, 'Web Development', 'Web development services and tools', 'web-development', NULL, 0, 1, '2025-09-15 12:32:19', '2025-09-15 12:32:19'),
(5, 'Mobile Apps', 'Mobile application development', 'mobile-apps', NULL, 0, 1, '2025-09-15 12:32:19', '2025-09-15 12:32:19'),
(6, 'Digital Marketing', 'Digital marketing services and tools', 'digital-marketing', NULL, 0, 1, '2025-09-15 12:32:19', '2025-09-15 12:32:19');

-- --------------------------------------------------------

--
-- Table structure for table `client_users`
--

CREATE TABLE `client_users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `two_factor_enabled` tinyint(1) DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `downloads`
--

CREATE TABLE `downloads` (
  `id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `download_count` int(11) DEFAULT 0,
  `upload_date` datetime DEFAULT current_timestamp(),
  `last_download` datetime DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `status` enum('active','expired') DEFAULT 'active',
  `download_limit` int(11) DEFAULT NULL,
  `expiry_date` datetime DEFAULT NULL,
  `thumbnail_url` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `sender_id` int(11) DEFAULT NULL,
  `recipient_id` int(11) DEFAULT NULL,
  `content` text NOT NULL,
  `status` enum('unread','read','archived') DEFAULT 'unread',
  `subject` varchar(255) NOT NULL,
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `is_starred` tinyint(1) DEFAULT 0,
  `has_attachment` tinyint(1) DEFAULT 0,
  `attachment_url` varchar(255) DEFAULT NULL,
  `project_id` varchar(255) DEFAULT NULL,
  `read_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(11) NOT NULL,
  `version` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `executed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `version`, `name`, `executed_at`) VALUES
(1, 1, 'Create optimized schema', '2025-09-15 19:25:12'),
(2, 2, 'Create optimized categories table', '2025-09-15 19:32:19'),
(3, 3, 'Create optimized products table', '2025-09-15 19:32:20'),
(4, 4, 'Normalize portfolio URLs', '2025-09-19 21:51:12');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` enum('Pending','Shipped','Delivered','Cancelled') DEFAULT 'Pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `shipping_address` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `selected_size` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `portfolio`
--

CREATE TABLE `portfolio` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `category` varchar(255) NOT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `media_type` enum('image','video') NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `user_id` int(11) NOT NULL,
  `media_u_r_l` varchar(255) NOT NULL,
  `client` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `overview` text DEFAULT NULL,
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`features`)),
  `testimonial` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`testimonial`)),
  `gallery` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`gallery`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `portfolio`
--

INSERT INTO `portfolio` (`id`, `title`, `description`, `category`, `tags`, `media_type`, `created_at`, `updated_at`, `user_id`, `media_u_r_l`, `client`, `location`, `date`, `overview`, `features`, `testimonial`, `gallery`) VALUES
(23, 'iui', 'dfg', 'print-design', '[\"dfg\"]', 'image', '2025-09-19 11:10:01', '2025-09-24 20:09:53', 6, 'http://localhost:5000/uploads/1758305401123.webp', 'df', 'dfg', '2025-09-03 00:00:00', 'dfg', '[\"dfg\"]', '{\"quote\":\"dfg\",\"author\":\"dfg\",\"company\":\"\"}', '[\"http://localhost:5000/uploads/1758305401123.webp\",\"http://localhost:5000/uploads/1758305401135.webp\",\"http://localhost:5000/uploads/1758305401144.webp\"]'),
(24, 'mnmn', 'bnm', 'videos-pictures', '[\"bnm\"]', 'image', '2025-09-24 10:19:38', '2025-09-26 14:02:58', 6, 'http://localhost:5000/uploads/1758734378457-68b0b435.webp', 'bnm', 'bnm', '2025-09-11 00:00:00', 'bnm', '[\"bnm\"]', '{\"quote\":\"bnm\",\"author\":\"bnm\",\"company\":\"bnm\"}', '[\"http://localhost:5000/uploads/1758734378457-68b0b435.webp\",\"http://localhost:5000/uploads/1758920548387-08668b0f.webp\",\"http://localhost:5000/uploads/1758920548411-8b6a8926.webp\"]'),
(26, 'ghjg', 'ghjghjsdhfkjbnbcvhcksjhkhjkhadsjkhajhsdhkj\nasdhkjashdkjhajhsdjhkjhahsdla;khkljhds\ndhjfjkshkjdhfjkhsjkdhfkjhsdfsdfsdfscxbvcv', 'branding', '[\"ghj\"]', 'image', '2025-09-24 17:45:51', '2025-10-04 13:51:57', 6, 'http://localhost:5000/uploads/1758761151197-428ebb57.webp', 'hj', 'ghj', '2025-09-02 00:00:00', 'ghjg', '[\"hj\"]', '{\"quote\":\"ghj\",\"author\":\"ghjg\",\"company\":\"jghj\"}', '[\"http://localhost:5000/uploads/1758761151197-428ebb57.webp\",\"http://localhost:5000/uploads/1758761151197-9a964182.webp\"]'),
(27, 'rt', 'rtyrtyrty', 'graphic-design', '[\"rtyrty\"]', 'image', '2025-09-25 09:40:21', '2025-09-25 09:40:21', 6, 'http://localhost:5000/api/v1/uploads/1758818421470-e274e5d4.webp', 'tyrty', 'rtyr', '2025-09-03 00:00:00', 'rtyrtyrt', '[\"rtyry\"]', '{\"quote\":\"rtyrt\",\"author\":\"yrty\",\"company\":\"rtyrty\"}', '[\"http://localhost:5000/api/v1/uploads/1758818421470-e274e5d4.webp\",\"http://localhost:5000/api/v1/uploads/1758818421472-8cf83d47.webp\"]');

-- --------------------------------------------------------

--
-- Table structure for table `product`
--

CREATE TABLE `product` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` float NOT NULL,
  `original_price` decimal(12,2) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `category` varchar(255) DEFAULT NULL,
  `gallery` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`gallery`)),
  `frame_options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`frame_options`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product`
--

INSERT INTO `product` (`id`, `name`, `description`, `price`, `original_price`, `image_url`, `created_at`, `updated_at`, `category`, `gallery`, `frame_options`) VALUES
(29, 'oiiop', 'hjkhjk', 678, NULL, 'http://localhost:5000/uploads/1758761110655-680a8b41.webp', '2025-09-24 17:45:10', '2025-09-26 15:57:41', 'templates', '[\"http://localhost:5000/uploads/1758927459670-7b7e8ddb.webp\",\"http://localhost:5000/uploads/1758927459676-b0f3d4b3.webp\",\"http://localhost:5000/uploads/1758927459680-6de02fc4.webp\"]', NULL),
(30, 'yui', 'hjkhjkhjk', 76, NULL, 'http://localhost:5000/uploads/1758823599067-0cbb16ad.webp', '2025-09-25 11:06:39', '2025-09-25 11:06:39', 'picture-frames', '[\"http://localhost:5000/uploads/1758823599067-0cbb16ad.webp\",\"http://localhost:5000/uploads/1758823599068-285128f0.webp\"]', NULL),
(32, 'ytut', 'vbnvbn', 546, NULL, 'http://localhost:5000/uploads/1758905246315-2b0cfe50.png', '2025-09-26 09:47:26', '2025-09-26 10:17:01', 'templates', '[\"http://localhost:5000/uploads/1758905246315-2b0cfe50.png\",\"http://localhost:5000/uploads/1758905246329-25529ebf.webp\",\"http://localhost:5000/uploads/1758905246337-eca8f2ac.webp\",\"http://localhost:5000/uploads/1758907021437-685c3c9b.webp\"]', NULL),
(33, 'rty', 'hgjdghj', 78, NULL, 'http://localhost:5000/uploads/1759170459787-5e4ecd31.webp', '2025-09-29 11:27:39', '2025-09-29 11:27:39', 'templates', '[\"http://localhost:5000/uploads/1759170459787-5e4ecd31.webp\",\"http://localhost:5000/uploads/1759170459789-65812ca0.webp\",\"http://localhost:5000/uploads/1759170459792-0740a6cc.webp\"]', NULL),
(34, 'xcvb', 'xzcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccxzcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccxzccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc', 45, NULL, 'http://localhost:5000/uploads/1759469469542-551b6c64.webp', '2025-10-02 22:31:09', '2025-10-02 22:31:09', 'web-design', '[\"http://localhost:5000/uploads/1759469469542-551b6c64.webp\",\"http://localhost:5000/uploads/1759469469544-ebf29e8f.webp\",\"http://localhost:5000/uploads/1759469469547-dcb49d8e.webp\"]', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `refresh_tokens`
--

CREATE TABLE `refresh_tokens` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `is_client` tinyint(1) NOT NULL DEFAULT 0,
  `token` varchar(512) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `refresh_tokens`
--

INSERT INTO `refresh_tokens` (`id`, `user_id`, `is_client`, `token`, `created_at`) VALUES
(1, 6, 0, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjYsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzYxNzY3NDkyLCJleHAiOjE3NjIzNzIyOTJ9.GLVVJXKhdKJICUEkrLZGlkyBmUAgNvCrJArV6Gr42sQ', '2025-10-29 12:51:32'),
(2, 6, 0, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjYsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzYyMjAzNTQwLCJleHAiOjE3NjI4MDgzNDB9.zQTSX-AmQoEV-a9HEuAp5AP5t9uZ5PT28nnRdDC0IFE', '2025-11-03 12:59:00'),
(3, 6, 0, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjYsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzYyNDU5MzA0LCJleHAiOjE3NjMwNjQxMDR9.LZ_ZueQJMo3uriysctYk640Wt7JMHwHmTYmSDIeT4j0', '2025-11-06 12:01:44'),
(4, 6, 0, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjYsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzYyNDYxNTYxLCJleHAiOjE3NjMwNjYzNjF9.E2M_eLmymBahpJIDtCQxTuZUIQB4PHZ4G9r6HUYmRQM', '2025-11-06 12:39:21'),
(5, 6, 0, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjYsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzYyNDY1ODA0LCJleHAiOjE3NjMwNzA2MDR9.Wm0BiKrFbEWxXSmgVthFZNSSYtWAo6JCWS0KJLJ9EUM', '2025-11-06 13:50:04'),
(6, 6, 0, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjYsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzYyNDY2MTgzLCJleHAiOjE3NjMwNzA5ODN9.Qkl5qj2Ye1WM_MgfrSfzhK56sUkKq8BcaL2rCo_YbnA', '2025-11-06 13:56:23'),
(7, 6, 0, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjYsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzYyNDc5ODU5LCJleHAiOjE3NjMwODQ2NTl9.buH7ShdyBG6MIOa_YzaFJslegP0I5mRNZ-GzNu9EPPg', '2025-11-06 17:44:19'),
(8, 6, 0, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjYsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzYyNTQyNzg3LCJleHAiOjE3NjMxNDc1ODd9.rRdphxhUbZ0Q31VnQh20aSHQMMDLBXwHdTH-9TBP6Y0', '2025-11-07 11:13:07'),
(9, 7, 0, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjcsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzYyNTUzODIzLCJleHAiOjE3NjMxNTg2MjN9.ZbnjnIaRoBeMwCWBSFdcCR1-8Xchdlv87Nsriay5DYw', '2025-11-07 14:17:03'),
(10, 6, 0, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjYsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzYyNjI5NDM5LCJleHAiOjE3NjMyMzQyMzl9.lQzVWLQssq4M5c6XY9AViA5I2hmQBl5sTevakW89scI', '2025-11-08 11:17:19'),
(11, 6, 0, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjYsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzYyODgwODM5LCJleHAiOjE3NjM0ODU2Mzl9.QYzBS9kk_qEHQrOkEVIjYCZkyxk6aqQ-lZxT9vcl-8M', '2025-11-11 10:45:02'),
(12, 6, 0, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjYsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzYyODg2NzE5LCJleHAiOjE3NjM0OTE1MTl9.l77_K3qFFPbl3_rhC7y8xTIOMpM8miSGpgaomj2GzlA', '2025-11-11 10:45:19'),
(13, 6, 0, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjYsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzYyODg5Mjc3LCJleHAiOjE3NjM0OTQwNzd9.RNDZQM3Bh5oR9fDEX2huXstEhi8Tl7H0HPNR5MgYPsA', '2025-11-11 11:27:57'),
(14, 6, 0, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjYsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzYzNDA5MTgwLCJleHAiOjE3NjQwMTM5ODB9.tXsFNP4cUETWHu53l9RVPgIYYorkfiHOnPRqLuWD620', '2025-11-17 11:53:00'),
(15, 6, 0, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjYsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzYzNzUzNzIzLCJleHAiOjE3NjQzNTg1MjN9.VXeympTQ_qEE_wEuJ3GVAr96X-SFLmPe4Jj7r_klXeE', '2025-11-21 11:35:23'),
(16, 6, 0, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjYsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzYzNzYxMTU4LCJleHAiOjE3NjQzNjU5NTh9.Mxbri7F0ud7-VFDvP3I0T31Tgx-50MrDDElK_0o-HJ4', '2025-11-21 13:39:18');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `device` varchar(255) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `last_active` datetime DEFAULT current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `support_tickets`
--

CREATE TABLE `support_tickets` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `status` enum('Open','In Progress','Closed') DEFAULT 'Open',
  `priority` enum('Low','Medium','High','Urgent') DEFAULT 'Medium',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `support_tickets`
--

INSERT INTO `support_tickets` (`id`, `user_id`, `subject`, `message`, `status`, `priority`, `created_at`, `updated_at`) VALUES
(3, 6, 'Order Issue', 'My order was not delivered on time', 'Open', 'Medium', '2025-10-29 11:56:19', '2025-10-29 11:56:19'),
(4, 6, 'Order Issue', 'My order was not delivered on time', 'Open', 'Medium', '2025-10-29 11:56:45', '2025-10-29 11:56:45');

-- --------------------------------------------------------

--
-- Table structure for table `testimonial`
--

CREATE TABLE `testimonial` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `company` varchar(255) DEFAULT NULL,
  `content` text NOT NULL,
  `rating` int(11) DEFAULT 0,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `featured` tinyint(1) DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `wishlist`
--

CREATE TABLE `wishlist` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`client_user_id`),
  ADD KEY `idx_is_default` (`is_default`);

--
-- Indexes for table `admin_users`
--
ALTER TABLE `admin_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_admin_email` (`email`),
  ADD KEY `idx_admin_role` (`role`),
  ADD KEY `idx_admin_status` (`status`);

--
-- Indexes for table `blog_posts`
--
ALTER TABLE `blog_posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `client_users`
--
ALTER TABLE `client_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_client_email` (`email`);

--
-- Indexes for table `downloads`
--
ALTER TABLE `downloads`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `recipient_id` (`recipient_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `version` (`version`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_orders_user_status` (`user_id`,`status`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order_items_order_product` (`order_id`,`product_id`);

--
-- Indexes for table `portfolio`
--
ALTER TABLE `portfolio`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_portfolio_user_id` (`user_id`);

--
-- Indexes for table `product`
--
ALTER TABLE `product`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_token` (`token`),
  ADD KEY `idx_user_isclient` (`user_id`,`is_client`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_is_active` (`is_active`),
  ADD KEY `idx_last_active` (`last_active`),
  ADD KEY `idx_sessions_user_active` (`user_id`,`is_active`);

--
-- Indexes for table `support_tickets`
--
ALTER TABLE `support_tickets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_priority` (`priority`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_support_tickets_user_status` (`user_id`,`status`);

--
-- Indexes for table `testimonial`
--
ALTER TABLE `testimonial`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `wishlist`
--
ALTER TABLE `wishlist`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_product` (`user_id`,`product_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_product_id` (`product_id`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_wishlist_user_created` (`user_id`,`created_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `addresses`
--
ALTER TABLE `addresses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `admin_users`
--
ALTER TABLE `admin_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `blog_posts`
--
ALTER TABLE `blog_posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `client_users`
--
ALTER TABLE `client_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `downloads`
--
ALTER TABLE `downloads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `portfolio`
--
ALTER TABLE `portfolio`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `product`
--
ALTER TABLE `product`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `sessions`
--
ALTER TABLE `sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `support_tickets`
--
ALTER TABLE `support_tickets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `testimonial`
--
ALTER TABLE `testimonial`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `wishlist`
--
ALTER TABLE `wishlist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`);

--
-- Constraints for table `wishlist`
--
ALTER TABLE `wishlist`
  ADD CONSTRAINT `fk_wishlist_product_id` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
