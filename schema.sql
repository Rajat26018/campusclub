-- ============================================================================
-- Campusclub Database Schema & Initial Data
-- Database: campushub
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `campushub`;
USE `campushub`;

SET FOREIGN_KEY_CHECKS = 0;

-- Table: clubs
CREATE TABLE IF NOT EXISTS `clubs` (
  `club_id` int NOT NULL AUTO_INCREMENT,
  `club_name` varchar(100) NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `description` text,
  `faculty_coordinator` varchar(100) DEFAULT NULL,
  `founded_year` year DEFAULT NULL,
  PRIMARY KEY (`club_id`),
  UNIQUE KEY `club_name` (`club_name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `clubs` (`club_id`, `club_name`, `category`, `description`, `faculty_coordinator`, `founded_year`) VALUES
(1, 'Coding Club', 'Technical', 'Weekly coding practice and hackathons', 'Dr. Ramesh', 2018),
(2, 'Cultural Club', 'Cultural', 'Dance, music and fest events', 'Mrs. Anitha', 2015),
(3, 'Sports Club', 'Sports', 'Inter-college tournaments and fitness', 'Mr. Kumar', 2012),
(4, 'Gravity SJCE', 'Cultural', '', 'Divya sharma of EC department', 2026),
(5, 'chess club', 'Sports', '[icon:♟️]', 'Pavan kumar', 2025);

-- Table: members
CREATE TABLE IF NOT EXISTS `members` (
  `member_id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `usn` varchar(20) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `course` varchar(30) DEFAULT NULL,
  `semester` int DEFAULT NULL,
  PRIMARY KEY (`member_id`),
  UNIQUE KEY `usn` (`usn`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `members` (`member_id`, `full_name`, `usn`, `email`, `phone`, `course`, `semester`) VALUES
(1, 'Rajat', '01JST25PCA005', 'rajat@example.com', '9876543210', 'BCA', 5),
(2, 'Ananya S', '01JST25PCA010', 'ananya@example.com', '9876500001', 'BCA', 5),
(3, 'Kiran M', '01JST25PCA021', 'kiran@example.com', '9876500002', 'BCA', 3),
(4, 'Vaibhavi', '1RVCS321', 'vaibhavishetti82@gmail.com', '9901980002', 'cse', 6),
(5, 'Rahul sharma', '01JST25PCA011', 'rahul@gmail.com', '4201980002', 'MCA', 2),
(6, 'Sunil kumar', '01JST25PCA234', 'sunil@gmail.com', '4201980002', 'CsE', 4);

-- Table: memberships
CREATE TABLE IF NOT EXISTS `memberships` (
  `membership_id` int NOT NULL AUTO_INCREMENT,
  `member_id` int NOT NULL,
  `club_id` int NOT NULL,
  `role` varchar(30) DEFAULT 'Member',
  `joined_on` date DEFAULT NULL,
  PRIMARY KEY (`membership_id`),
  UNIQUE KEY `member_id` (`member_id`,`club_id`),
  KEY `club_id` (`club_id`),
  CONSTRAINT `memberships_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE,
  CONSTRAINT `memberships_ibfk_2` FOREIGN KEY (`club_id`) REFERENCES `clubs` (`club_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `memberships` (`membership_id`, `member_id`, `club_id`, `role`, `joined_on`) VALUES
(1, 1, 1, 'President', '2025-07-31 18:30:00'),
(2, 2, 1, 'Member', '2025-08-04 18:30:00'),
(3, 2, 2, 'Secretary', '2025-08-09 18:30:00'),
(4, 3, 3, 'Member', '2025-08-31 18:30:00'),
(5, 4, 2, 'President', '2026-11-02 18:30:00'),
(6, 3, 4, 'Media & PR Lead', '2026-09-02 18:30:00'),
(7, 1, 5, 'Vice President', '2026-11-03 18:30:00'),
(8, 5, 2, 'Member', '2026-09-08 18:30:00');

-- Table: events
CREATE TABLE IF NOT EXISTS `events` (
  `event_id` int NOT NULL AUTO_INCREMENT,
  `club_id` int NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text,
  `event_date` date DEFAULT NULL,
  `venue` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`event_id`),
  KEY `club_id` (`club_id`),
  CONSTRAINT `events_ibfk_1` FOREIGN KEY (`club_id`) REFERENCES `clubs` (`club_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `events` (`event_id`, `club_id`, `title`, `description`, `event_date`, `venue`) VALUES
(1, 1, 'Hackathon 2026', '24-hour coding contest', '2026-12-09 18:30:00', 'Seminar Hall'),
(2, 2, 'Annual Fest', 'Cultural programs', '2026-12-19 18:30:00', 'Main Auditorium'),
(3, 3, 'Cricket Tournament', 'Inter-department matches', '2026-12-04 18:30:00', 'College Ground'),
(4, 1, 'hack ai thon', 'hackthon for students', '2026-11-29 18:30:00', 'A block'),
(5, 4, 'Solo Dance event', 'Show your steps and talent , get a chance to shine on stage', '2026-12-03 18:30:00', 'golden jubilee'),
(6, 5, 'chess evenet', '', '2025-11-04 18:30:00', 'block c');

-- Table: registrations
CREATE TABLE IF NOT EXISTS `registrations` (
  `registration_id` int NOT NULL AUTO_INCREMENT,
  `event_id` int NOT NULL,
  `member_id` int NOT NULL,
  `registered_on` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`registration_id`),
  UNIQUE KEY `event_id` (`event_id`,`member_id`),
  KEY `member_id` (`member_id`),
  CONSTRAINT `registrations_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`event_id`) ON DELETE CASCADE,
  CONSTRAINT `registrations_ibfk_2` FOREIGN KEY (`member_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `registrations` (`registration_id`, `event_id`, `member_id`, `registered_on`) VALUES
(1, 1, 1, '2026-11-03 13:37:06'),
(2, 1, 2, '2026-11-03 13:37:06'),
(3, 2, 2, '2026-11-03 13:37:06'),
(4, 3, 3, '2026-11-03 13:37:06');

SET FOREIGN_KEY_CHECKS = 1;
