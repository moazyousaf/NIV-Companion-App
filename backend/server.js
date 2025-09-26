const express = require('express');
const cors = require('cors'); //middleware
const patientRouter = require('./routes/patient');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use('/api/patient', patientRouter); //use patient router

app.listen(PORT, (error) => {
  if (!error) {
    console.log('Server listening on port:' + PORT);
  } else {
    console.log('Server not running', error);
  }
});
