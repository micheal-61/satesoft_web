

import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { createRequire } from 'node:module';
import multer from 'multer';
const require = createRequire(import.meta.url);
const Imap = require('imap');
import { simpleParser } from 'mailparser';
import privacyPolicyRoutes from './routes/privacyPolicyRoutes.js';
import serviceAgreementRoutes from './routes/serviceAgreementRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const JWT_SECRET =
  process.env.JWT_SECRET || 'super-secret-key-change-in-production';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || SMTP_USER || 'admin@satesoft.com';

const IMAP_HOST = process.env.IMAP_HOST || 'imap.gmail.com';
const IMAP_PORT = Number(process.env.IMAP_PORT) || 993;
const IMAP_SECURE = process.env.IMAP_SECURE === 'true';
const IMAP_USER = process.env.IMAP_USER || SMTP_USER || '';
const IMAP_PASS = process.env.IMAP_PASS || SMTP_PASS || '';

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '8mb' }));

const uploadsDir = path.join(__dirname, 'public', 'uploads', 'cvs');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const cvStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = 'cv_' + Date.now() + '_' + Math.round(Math.random() * 1e9) + ext;
    cb(null, name);
  },
});

const cvUpload = multer({
  storage: cvStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX allowed.'));
  },
});

// Database Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'satesoft_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 60000,
});

// Helper function to normalize dates
const normalizeDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().split('T')[0];
  return String(value);
};

// Initialize Database
const initializeDatabase = async () => {
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = process.env.DB_PORT || 3306;
  const dbUser = process.env.DB_USER || 'root';
  const dbPassword = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'satesoft_db';

  const retry = async (fn, retries = 5, delay = 2000) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (err) {
        if (i === retries - 1) throw err;
        console.warn(`⚠️ DB connection attempt ${i + 1} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

    let conn;
    try {
      conn = await retry(async () => mysql.createConnection({ host: dbHost, port: dbPort, user: dbUser, password: dbPassword }), 5, 2000);
      try {
        await conn.query('REPAIR TABLE mysql.db EXTENDED');
      } catch (repairErr) {
        console.error('⚠️ mysql.db repair warning:', repairErr.message);
      }
      await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
      await conn.query(`CREATE USER IF NOT EXISTS '${dbUser}'@'localhost' IDENTIFIED BY '${dbPassword}'`);
      await conn.query(`GRANT ALL PRIVILEGES ON \`${dbName}\`.* TO '${dbUser}'@'localhost'`);
      await conn.query('FLUSH PRIVILEGES');
      console.log(`✅ Database "${dbName}" and user "${dbUser}" ready`);
    } catch (err) {
      console.error('❌ DB setup error:', err.message);
    } finally {
      if (conn) await conn.end();
    }

  // Now connect with the app user to create tables
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.query(`USE \`${dbName}\``);

    const initTable = async (name, fn) => {
    try {
      await fn();
      console.log(`✅ Table "${name}" initialized`);
    } catch (err) {
      console.error(`❌ Table "${name}" init error:`, err.message);
    }
  };

  await initTable('project_stats', async () => {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS project_stats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        value VARCHAR(255) NOT NULL,
        description TEXT
      )
    `);
    const [statsRows] = await connection.query('SELECT COUNT(*) as count FROM project_stats');
    if (statsRows[0].count === 0) {
      await connection.query(`
        INSERT INTO project_stats (title, value, description)
        VALUES
        ('Countdown', '186 days', 'Days until completion'),
        ('Completed', '298 days', 'Days already completed'),
        ('Total Days', '478 days', 'Total estimated days')
      `);
    }
  });

  await initTable('admin_users', async () => {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) DEFAULT NULL,
        reset_token VARCHAR(255) DEFAULT NULL,
        reset_token_expiry DATETIME DEFAULT NULL
      )
    `);
    try {
      await connection.query('ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS email VARCHAR(255) DEFAULT NULL');
      await connection.query('ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255) DEFAULT NULL');
      await connection.query('ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS reset_token_expiry DATETIME DEFAULT NULL');
    } catch (e) {
      console.error('Alter table admin_users error:', e.message);
    }
    const [userRows] = await connection.query('SELECT COUNT(*) as count FROM admin_users');
    if (userRows[0].count === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await connection.query(
        'INSERT INTO admin_users (username, password, email) VALUES (?, ?, ?)',
        ['satesoft', hashedPassword, 'admin@satesoft.com']
      );
      console.log('✅ Default admin created (username: satesoft, password: admin123)');
    } else {
      // Ensure existing users have proper bcrypt passwords
      const [users] = await connection.query('SELECT id, username, password FROM admin_users');
      for (const user of users) {
        if (!user.password || !String(user.password).startsWith('$2')) {
          const hashedPassword = await bcrypt.hash('admin123', 10);
          await connection.query('UPDATE admin_users SET password = ? WHERE id = ?', [hashedPassword, user.id]);
          console.log(`✅ Updated password for user "${user.username}" to admin123`);
        }
      }
    }
  });

  // Products Table
  await initTable('product_cards', async () => {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS product_cards (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          subtitle VARCHAR(500) NOT NULL,
          category VARCHAR(255) DEFAULT NULL,
          icon_name VARCHAR(100) NOT NULL DEFAULT 'trending',
          logo_url VARCHAR(1000) DEFAULT NULL,
          description TEXT DEFAULT NULL,
          key_features JSON DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      await connection.query('ALTER TABLE product_cards ADD COLUMN IF NOT EXISTS logo_url VARCHAR(1000) DEFAULT NULL');
      await connection.query('ALTER TABLE product_cards ADD COLUMN IF NOT EXISTS category VARCHAR(255) DEFAULT NULL');
      const [productRows] = await connection.query('SELECT COUNT(*) as count FROM product_cards');
      if (productRows[0].count === 0) {
        await connection.query(`
          INSERT INTO product_cards (title, subtitle, category, icon_name, logo_url, description, key_features)
          VALUES 
            ('Duqact', 'Retail Intelligence for the African Market', 'Retail Intelligence', 'trending', 'https://via.placeholder.com/120?text=Duqact', 'Duqact empowers African retailers with real-time sales intelligence, inventory forecasting, and customer behavior analytics.', '["Real-time sales tracking", "Inventory forecasting", "Customer segmentation"]'),
            ('Karibyshoo', 'Smart Visitor & Event Management', 'Visitor Management', 'user', 'https://via.placeholder.com/120?text=Karibyshoo', 'Karibyshoo streamlines visitor check-ins, event scheduling, and attendee engagement through an intuitive operations platform.', '["Smart check-in system", "Event scheduling", "Attendee engagement"]'),
            ('FoundDocument', 'Intelligent Archiving & Retrieval', 'Document Management', 'document', 'https://via.placeholder.com/120?text=FoundDocument', 'FoundDocument automates document archiving, intelligent retrieval, and compliance management for modern enterprises.', '["Intelligent search", "Automated archiving", "Compliance tracking"]')
        `);
      }
    });

  // Partners Table
  await initTable('partners', async () => {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS partners (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          joined DATE DEFAULT NULL,
          industry VARCHAR(255) DEFAULT NULL,
          location VARCHAR(255) DEFAULT NULL,
          contact_name VARCHAR(255) DEFAULT NULL,
          contact_email VARCHAR(255) DEFAULT NULL,
          status VARCHAR(50) DEFAULT 'ACTIVE',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      const [partnerRows] = await connection.query('SELECT COUNT(*) as count FROM partners');
      if (partnerRows[0].count === 0) {
        await connection.query(`
          INSERT INTO partners (name, joined, industry, location, contact_name, contact_email, status)
          VALUES
            ('Global Tech Solutions', '2025-01-15', 'Information Technology', 'Nairobi, Kenya', 'Jane Doe', 'jane.doe@globaltech.com', 'ACTIVE'),
            ('African Retail Group', '2025-02-10', 'Retail', 'Lagos, Nigeria', 'John Smith', 'john.smith@africanretail.com', 'ACTIVE')
        `);
      }
    });

  // Advisors Table
  await initTable('advisors', async () => {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS advisors (
          id INT AUTO_INCREMENT PRIMARY KEY,
          first_name VARCHAR(255) NOT NULL,
          last_name VARCHAR(255) DEFAULT NULL,
          role_id BIGINT DEFAULT 0,
          advisor_order INT DEFAULT 0,
          is_active BIT(1) DEFAULT 1,
          image_url VARCHAR(500) DEFAULT NULL,
          profile_link VARCHAR(500) DEFAULT NULL,
          bio TEXT DEFAULT NULL,
          email VARCHAR(255) DEFAULT NULL,
          expertise VARCHAR(255) DEFAULT NULL,
          category VARCHAR(100) DEFAULT 'board',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      await connection.query('ALTER TABLE advisors ADD COLUMN IF NOT EXISTS advisor_order INT DEFAULT 0');
      await connection.query('ALTER TABLE advisors ADD COLUMN IF NOT EXISTS image_url VARCHAR(500) DEFAULT NULL');
      await connection.query('ALTER TABLE advisors ADD COLUMN IF NOT EXISTS profile_link VARCHAR(500) DEFAULT NULL');
      await connection.query('ALTER TABLE advisors ADD COLUMN IF NOT EXISTS email VARCHAR(255) DEFAULT NULL');
      await connection.query('ALTER TABLE advisors ADD COLUMN IF NOT EXISTS expertise VARCHAR(255) DEFAULT NULL');
      await connection.query("ALTER TABLE advisors ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'board'");
      await connection.query("ALTER TABLE advisors ADD COLUMN IF NOT EXISTS role_title VARCHAR(255) DEFAULT NULL");
      const [advisorRows] = await connection.query('SELECT COUNT(*) as count FROM advisors');
    });

  // Milestones Table
  await initTable('milestones', async () => {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS milestones (
          id INT AUTO_INCREMENT PRIMARY KEY,
          year VARCHAR(10) NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT DEFAULT NULL,
          color VARCHAR(7) DEFAULT '#72bf24',
          display_order INT DEFAULT 0,
          icon VARCHAR(100) DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      await connection.query('ALTER TABLE milestones ADD COLUMN IF NOT EXISTS icon VARCHAR(100) DEFAULT NULL');
      const [milestoneRows] = await connection.query('SELECT COUNT(*) as count FROM milestones');
      if (milestoneRows[0].count === 0) {
        await connection.query(`
          INSERT INTO milestones (year, title, description, color, display_order, icon) VALUES
          ('1978', 'LIOREM SUMARIS', 'Lorem ipsum dolor sit amet consectetuer odio non tellus natoque accumsan. Sed hae in enim ne remaia teston na vas.', '#72bf24', 0, 'fa-solid fa-lightbulb'),
          ('1983', 'ENE BENELE', 'Lorem ipsum dolor sit amet consectetuer odio non tellus natoque accumsan. Sed hae in enim ne remaia teston na vas.', '#72bf24', 1, 'fa-solid fa-users'),
          ('1996', 'SUNA SIPUM ENI', 'Rumalesuada eleifend ultrices justa Curabitur Maecenas orci. Tincidunt adipiscing elit et at tincidunt elit nulla mauris eleifend.', '#72bf24', 2, 'fa-solid fa-globe'),
          ('2012', 'LAST SICHR SCR', 'Auctor Sed urna dignissim, malesuada eleifend ultrices justo Curabitur Maecenas orci. Tincidunt adipiscing elit et at tincidunt.', '#72bf24', 3, 'fa-solid fa-rocket'),
          ('2021', 'KASTROL NATO', 'Lorem ipsum dolor sit amet consectetuer odio non tellus natoque accumsan. Sed hae in enim ne remaia teston na vas.', '#72bf24', 4, 'fa-solid fa-chart-line')
        `);
      }
    });

  // Milestone Activities Table
  await initTable('milestone_activities', async () => {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS milestone_activities (
          id INT AUTO_INCREMENT PRIMARY KEY,
          milestone_id INT NOT NULL,
          month VARCHAR(50) NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT DEFAULT NULL,
          display_order INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE CASCADE
        )
      `);
    });

    // News Posts Table
    await initTable('news_posts', async () => {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS news_posts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          category VARCHAR(255) DEFAULT NULL,
          author VARCHAR(255) DEFAULT NULL,
          publish_date DATE DEFAULT NULL,
          excerpt TEXT DEFAULT NULL,
          content TEXT DEFAULT NULL,
          views INT DEFAULT 0,
          image_url VARCHAR(500) DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      try {
        await connection.query('ALTER TABLE news_posts ADD COLUMN IF NOT EXISTS content TEXT DEFAULT NULL');
        await connection.query('ALTER TABLE news_posts ADD COLUMN IF NOT EXISTS views INT DEFAULT 0');
        await connection.query('ALTER TABLE news_posts ADD COLUMN IF NOT EXISTS image_url VARCHAR(500) DEFAULT NULL');
      } catch (e) {
        console.error('Alter table news_posts error:', e.message);
      }
      const [newsRows] = await connection.query('SELECT COUNT(*) as count FROM news_posts');
    });

    // Viewed Posts Table
    await initTable('viewed_posts', async () => {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS viewed_posts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          post_id INT NOT NULL,
          ip_address VARCHAR(45) NOT NULL,
          user_agent TEXT,
          viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (post_id) REFERENCES news_posts(id) ON DELETE CASCADE,
          UNIQUE KEY unique_view (post_id, ip_address)
        )
      `);
    });

    // Job Opportunities Table
    await initTable('job_opportunities', async () => {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS job_opportunities (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          location VARCHAR(255) NOT NULL,
          type VARCHAR(100) NOT NULL,
          key_requirements TEXT DEFAULT NULL,
          description TEXT DEFAULT NULL,
          applications INT DEFAULT 0,
          status VARCHAR(50) DEFAULT 'Active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      await connection.query('ALTER TABLE job_opportunities ADD COLUMN IF NOT EXISTS key_requirements TEXT DEFAULT NULL');
      await connection.query('ALTER TABLE job_opportunities ADD COLUMN IF NOT EXISTS description TEXT DEFAULT NULL');
    });

    // Applicants Table
    await initTable('applicants', async () => {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS applicants (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) DEFAULT NULL,
          opportunity VARCHAR(255) NOT NULL,
          sex VARCHAR(50) DEFAULT NULL,
          experience VARCHAR(255) DEFAULT NULL,
          phone VARCHAR(100) DEFAULT NULL,
          location VARCHAR(255) DEFAULT NULL,
          cv_name VARCHAR(500) DEFAULT NULL,
          cv_url VARCHAR(1000) DEFAULT NULL,
          applied_date DATE DEFAULT NULL,
          status VARCHAR(50) DEFAULT 'PENDING',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      const [columns] = await connection.query('SHOW COLUMNS FROM applicants');
      const existingColumns = columns.map(c => c.Field);
      const missingColumns = [
        ['phone', 'VARCHAR(100) DEFAULT NULL'],
        ['location', 'VARCHAR(255) DEFAULT NULL'],
        ['cv_name', 'VARCHAR(500) DEFAULT NULL'],
        ['cv_url', 'VARCHAR(1000) DEFAULT NULL'],
      ].filter(([field]) => !existingColumns.includes(field));
      for (const [field, definition] of missingColumns) {
        await connection.query(`ALTER TABLE applicants ADD COLUMN ${field} ${definition}`);
      }
    });

    // Subscribers Table
    await initTable('subscribers', async () => {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS subscribers (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255) DEFAULT NULL,
          subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
    });

    // Messages Table
    await initTable('messages', async () => {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS messages (
          id INT AUTO_INCREMENT PRIMARY KEY,
          sender_name VARCHAR(255) NOT NULL,
          sender_email VARCHAR(255) NOT NULL,
          recipient_name VARCHAR(255) DEFAULT NULL,
          recipient_email VARCHAR(255) DEFAULT NULL,
          subject VARCHAR(255) NOT NULL,
          body TEXT,
          sent_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          folder VARCHAR(50) DEFAULT 'inbox',
          is_read TINYINT(1) DEFAULT 0,
          is_starred TINYINT(1) DEFAULT 0,
          label VARCHAR(50) DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      try {
        await connection.query("ALTER TABLE messages MODIFY COLUMN folder VARCHAR(50) DEFAULT 'inbox'");
      } catch (e) {
        console.error('Alter table messages folder error:', e.message);
      }
    });

    // Comments Table
    await initTable('comments', async () => {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS comments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          article_id INT NOT NULL,
          author VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          parent_id INT DEFAULT NULL,
          likes INT DEFAULT 0,
          is_approved TINYINT DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (article_id) REFERENCES news_posts(id) ON DELETE CASCADE,
          FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
        )
      `);
    });

    // Service Agreements Table
    await initTable('service_agreements', async () => {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS service_agreements (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          content TEXT DEFAULT NULL,
          is_active TINYINT(1) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      const [isActiveCols] = await connection.query(`SHOW COLUMNS FROM service_agreements LIKE 'is_active'`);
      if (isActiveCols.length === 0) {
        await connection.query(`ALTER TABLE service_agreements ADD COLUMN is_active TINYINT(1) DEFAULT 0 AFTER content`);
      }
    });

    // Service Agreement Sections Table
    await initTable('service_agreement_sections', async () => {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS service_agreement_sections (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          badge VARCHAR(50) DEFAULT '',
          text TEXT,
          sort_order INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      const [titleCols] = await connection.query(`SHOW COLUMNS FROM service_agreement_sections LIKE 'title'`);
      if (titleCols.length === 0) {
        await connection.query(`
          ALTER TABLE service_agreement_sections
          ADD COLUMN title VARCHAR(255) NOT NULL AFTER id,
          ADD COLUMN badge VARCHAR(50) DEFAULT '' AFTER title,
          ADD COLUMN text TEXT AFTER badge,
          ADD COLUMN sort_order INT DEFAULT 0 AFTER text
        `);
      }
    });

    // Sustainability Sections Table
    await initTable('sustainability_sections', async () => {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS sustainability_sections (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          badge VARCHAR(50) DEFAULT '',
          text TEXT,
          sort_order INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      const [susTitleCols] = await connection.query(`SHOW COLUMNS FROM sustainability_sections LIKE 'title'`);
      if (susTitleCols.length === 0) {
        await connection.query(`
          ALTER TABLE sustainability_sections
          ADD COLUMN title VARCHAR(255) NOT NULL AFTER id,
          ADD COLUMN badge VARCHAR(50) DEFAULT '' AFTER title,
          ADD COLUMN text TEXT AFTER badge,
          ADD COLUMN sort_order INT DEFAULT 0 AFTER text
        `);
      }
    });

    // Sustainability Pages Table
    await initTable('sustainability_pages', async () => {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS sustainability_pages (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          content TEXT,
          is_active TINYINT(1) DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
    });

    // Privacy Policies Table
    await initTable('privacy_policies', async () => {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS privacy_policies (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          content TEXT DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
    });

    // Privacy Policy Sections Table
    await initTable('privacy_policy_sections', async () => {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS privacy_policy_sections (
          id INT AUTO_INCREMENT PRIMARY KEY,
          section_number VARCHAR(50) NOT NULL,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          section_order INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      const [sectionRows] = await connection.query('SELECT COUNT(*) as count FROM privacy_policy_sections');
      if (sectionRows[0].count === 0) {
        await connection.query(`
          INSERT INTO privacy_policy_sections (section_number, title, content, section_order) VALUES
          ('1', 'Introduction', 'At Satesoft, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy outlines how we collect, use, disclose, and safeguard your data when you use our cloud solutions, software products, and services across Africa. By accessing or using our services, you consent to the practices described in this policy.', 1),
          ('2', 'Information We Collect', 'We collect information that you provide directly to us, such as when you create an account, submit a form, or contact our support team. This may include your name, email address, phone number, company details, and any other information you choose to provide. We also automatically collect certain information when you access our services, including IP address, browser type, device information, and usage data.', 2),
          ('3', 'How We Use Your Information', 'We use the information we collect to provide, maintain, and improve our services; to process transactions and send related information; to communicate with you about products, services, offers, and events; to monitor and analyze trends, usage, and activities; to detect, investigate, and prevent fraudulent or unauthorized activities; and to comply with legal obligations.', 3),
          ('4', 'Data Sharing and Disclosure', 'We do not sell, trade, or rent your personal information to third parties. We may share your information with trusted service providers who assist us in operating our platform, conducting business, or servicing you, provided they agree to keep your information confidential. We may also disclose information when required by law, to protect our rights or safety, or in connection with a merger, acquisition, or asset sale.', 4),
          ('5', 'Data Security', 'We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. These measures include encryption, secure server hosting, regular security audits, and access controls. However, no method of transmission over the Internet or electronic storage is completely secure, and we cannot guarantee absolute security.', 5),
          ('6', 'Data Retention', 'We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need your information, we will securely delete or anonymize it in accordance with our data retention policies.', 6),
          ('7', 'Your Rights and Choices', 'You have the right to access, correct, or delete your personal information. You may also object to or restrict certain processing of your data, request data portability, and withdraw consent where applicable. To exercise these rights, please contact us using the information provided at the end of this policy. We will respond to your request within the timeframe required by applicable law.', 7),
          ('8', 'Cookies and Tracking Technologies', 'We use cookies and similar tracking technologies to enhance your experience on our platform. Cookies help us understand user preferences, analyze traffic patterns, and improve our services. You can manage your cookie preferences through your browser settings. Please note that disabling certain cookies may affect the functionality of our services.', 8),
          ('9', 'Third-Party Services', 'Our services may contain links to third-party websites or services that are not operated by us. We have no control over and assume no responsibility for the privacy practices or content of these third parties. We encourage you to review the privacy policies of any third-party sites you visit.', 9),
          ('10', 'International Data Transfers', 'Your information may be transferred to and maintained on servers located outside of your country of residence, including in jurisdictions that may not have the same data protection laws as your jurisdiction. We ensure that such transfers comply with applicable data protection regulations and that appropriate safeguards are in place.', 10),
          ('11', 'Changes to This Policy', 'We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or for other operational reasons. We will notify you of any material changes by posting the updated policy on our website and updating the "Effective Date" at the top of this page. Your continued use of our services after such modifications constitutes acceptance of the updated policy.', 11)
        `);
        console.log('✅ Privacy policy sections seeded');
      }
    });

    // Contacts Table
    await initTable('contacts', async () => {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS contacts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          placeholder_id VARCHAR(255) DEFAULT NULL,
          contact_point VARCHAR(255) NOT NULL,
          purpose_context TEXT DEFAULT NULL,
          section VARCHAR(255) DEFAULT NULL,
          category VARCHAR(100) DEFAULT 'general',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      const [contactRows] = await connection.query('SELECT COUNT(*) as count FROM contacts');
      if (contactRows[0].count === 0) {
        await connection.query(`
          INSERT INTO contacts (contact_point, purpose_context, section, category) VALUES
          ('https://facebook.com/satesoft', 'Follow us on Facebook', 'footer', 'social_media'),
          ('https://twitter.com/satesoft', 'Follow us on Twitter', 'footer', 'social_media'),
          ('https://instagram.com/satesoft', 'Follow us on Instagram', 'footer', 'social_media'),
          ('https://linkedin.com/company/satesoft', 'Connect on LinkedIn', 'footer', 'social_media'),
          ('https://github.com/satesoft', 'View our GitHub', 'footer', 'social_media')
        `);
      }
    });

    // Jurisdictions Table
    await initTable('jurisdictions', async () => {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS jurisdictions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          code VARCHAR(10) DEFAULT NULL,
          courts TEXT DEFAULT NULL,
          laws TEXT DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
    });

    // Pricing Table
    await initTable('pricing', async () => {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS pricing (
          id INT AUTO_INCREMENT PRIMARY KEY,
          plan VARCHAR(255) NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          features TEXT DEFAULT NULL,
          popular BOOLEAN DEFAULT FALSE,
          display_order INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
    });

    // Service Cards Table
    await initTable('service_cards', async () => {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS service_cards (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          subtitle VARCHAR(500) DEFAULT NULL,
          description TEXT DEFAULT NULL,
          summary TEXT DEFAULT NULL,
          features JSON DEFAULT NULL,
          image_url VARCHAR(1000) DEFAULT NULL,
          display_order INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
    });

    const [existingServices] = await connection.query('SELECT COUNT(*) as count FROM service_cards');
    if (existingServices[0].count === 0) {
      await connection.query(`
        INSERT INTO service_cards (title, subtitle, description, summary, features, image_url, display_order) VALUES
        ('Cyber Security', 'Your Digital Shield', 'We protect your business with advanced cybersecurity solutions tailored to African market challenges. Our security protocols are designed to safeguard your data, infrastructure, and reputation.', 'Stay safe in a connected world. We deliver security that fits African business realities — from threat detection to incident response.', '["Threat detection & response", "Network security monitoring", "Data encryption & compliance", "Security awareness training"]', '/assets/images/african_tech_meeting_1783002294603.png', 1),
        ('UI/UX Design', 'Design That Speaks', 'We create intuitive, user-centered designs that resonate with African users. Our design process combines global best practices with local cultural insights.', 'Design that feels natural. We build interfaces that work for real people — simple, inclusive, and culturally aware.', '["User research & testing", "Responsive interface design", "Design system creation", "Accessibility-first approach"]', '/assets/images/african_tech_woman_3_1783002839334.png', 2),
        ('App Development', 'Build For Scale', 'We build robust mobile and web applications that scale. From MVP to enterprise-grade platforms, our engineering teams deliver reliable software.', 'Software that grows with you. We engineer apps that remain fast, stable, and maintainable as your user base expands.', '["Cross-platform development", "API-first architecture", "Performance optimization", "Ongoing maintenance & support"]', '/assets/images/african_tech_team_hero_1783002251745.png', 3),
        ('Technology Consult', 'Strategic Guidance', 'We help organizations make smarter technology decisions. From digital transformation roadmaps to vendor evaluation, our consultants bring practical expertise.', 'Make the right tech bets. We cut through hype to help you choose solutions that actually move the needle.', '["Digital strategy & roadmap", "Technology assessment", "Vendor selection support", "Change management guidance"]', '/assets/images/african_developer_laptop_1783002306037.png', 4),
        ('IT Solution', 'End-to-End Support', 'We deliver comprehensive IT solutions — from infrastructure setup to managed services. Our solutions are built for reliability and cost-efficiency.', 'One partner, full coverage. We handle the heavy lifting so you can focus on running your business.', '["Infrastructure design & deployment", "Cloud migration & management", "Managed IT services", "24/7 technical support"]', '/assets/images/african_tech_board_1_1783002554188.png', 5)
      `);
      console.log('✅ Service cards seeded');
    }

    console.log('✅ Database initialization complete');
  } catch (err) {
    console.error('❌ Database initialization error:', err);
  } finally {
    if (connection) connection.release();
  }
};

// Call initialization
await initializeDatabase();

// Set pool for privacy policy routes
privacyPolicyRoutes.setPool(pool);
serviceAgreementRoutes.setPool(pool);

// JWT Middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Token missing.' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'super-secret-key-change-in-production', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token. Please log in again.' });
    }
    req.user = user;
    next();
  });
};

const verifyStoredPassword = async (inputPassword, storedPassword) => {
  if (!storedPassword) {
    return false;
  }

  if (typeof storedPassword === 'string' && storedPassword.startsWith('$2')) {
    try {
      return await bcrypt.compare(inputPassword, storedPassword);
    } catch (error) {
      console.warn('⚠️ Password hash comparison failed, falling back to plain compare.', error.message);
    }
  }

  return storedPassword === inputPassword;
};

const normalizeImageUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.startsWith('/assets/')) return trimmed;
  const normalized = trimmed.replace(/\\/g, '/');
  const match = normalized.match(/\/assets\/images\/.+$/);
  if (match) return match[0];
  const filename = normalized.split('/').pop();
  if (filename) return '/assets/images/' + filename;
  return null;
};

// ======================
// API ROUTES - ALL API ROUTES MUST BE DEFINED HERE
// ======================

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'ok',
      database: 'connected',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: error.message,
    });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: 'Username and password are required.',
      });
    }

    const [users] = await pool.query(
      'SELECT * FROM admin_users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({
        error: 'Invalid credentials.',
      });
    }

    const user = users[0];
    const passwordMatch = await verifyStoredPassword(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        error: 'Invalid credentials.',
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
      },
      JWT_SECRET,
      {
        expiresIn: '24h',
      }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error('❌ Login Error:', error);
    res.status(500).json({
      error: 'Internal server error.',
    });
  }
});

// Forgot Password
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email is required.',
      });
    }

    const [users] = await pool.query(
      'SELECT * FROM admin_users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({
        error: 'No account found with that email address.',
      });
    }

    const resetToken = jwt.sign(
      { id: users[0].id, username: users[0].username },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const tokenExpiry = new Date(Date.now() + 3600000);

    await pool.query(
      'UPDATE admin_users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
      [resetToken, tokenExpiry, users[0].id]
    );

    console.log(`🔑 Password reset token for ${email}: ${resetToken}`);

    res.json({
      message: 'If an account exists, reset instructions have been sent to your email.',
      email: users[0].email,
    });
  } catch (error) {
    console.error('❌ Forgot Password Error:', error);
    res.status(500).json({
      error: 'Internal server error.',
    });
  }
});

// Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        error: 'Token and new password are required.',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(400).json({
        error: 'Invalid or expired reset token.',
      });
    }

    const [users] = await pool.query(
      'SELECT * FROM admin_users WHERE id = ? AND reset_token = ?',
      [decoded.id, token]
    );

    if (users.length === 0) {
      return res.status(400).json({
        error: 'Invalid reset token.',
      });
    }

    const user = users[0];
    if (new Date() > new Date(user.reset_token_expiry)) {
      return res.status(400).json({
        error: 'Reset token has expired.',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      'UPDATE admin_users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    res.json({
      message: 'Password reset successfully.',
    });
  } catch (error) {
    console.error('❌ Reset Password Error:', error);
    res.status(500).json({
      error: 'Internal server error.',
    });
  }
});

// Stats endpoints
app.get('/api/stats', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM project_stats');
    res.json(rows);
  } catch (error) {
    console.error('❌ Stats Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/stats', verifyToken, async (req, res) => {
  try {
    const { title, value, description } = req.body;
    if (!title || !value) {
      return res.status(400).json({ error: 'Title and value are required.' });
    }
    const [result] = await pool.query(
      'INSERT INTO project_stats (title, value, description) VALUES (?, ?, ?)',
      [title, value, description || '']
    );
    res.status(201).json({ id: result.insertId, title, value, description: description || '' });
  } catch (error) {
    console.error('❌ Add Stat Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.put('/api/stats/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, value, description } = req.body;
    if (!title || !value) {
      return res.status(400).json({ error: 'Title and value are required.' });
    }
    await pool.query(
      'UPDATE project_stats SET title = ?, value = ?, description = ? WHERE id = ?',
      [title, value, description || '', id]
    );
    res.json({ id, title, value, description: description || '' });
  } catch (error) {
    console.error('❌ Update Stat Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.delete('/api/stats/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM project_stats WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Delete Stat Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/stats/reset', verifyToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM project_stats');
    await pool.query(`
      INSERT INTO project_stats (title, value, description)
      VALUES 
        ('Countdown', '186 days', 'Days until completion'),
        ('Completed', '298 days', 'Days already completed'),
        ('Total Days', '478 days', 'Total estimated days')
    `);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Reset Stats Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Admin Users endpoints
app.get('/api/admin/users', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username, created_at FROM admin_users ORDER BY id');
    res.json(rows);
  } catch (error) {
    console.error('❌ List Users Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/admin/users', verifyToken, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO admin_users (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );
    res.status(201).json({ id: result.insertId, username });
  } catch (error) {
    console.error('❌ Add User Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.delete('/api/admin/users/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [user] = await pool.query('SELECT * FROM admin_users WHERE id = ?', [id]);
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    if (user[0].username === 'admin') {
      return res.status(400).json({ error: 'Cannot delete the default admin user.' });
    }
    await pool.query('DELETE FROM admin_users WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Delete User Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.put('/api/admin/users/:id/password', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    if (!password || password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('UPDATE admin_users SET password = ? WHERE id = ?', [hashedPassword, id]);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Update Password Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ======================
// PRODUCT ENDPOINTS
// ======================

app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM product_cards ORDER BY id');
    const products = rows.map((row) => ({
      ...row,
      name: row.title,
      tagline: row.subtitle,
      category: row.category,
      iconType: row.icon_name,
      logoUrl: row.logo_url,
      description: row.description,
      keyFeatures: row.key_features ? JSON.parse(row.key_features) : [],
    }));
    res.json(products);
  } catch (error) {
    console.error('❌ List Products Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM product_cards WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    const row = rows[0];
    res.json({
      id: row.id,
      name: row.title,
      tagline: row.subtitle,
      category: row.category,
      iconType: row.icon_name,
      logoUrl: row.logo_url,
      description: row.description,
      keyFeatures: row.key_features ? JSON.parse(row.key_features) : [],
    });
  } catch (error) {
    console.error('❌ Get Product Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, tagline, category, iconType, logoUrl, description, keyFeatures } = req.body;
    if (!name || !tagline) {
      return res.status(400).json({ error: 'Name and tagline are required.' });
    }
    const [result] = await pool.query(
      'INSERT INTO product_cards (title, subtitle, category, icon_name, logo_url, description, key_features) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, tagline, category || null, iconType || 'trending', normalizeImageUrl(logoUrl), description || null, keyFeatures && Array.isArray(keyFeatures) ? JSON.stringify(keyFeatures) : JSON.stringify([])]
    );
    res.status(201).json({ id: result.insertId, name, tagline, category: category || null, iconType: iconType || 'trending', logoUrl: logoUrl || null, description: description || null, keyFeatures: keyFeatures || [] });
  } catch (error) {
    console.error('❌ Add Product Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, tagline, category, iconType, logoUrl, description, keyFeatures } = req.body;
    if (!name || !tagline) {
      return res.status(400).json({ error: 'Name and tagline are required.' });
    }
    await pool.query(
      'UPDATE product_cards SET title = ?, subtitle = ?, category = ?, icon_name = ?, logo_url = ?, description = ?, key_features = ? WHERE id = ?',
      [name, tagline, category || null, iconType || 'trending', normalizeImageUrl(logoUrl), description || null, keyFeatures && Array.isArray(keyFeatures) ? JSON.stringify(keyFeatures) : JSON.stringify([]), id]
    );
    res.json({ id: Number(id), name, tagline, category: category || null, iconType: iconType || 'trending', logoUrl: logoUrl || null, description: description || null, keyFeatures: keyFeatures || [] });
  } catch (error) {
    console.error('❌ Update Product Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM product_cards WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Delete Product Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ======================
// SERVICE ENDPOINTS
// ======================

app.get('/api/services', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM service_cards ORDER BY display_order, id');
    const services = rows.map((row) => ({
      id: row.id,
      title: row.title,
      subtitle: row.subtitle,
      description: row.description,
      summary: row.summary,
      features: row.features ? JSON.parse(row.features) : [],
      imageUrl: row.image_url,
      displayOrder: row.display_order,
    }));
    res.json(services);
  } catch (error) {
    console.error('❌ List Services Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.get('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM service_cards WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Service not found.' });
    }
    const row = rows[0];
    res.json({
      id: row.id,
      title: row.title,
      subtitle: row.subtitle,
      description: row.description,
      summary: row.summary,
      features: row.features ? JSON.parse(row.features) : [],
      imageUrl: row.image_url,
      displayOrder: row.display_order,
    });
  } catch (error) {
    console.error('❌ Get Service Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/services', async (req, res) => {
  try {
    const { title, subtitle, description, summary, features, imageUrl, displayOrder } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required.' });
    }
    const [result] = await pool.query(
      'INSERT INTO service_cards (title, subtitle, description, summary, features, image_url, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, subtitle || null, description || null, summary || null, features && Array.isArray(features) ? JSON.stringify(features) : JSON.stringify([]), normalizeImageUrl(imageUrl), displayOrder || 0]
    );
    res.status(201).json({ id: result.insertId, title, subtitle: subtitle || null, description: description || null, summary: summary || null, features: features || [], imageUrl: imageUrl || null, displayOrder: displayOrder || 0 });
  } catch (error) {
    console.error('❌ Add Service Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.put('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, description, summary, features, imageUrl, displayOrder } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required.' });
    }
    await pool.query(
      'UPDATE service_cards SET title = ?, subtitle = ?, description = ?, summary = ?, features = ?, image_url = ?, display_order = ? WHERE id = ?',
      [title, subtitle || null, description || null, summary || null, features && Array.isArray(features) ? JSON.stringify(features) : JSON.stringify([]), normalizeImageUrl(imageUrl), displayOrder || 0, id]
    );
    res.json({ id: Number(id), title, subtitle: subtitle || null, description: description || null, summary: summary || null, features: features || [], imageUrl: imageUrl || null, displayOrder: displayOrder || 0 });
  } catch (error) {
    console.error('❌ Update Service Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.delete('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM service_cards WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Delete Service Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ======================
// SUBSCRIBERS ENDPOINTS
// ======================

app.post('/api/subscribe', async (req, res) => {
  try {
    const { email, name } = req.body;
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanName = String(name || '').trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    const [existing] = await pool.query('SELECT id FROM subscribers WHERE email = ?', [cleanEmail]);
    if (existing.length > 0) {
      return res.status(200).json({ success: true, message: 'You are already subscribed!' });
    }

    await pool.query('INSERT INTO subscribers (email, name) VALUES (?, ?)', [cleanEmail, cleanName || null]);
    res.status(201).json({ success: true, message: 'Successfully subscribed!' });
  } catch (error) {
    console.error('❌ Subscribe Error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(200).json({ success: true, message: 'You are already subscribed!' });
    }
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.get('/api/subscribers', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM subscribers ORDER BY subscribed_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('❌ Subscribers Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.get('/api/subscribers/count', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM subscribers');
    res.json({ count: rows[0]?.count || 0 });
  } catch (error) {
    console.error('❌ Subscribers count Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ======================
// PARTNER ENDPOINTS
// ======================

app.get('/api/partners', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM partners ORDER BY id');
    const partners = rows.map((row) => ({
      id: row.id,
      name: row.name,
      joined: normalizeDate(row.joined),
      industry: row.industry,
      location: row.location,
      contactName: row.contact_name,
      contactEmail: row.contact_email,
      status: row.status,
    }));
    res.json(partners);
  } catch (error) {
    console.error('❌ List Partners Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/partners', async (req, res) => {
  try {
    const { name, joined, industry, location, contactName, contactEmail, status } = req.body;
    if (!name || !industry || !location) {
      return res.status(400).json({ error: 'Name, industry, and location are required.' });
    }
    const [result] = await pool.query(
      'INSERT INTO partners (name, joined, industry, location, contact_name, contact_email, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, joined || null, industry, location, contactName || null, contactEmail || null, status || 'ACTIVE']
    );
    res.status(201).json({ id: result.insertId, name, joined: joined || null, industry, location, contactName: contactName || null, contactEmail: contactEmail || null, status: status || 'ACTIVE' });
  } catch (error) {
    console.error('❌ Add Partner Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.put('/api/partners/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, joined, industry, location, contactName, contactEmail, status } = req.body;
    if (!name || !industry || !location) {
      return res.status(400).json({ error: 'Name, industry, and location are required.' });
    }
    await pool.query(
      'UPDATE partners SET name = ?, joined = ?, industry = ?, location = ?, contact_name = ?, contact_email = ?, status = ? WHERE id = ?',
      [name, joined || null, industry, location, contactName || null, contactEmail || null, status || 'ACTIVE', id]
    );
    res.json({ id: Number(id), name, joined: joined || null, industry, location, contactName: contactName || null, contactEmail: contactEmail || null, status: status || 'ACTIVE' });
  } catch (error) {
    console.error('❌ Update Partner Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.delete('/api/partners/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM partners WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Delete Partner Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.put('/api/partners/:id/terminate', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT status FROM partners WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Partner not found.' });
    }
    const newStatus = rows[0].status === 'TERMINATED' ? 'ACTIVE' : 'TERMINATED';
    await pool.query('UPDATE partners SET status = ? WHERE id = ?', [newStatus, id]);
    res.json({ success: true, id: Number(id), status: newStatus });
  } catch (error) {
    console.error('❌ Terminate Partner Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ======================
// ADVISOR ENDPOINTS
// ======================

app.get('/api/advisors', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM advisors ORDER BY advisor_order, id');
    res.json(rows.map((row) => {
      const isActiveRaw = row.is_active;
      const isActive = Buffer.isBuffer(isActiveRaw) ? isActiveRaw[0] === 1 : Number(isActiveRaw) === 1;
      return {
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        roleId: row.role_id,
        roleTitle: row.role_title,
        order: row.advisor_order,
        isActive,
        imageUrl: row.image_url || null,
        profileLink: row.profile_link || null,
        bio: row.bio,
        email: row.email,
        expertise: row.expertise,
        category: row.category || 'board',
      };
    }));
  } catch (error) {
    console.error('❌ List Advisors Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.get('/api/advisors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM advisors WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Advisor not found.' });
    }
    const row = rows[0];
    const isActiveRaw = row.is_active;
    const isActive = Buffer.isBuffer(isActiveRaw) ? isActiveRaw[0] === 1 : Number(isActiveRaw) === 1;
    res.json({
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      roleId: row.role_id,
      roleTitle: row.role_title,
      order: row.advisor_order,
      isActive,
      imageUrl: row.image_url || null,
      profileLink: row.profile_link || null,
      bio: row.bio,
      email: row.email,
      expertise: row.expertise,
      category: row.category || 'board',
    });
  } catch (error) {
    console.error('❌ Get Advisor Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/advisors', async (req, res) => {
  try {
    const { firstName, lastName, roleId, roleTitle, advisorOrder, email, expertise, bio, imageUrl, profileLink, isActive, category } = req.body;
    if (!firstName) {
      return res.status(400).json({ error: 'First name is required.' });
    }
    const [result] = await pool.query(
      'INSERT INTO advisors (first_name, last_name, role_id, role_title, advisor_order, is_active, image_url, profile_link, bio, email, expertise, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [firstName, lastName || null, roleId || 0, roleTitle || null, advisorOrder || 0, isActive ? 1 : 1, normalizeImageUrl(imageUrl), profileLink || null, bio || null, email || null, expertise || null, category || 'board']
    );
    res.status(201).json({ id: result.insertId, firstName, lastName, roleId: roleId || 0, roleTitle: roleTitle || null, order: advisorOrder || 0, isActive: isActive ? true : true, imageUrl: imageUrl || null, profileLink: profileLink || null, bio: bio || null, email: email || null, expertise: expertise || null, category: category || 'board' });
  } catch (error) {
    console.error('❌ Add Advisor Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.put('/api/advisors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, roleId, roleTitle, advisorOrder, email, expertise, bio, imageUrl, profileLink, isActive, category } = req.body;
    if (!firstName) {
      return res.status(400).json({ error: 'First name is required.' });
    }
    await pool.query(
      'UPDATE advisors SET first_name = ?, last_name = ?, role_id = ?, role_title = ?, advisor_order = ?, is_active = ?, image_url = ?, profile_link = ?, bio = ?, email = ?, expertise = ?, category = ? WHERE id = ?',
      [firstName, lastName || null, roleId || 0, roleTitle || null, advisorOrder || 0, isActive ? 1 : 0, normalizeImageUrl(imageUrl), profileLink || null, bio || null, email || null, expertise || null, category || 'board', id]
    );
    res.json({ id: Number(id), firstName, lastName, roleId: roleId || 0, roleTitle: roleTitle || null, order: advisorOrder || 0, isActive: isActive ? true : false, imageUrl: imageUrl || null, profileLink: profileLink || null, bio: bio || null, email: email || null, expertise: expertise || null, category: category || 'board' });
  } catch (error) {
    console.error('❌ Update Advisor Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.delete('/api/advisors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM advisors WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Delete Advisor Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ======================
// MILESTONE ENDPOINTS
// ======================

app.get('/api/milestones', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM milestones ORDER BY display_order, id');
    res.json(rows.map((row) => ({
      id: row.id,
      year: row.year,
      title: row.title,
      description: row.description,
      color: row.color || '#72bf24',
      displayOrder: row.display_order,
      icon: row.icon || '',
      blogSlug: row.blog_slug || null,
    })));
  } catch (error) {
    console.error('❌ List Milestones Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.get('/api/milestones/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM milestones WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Milestone not found.' });
    }
    const row = rows[0];
    res.json({
      id: row.id,
      year: row.year,
      title: row.title,
      description: row.description,
      color: row.color || '#72bf24',
      displayOrder: row.display_order,
      icon: row.icon || '',
      blogSlug: row.blog_slug || null,
    });
  } catch (error) {
    console.error('❌ Get Milestone Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/milestones', async (req, res) => {
  try {
    const { year, title, description, color, displayOrder, icon, blogSlug } = req.body;
    if (!year || !title) {
      return res.status(400).json({ error: 'Year and title are required.' });
    }
    const [result] = await pool.query(
      'INSERT INTO milestones (year, title, description, color, display_order, icon, blog_slug) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [year, title, description || null, color || '#72bf24', displayOrder || 0, icon || null, blogSlug || null]
    );
    res.status(201).json({ id: result.insertId, year, title, description: description || null, color: color || '#72bf24', displayOrder: displayOrder || 0, icon: icon || '', blogSlug: blogSlug || null });
  } catch (error) {
    console.error('❌ Add Milestone Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.put('/api/milestones/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { year, title, description, color, displayOrder, icon, blogSlug } = req.body;
    if (!year || !title) {
      return res.status(400).json({ error: 'Year and title are required.' });
    }
    await pool.query(
      'UPDATE milestones SET year = ?, title = ?, description = ?, color = ?, display_order = ?, icon = ?, blog_slug = ? WHERE id = ?',
      [year, title, description || null, color || '#72bf24', displayOrder || 0, icon || null, blogSlug || null, id]
    );
    res.json({ id: Number(id), year, title, description: description || null, color: color || '#72bf24', displayOrder: displayOrder || 0, icon: icon || '', blogSlug: blogSlug || null });
  } catch (error) {
    console.error('❌ Update Milestone Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.delete('/api/milestones/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM milestones WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Delete Milestone Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.get('/api/milestones/:milestoneId/activities/:activityId', async (req, res) => {
  console.log('GET /api/milestones/:milestoneId/activities/:activityId hit', req.params);
  try {
    const { milestoneId, activityId } = req.params;
    const [rows] = await pool.query('SELECT * FROM milestone_activities WHERE id = ? AND milestone_id = ?', [activityId, milestoneId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Activity not found.' });
    }
    const row = rows[0];
    res.json({
      id: row.id,
      milestoneId: row.milestone_id,
      month: row.month,
      title: row.title,
      description: row.description,
      displayOrder: row.display_order,
    });
  } catch (error) {
    console.error('❌ Get Activity Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ======================
// MILESTONE ACTIVITY ENDPOINTS
// ======================

app.get('/api/milestones/:id/activities', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM milestone_activities WHERE milestone_id = ? ORDER BY display_order, id', [id]);
    res.json(rows.map((row) => ({
      id: row.id,
      milestoneId: row.milestone_id,
      month: row.month,
      title: row.title,
      description: row.description,
      displayOrder: row.display_order,
      activityDate: row.activity_date || null,
      blogSlug: row.blog_slug || null,
    })));
  } catch (error) {
    console.error('❌ List Milestone Activities Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.get('/api/milestones/:id/activities/date/:date', async (req, res) => {
  try {
    const { id, date } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM milestone_activities WHERE milestone_id = ? AND activity_date = ? ORDER BY display_order, id',
      [id, date]
    );
    res.json(rows.map((row) => ({
      id: row.id,
      milestoneId: row.milestone_id,
      month: row.month,
      title: row.title,
      description: row.description,
      displayOrder: row.display_order,
      activityDate: row.activity_date || null,
      blogSlug: row.blog_slug || null,
    })));
  } catch (error) {
    console.error('❌ List Activities by Date Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/milestones/:id/activities', async (req, res) => {
  try {
    const { id } = req.params;
    const { month, title, description, displayOrder, activityDate, blogSlug } = req.body;
    if (!month || !title) {
      return res.status(400).json({ error: 'Month and title are required.' });
    }
    const [result] = await pool.query(
      'INSERT INTO milestone_activities (milestone_id, month, title, description, display_order, activity_date, blog_slug) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, month, title, description || null, displayOrder || 0, activityDate || null, blogSlug || null]
    );
    res.status(201).json({ id: result.insertId, milestoneId: Number(id), month, title, description: description || null, displayOrder: displayOrder || 0, activityDate: activityDate || null, blogSlug: blogSlug || null });
  } catch (error) {
    console.error('❌ Add Milestone Activity Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.put('/api/milestone-activities/:activityId', async (req, res) => {
  try {
    const { activityId } = req.params;
    const { month, title, description, displayOrder, activityDate, blogSlug } = req.body;
    if (!month || !title) {
      return res.status(400).json({ error: 'Month and title are required.' });
    }
    await pool.query(
      'UPDATE milestone_activities SET month = ?, title = ?, description = ?, display_order = ?, activity_date = ?, blog_slug = ? WHERE id = ?',
      [month, title, description || null, displayOrder || 0, activityDate || null, blogSlug || null, activityId]
    );
    res.json({ id: Number(activityId), month, title, description: description || null, displayOrder: displayOrder || 0, activityDate: activityDate || null, blogSlug: blogSlug || null });
  } catch (error) {
    console.error('❌ Update Milestone Activity Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.delete('/api/milestone-activities/:activityId', async (req, res) => {
  try {
    const { activityId } = req.params;
    await pool.query('DELETE FROM milestone_activities WHERE id = ?', [activityId]);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Delete Milestone Activity Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ======================
// NEWS ENDPOINTS
// ======================

app.get('/api/news', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT n.*, COUNT(c.id) as comments
      FROM news_posts n
      LEFT JOIN comments c ON c.article_id = n.id AND c.is_approved = 1
      GROUP BY n.id
      ORDER BY n.publish_date DESC, n.id DESC
    `);
    res.json(rows.map((row) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      author: row.author,
      date: normalizeDate(row.publish_date),
      excerpt: row.excerpt,
      content: row.content || null,
      views: row.views || 0,
      comments: row.comments || 0,
      imageUrl: row.image_url || null,
    })));
  } catch (error) {
    console.error('❌ List News Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.get('/api/news/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT n.*, COUNT(c.id) as comments
      FROM news_posts n
      LEFT JOIN comments c ON c.article_id = n.id AND c.is_approved = 1
      WHERE n.id = ?
      GROUP BY n.id
    `, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'News post not found.' });
    }
    const row = rows[0];
    res.json({
      id: row.id,
      title: row.title,
      category: row.category,
      author: row.author,
      date: normalizeDate(row.publish_date),
      excerpt: row.excerpt,
      content: row.content || null,
      views: row.views || 0,
      imageUrl: row.image_url || null,
      comments: row.comments || 0,
    });
  } catch (error) {
    console.error('❌ Get News Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/news/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid article ID' });
    }

    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || null;

    try {
      const [existing] = await pool.query(
        'SELECT id FROM viewed_posts WHERE post_id = ? AND ip_address = ?',
        [id, ipAddress]
      );

      if (existing.length === 0) {
        await pool.query(
          'INSERT INTO viewed_posts (post_id, ip_address, user_agent) VALUES (?, ?, ?)',
          [id, ipAddress, userAgent]
        );
        await pool.query('UPDATE news_posts SET views = views + 1 WHERE id = ?', [id]);
      }

      const [rows] = await pool.query('SELECT views FROM news_posts WHERE id = ?', [id]);
      res.json({ success: true, views: rows[0]?.views || 0 });
    } catch (tableError) {
      if (tableError.code === 'ER_NO_SUCH_TABLE') {
        await pool.query('UPDATE news_posts SET views = views + 1 WHERE id = ?', [id]);
        const [rows] = await pool.query('SELECT views FROM news_posts WHERE id = ?', [id]);
        res.json({ success: true, views: rows[0]?.views || 0 });
      } else {
        throw tableError;
      }
    }
  } catch (error) {
    console.error('❌ Track view error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/news', async (req, res) => {
  try {
    const { title, category, author, date, excerpt, content, imageUrl } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required.' });
    }
    const [result] = await pool.query(
      'INSERT INTO news_posts (title, category, author, publish_date, excerpt, content, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, category || null, author || null, date || null, excerpt || null, content || null, imageUrl || null]
    );
    res.status(201).json({ id: result.insertId, title, category: category || null, author: author || null, date: date || null, excerpt: excerpt || null, content: content || null, imageUrl: imageUrl || null });
  } catch (error) {
    console.error('❌ Add News Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.put('/api/news/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, author, date, excerpt, content, imageUrl } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required.' });
    }
    await pool.query(
      'UPDATE news_posts SET title = ?, category = ?, author = ?, publish_date = ?, excerpt = ?, content = ?, image_url = ? WHERE id = ?',
      [title, category || null, author || null, date || null, excerpt || null, content || null, imageUrl || null, id]
    );
    res.json({ id: Number(id), title, category: category || null, author: author || null, date: date || null, excerpt: excerpt || null, content: content || null, imageUrl: imageUrl || null });
  } catch (error) {
    console.error('❌ Update News Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.delete('/api/news/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM news_posts WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Delete News Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ======================
// COMMENTS ENDPOINTS
// ======================

// Debug endpoint to check comment status
app.get('/api/comments/debug/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [comment] = await pool.query('SELECT * FROM comments WHERE id = ?', [id]);
    const [replies] = await pool.query('SELECT * FROM comments WHERE parent_id = ?', [id]);
    const [references] = await pool.query('SELECT COUNT(*) as count FROM comments WHERE parent_id = ?', [id]);
    res.json({
      comment: comment[0] || null,
      replies: replies,
      replyCount: replies.length,
      hasReferences: references[0].count > 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get comments by article
app.get('/api/comments/by-article', async (req, res) => {
  try {
    const { articleId } = req.query;

    if (articleId && !isNaN(articleId)) {
      const [comments] = await pool.query(
        `SELECT c.*, 
                (SELECT COUNT(*) FROM comments WHERE parent_id = c.id AND is_approved = 1) as reply_count
         FROM comments c
         WHERE c.article_id = ? AND c.parent_id IS NULL AND c.is_approved = 1
         ORDER BY c.created_at DESC`,
        [articleId]
      );

      const commentsWithReplies = await Promise.all(
        comments.map(async (comment) => {
          const [replies] = await pool.query(
            `SELECT * FROM comments 
             WHERE parent_id = ? AND is_approved = 1 
             ORDER BY created_at ASC`,
            [comment.id]
          );
          return {
            ...comment,
            _id: comment.id,
            createdAt: comment.created_at,
            isApproved: Boolean(comment.is_approved),
            replies: replies.map(r => ({
              ...r,
              _id: r.id,
              createdAt: r.created_at,
              isApproved: Boolean(r.is_approved)
            }))
          };
        })
      );

      res.json({
        articleId: parseInt(articleId),
        totalComments: commentsWithReplies.reduce((sum, c) => sum + 1 + c.replies.length, 0),
        comments: commentsWithReplies
      });
      return;
    }

    const [summaryRows] = await pool.query(`
      SELECT article_id, COUNT(*) as totalComments
      FROM comments
      WHERE is_approved = 1
      GROUP BY article_id
    `);

    const articlesWithComments = await Promise.all(
      summaryRows.map(async (row) => {
        const [comments] = await pool.query(
          `SELECT id, article_id, author, content, parent_id, likes, is_approved, created_at, updated_at
           FROM comments
           WHERE article_id = ? AND is_approved = 1
           ORDER BY created_at ASC`,
          [row.article_id]
        );

        const commentsWithReplies = await Promise.all(
          comments
            .filter((c) => c.parent_id === null)
            .map(async (comment) => {
              const [replies] = await pool.query(
                `SELECT id, article_id, author, content, parent_id, likes, is_approved, created_at, updated_at
                 FROM comments
                 WHERE parent_id = ? AND is_approved = 1
                 ORDER BY created_at ASC`,
                [comment.id]
              );
              return {
                ...comment,
                _id: comment.id,
                createdAt: comment.created_at,
                isApproved: Boolean(comment.is_approved),
                replies: replies.map((r) => ({
                  ...r,
                  _id: r.id,
                  createdAt: r.created_at,
                  isApproved: Boolean(r.is_approved),
                })),
              };
            })
        );

        return {
          articleId: row.article_id,
          totalComments: row.totalComments,
          comments: commentsWithReplies,
        };
      })
    );

    res.json(articlesWithComments);
  } catch (error) {
    console.error('❌ Comments by article Error:', error);
    res.status(500).json({ error: 'Internal server error.', details: error.message });
  }
});

// Get comments for an article
app.get('/api/comments/:articleId', async (req, res) => {
  try {
    const { articleId } = req.params;
    if (!articleId || isNaN(articleId)) {
      return res.status(400).json({ error: 'Invalid article ID' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM comments WHERE article_id = ? AND parent_id IS NULL AND is_approved = 1 ORDER BY created_at DESC',
      [articleId]
    );

    const commentsWithReplies = await Promise.all(rows.map(async (comment) => {
      const [replies] = await pool.query(
        'SELECT * FROM comments WHERE parent_id = ? AND is_approved = 1 ORDER BY created_at ASC',
        [comment.id]
      );
      return {
        ...comment,
        _id: comment.id,
        createdAt: comment.created_at,
        isApproved: Boolean(comment.is_approved),
        replies: replies.map(r => ({
          ...r,
          _id: r.id,
          createdAt: r.created_at,
          isApproved: Boolean(r.is_approved)
        })),
      };
    }));

    res.json(commentsWithReplies);
  } catch (error) {
    console.error('❌ List Comments Error:', error);
    res.status(500).json({ error: 'Internal server error.', details: error.message });
  }
});

// Alias for blog frontend
app.get('/api/articles/:articleId/comments', async (req, res) => {
  try {
    const { articleId } = req.params;
    if (!articleId || isNaN(articleId)) {
      return res.status(400).json({ error: 'Invalid article ID' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM comments WHERE article_id = ? AND parent_id IS NULL AND is_approved = 1 ORDER BY created_at DESC',
      [articleId]
    );

    const commentsWithReplies = await Promise.all(rows.map(async (comment) => {
      const [replies] = await pool.query(
        'SELECT * FROM comments WHERE parent_id = ? AND is_approved = 1 ORDER BY created_at ASC',
        [comment.id]
      );
      return {
        ...comment,
        _id: comment.id,
        createdAt: comment.created_at,
        isApproved: Boolean(comment.is_approved),
        replies: replies.map(r => ({
          ...r,
          _id: r.id,
          createdAt: r.created_at,
          isApproved: Boolean(r.is_approved)
        })),
      };
    }));

    res.json(commentsWithReplies);
  } catch (error) {
    console.error('❌ List Comments Error:', error);
    res.status(500).json({ error: 'Internal server error.', details: error.message });
  }
});

// Post a new comment
app.post('/api/comments', async (req, res) => {
  try {
    const { articleId, author, content, parentId } = req.body;
    const cleanAuthor = String(author || '').trim();
    const cleanContent = String(content || '').trim();

    if (!Number.isInteger(Number(articleId)) || articleId < 1) {
      return res.status(400).json({ error: 'Valid article ID is required.' });
    }
    if (!cleanAuthor) {
      return res.status(400).json({ error: 'Author name is required.' });
    }
    if (!cleanContent) {
      return res.status(400).json({ error: 'Comment content is required.' });
    }
    if (cleanAuthor.length > 80) {
      return res.status(400).json({ error: 'Author name cannot exceed 80 characters.' });
    }
    if (cleanContent.length > 2000) {
      return res.status(400).json({ error: 'Comment cannot exceed 2000 characters.' });
    }

    const [articleCheck] = await pool.query('SELECT id FROM news_posts WHERE id = ?', [articleId]);
    if (articleCheck.length === 0) {
      return res.status(404).json({ error: 'Article not found.' });
    }

    if (parentId) {
      const [parentCheck] = await pool.query(
        'SELECT id FROM comments WHERE id = ? AND article_id = ?',
        [parentId, articleId]
      );
      if (parentCheck.length === 0) {
        return res.status(404).json({ error: 'Parent comment not found.' });
      }
    }

    const [result] = await pool.query(
      'INSERT INTO comments (article_id, author, content, parent_id, is_approved) VALUES (?, ?, ?, ?, ?)',
      [articleId, cleanAuthor, cleanContent, parentId || null, 1]
    );

    const [newComment] = await pool.query('SELECT * FROM comments WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      comment: {
        ...newComment[0],
        _id: newComment[0].id,
        createdAt: newComment[0].created_at,
        isApproved: Boolean(newComment[0].is_approved),
        replies: []
      }
    });
  } catch (error) {
    console.error('❌ Add Comment Error:', error);
    res.status(500).json({ error: 'Unable to add comment. Please try again.', details: error.message });
  }
});

// DELETE a comment - FIXED VERSION
app.delete('/api/comments/:id', async (req, res) => {
  console.log(`🔍 DELETE request received for comment ID: ${req.params.id}`);
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      console.log('❌ Invalid comment ID:', id);
      return res.status(400).json({ error: 'Invalid comment ID' });
    }

    // Check if comment exists
    const [existingComment] = await pool.query(
      'SELECT id, parent_id FROM comments WHERE id = ?',
      [id]
    );

    if (existingComment.length === 0) {
      console.log('❌ Comment not found:', id);
      return res.status(404).json({ error: 'Comment not found' });
    }

    const comment = existingComment[0];
    let deletedReplies = 0;

    // If it's a parent comment, delete all its replies first
    if (comment.parent_id === null) {
      const [replies] = await pool.query(
        'SELECT id FROM comments WHERE parent_id = ?',
        [id]
      );
      deletedReplies = replies.length;
      console.log(`📝 Deleting ${deletedReplies} replies for comment ${id}`);
      
      await pool.query('DELETE FROM comments WHERE parent_id = ?', [id]);
    }

    // Delete the comment itself
    const [result] = await pool.query('DELETE FROM comments WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      console.log('❌ Comment could not be deleted:', id);
      return res.status(404).json({ error: 'Comment could not be deleted' });
    }

    console.log(`✅ Comment ${id} deleted successfully`);
    res.json({ 
      success: true, 
      message: 'Comment deleted successfully',
      deletedCommentId: parseInt(id),
      deletedReplies: deletedReplies
    });
  } catch (error) {
    console.error('❌ Delete Comment Error:', error);
    
    // If there's a foreign key constraint error, try a more aggressive approach
    if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_NO_REFERENCED_ROW') {
      try {
        console.log('🔄 Attempting force delete with foreign key checks disabled');
        await pool.query('SET FOREIGN_KEY_CHECKS = 0');
        await pool.query('DELETE FROM comments WHERE parent_id = ?', [req.params.id]);
        await pool.query('DELETE FROM comments WHERE id = ?', [req.params.id]);
        await pool.query('SET FOREIGN_KEY_CHECKS = 1');
        
        console.log('✅ Force delete successful');
        return res.json({ 
          success: true, 
          message: 'Comment and all replies deleted successfully',
          deletedCommentId: parseInt(req.params.id)
        });
      } catch (retryError) {
        await pool.query('SET FOREIGN_KEY_CHECKS = 1');
        console.error('❌ Retry delete failed:', retryError);
        return res.status(500).json({ 
          error: 'Unable to delete comment. Please try again.',
          details: retryError.message 
        });
      }
    }
    
    res.status(500).json({ 
      error: 'Unable to delete comment. Please try again.',
      details: error.message 
    });
  }
});

// Delete all comments for an article
app.delete('/api/comments/article/:articleId', async (req, res) => {
  try {
    const { articleId } = req.params;
    if (!articleId || isNaN(articleId)) {
      return res.status(400).json({ error: 'Invalid article ID' });
    }

    const [articleCheck] = await pool.query('SELECT id FROM news_posts WHERE id = ?', [articleId]);
    if (articleCheck.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const [result] = await pool.query('DELETE FROM comments WHERE article_id = ?', [articleId]);
    res.json({ success: true, message: `Deleted ${result.affectedRows} comments`, deletedCount: result.affectedRows });
  } catch (error) {
    console.error('❌ Delete Article Comments Error:', error);
    res.status(500).json({ error: 'Unable to delete comments. Please try again.', details: error.message });
  }
});

// Like a comment
app.put('/api/comments/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid comment ID' });
    }

    const [result] = await pool.query('UPDATE comments SET likes = likes + 1 WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Comment not found.' });
    }

    const [rows] = await pool.query('SELECT likes FROM comments WHERE id = ?', [id]);
    res.json({ likes: rows[0].likes });
  } catch (error) {
    console.error('❌ Like Comment Error:', error);
    res.status(500).json({ error: 'Unable to like comment. Please try again.', details: error.message });
  }
});

// ======================
// SERVICE AGREEMENTS ENDPOINTS
// ======================

app.get('/api/service-agreements', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM service_agreements ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('❌ List Service Agreements Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.get('/api/service-agreements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM service_agreements WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Service agreement not found.' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('❌ Get Service Agreement Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/service-agreements', async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required.' });
    }
    const [result] = await pool.query('INSERT INTO service_agreements (title, content) VALUES (?, ?)', [title, content || null]);
    const [newAgreement] = await pool.query('SELECT * FROM service_agreements WHERE id = ?', [result.insertId]);
    res.status(201).json(newAgreement[0]);
  } catch (error) {
    console.error('❌ Create Service Agreement Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.put('/api/service-agreements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required.' });
    }
    await pool.query('UPDATE service_agreements SET title = ?, content = ? WHERE id = ?', [title, content || null, id]);
    const [updated] = await pool.query('SELECT * FROM service_agreements WHERE id = ?', [id]);
    res.json(updated[0]);
  } catch (error) {
    console.error('❌ Update Service Agreement Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.delete('/api/service-agreements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM service_agreements WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Delete Service Agreement Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ======================
// PRICING ENDPOINTS
// ======================

app.get('/api/pricing', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pricing ORDER BY display_order ASC, id ASC');
    res.json(rows);
  } catch (error) {
    console.error('❌ List Pricing Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.get('/api/pricing/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM pricing WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Pricing plan not found.' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('❌ Get Pricing Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/pricing', async (req, res) => {
  try {
    const { plan, price, features, popular, display_order } = req.body;
    if (!plan || price === undefined) {
      return res.status(400).json({ error: 'Plan and price are required.' });
    }
    const [result] = await pool.query(
      'INSERT INTO pricing (plan, price, features, popular, display_order) VALUES (?, ?, ?, ?, ?)',
      [plan, price, features || null, popular ? 1 : 0, display_order || 0]
    );
    const [newPricing] = await pool.query('SELECT * FROM pricing WHERE id = ?', [result.insertId]);
    res.status(201).json(newPricing[0]);
  } catch (error) {
    console.error('❌ Create Pricing Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.put('/api/pricing/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { plan, price, features, popular, display_order } = req.body;
    if (!plan || price === undefined) {
      return res.status(400).json({ error: 'Plan and price are required.' });
    }
    await pool.query(
      'UPDATE pricing SET plan = ?, price = ?, features = ?, popular = ?, display_order = ? WHERE id = ?',
      [plan, price, features || null, popular ? 1 : 0, display_order || 0, id]
    );
    const [updated] = await pool.query('SELECT * FROM pricing WHERE id = ?', [id]);
    res.json(updated[0]);
  } catch (error) {
    console.error('❌ Update Pricing Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.delete('/api/pricing/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM pricing WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Delete Pricing Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ======================
// PRIVACY POLICIES ENDPOINTS
// ======================

app.get('/api/privacy-policies', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM privacy_policies ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('❌ List Privacy Policies Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.get('/api/privacy-policies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM privacy_policies WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Privacy policy not found.' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('❌ Get Privacy Policy Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/privacy-policies', async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required.' });
    }
    const [result] = await pool.query('INSERT INTO privacy_policies (title, content) VALUES (?, ?)', [title, content || null]);
    const [newPolicy] = await pool.query('SELECT * FROM privacy_policies WHERE id = ?', [result.insertId]);
    res.status(201).json(newPolicy[0]);
  } catch (error) {
    console.error('❌ Create Privacy Policy Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.put('/api/privacy-policies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required.' });
    }
    await pool.query('UPDATE privacy_policies SET title = ?, content = ? WHERE id = ?', [title, content || null, id]);
    const [updated] = await pool.query('SELECT * FROM privacy_policies WHERE id = ?', [id]);
    res.json(updated[0]);
  } catch (error) {
    console.error('❌ Update Privacy Policy Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.delete('/api/privacy-policies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM privacy_policies WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Delete Privacy Policy Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ======================
// SUSTAINABILITY DIRECT ENDPOINTS
// ======================

const initSustainabilityTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sustainability_sections (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      badge VARCHAR(50) DEFAULT '',
      text TEXT,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
};

app.get('/api/legal/sustainability/sections', async (req, res) => {
  try {
    await initSustainabilityTable();
    const [rows] = await pool.query('SELECT * FROM sustainability_sections ORDER BY sort_order ASC, id ASC');
    if (rows.length === 0) {
      const DEFAULT_SUSTAINABILITY_SECTIONS = [
        { title: '0. ESG Strategy: Driving Digital Sustainability', badge: null, text: "Satesoft's ESG strategy integrates environmental stewardship, social responsibility, and governance into our core business model. We recognize that technology companies have a unique opportunity—and responsibility—to drive sustainable digital transformation across Africa and beyond. Our strategy is built on science-based targets, stakeholder engagement, and transparent disclosure. We align with the UN Sustainable Development Goals (SDGs), focusing on affordable clean energy (SDG 7), decent work and economic growth (SDG 8), industry innovation (SDG 9), and climate action (SDG 13). By embedding sustainability into product design, operations, and partnerships, we aim to create long-term value for our clients, employees, and the communities we serve.", sort_order: 0 },
        { title: '1. Circular Economy & E-Waste Stewardship', badge: 'COLLAPSIBLE', text: 'We are committed to minimizing electronic waste through responsible device lifecycle management. Our initiatives include partnerships with certified e-waste recyclers, refurbishment programs for retired hardware, and supplier requirements for take-back schemes. By 2027, we aim to divert 100% of our e-waste from landfills and extend the useful life of devices through repair, reuse, and responsible material recovery. We also work with clients to establish circular IT procurement policies that prioritize durability, repairability, and end-of-life recycling.', sort_order: 1 },
        { title: '2. Decarbonizing Digital Infrastructure', badge: 'COLLAPSIBLE', text: 'Our digital infrastructure is being decarbonized through renewable energy procurement, energy-efficient data center design, and carbon-aware cloud architectures. We track Scope 1, 2, and 3 emissions and publish annual carbon footprint reports. Our target is a 50% reduction in absolute emissions by 2028. We optimize compute workloads to run during periods of low grid carbon intensity, consolidate underutilized servers, and invest in next-generation cooling technologies. Our cloud partners are selected partly based on their renewable energy commitments and carbon transparency.', sort_order: 2 },
        { title: '3. Low-Carbon Service Delivery', badge: 'COLLAPSIBLE', text: 'We optimize our software and services for energy efficiency. From lightweight code deployments to edge computing strategies that reduce data transmission distances, every layer of our service delivery model is evaluated for carbon impact. We help clients measure and reduce the carbon footprint of their digital operations through sustainability dashboards, green software audits, and carbon-aware architecture guidance. Our engineering teams follow green coding practices that minimize CPU cycles, memory usage, and network transfers—reducing both cost and environmental impact.', sort_order: 3 },
        { title: '4. Ecosystem Protection & Climate Resilience', badge: 'COLLAPSIBLE', text: 'Beyond our operational footprint, we invest in ecosystem restoration and climate resilience projects. This includes reforestation partnerships, water conservation programs in our offices, and climate-risk assessments for our supply chain. We align with the Task Force on Climate-related Financial Disclosures (TCFD) framework and integrate climate risk into our enterprise risk management process. Our community programs support climate-smart agriculture, wetland restoration, and biodiversity monitoring using our own technology platforms.', sort_order: 4 },
        { title: '5. Social Impact: Enabling Client Sustainability', badge: 'COLLAPSIBLE', text: 'Our greatest impact comes from empowering clients to achieve their sustainability goals. Through Duqact, we provide supply chain transparency tools that reduce food waste and logistics emissions. Through FoundDocument, we enable paperless operations that save millions of pages annually. We measure the avoided emissions generated by client use of our platforms and publish these impact metrics in our annual ESG report. Our digital literacy programs also ensure that sustainability benefits are accessible to small businesses and informal sector operators across Africa.', sort_order: 5 },
        { title: '6. Governance & Accountability', badge: 'COLLAPSIBLE', text: 'Sustainability governance is embedded in our board structure and executive compensation. Our ESG Committee meets quarterly to review targets, risks, and disclosures. We undergo third-party audits of our environmental data and maintain transparent reporting aligned with GRI and SASB standards. Our code of conduct applies to all employees, suppliers, and partners, with zero tolerance for greenwashing or misleading environmental claims. We maintain a whistleblower policy and independent oversight for all ESG-related disclosures.', sort_order: 6 }
      ];
      for (const section of DEFAULT_SUSTAINABILITY_SECTIONS) {
        await pool.query('INSERT INTO sustainability_sections (title, badge, text, sort_order) VALUES (?, ?, ?, ?)', [section.title, section.badge, section.text, section.sort_order]);
      }
      const [newRows] = await pool.query('SELECT * FROM sustainability_sections ORDER BY sort_order ASC, id ASC');
      return res.json(newRows);
    }
    res.json(rows);
  } catch (error) {
    console.error('Fetch Sustainability Error:', error);
    res.status(500).json({ error: 'Failed to fetch sustainability sections' });
  }
});

app.post('/api/legal/sustainability/section', verifyToken, async (req, res) => {
  try {
    await initSustainabilityTable();
    let { title, badge, text, sort_order } = req.body;
    const cleanTitle = String(title || '').replace(/^(\d+\.|\s)+/g, '').trim();

    const [maxRows] = await pool.query('SELECT MAX(sort_order) AS max_sort FROM sustainability_sections');
    const nextSort = sort_order !== undefined && sort_order !== '' 
      ? parseInt(sort_order, 10) 
      : (maxRows[0]?.max_sort ?? -1) + 1;

    const [result] = await pool.query(
      'INSERT INTO sustainability_sections (title, badge, text, sort_order) VALUES (?, ?, ?, ?)',
      [cleanTitle, badge || '', text || '', nextSort]
    );

    const [rows] = await pool.query('SELECT * FROM sustainability_sections WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Add Sustainability Error:', err);
    res.status(500).json({ error: 'Failed to save section: API endpoint error' });
  }
});

app.put('/api/legal/sustainability/section/:id', verifyToken, async (req, res) => {
  try {
    let { title, badge, text, sort_order } = req.body;
    const cleanTitle = title !== undefined ? String(title).replace(/^(\d+\.|\s)+/g, '').trim() : undefined;

    await pool.query(
      'UPDATE sustainability_sections SET title = COALESCE(?, title), badge = COALESCE(?, badge), text = COALESCE(?, text), sort_order = COALESCE(?, sort_order) WHERE id = ?',
      [cleanTitle, badge, text, sort_order, req.params.id]
    );

    const [rows] = await pool.query('SELECT * FROM sustainability_sections WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Update Sustainability Error:', err);
    res.status(500).json({ error: 'Failed to update section' });
  }
});

app.delete('/api/legal/sustainability/section/:id', verifyToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM sustainability_sections WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('Delete Sustainability Error:', err);
    res.status(500).json({ error: 'Failed to delete section' });
  }
});

app.post('/api/legal/sustainability/reset-seed', verifyToken, async (req, res) => {
  try {
    await pool.query(`DROP TABLE IF EXISTS sustainability_sections`);
    await initSustainabilityTable();
    const DEFAULT_SUSTAINABILITY_SECTIONS = [
      { title: '0. ESG Strategy: Driving Digital Sustainability', badge: null, text: "Satesoft's ESG strategy integrates environmental stewardship, social responsibility, and governance into our core business model. We recognize that technology companies have a unique opportunity—and responsibility—to drive sustainable digital transformation across Africa and beyond. Our strategy is built on science-based targets, stakeholder engagement, and transparent disclosure. We align with the UN Sustainable Development Goals (SDGs), focusing on affordable clean energy (SDG 7), decent work and economic growth (SDG 8), industry innovation (SDG 9), and climate action (SDG 13). By embedding sustainability into product design, operations, and partnerships, we aim to create long-term value for our clients, employees, and the communities we serve.", sort_order: 0 },
      { title: '1. Circular Economy & E-Waste Stewardship', badge: 'COLLAPSIBLE', text: 'We are committed to minimizing electronic waste through responsible device lifecycle management. Our initiatives include partnerships with certified e-waste recyclers, refurbishment programs for retired hardware, and supplier requirements for take-back schemes. By 2027, we aim to divert 100% of our e-waste from landfills and extend the useful life of devices through repair, reuse, and responsible material recovery. We also work with clients to establish circular IT procurement policies that prioritize durability, repairability, and end-of-life recycling.', sort_order: 1 },
      { title: '2. Decarbonizing Digital Infrastructure', badge: 'COLLAPSIBLE', text: 'Our digital infrastructure is being decarbonized through renewable energy procurement, energy-efficient data center design, and carbon-aware cloud architectures. We track Scope 1, 2, and 3 emissions and publish annual carbon footprint reports. Our target is a 50% reduction in absolute emissions by 2028. We optimize compute workloads to run during periods of low grid carbon intensity, consolidate underutilized servers, and invest in next-generation cooling technologies. Our cloud partners are selected partly based on their renewable energy commitments and carbon transparency.', sort_order: 2 },
      { title: '3. Low-Carbon Service Delivery', badge: 'COLLAPSIBLE', text: 'We optimize our software and services for energy efficiency. From lightweight code deployments to edge computing strategies that reduce data transmission distances, every layer of our service delivery model is evaluated for carbon impact. We help clients measure and reduce the carbon footprint of their digital operations through sustainability dashboards, green software audits, and carbon-aware architecture guidance. Our engineering teams follow green coding practices that minimize CPU cycles, memory usage, and network transfers—reducing both cost and environmental impact.', sort_order: 3 },
      { title: '4. Ecosystem Protection & Climate Resilience', badge: 'COLLAPSIBLE', text: 'Beyond our operational footprint, we invest in ecosystem restoration and climate resilience projects. This includes reforestation partnerships, water conservation programs in our offices, and climate-risk assessments for our supply chain. We align with the Task Force on Climate-related Financial Disclosures (TCFD) framework and integrate climate risk into our enterprise risk management process. Our community programs support climate-smart agriculture, wetland restoration, and biodiversity monitoring using our own technology platforms.', sort_order: 4 },
      { title: '5. Social Impact: Enabling Client Sustainability', badge: 'COLLAPSIBLE', text: 'Our greatest impact comes from empowering clients to achieve their sustainability goals. Through Duqact, we provide supply chain transparency tools that reduce food waste and logistics emissions. Through FoundDocument, we enable paperless operations that save millions of pages annually. We measure the avoided emissions generated by client use of our platforms and publish these impact metrics in our annual ESG report. Our digital literacy programs also ensure that sustainability benefits are accessible to small businesses and informal sector operators across Africa.', sort_order: 5 },
      { title: '6. Governance & Accountability', badge: 'COLLAPSIBLE', text: 'Sustainability governance is embedded in our board structure and executive compensation. Our ESG Committee meets quarterly to review targets, risks, and disclosures. We undergo third-party audits of our environmental data and maintain transparent reporting aligned with GRI and SASB standards. Our code of conduct applies to all employees, suppliers, and partners, with zero tolerance for greenwashing or misleading environmental claims. We maintain a whistleblower policy and independent oversight for all ESG-related disclosures.', sort_order: 6 }
    ];
    for (const section of DEFAULT_SUSTAINABILITY_SECTIONS) {
      await pool.query('INSERT INTO sustainability_sections (title, badge, text, sort_order) VALUES (?, ?, ?, ?)', [section.title, section.badge, section.text, section.sort_order]);
    }
    const [rows] = await pool.query('SELECT * FROM sustainability_sections ORDER BY sort_order ASC, id ASC');
    return res.json({ message: 'Database successfully reset and seeded', data: rows });
  } catch (err) {
    console.error('Reset Seed Failed:', err);
    return res.status(500).json({ error: 'Failed to reset database' });
  }
});

// GET Sustainability Content
app.get('/api/legal/sustainability', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT content FROM sustainability_pages WHERE is_active = 1 LIMIT 1');
    if (rows.length === 0 || !rows[0].content) {
      const defaultContent = `0. Environmental, Social, and Governance (ESG) Commitment
Satesoft Corporation Limited is committed to conducting operations sustainably across Kenya, Uganda, and our continental African expansion. We actively incorporate eco-friendly digital infrastructure, responsible resource utilization, and strong socio-economic governance across all product platforms.`;
      return res.json({ content: defaultContent });
    }
    res.json({ content: rows[0].content });
  } catch (error) {
    console.error('Fetch Sustainability Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST Save/Update Sustainability Content
app.post('/api/legal/sustainability', verifyToken, async (req, res) => {
  try {
    const { content } = req.body;
    const [existing] = await pool.query('SELECT id FROM sustainability_pages WHERE is_active = 1 LIMIT 1');
    if (existing.length > 0) {
      await pool.query('UPDATE sustainability_pages SET content = ? WHERE id = ?', [content || '', existing[0].id]);
    } else {
      await pool.query('INSERT INTO sustainability_pages (title, content, is_active) VALUES (?, ?, 1)', ['Sustainability Policy', content || '']);
    }
    res.json({ success: true, content: content || '' });
  } catch (error) {
    console.error('Save Sustainability Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST Restore Default Sustainability Content
app.post('/api/legal/sustainability/restore', verifyToken, async (req, res) => {
  try {
    const defaultContent = 'Satesoft Corporation Limited is committed to sustainable business operations, energy-efficient cloud software architecture, transparent corporate governance, and community development across all operational markets.';
    const [existing] = await pool.query('SELECT id FROM sustainability_pages WHERE is_active = 1 LIMIT 1');
    if (existing.length > 0) {
      await pool.query('UPDATE sustainability_pages SET content = ? WHERE id = ?', [defaultContent, existing[0].id]);
    } else {
      await pool.query('INSERT INTO sustainability_pages (title, content, is_active) VALUES (?, ?, 1)', ['Sustainability Policy', defaultContent]);
    }
    res.json({ success: true, content: defaultContent });
  } catch (error) {
    console.error('Restore Sustainability Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ======================
// PRIVACY POLICY SECTIONS ROUTES
// ======================

app.use('/api', privacyPolicyRoutes);
app.use('/api', serviceAgreementRoutes);

const DEFAULT_PRIVACY_SECTIONS = [
  { section_number: "1", title: "Introduction", content: "Satesoft Corporation Limited operates and manages software services across Africa. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our platforms, or engage with our services." },
  { section_number: "2", title: "Information We Collect", content: "We collect personal data that you voluntarily provide to us when registering for services, including name, email address, phone number, job title, and company name. We also collect usage data such as IP addresses, browser types, operating systems, device identifiers, and access timestamps." },
  { section_number: "3", title: "How We Use Your Information", content: "We use the information we collect to operate, maintain, and provide our core features, communicate system updates, process transactions, prevent fraud, and comply with legal and regulatory requirements." },
  { section_number: "4", title: "Data Sharing and Disclosure", content: "We do not sell your personal data. We may share data with trusted service providers such as cloud hosting and payment processors, legal authorities when required by law, or in connection with a corporate reorganization or acquisition." },
  { section_number: "5", title: "Data Security", content: "We implement robust technical and organizational measures to safeguard your data, including encryption in transit and at rest, access controls, and regular security audits." },
  { section_number: "6", title: "Data Retention", content: "We retain personal information only for as long as necessary to fulfill the purposes outlined in this policy, including to satisfy legal, accounting, or reporting requirements." },
  { section_number: "7", title: "Your Rights and Choices", content: "Depending on your jurisdiction, you have rights regarding your personal data access and deletion. To exercise these rights, contact our Data Protection Office at privacy@satesoft.com." },
  { section_number: "8", title: "Cookies and Tracking Technologies", content: "We use cookies and similar tracking technologies to analyze traffic and customize experience. Essential cookies are used for session management and security. Analytical cookies are used only with your consent." },
  { section_number: "9", title: "Third-Party Services", content: "Our services may contain links to third-party websites or services not operated by us. We are not responsible for the privacy practices or content of these external sites." },
  { section_number: "10", title: "International Data Transfers", content: "Your information may be transferred to and maintained on servers located outside your jurisdiction. We ensure appropriate safeguards are in place for such transfers." },
  { section_number: "11", title: "Changes to This Policy", content: "We may update this Privacy Policy from time to time to reflect changes in our practices. The updated version will be indicated by an updated Effective Date at the top of the policy." },
  { section_number: "12", title: "Contact Us", content: "If you have questions or concerns about this Privacy Policy, please contact us at privacy@satesoft.com or +256 700 000 000." }
];

app.post('/api/privacy-policy/restore', async (req, res) => {
  try {
    await pool.query('TRUNCATE TABLE privacy_policy_sections');
    for (const sec of DEFAULT_PRIVACY_SECTIONS) {
      await pool.query(
        'INSERT INTO privacy_policy_sections (section_number, title, content) VALUES (?, ?, ?)',
        [sec.section_number, sec.title, sec.content]
      );
    }
    const [rows] = await pool.query('SELECT * FROM privacy_policy_sections ORDER BY CAST(section_number AS UNSIGNED) ASC');
    return res.json({ message: 'Default content restored successfully', data: rows });
  } catch (error) {
    console.error('Error restoring privacy policy:', error);
    return res.status(500).json({ error: 'Database seed failed' });
  }
});



// ======================
// SERVICE AGREEMENT CONTENT ENDPOINTS
// ======================

app.get('/api/legal/service-agreement', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT content FROM service_agreements WHERE is_active = 1 LIMIT 1');
    if (rows.length === 0 || !rows[0].content) {
      const defaultContent = `0. Introduction
These Terms and Conditions ("Terms") govern your access to and use of the digital products, platforms, applications, websites, and support services provided by Satesoft Corporation Limited and its subsidiaries (collectively, "Satesoft," "we," "us," or "our"). By creating an account, downloading any Satesoft application, or continuing to use the Services after notification of any change to these Terms, you agree to be bound by them. Satesoft Corporation Limited is a technology company incorporated and registered in the Republic of Kenya, with a subsidiary registered in Uganda and other subsidiary operations across the African continent. References to "Satesoft" in these Terms refer to Satesoft Corporation Limited and, where applicable, its respective subsidiaries. These Terms cover the following Satesoft products and services (collectively, the "Services"):
• Duqact — Retail Intelligence Platform
• Karibyshoo — Smart Attendance and Parking Management System
• FoundDocument — Digital Document Recovery System
• Any other future Satesoft products and services.

1. Your Privacy
Your privacy is important to us. Please read the Satesoft Privacy Policy carefully, as it describes the types of data we collect from you and your devices, how we use your data, and the legal bases we have to process your data.

2. Your Content
Many of our Services allow you to create, store, or share Your Content or receive material from others. Satesoft does not claim ownership of Your Content. Your Content remains your property and you are responsible for it. You grant Satesoft a worldwide, royalty-free license to host, store, and process Your Content solely to provide the Services.
a. Sharing Your Content: You retain ownership of any intellectual property rights you hold in Your Content.
b. License to Use Your Content: You grant Satesoft a limited, non-exclusive, worldwide, royalty-free license to use, reproduce, modify, adapt, publish, translate, distribute, and exploit Your Content for the purpose of providing and improving the Services.
c. Data Export: You may request export of Your Content by contacting legal@satesoft.com.

3. Code Of Conduct
You are accountable for your conduct and content when using the Services. You must not engage in any illegal activity, upload malicious code, attempt unauthorized access to system resources, interfere with network operations, or violate the rights of other users.
a. You must not use the Services for any illegal or unauthorized purpose.
b. You must not exploit, harm, or attempt to exploit or harm minors.
c. You must not transmit any unsolicited or unauthorized advertising or promotional materials.
d. You must not transmit any material that is unlawful, harassing, libelous, defamatory, obscene, or otherwise objectionable.
e. You must not engage in fraudulent behavior or misrepresent your affiliation with any person or entity.
f. You must not attempt to jailbreak, reverse engineer, or manipulate AI models or automated systems.
g. You must not harass, threaten, or intimidate other users.
h. You must not infringe on any copyright, trademark, or other intellectual property rights.
i. You must not violate any person's right to privacy or publicity.
j. You must not interfere with or disrupt the Services or servers or networks connected to the Services.

4. Using The Services & Support
a. Satesoft Account: You will need a Satesoft account to access many of the Services. Your account credentials must be kept secure.
i. You are responsible for maintaining the confidentiality of your account credentials.
ii. You must notify Satesoft immediately of any unauthorized use of your account.
iii. You must ensure that your account information is accurate and up-to-date.
iv. You may not share your account credentials with any third party.
b. Moderation and Enforcement: Satesoft reserves the right to moderate, restrict, or remove content that violates these Terms.
c. Service Notifications: Satesoft may send you notifications related to your use of the Services.
d. Support for the Services: Satesoft provides customer support according to the service level agreements (SLA) defined in your enterprise subscription tier.
e. Ending Your Services: You may stop using the Services at any time. We may terminate your access to the Services if you violate these Terms.

5. Using Third-Party Apps And Services
The Services may allow you to access or acquire products, services, websites, links, content, or integrations provided by third parties. Satesoft is not responsible for third-party tools and makes no warranties regarding their availability or security. Your use of third-party services is governed by their respective terms and privacy policies.

6. Service Availability
The Services, Third-Party Apps and Services, or materials or products offered through the Services may be unavailable from time to time due to routine maintenance, updates, or unforeseen technical disruptions. We strive to maintain maximum uptime as specified in our SLA. Satesoft shall not be liable for any loss, damage, or inconvenience arising from such unavailability.

7. Updates To The Services Or Software, And Changes To These Terms
We may change these Terms at any time, and we will notify you when we do. Material changes will be notified at least 30 days before they take effect. Using the Services after the changes become effective means you agree to the new terms. We may also check your version of software and download software updates or configuration changes to your device. These updates are designed to improve, enhance, and further develop the Services and may take the form of bug fixes, enhanced functions, new software modules, or entirely new versions.

8. Software License
Unless accompanied by a separate Satesoft license agreement, any software provided by us to you as part of the Services is subject to these Terms. Software is licensed, not sold, and Satesoft reserves all rights to the software not expressly granted. You may not: disassemble, decompile, decrypt, reverse engineer, publish, copy, rent, lease, sell, export, import, distribute, or create derivative works from the software except as permitted by law.

9. Payment Terms
If you purchase a Service, then these payment terms apply to your purchase and you agree to them. Charges are billed in advance based on your selected billing cycle. All applicable taxes are your responsibility unless specified otherwise.
a. Charges: You agree to pay all charges for the Services at the prices then in effect.
b. Your Billing Account: You must provide valid billing information and keep it current.
c. Recurring Payments: Subscriptions renew automatically unless canceled before the renewal date.
d. Refund Policy: Refund requests must be submitted within 90 days of the charge.
e. Price Changes: We may change prices with 30 days advance notice.
f. Canceling the Services: You may cancel at any time through your account settings or by contacting support.

10. Contracting Entity, Choice Of Law, And Jurisdiction
a. Contracting Entity: You are contracting with Satesoft Corporation Limited, incorporated and registered in the Republic of Kenya.
b. Choice of Law: These Terms are governed by the laws of the Republic of Kenya without regard to conflict of law principles.
c. Jurisdictional Framework:
i. In Kenya (Parent Company): Kenya Data Protection Act 2019, Kenya Information and Communications Act, Computer Misuse and Cybercrimes Act 2018, Virtual Assets Service Providers Act 2023.
ii. In Uganda (Registered Subsidiary): Uganda Data Protection and Privacy Act 2019, Electronic Transactions Act, Computer Misuse Act.
iii. In the European Union (EU) and EEA: GDPR & Standard Contractual Clauses (SCCs).
iv. In the United Kingdom (UK): UK GDPR & Data Protection Act 2018.

11. Registered Jurisdictions And Applicable Data Protection Laws
The following table sets out the jurisdictions in which Satesoft Corporation Limited is registered and operates. Personal data processing complies with continental standards like the African Union Convention on Cyber Security and Personal Data Protection (Malabo Convention) alongside applicable regional statutory laws. Satesoft ensures that cross-border data transfers are conducted in accordance with applicable legal frameworks including adequacy decisions, Standard Contractual Clauses, and Binding Corporate Rules where applicable.

12. Warranties
DISCLAIMER: SATESOFT, AND ITS AFFILIATES, RESELLERS, DISTRIBUTORS, AND VENDORS, MAKE NO WARRANTIES, EXPRESS OR IMPLIED, GUARANTEES, OR CONDITIONS WITH RESPECT TO YOUR USE OF THE SERVICES. YOU UNDERSTAND THAT USE OF THE SERVICES IS AT YOUR OWN RISK AND THAT WE PROVIDE THE SERVICES ON AN "AS IS" BASIS "WITH ALL FAULTS" AND "AS AVAILABLE." YOU BEAR THE ENTIRE RISK OF USING THE SERVICES. SATESOFT DOES NOT GUARANTEE THE ACCURACY OR TIMELINESS OF THE SERVICES. TO THE EXTENT PERMITTED UNDER YOUR LOCAL LAW, WE EXCLUDE ANY IMPLIED WARRANTIES, INCLUDING FOR MERCHANTABILITY, SATISFACTORY QUALITY, FITNESS FOR A PARTICULAR PURPOSE, WORKMANLIKE EFFORT, AND NON-INFRINGEMENT. NOTHING IN THESE TERMS SHALL AFFECT THOSE STATUTORY RIGHTS WHICH YOU ARE ALWAYS ENTITLED TO AS A CONSUMER AND THAT YOU CANNOT CONTRACTUALLY AGREE TO ALTER OR WAIVE.

13. Limitation Of Liability
If you have any basis for recovering damages (including breach of these Terms), you agree that your exclusive remedy is to recover, from Satesoft or any affiliates, resellers, distributors, Third-Party Apps and Services providers, and vendors, direct damages up to an amount equal to your Services fee for the month during which the loss or breach occurred (or up to USD 10.00 if the Services are free). You cannot recover any other damages or losses, including direct, consequential, lost profits, special, indirect, incidental, or punitive damages. These limitations and exclusions apply even if this remedy does not fully compensate you for any losses, or if we knew or should have known about the possibility of the damages. To the maximum extent permitted by law, these limitations and exclusions apply to anything or any claims related to these Terms, the Services, or the software related to the Services.`;
      return res.json({ content: defaultContent });
    }
    res.json({ content: rows[0].content });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/legal/service-agreement', verifyToken, async (req, res) => {
  try {
    const { content } = req.body;
    const [existing] = await pool.query('SELECT id FROM service_agreements WHERE is_active = 1 LIMIT 1');
    if (existing.length > 0) {
      await pool.query('UPDATE service_agreements SET content = ? WHERE id = ?', [content || '', existing[0].id]);
    } else {
      await pool.query('INSERT INTO service_agreements (title, content, is_active) VALUES (?, ?, 1)', ['Service Agreement', content || '']);
    }
    res.json({ success: true, content: content || '' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/legal/service-agreement/restore', verifyToken, async (req, res) => {
  try {
    const defaultContent = 'These Terms and Conditions ("Terms") govern your access to and use of the digital products, platforms, applications, websites, and support services provided by Satesoft Corporation Limited. By accessing or using any of our Services, you agree to be bound by these Terms. If you do not agree to these Terms, you may not use the Services.';
    const [existing] = await pool.query('SELECT id FROM service_agreements WHERE is_active = 1 LIMIT 1');
    if (existing.length > 0) {
      await pool.query('UPDATE service_agreements SET content = ? WHERE id = ?', [defaultContent, existing[0].id]);
    } else {
      await pool.query('INSERT INTO service_agreements (title, content, is_active) VALUES (?, ?, 1)', ['Service Agreement', defaultContent]);
    }
    res.json({ success: true, content: defaultContent });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ======================
// CONTACTS ENDPOINTS
// ======================

app.get('/api/contacts', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM contacts ORDER BY id');
    res.json(rows);
  } catch (error) {
    console.error('❌ List Contacts Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.get('/api/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM contacts WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found.' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('❌ Get Contact Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/contacts', async (req, res) => {
  try {
    const { placeholder_id, contact_point, purpose_context, section, category } = req.body;
    if (!contact_point) {
      return res.status(400).json({ error: 'Contact point is required.' });
    }
    const [result] = await pool.query(
      'INSERT INTO contacts (placeholder_id, contact_point, purpose_context, section, category) VALUES (?, ?, ?, ?, ?)',
      [placeholder_id || null, contact_point, purpose_context || null, section || null, category || 'general']
    );
    const [newContact] = await pool.query('SELECT * FROM contacts WHERE id = ?', [result.insertId]);
    res.status(201).json(newContact[0]);
  } catch (error) {
    console.error('❌ Create Contact Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.put('/api/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { placeholder_id, contact_point, purpose_context, section, category } = req.body;
    if (!contact_point) {
      return res.status(400).json({ error: 'Contact point is required.' });
    }
    await pool.query(
      'UPDATE contacts SET placeholder_id = ?, contact_point = ?, purpose_context = ?, section = ?, category = ? WHERE id = ?',
      [placeholder_id || null, contact_point, purpose_context || null, section || null, category || 'general', id]
    );
    const [updated] = await pool.query('SELECT * FROM contacts WHERE id = ?', [id]);
    res.json(updated[0]);
  } catch (error) {
    console.error('❌ Update Contact Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.delete('/api/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM contacts WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Delete Contact Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ======================
// JURISDICTIONS ENDPOINTS
// ======================

app.get('/api/jurisdictions', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM jurisdictions ORDER BY id');
    res.json(rows);
  } catch (error) {
    console.error('❌ List Jurisdictions Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.get('/api/jurisdictions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM jurisdictions WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Jurisdiction not found.' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('❌ Get Jurisdiction Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/jurisdictions', async (req, res) => {
  try {
    const { name, code, courts, laws } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required.' });
    }
    const [result] = await pool.query(
      'INSERT INTO jurisdictions (name, code, courts, laws) VALUES (?, ?, ?, ?)',
      [name, code || null, courts || null, laws || null]
    );
    const [newJurisdiction] = await pool.query('SELECT * FROM jurisdictions WHERE id = ?', [result.insertId]);
    res.status(201).json(newJurisdiction[0]);
  } catch (error) {
    console.error('❌ Create Jurisdiction Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.put('/api/jurisdictions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, courts, laws } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required.' });
    }
    await pool.query(
      'UPDATE jurisdictions SET name = ?, code = ?, courts = ?, laws = ? WHERE id = ?',
      [name, code || null, courts || null, laws || null, id]
    );
    const [updated] = await pool.query('SELECT * FROM jurisdictions WHERE id = ?', [id]);
    res.json(updated[0]);
  } catch (error) {
    console.error('❌ Update Jurisdiction Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.delete('/api/jurisdictions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM jurisdictions WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Delete Jurisdiction Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ======================
// JOB OPPORTUNITIES ENDPOINTS
// ======================

app.get('/api/jobs', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM job_opportunities ORDER BY id');
    res.json(rows.map((row) => ({ ...row, keyRequirements: row.key_requirements || '' })));
  } catch (error) {
    console.error('❌ List Jobs Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.get('/api/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM job_opportunities WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Job not found.' });
    }
    res.json({ ...rows[0], keyRequirements: rows[0].key_requirements || '' });
  } catch (error) {
    console.error('❌ Get Job Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/jobs', verifyToken, async (req, res) => {
  try {
    const { title, location, type, keyRequirements, description, applications, status } = req.body;
    if (!title || !location || !type) {
      return res.status(400).json({ error: 'Title, location, and type are required.' });
    }
    const [result] = await pool.query(
      'INSERT INTO job_opportunities (title, location, type, key_requirements, description, applications, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, location, type, keyRequirements || null, description || null, applications || 0, status || 'Active']
    );
    res.status(201).json({ id: result.insertId, title, location, type, keyRequirements: keyRequirements || null, description: description || null, applications: applications || 0, status: status || 'Active' });
  } catch (error) {
    console.error('❌ Add Job Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.put('/api/jobs/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, location, type, keyRequirements, description, applications, status } = req.body;
    if (!title || !location || !type) {
      return res.status(400).json({ error: 'Title, location, and type are required.' });
    }
    await pool.query(
      'UPDATE job_opportunities SET title = ?, location = ?, type = ?, key_requirements = ?, description = ?, applications = ?, status = ? WHERE id = ?',
      [title, location, type, keyRequirements || null, description || null, applications || 0, status || 'Active', id]
    );
    res.json({ id: Number(id), title, location, type, keyRequirements: keyRequirements || null, description: description || null, applications: applications || 0, status: status || 'Active' });
  } catch (error) {
    console.error('❌ Update Job Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.delete('/api/jobs/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM job_opportunities WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Delete Job Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ======================
// APPLICANTS ENDPOINTS
// ======================

app.get('/api/applicants', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM applicants ORDER BY created_at DESC, id DESC');
    res.json(rows.map((row) => ({ ...row, appliedDate: normalizeDate(row.applied_date) })));
  } catch (error) {
    console.error('❌ List Applicants Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.get('/api/applicants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM applicants WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Applicant not found.' });
    }
    res.json({ ...rows[0], appliedDate: normalizeDate(rows[0].applied_date) });
  } catch (error) {
    console.error('❌ Get Applicant Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/applicants', verifyToken, async (req, res) => {
  try {
    const { name, email, opportunity, sex, experience, appliedDate, status } = req.body;
    if (!name || !opportunity) {
      return res.status(400).json({ error: 'Name and opportunity are required.' });
    }
    const [result] = await pool.query(
      'INSERT INTO applicants (name, email, opportunity, sex, experience, applied_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email || null, opportunity, sex || null, experience || null, appliedDate || null, status || 'PENDING']
    );
    res.status(201).json({ id: result.insertId, name, email: email || null, opportunity, sex: sex || null, experience: experience || null, applied_date: appliedDate || null, status: status || 'PENDING' });
  } catch (error) {
    console.error('❌ Add Applicant Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.put('/api/applicants/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, opportunity, sex, experience, appliedDate, status } = req.body;
    if (!name || !opportunity) {
      return res.status(400).json({ error: 'Name and opportunity are required.' });
    }
    await pool.query(
      'UPDATE applicants SET name = ?, email = ?, opportunity = ?, sex = ?, experience = ?, applied_date = ?, status = ? WHERE id = ?',
      [name, email || null, opportunity, sex || null, experience || null, appliedDate || null, status || 'PENDING', id]
    );
    res.json({ id: Number(id), name, email: email || null, opportunity, sex: sex || null, experience: experience || null, applied_date: appliedDate || null, status: status || 'PENDING' });
  } catch (error) {
    console.error('❌ Update Applicant Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.delete('/api/applicants/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM applicants WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Delete Applicant Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ======================
// MESSAGE ENDPOINTS
// ======================

app.get('/api/messages', async (req, res) => {
  try {
    const { folder } = req.query;
    let query;
    if (folder === 'starred') {
      query = "SELECT * FROM messages WHERE is_starred = 1 AND folder != 'trash' ORDER BY sent_date DESC";
    } else if (folder === 'sent') {
      query = "SELECT * FROM messages WHERE folder = 'sent' ORDER BY sent_date DESC";
    } else if (folder === 'drafts') {
      query = "SELECT * FROM messages WHERE folder = 'drafts' ORDER BY sent_date DESC";
    } else if (folder === 'spam') {
      query = "SELECT * FROM messages WHERE folder = 'spam' ORDER BY sent_date DESC";
    } else if (folder === 'trash') {
      query = "SELECT * FROM messages WHERE folder = 'trash' ORDER BY sent_date DESC";
    } else {
      query = "SELECT * FROM messages WHERE folder = 'inbox' ORDER BY sent_date DESC";
    }

    const [rows] = await pool.query(query);
    const messages = rows.map((row) => ({
      id: row.id,
      sender: row.sender_name,
      email: row.sender_email,
      recipient: row.recipient_name,
      recipientEmail: row.recipient_email,
      subject: row.subject,
      body: row.body,
      preview: row.body ? row.body.substring(0, 80) + (row.body.length > 80 ? '...' : '') : '',
      date: normalizeDate(row.sent_date),
      folder: row.folder,
      read: row.is_read === 1,
      starred: row.is_starred === 1,
      label: row.label || null,
    }));
    res.json(messages);
  } catch (error) {
    console.error('❌ List Messages Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.get('/api/messages/sync', async (req, res) => {
  try {
    if (!IMAP_USER || !IMAP_PASS || IMAP_USER.includes('your-email') || IMAP_PASS.includes('your-app-password')) {
      return res.status(400).json({ error: 'IMAP credentials are not configured on the server.' });
    }

    const imap = new Imap({
      user: IMAP_USER,
      password: IMAP_PASS,
      host: IMAP_HOST,
      port: IMAP_PORT,
      tls: IMAP_SECURE,
      tlsOptions: { rejectUnauthorized: false },
    });

    const imported = [];

    const fetchInbox = () =>
      new Promise((resolve, reject) => {
        imap.once('ready', () => {
          imap.openBox('INBOX', false, (err) => {
            if (err) return reject(err);
            const f = imap.fetch('1:*', { bodies: '', markSeen: true, struct: true });
            f.on('message', (msg) => {
              simpleParser(msg, (err, parsed) => {
                if (err) return;
                imported.push({
                  from: parsed.from?.text || parsed.from?.value?.[0]?.address || 'unknown',
                  fromAddress: parsed.from?.value?.[0]?.address || 'unknown@example.com',
                  to: parsed.to?.text || ADMIN_EMAIL,
                  toAddress: parsed.to?.value?.[0]?.address || ADMIN_EMAIL,
                  subject: parsed.subject || '(no subject)',
                  text: parsed.text || parsed.html || '',
                  date: parsed.date || new Date(),
                });
              });
            });
            f.once('end', () => {
              imap.end();
              resolve();
            });
          });
        });
        imap.once('error', (err) => reject(err));
        imap.connect();
      });

    await fetchInbox();

    let saved = 0;
    for (const mail of imported) {
      const [dup] = await pool.query(
        'SELECT id FROM messages WHERE sender_email = ? AND subject = ? AND sent_date >= DATE_SUB(?, INTERVAL 1 MINUTE)',
        [mail.fromAddress, mail.subject, mail.date]
      );
      if (dup.length > 0) continue;

      await pool.query(
        'INSERT INTO messages (sender_name, sender_email, recipient_name, recipient_email, subject, body, sent_date, folder, is_read, is_starred, label) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 0, ?)',
        [mail.from, mail.fromAddress, mail.to, mail.toAddress, mail.subject, mail.text, mail.date, 'inbox', null]
      );
      saved += 1;
    }

    res.json({ imported: saved, total: imported.length });
  } catch (error) {
    console.error('❌ Sync Messages Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.get('/api/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM messages WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Message not found.' });
    }
    const row = rows[0];
    res.json({
      id: row.id,
      sender: row.sender_name,
      email: row.sender_email,
      recipient: row.recipient_name,
      recipientEmail: row.recipient_email,
      subject: row.subject,
      body: row.body,
      preview: row.body ? row.body.substring(0, 80) + (row.body.length > 80 ? '...' : '') : '',
      date: normalizeDate(row.sent_date),
      folder: row.folder,
      read: row.is_read === 1,
      starred: row.is_starred === 1,
      label: row.label || null,
    });
  } catch (error) {
    console.error('❌ Get Message Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const { sender, email, recipient, recipientEmail, subject, body, folder } = req.body;
    if (!sender || !email || !subject) {
      return res.status(400).json({ error: 'Sender name, email, and subject are required.' });
    }

    const resolvedFolder = folder || 'sent';
    const [result] = await pool.query(
      'INSERT INTO messages (sender_name, sender_email, recipient_name, recipient_email, subject, body, sent_date, folder, is_read, is_starred, label) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, 0, 0, ?)',
      [sender, email, recipient || null, recipientEmail || null, subject, body || null, resolvedFolder, null]
    );

    if (resolvedFolder === 'sent' && recipientEmail && SMTP_USER && SMTP_PASS) {
      try {
        await transporter.sendMail({
          from: `"${sender}" <${email}>`,
          to: recipientEmail,
          subject,
          text: body || '',
        });
      } catch (mailError) {
        console.error('❌ SMTP send error:', mailError.message);
      }
    }

    res.status(201).json({ id: result.insertId, sender, email, recipient: recipient || null, recipientEmail: recipientEmail || null, subject, body: body || null, folder: resolvedFolder, read: false, starred: false, label: null });
  } catch (error) {
    console.error('❌ Send Message Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.put('/api/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_read, is_starred, folder } = req.body;

    const updates = [];
    const values = [];

    if (is_read !== undefined) {
      updates.push('is_read = ?');
      values.push(is_read);
    }
    if (is_starred !== undefined) {
      updates.push('is_starred = ?');
      values.push(is_starred);
    }
    if (folder) {
      updates.push('folder = ?');
      values.push(folder);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update.' });
    }

    values.push(id);
    await pool.query(`UPDATE messages SET ${updates.join(', ')} WHERE id = ?`, values);
    res.json({ success: true, id: Number(id) });
  } catch (error) {
    console.error('❌ Update Message Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.delete('/api/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM messages WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Delete Message Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/public/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Name, email, subject, and message are required.' });
    }

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@satesoft.com';

    await pool.query(
      'INSERT INTO messages (sender_name, sender_email, recipient_name, recipient_email, subject, body, sent_date, folder, is_read, is_starred, label) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, 0, 0, ?)',
      [name, email, 'Admin User', ADMIN_EMAIL, subject, message, 'inbox', null]
    );

    if (SMTP_USER && SMTP_PASS && !SMTP_USER.includes('your-email')) {
      try {
        await transporter.sendMail({
          from: `"${name}" <${email}>`,
          to: ADMIN_EMAIL,
          subject: `[Contact Form] ${subject}`,
          text: `From: ${name} <${email}>\n\n${message}`,
        });
      } catch (mailError) {
        console.error('❌ SMTP send error:', mailError.message);
      }
    }

    res.status(201).json({ success: true, message: 'Your message has been received.' });
  } catch (error) {
    console.error('❌ Public Contact Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ======================
// PUBLIC JOB APPLICATION
// ======================

app.post('/api/public/job-applications', cvUpload.single('cv'), async (req, res) => {
  try {
    const { name, email, phone, location, experience, opportunity, opportunityId } = req.body;

    if (!name || !opportunity) {
      return res.status(400).json({ error: 'Name and opportunity are required.' });
    }

    let cvName = null;
    let cvUrl = null;
    if (req.file) {
      cvName = req.file.originalname;
      cvUrl = '/uploads/cvs/' + req.file.filename;
    }

    const appliedDate = new Date().toISOString().split('T')[0];

    const connection = await pool.getConnection();
    let applicantId;
    try {
      await connection.beginTransaction();
      const [applicantResult] = await connection.query(
        'INSERT INTO applicants (name, email, opportunity, experience, phone, location, cv_name, cv_url, applied_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [name, email || null, opportunity, experience || null, phone || null, location || null, cvName, cvUrl, appliedDate, 'PENDING']
      );
      applicantId = applicantResult.insertId;
      if (opportunityId) {
        await connection.query('UPDATE job_opportunities SET applications = applications + 1 WHERE id = ?', [opportunityId]);
      }
      await connection.commit();
    } catch (databaseError) {
      await connection.rollback();
      throw databaseError;
    } finally {
      connection.release();
    }

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@satesoft.com';
    const subject = `Job application: ${opportunity}`;
    const body = [
      `Applicant: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      `Location: ${location}`,
      `Experience: ${experience}`,
      `Opportunity: ${opportunity}${opportunityId ? ` (ID: ${opportunityId})` : ''}`,
      '',
      `CV: ${cvName || 'None'}`,
      `CV download: ${cvUrl || 'N/A'}`,
    ].join('\n');
    await pool.query(
      'INSERT INTO messages (sender_name, sender_email, recipient_name, recipient_email, subject, body, sent_date, folder, is_read, is_starred, label) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, 0, 0, ?)',
      [name, email || '', 'Admin User', ADMIN_EMAIL, subject, body, 'inbox', 'Application']
    );

    if (SMTP_USER && SMTP_PASS && !SMTP_USER.includes('your-email')) {
      try {
        await transporter.sendMail({
          from: `"${name}" <${email || ADMIN_EMAIL}>`,
          to: ADMIN_EMAIL,
          subject: `[Application] ${subject}`,
          text: body,
        });
      } catch (mailError) {
        console.error('❌ Job application email error:', mailError.message);
      }
    }

    res.status(201).json({
      success: true,
      applicantId,
      message: 'Your application has been received.',
      applicant: {
        id: applicantId,
        name,
        email: email || null,
        opportunity,
        experience: experience || null,
        phone: phone || null,
        location: location || null,
        cv_name: cvName,
        cv_url: cvUrl,
        applied_date: appliedDate,
        status: 'PENDING',
      },
    });
  } catch (error) {
    console.error('❌ Public Job Application Error:', error);
    res.status(500).json({ error: 'Unable to send your application. Please try again.' });
  }
});

// ======================
// REACT / VITE BUILD - THIS MUST BE THE LAST SECTION
// ======================

const distPath = path.join(__dirname, 'dist');

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use(express.static(distPath));

// 404 handler for API routes - FIXED: No wildcard in path
app.use((req, res, next) => {
  // If it's an API route and hasn't been handled, return 404
  if (req.path.startsWith('/api/')) {
    console.log(`❌ API route not found: ${req.method} ${req.originalUrl}`);
    return res.status(404).json({
      error: 'API endpoint not found',
      path: req.originalUrl,
      method: req.method
    });
  }
  // Otherwise, continue to the next middleware
  next();
});

// Catch-all route for React SPA - MUST BE THE VERY LAST ROUTE
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).send('Error loading application');
    }
  });
});

// ======================
// START SERVER
// ======================

(async () => {
  await initializeDatabase();
  app.listen(port, () => {
    console.log(`
🚀 Server Running
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌍 URL: http://localhost:${port}
📦 Environment: ${process.env.NODE_ENV || 'development'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
  });
})();