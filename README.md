# 🫁 NIV Companion App

Un'applicazione intuitiva per il monitoraggio e la comprensione della terapia di ventilazione non invasiva (NIV). Il progetto include una dashboard per visualizzare i dati terapeutici (ore di utilizzo, perdite della maschera, ossigenazione, ecc.) e fornisce punteggi intelligenti per aiutare i pazienti e i medici a valutare l'efficacia del trattamento.

---

## 🛠️ Tecnologie Utilizzate

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla), Chart.js (per i grafici)
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (con libreria `pg-promise`)
- **Autenticazione:** JSON Web Tokens (JWT) e `bcrypt` per le password

---

## 📋 Prerequisiti

Per eseguire questo progetto sul tuo computer, devi avere installato:

1.  [Node.js](https://nodejs.org/) (versione 16 o superiore)
2.  [PostgreSQL](https://www.postgresql.org/) (assicurati di avere un database vuoto pronto per l'uso)

---

## 🚀 Installazione e Avvio Rapido

Segui questi semplici passaggi per configurare l'intero ambiente in pochi minuti.

### 1. Configura il Backend

Apri il terminale, naviga nella cartella del progetto ed entra nella cartella `backend`:

```bash
cd backend
npm install
```

### 2. Configura le Variabili d'Ambiente

Crea un file chiamato esattamente **`.env`** (senza estensioni come .txt) all'interno della cartella `backend` e inserisci le tue credenziali del database e una chiave segreta a tua scelta:

```env
# Sostituisci "tuo_utente", "tua_password" e "nome_database" con i tuoi dati reali di PostgreSQL
DATABASE_URL=postgres://tuo_utente:tua_password@localhost:5432/nome_database

# Inserisci una parola o frase segreta casuale per generare i token di accesso
JWT_SECRET=una_chiave_segreta_molto_sicura

# Insierisci la tua API key
GEMINI_API_KEY=la_tua_chiave_api
```

### 3. Inizializza il Database

Abbiamo creato uno script automatizzato che genera le tabelle necessarie, crea un paziente di test e inserisce 7 giorni di dati fittizi. Esegui semplicemente:

```bash
npm run setup
```

> **Nota bene:** Al termine di questo processo, il terminale ti mostrerà l'**Email** e la **Password** da utilizzare per accedere all'applicazione!

### 4. Avvia il Server

Una volta che il database è pronto, avvia il server backend (che rimarrà in ascolto sulla porta 5000):

```bash
npm run devStart
```

### 5. Avvia il Frontend

Lascia il terminale aperto e funzionante. Ora naviga nella cartella `frontend` del progetto.
Per la migliore esperienza (ed evitare blocchi CORS del browser), ti consigliamo di aprire il file `landing.html` utilizzando un server locale, come l'estensione **Live Server** di Visual Studio Code. In alternativa, puoi provare a fare doppio clic sul file `landing.html` per aprirlo direttamente nel tuo browser.

---

## 💡 Come usare l'App

1.  Apri la pagina iniziale (`landing.html`).
2.  Clicca su **Accedi**.
3.  Usa le credenziali fornite dallo script di setup (`paziente@demo.com` / `password123`).
4.  Esplora la Dashboard, controlla i grafici nella sezione Trends e impara di più sulla tua terapia nella sezione Education!

---

## 📂 Struttura del Progetto

```text
NIV-Companion-App/
├── frontend/             # File statici (HTML, CSS, JS) e logica della UI
│   ├── landing.html      # Pagina di benvenuto, login e registrazione
│   ├── dashboard.html    # Dashboard principale dell'app
│   ├── style.css         # Stili globali
│   └── script.js         # Logica client-side e chiamate API
├── backend/              # Server Node.js e configurazione database
│   ├── db/               # Connessione DB e script di setup
│   ├── routes/           # Endpoint API (auth, pazienti)
│   ├── server.js         # Entry point del server Express
│   └── package.json      # Dipendenze e script npm
└── README.md             # Questo file
```
