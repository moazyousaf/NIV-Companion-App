const express = require('express');
const router = express.Router();
const db = require('../db/config');

//router responses

router.get('/list', async (req, res) => {
  try {
    const query = 'SELECT id, name, email FROM patients ORDER BY id';
    const result = await db.any(query);
    res.json(result);
  } catch (err) {
    console.error('Patient list error: ', err);
    res.status(500).json({ error: 'Database error fetching patients' });
  }
});

module.exports = router;
