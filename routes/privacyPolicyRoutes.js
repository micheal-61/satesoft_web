import express from 'express';

const router = express.Router();

let pool;

router.setPool = (p) => {
  pool = p;
};

router.get('/privacy-policy', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM privacy_policy_sections ORDER BY section_order ASC'
    );
    res.json(rows);
  } catch (error) {
    console.error('List Privacy Policy Sections Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.post('/admin/privacy-policy', async (req, res) => {
  try {
    const { section_number, title, content, section_order } = req.body;
    if (!section_number || !title || !content) {
      return res.status(400).json({
        error: 'Section number, title, and content are required.',
      });
    }
    const [result] = await pool.query(
      'INSERT INTO privacy_policy_sections (section_number, title, content, section_order) VALUES (?, ?, ?, ?)',
      [section_number, title, content, section_order || 0]
    );
    const [newSection] = await pool.query(
      'SELECT * FROM privacy_policy_sections WHERE id = ?',
      [result.insertId]
    );
    res.status(201).json(newSection[0]);
  } catch (error) {
    console.error('Create Privacy Policy Section Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.put('/admin/privacy-policy/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { section_number, title, content, section_order } = req.body;
    if (!section_number || !title || !content) {
      return res.status(400).json({
        error: 'Section number, title, and content are required.',
      });
    }
    await pool.query(
      'UPDATE privacy_policy_sections SET section_number = ?, title = ?, content = ?, section_order = ? WHERE id = ?',
      [section_number, title, content, section_order || 0, id]
    );
    const [updated] = await pool.query(
      'SELECT * FROM privacy_policy_sections WHERE id = ?',
      [id]
    );
    res.json(updated[0]);
  } catch (error) {
    console.error('Update Privacy Policy Section Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.delete('/admin/privacy-policy/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM privacy_policy_sections WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete Privacy Policy Section Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
