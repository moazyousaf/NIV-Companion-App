// Carichiamo le variabili d'ambiente (il tuo file .env)
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Inizializziamo l'SDK usando la tua chiave
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testGemini() {
  try {
    console.log('⏳ Contattando il modello Gemini...');

    // Scegliamo il modello 'flash', che è veloce e perfetto per compiti di testo
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

    // Prepariamo un prompt di prova simulando dei dati
    const prompt = `
      Sei un assistente medico virtuale per la terapia NIV.
      Dati fittizi di stanotte:
      - Ore di utilizzo: 7.5
      - Perdite maschera: Basse (ottimo)
      
      Scrivi un brevissimo messaggio di buongiorno (massimo 2 frasi) per incoraggiare il paziente.
    `;

    // Inviamo la richiesta
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    console.log("✅ Risposta ricevuta dall'AI:");
    console.log('--------------------------------------------------');
    console.log(responseText);
    console.log('--------------------------------------------------');
  } catch (error) {
    console.error('❌ Errore durante la chiamata API:', error);
  }
}

testGemini();
