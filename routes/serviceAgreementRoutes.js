import express from 'express';

const router = express.Router();

let pool;

router.setPool = (p) => {
  pool = p;
};

const initSectionsTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS service_agreement_sections (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      badge VARCHAR(50) DEFAULT '',
      text TEXT,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
};

const DEFAULT_SECTIONS = [
  { title: '0. Introduction', badge: null, text: 'These Terms and Conditions ("Terms") govern your access to and use of the digital products, platforms, applications, websites, and support services provided by Satesoft Corporation Limited. By accessing or using any of our Services, you agree to be bound by these Terms.', sort_order: 0 },
  { title: '1. Your Privacy', badge: 'COLLAPSIBLE', text: 'Your privacy is important to us. Please read the Satesoft Privacy Policy carefully, as it describes the types of data we collect from you and your devices, how we use your data, and the legal bases we have to process your data.', sort_order: 1 },
  { title: '2. Your Content', badge: 'COLLAPSIBLE', text: 'Many of our Services allow you to create, store, or share Your Content or receive material from others. Satesoft does not claim ownership of Your Content.', sort_order: 2 },
  { title: '3. Code of Conduct', badge: 'COLLAPSIBLE', text: 'You are accountable for your conduct and content when using the Services. You must not engage in any illegal activity, upload malicious code, attempt unauthorized access to system resources, interfere with network operations, or violate the rights of other users.', sort_order: 3 },
  { title: '4. Using the Services & Support', badge: 'COLLAPSIBLE', text: 'a. Satesoft Account: You will need a Satesoft account to access many of the Services. Your account credentials must be kept secure.\nb. Technical Support: Satesoft provides customer support according to the service level agreements (SLA) defined in your enterprise subscription tier.', sort_order: 4 },
  { title: '5. Using Third-Party Apps and Services', badge: 'COLLAPSIBLE', text: 'The Services may allow you to access or acquire products, services, websites, links, content, or integrations provided by third parties. Satesoft is not responsible for third-party tools and makes no warranties regarding their availability or security.', sort_order: 5 },
  { title: '6. Service Availability', badge: 'COLLAPSIBLE', text: 'The Services, Third-Party Apps and Services, or materials or products offered through the Services may be unavailable from time to time due to routine maintenance, updates, or unforeseen technical disruptions.', sort_order: 6 },
  { title: '7. Updates to the Services Or Software, and Changes to These Terms', badge: 'COLLAPSIBLE', text: 'We may change these Terms at any time, and we will notify you when we do. Material changes will be notified at least 30 days before they take effect.', sort_order: 7 },
  { title: '8. Software License', badge: 'COLLAPSIBLE', text: 'Unless accompanied by a separate Satesoft license agreement, any software provided by us to you as part of the Services is subject to these Terms under a limited, non-exclusive, non-transferable license.', sort_order: 8 },
  { title: '9. Payment Terms', badge: 'COLLAPSIBLE', text: 'If you purchase a Service, then these payment terms apply to your purchase and you agree to them. Charges are billed in advance based on your selected billing cycle.', sort_order: 9 },
  { title: '10. Contracting Entity, Choice of Law, and Jurisdiction', badge: 'COLLAPSIBLE', text: 'a. Contracting Entity: You are contracting with Satesoft Corporation Limited.\nb. Choice of Law: These Terms are governed by the laws of the applicable registered jurisdiction without regard to conflict of law principles.', sort_order: 10 },
  { title: '11. Registered Jurisdictions and Applicable Data Protection Laws', badge: 'COLLAPSIBLE', text: 'The following table sets out the jurisdictions in which Satesoft Corporation Limited is registered and operates. Personal data processing complies with continental standards like the African Union Convention on Cyber Security and Personal Data Protection (Malabo Convention) alongside applicable regional statutory laws.', sort_order: 11 },
  { title: '12. Warranties', badge: 'COLLAPSIBLE', text: 'DISCLAIMER: SATESOFT, AND ITS AFFILIATES, RESELLERS, DISTRIBUTORS, AND VENDORS, MAKE NO WARRANTIES, EXPRESS OR IMPLIED, GUARANTEES, OR CONDITIONS WITH RESPECT TO YOUR USE OF THE SERVICES.', sort_order: 12 },
  { title: '13. Limitation of Liability', badge: 'COLLAPSIBLE', text: 'If you have any basis for recovering damages, your exclusive remedy is to recover direct damages up to an amount equal to your Services fee for the month during which the loss or breach occurred.', sort_order: 13 },
  { title: '14. Service-Specific Terms', badge: 'COLLAPSIBLE', text: 'a. Duqact — Retail Intelligence Platform: Digital transformation tools, sales/inventory tracking, offline mode, and supply chain integration.', sort_order: 14 },
  { title: '15. Mediation and Dispute Resolution', badge: 'COLLAPSIBLE', text: 'SATESOFT OPTS FOR MEDIATION RATHER THAN BINDING ARBITRATION. In the event of any dispute, claim, or controversy arising out of or relating to these Terms, the parties agree to first attempt in good faith to resolve the dispute through informal negotiation and voluntary mediation before pursuing formal court litigation.', sort_order: 15 },
  { title: '16. Miscellaneous', badge: 'COLLAPSIBLE', text: 'This section, and sections 1, 9, 10, 11, 12, 13, 15, and those that by their terms apply after the Terms end, will survive any termination or cancellation of these Terms.', sort_order: 16 },
  { title: '17. Export Laws', badge: 'COLLAPSIBLE', text: 'You must comply with all applicable domestic and international export laws and regulations that apply to the software and services, which include restrictions on destinations, end users, and end use.', sort_order: 17 },
  { title: '18. Reservation of Rights and Feedback', badge: 'COLLAPSIBLE', text: 'Except as expressly provided under these Terms, Satesoft does not grant you a license or any other rights under any patents, know-how, copyrights, trade secrets, trademarks, or other intellectual property.', sort_order: 18 },
  { title: '19. Covered Services', badge: 'COLLAPSIBLE', text: 'The following products and services are covered by this Satesoft Services Agreement: Duqact (Retail Intelligence), Karibyshoo (Visitor & Event Management), FoundDocument (Intelligent Archiving), and related enterprise custom software solutions.', sort_order: 19 },
  { title: '20. Contact Information & Legal Directory', badge: 'COLLAPSIBLE', text: 'For your convenience, the following table summarizes the contact points mentioned throughout this Agreement. Official legal communications, privacy inquiries, and compliance notices should be submitted to legal@satesoft.com or directed to your regional Satesoft representative office.', sort_order: 20 }
];

router.get('/legal/service-agreement/sections', async (req, res) => {
  try {
    await initSectionsTable();
    const [rows] = await pool.query('SELECT * FROM service_agreement_sections ORDER BY sort_order ASC, id ASC');
    if (rows.length === 0) {
      for (const section of DEFAULT_SECTIONS) {
        await pool.query('INSERT INTO service_agreement_sections (title, badge, text, sort_order) VALUES (?, ?, ?, ?)', [section.title, section.badge, section.text, section.sort_order]);
      }
      const [newRows] = await pool.query('SELECT * FROM service_agreement_sections ORDER BY sort_order ASC, id ASC');
      return res.json(newRows);
    }
    res.json(rows);
  } catch (error) {
    console.error('Fetch Sections Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/legal/service-agreement/section', async (req, res) => {
  try {
    await initSectionsTable();
    let { title, badge, text } = req.body;
    const cleanTitle = (title || '').replace(/^(\d+\.|\s)+/g, '').trim();
    const [maxRows] = await pool.query('SELECT MAX(sort_order) AS max_sort FROM service_agreement_sections');
    const nextSort = (maxRows[0]?.max_sort ?? -1) + 1;
    const [result] = await pool.query(
      'INSERT INTO service_agreement_sections (title, badge, text, sort_order) VALUES (?, ?, ?, ?)',
      [cleanTitle, badge || '', text || '', nextSort]
    );
    const [rows] = await pool.query('SELECT * FROM service_agreement_sections WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Add Section Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/legal/service-agreement/sections/:id', async (req, res) => {
  try {
    await initSectionsTable();
    const { id } = req.params;
    let { title, badge, text, sort_order } = req.body;
    const cleanTitle = (title || '').replace(/^(\d+\.|\s)+/g, '').trim();
    await pool.query(
      'UPDATE service_agreement_sections SET title = ?, badge = ?, text = ?, sort_order = ? WHERE id = ?',
      [cleanTitle, badge || '', text || '', sort_order ?? 0, id]
    );
    const [updated] = await pool.query('SELECT * FROM service_agreement_sections WHERE id = ?', [id]);
    res.json(updated[0]);
  } catch (error) {
    console.error('Update Section Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/legal/service-agreement/sections/:id', async (req, res) => {
  try {
    await initSectionsTable();
    const { id } = req.params;
    await pool.query('DELETE FROM service_agreement_sections WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete Section Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/legal/service-agreement/reset-seed', async (req, res) => {
  try {
    await pool.query(`DROP TABLE IF EXISTS service_agreement_sections`);
    await initSectionsTable();
    for (const section of DEFAULT_SECTIONS) {
      await pool.query('INSERT INTO service_agreement_sections (title, badge, text, sort_order) VALUES (?, ?, ?, ?)', [section.title, section.badge, section.text, section.sort_order]);
    }
    const [rows] = await pool.query('SELECT * FROM service_agreement_sections ORDER BY sort_order ASC, id ASC');
    return res.json({ message: 'Database successfully reset and seeded', data: rows });
  } catch (err) {
    console.error('Reset Seed Failed:', err);
    return res.status(500).json({ error: 'Failed to reset database' });
  }
});

export default router;
