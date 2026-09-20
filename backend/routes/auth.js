const express = require('express');
const authRouter = express.Router();
const db = require('../db/config');
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;

//user registration route
authRouter.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  //validation
  if (!name || !email || !password || !role) {
    return res
      .status(400)
      .json({ error: 'Name, email, and password are required' });
  }

  try {
    const exits = await db.oneOrNone('SELECT id FROM users WHERE email=$1', [
      email,
    ]);

    if (exits) return res.status(400).json({ error: 'Email already exists' });

    //hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    //insert the patient
    const newUser = await db.one(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, role]
    );

    //success
    res.status(201).json({ message: 'Patient registered', user: newUser });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//login route
authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;

  //validation
  if (!email || !password) {
    return res.status(400).json({ error: 'email, and password are required' });
  }

  try {
    const user = await db.oneOrNone('SELECT * FROM users WHERE email=$1', [
      email,
    ]);

    if (!user)
      return res.status(401).json({ error: 'Invalid email or password' });

    //Check password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword)
      return res.status(401).json({ error: 'Invalid email or password' });

    //generate jwt
    var token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    //Return token and patient info
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = authRouter;
