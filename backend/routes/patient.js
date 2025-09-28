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

//Days available for a patient
router.get('/:id/days', async (req, res) => {
  const id = req.params.id;

  if (!id) res.status(400).send('Patient ID not valid');
  try {
    const query =
      'SELECT DISTINCT timestamp::date AS day FROM niv_data WHERE patient_id = $1 ORDER BY day ASC;';
    result = await db.any(query, [id]);
    if (!result[0]) return res.status(400).send('Patient ID not found');
    res.json(result);
  } catch (err) {
    console.log("Error fetching patient's day data", err);
    res
      .status(500)
      .json({ error: "Database error during patient's day data fetching" });
  }
});

router.get('/:id/day/:day', async (req, res) => {
  const id = req.params.id;
  const day = req.params.day;

  if (!id || !day) {
    return res.status(400).send('Patient ID or DAY is missing or invalid');
  }
  try {
    const query =
      'SELECT \
        SUM(usage_hours) AS usage_hours,\
        ROUND(AVG(oxygen_avg)::numeric,2) AS oxygen_avg,\
        ROUND(AVG(resp_rate)::numeric,2) AS resp_rate, \
        ROUND(AVG(mask_leak)::numeric,2) AS mask_leak, \
        ROUND(AVG(tidal_volume)::numeric,2) AS tidal_volume, \
        ROUND(AVG(minute_ventilation)::numeric,2) AS minute_ventilation, \
        ROUND(AVG(insp_pressure)::numeric,2) AS insp_pressure, \
        ROUND(AVG(exp_pressure)::numeric,2) AS exp_pressure, \
        ROUND(AVG(insp_time)::numeric,2) AS insp_time \
      FROM niv_data \
      WHERE patient_id = $1 AND timestamp::date = $2::date';

    const result = await db.any(query, [id, day]);
    if (result[0].usage_hours == null || result.length == 0)
      return res.status(400).send('No data found for this patient on this day');
    res.json(result);
  } catch (err) {
    console.log("Error fetching patient's day data", err);
    res
      .status(500)
      .json({ error: "Database error during patient's day data fetching" });
  }
});

module.exports = router;
