const express = require('express');
const router = express.Router();
const db = require('../db/config');
const { authenticateToken, authorizeDoctor } = require('./authMiddleware');
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

//router responses

//List of all patients in the database
router.get('/list', authenticateToken, authorizeDoctor, async (req, res) => {
  try {
    const query =
      "SELECT id, name, email FROM users WHERE role = 'patient' ORDER BY id";
    const result = await db.any(query);
    res.json(result);
  } catch (err) {
    console.error('Patient list error: ', err);
    res.status(500).json({ error: 'Database error fetching patients' });
  }
});

//Data of a specific patient
router.get('/:id', authenticateToken, async (req, res) => {
  const requestedId = req.params.id;
  const user = req.user;

  if (!requestedId) {
    return res.status(404).send('Patient ID not valid');
  }

  // Role check
  if (user.role === 'patient' && user.id != requestedId) {
    return res
      .status(403)
      .json({ error: 'Patients can only access their own data' });
  }

  try {
    const query = 'SELECT * FROM niv_data WHERE patient_id = $1';
    const result = await db.any(query, [requestedId]);

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
router.get('/:id/days', authenticateToken, async (req, res) => {
  const requestedId = req.params.id;
  const user = req.user;

  if (!requestedId) return res.status(400).send('Patient ID not valid');
  // Role check
  if (user.role === 'patient' && user.id != requestedId) {
    return res
      .status(403)
      .json({ error: 'Patients can only access their own data' });
  }

  try {
    const query =
      "SELECT DISTINCT TO_CHAR(timestamp::date, 'YYYY-MM-DD') AS day FROM niv_data WHERE patient_id = $1 ORDER BY day ASC";
    result = await db.any(query, [requestedId]);
    if (!result[0]) return res.status(400).send('Patient ID not found');
    res.json(result);
  } catch (err) {
    console.log("Error fetching patient's day data", err);
    res
      .status(500)
      .json({ error: "Database error during patient's day data fetching" });
  }
});

router.get('/:id/day/:day', authenticateToken, async (req, res) => {
  const requestedId = req.params.id;
  const day = req.params.day;
  const user = req.user;

  if (!requestedId || !day) {
    return res.status(400).send('Patient ID or DAY is missing or invalid');
  }

  // Role check
  if (user.role === 'patient' && user.id != requestedId) {
    return res
      .status(403)
      .json({ error: 'Patients can only access their own data' });
  }

  try {
    const query = `SELECT 
        SUM(usage_hours) AS usage_hours,
        ROUND(AVG(oxygen_avg)::numeric,2) AS oxygen_avg,
        ROUND(AVG(resp_rate)::numeric,2) AS resp_rate, 
        ROUND(AVG(mask_leak)::numeric,2) AS mask_leak, 
        ROUND(AVG(tidal_volume)::numeric,2) AS tidal_volume, 
        ROUND(AVG(minute_ventilation)::numeric,2) AS minute_ventilation, 
        ROUND(AVG(insp_pressure)::numeric,2) AS insp_pressure,
        ROUND(AVG(exp_pressure)::numeric,2) AS exp_pressure, 
        ROUND(AVG(insp_time)::numeric,2) AS insp_time 
      FROM niv_data 
      WHERE patient_id = $1 AND timestamp::date = $2::date`;

    const result = await db.any(query, [requestedId, day]);
    if (result.length == 0 || result[0].usage_hours == null)
      return res.status(400).send('No data found for this patient on this day');
    res.json(result);
  } catch (err) {
    console.log("Error fetching patient's day data", err);
    res
      .status(500)
      .json({ error: "Database error during patient's day data fetching" });
  }
});

// Rotta per generare o recuperare il Briefing Mattutino dell'AI
router.get('/:id/day/:day/briefing', authenticateToken, async (req, res) => {
  const requestedId = req.params.id;
  const day = req.params.day;
  const user = req.user;

  if (!requestedId || !day) {
    return res.status(400).send('Patient ID or DAY is missing or invalid');
  }

  // Controllo permessi
  if (user.role === 'patient' && user.id != requestedId) {
    return res
      .status(403)
      .json({ error: 'Patients can only access their own data' });
  }

  try {
    // 1. Controlliamo se esiste già un briefing salvato per questa giornata
    const checkQuery = `
      SELECT ai_briefing FROM niv_data 
      WHERE patient_id = $1 AND timestamp::date = $2::date AND ai_briefing IS NOT NULL 
      LIMIT 1
    `;
    const existingBriefing = await db.oneOrNone(checkQuery, [requestedId, day]);

    if (existingBriefing && existingBriefing.ai_briefing) {
      // Se c'è già, lo restituiamo senza chiamare le API di Google
      return res.json({ briefing: existingBriefing.ai_briefing });
    }

    // 2. Se non esiste, recuperiamo i dati medi della giornata per passarli all'AI
    const dataQuery = `
      SELECT 
        SUM(usage_hours) AS usage_hours,
        ROUND(AVG(oxygen_avg)::numeric,2) AS oxygen_avg,
        ROUND(AVG(mask_leak)::numeric,2) AS mask_leak
      FROM niv_data 
      WHERE patient_id = $1 AND timestamp::date = $2::date
    `;
    const dayData = await db.oneOrNone(dataQuery, [requestedId, day]);

    if (!dayData || dayData.usage_hours == null) {
      return res
        .status(400)
        .send('Nessun dato disponibile per generare il briefing.');
    }

    // 3. Costruiamo il prompt per Gemini
    const prompt = `
      Sei un assistente medico virtuale per la terapia NIV (ventilazione non invasiva).
      Analizza questi dati medi della notte del paziente:
      - Ore di utilizzo totali: ${dayData.usage_hours} ore (L'obiettivo è > 6 ore)
      - Ossigeno medio: ${dayData.oxygen_avg}% (L'obiettivo è > 90%)
      - Perdita maschera media: ${dayData.mask_leak} L/min (Sotto i 24 è eccellente, sopra 35 è alta)
      
      Scrivi un riassunto mattutino di massimo 3 frasi. Rivolgiti direttamente al paziente con un tono empatico, rassicurante e incoraggiante. Sii conciso ma analitico sui tre parametri.
    `;

    // 4. Chiamiamo Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
    const result = await model.generateContent(prompt);
    const briefingText = result.response.text();

    // 5. Salviamo il briefing nel database per le prossime volte
    const updateQuery = `
      UPDATE niv_data 
      SET ai_briefing = $3 
      WHERE patient_id = $1 AND timestamp::date = $2::date
    `;
    await db.none(updateQuery, [requestedId, day, briefingText]);

    // 6. Restituiamo il risultato al frontend
    res.json({ briefing: briefingText });
  } catch (err) {
    console.error('Errore durante la generazione del briefing:', err);
    res
      .status(500)
      .json({
        error: "Errore durante l'analisi dell'Intelligenza Artificiale",
      });
  }
});

module.exports = router;
