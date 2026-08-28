-- Partners Table Migration
-- Run this script to reset or update the partners table with correct IDs and schema

DROP TABLE IF EXISTS partners;

CREATE TABLE partners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(255) DEFAULT 'General',
  location VARCHAR(255) DEFAULT 'N/A',
  contact_name VARCHAR(255) DEFAULT 'N/A',
  contact_email VARCHAR(255) NOT NULL,
  status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
  description TEXT DEFAULT NULL,
  joined_date DATE DEFAULT (CURRENT_DATE),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO partners (id, name, industry, location, contact_name, contact_email, status, description, joined_date) VALUES
(1, 'Othieno Innocent', 'School / Education', 'Kampala', '0706920866', 'othienoinnocent21@gmail.com', 'ACTIVE', 'Empowering institutions with tailored software solutions and digital infrastructure management across Uganda.', '2026-08-08'),
(2, 'Global Tech Solutions', 'Software Integration', 'Nairobi', 'Sarah Jenkins', 'contact@globaltech.com', 'ACTIVE', 'Leading provider of enterprise cloud migration, IT strategy, and custom web architecture.', '2026-05-15'),
(3, 'African Retail Group', 'Retail & Logistics', 'Kigali', 'David Mugisha', 'info@africanretail.rw', 'ACTIVE', 'Transforming modern supply chains and point-of-sale integration for regional retail ecosystems.', '2026-07-01');
