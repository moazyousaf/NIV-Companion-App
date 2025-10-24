const db = require('./db/config');

function randomFloat(min, max) {
  return parseFloat((min + Math.random() * (max - min)).toFixed(2));
}

// Helper: start from a given date
function startDate() {
  return new Date(2024, 0, 11); // 11 Jan 2024 (month is 0-based → 0 = Jan)
}

async function createDummyData() {
  try {
    const patientId = 43; // your existing patient

    const startDay = startDate();

    // generate 7 consecutive days
    for (let d = 0; d < 7; d++) {
      const dayDate = new Date(startDay);
      dayDate.setDate(startDay.getDate() + d);

      const usage_hours = randomFloat(4, 8);
      const baselineOxygen = randomFloat(90, 96);
      const baselineTidal = randomFloat(450, 550);
      const baselineResp = randomFloat(14, 18);

      const intervalMinutes = 15;
      const numIntervals = Math.floor((usage_hours * 60) / intervalMinutes);

      // Start usage at 10 PM
      const startTime = new Date(
        dayDate.getFullYear(),
        dayDate.getMonth(),
        dayDate.getDate(),
        22,
        0,
        0
      );

      for (let i = 0; i < numIntervals; i++) {
        const timestamp = new Date(
          startTime.getTime() + i * intervalMinutes * 60000
        );

        const usage = parseFloat((usage_hours / numIntervals).toFixed(2));
        const tidal_volume = randomFloat(
          baselineTidal - 30,
          baselineTidal + 30
        );
        const resp_rate = randomFloat(baselineResp - 1, baselineResp + 1);
        const minute_ventilation = parseFloat(
          ((tidal_volume * resp_rate) / 1000).toFixed(2)
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
          ]
        );
      }
    }

    console.log('✅ Dummy data created for patient 43!');
  } catch (err) {
    console.error(err);
  } finally {
    db.$pool.end();
  }
}

createDummyData();
