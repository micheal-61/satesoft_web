-- ============================================================
-- Privacy Policy Sections Table Migration
-- ============================================================

CREATE TABLE IF NOT EXISTS privacy_policy_sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  section_number VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  section_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed default sections (1 through 11) if table is empty
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
('11', 'Changes to This Policy', 'We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or for other operational reasons. We will notify you of any material changes by posting the updated policy on our website and updating the "Effective Date" at the top of this page. Your continued use of our services after such modifications constitutes acceptance of the updated policy.', 11);
