const db = require('./config');
const bcrypt = require('bcrypt');

function randomFloat(min, max) {
  return parseFloat((min + Math.random() * (max - min)).toFixed(2));
}

function startDate() {
  const d = new Date();
  d.setDate(d.getDate() - 7); // Genera dati a partire da 7 giorni fa
  return d;
}

async function setupDatabase() {
  try {
    console.log(' Creazione delle tabelle in corso...');

    // 1. Elimina le tabelle vecchie (se esistono) e ricreale pulite
    await db.query(`
      DROP TABLE IF EXISTS niv_data;
      DROP TABLE IF EXISTS users;
      
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL
      );

      CREATE TABLE niv_data (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        usage_hours NUMERIC,
        oxygen_avg NUMERIC,
        mask_leak NUMERIC,
        resp_rate NUMERIC,
        tidal_volume NUMERIC,
        minute_ventilation NUMERIC,
        insp_pressure NUMERIC,
        exp_pressure NUMERIC,
        insp_time NUMERIC,
        ai_briefing TEXT,
        timestamp TIMESTAMP NOT NULL
      );
    `);
    console.log(' Tabelle ricreate con successo!');

    // 2. Creazione Utente Fittizio con password crittografata
    const plainPassword = 'password123';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const email = 'paziente@demo.com';

    const newUser = await db.one(
      `
      INSERT INTO users (name, email, password_hash, role) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id
    `,
      ['Paziente Demo', email, hashedPassword, 'patient'],
    );

    const patientId = newUser.id;

    // 3. Generazione Dati
    console.log(' Generazione dei dati medici in corso...');
    const startDay = startDate();

    for (let d = 0; d < 7; d++) {
      const dayDate = new Date(startDay);
      dayDate.setDate(startDay.getDate() + d);

      const usage_hours = randomFloat(4, 8);
      const baselineOxygen = randomFloat(90, 96);
      const baselineTidal = randomFloat(450, 550);
      const baselineResp = randomFloat(14, 18);
      const intervalMinutes = 15;
      const numIntervals = Math.floor((usage_hours * 60) / intervalMinutes);

      const startTime = new Date(
        dayDate.getFullYear(),
        dayDate.getMonth(),
        dayDate.getDate(),
        22,
        0,
        0,
      );

      for (let i = 0; i < numIntervals; i++) {
        const timestamp = new Date(
          startTime.getTime() + i * intervalMinutes * 60000,
        );
        const usage = parseFloat((usage_hours / numIntervals).toFixed(2));
        const tidal_volume = randomFloat(
          baselineTidal - 30,
          baselineTidal + 30,
        );
        const resp_rate = randomFloat(baselineResp - 1, baselineResp + 1);
        const minute_ventilation = parseFloat(
          ((tidal_volume * resp_rate) / 1000).toFixed(2),
        );
        const oxygen_avg = randomFloat(baselineOxygen - 1, baselineOxygen + 1);
        const mask_leak = randomFloat(0, 60);
        const insp_pressure = randomFloat(10, 15);
        const exp_pressure = randomFloat(4, 7);
        const insp_time = randomFloat(0.8, 1.5);

        await db.query(
          `INSERT INTO niv_data
            (patient_id, usage_hours, oxygen_avg, mask_leak, resp_rate,
             tidal_volume, minute_ventilation, insp_pressure,
             exp_pressure, insp_time, timestamp)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
          [
            patientId,
            usage,
            oxygen_avg,
            mask_leak,
            resp_rate,
            tidal_volume,
            minute_ventilation,
            insp_pressure,
            exp_pressure,
            insp_time,
            timestamp,
          ],
        );
      }
    }

    console.log('\n=======================================');
    console.log(' SETUP COMPLETATO! ECCO LE CREDENZIALI:');
    console.log(` Email:    ${email}`);
    console.log(` Password: ${plainPassword}`);
    console.log('=======================================\n');
  } catch (err) {
    console.error(' Errore durante il setup:', err);
  } finally {
    db.$pool.end();
  }
}

setupDatabase();
