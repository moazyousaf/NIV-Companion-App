const express = require('express');
const db = require('./db/config');

const app = express();
const PORT = 5000;

app.listen(PORT, (error) => {
  if (!error) {
    console.log('Server listening on port:' + PORT);
  } else {
    console.log('Server not running', error);
  }
});
