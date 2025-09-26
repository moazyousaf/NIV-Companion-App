const express = require('express');
const router = express.Router();
const db = require('../db/config');

//router responses

//List of all patients in the database
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

//Data of a specific patient
router.get('/:id', async (req, res) => {
  const id = req.params.id;

  if (!id) {
    res.status(404).send('Patient ID not valid');
  }

  try {
    const query = 'SELECT * FROM niv_data WHERE patient_id = $1';
    const result = await db.any(query, [id]);

    if (!result[0]) return res.status(400).send('Patient ID not found');

    res.json(result);
  } catch (err) {
    console.log("Error fetching patient's data", err);
    res
      .status(500)
      .json({ error: "Database error during patient's data fetching" });
  }
});

module.exports = router;
