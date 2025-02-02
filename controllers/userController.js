const pool = require('../db');

const getUser = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username FROM users WHERE id = $1', [req.user.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getUser };
