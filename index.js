require('dotenv').config();
const express = require('express');
const fs = require('fs/promises');
const crypto = require('crypto');
const bcrypt = require('bcrypt'); //Added by Markut
const database = require('./database.js');
const tokens = require('./tokens.js');

const app = express();
const port = process.env.PORT || 3100;

app.use(express.json({ limit: '1mb' }));

database.createDBTablesAndExtensions();

app.get('/', (_, res) => {
  res.send('OpenCPI Web API running');
});

app.get('/jgc/v5/client/:client_id/configuration/site', async (req, res) => {
  try {
  const json = await fs.readFile('./json_blobs/website_configuration.json', 'utf8');
  res.json(JSON.parse(json));
} catch (err) {
  res.status(500).json({ error: 'File not found' });
  }
});

app.post('/jgc/v5/client/:client_id/api-key', (req, res) => {
  res.header('api-key', process.env.API_KEY);
  res.json({ data: null, error: null });
});

app.post('/registration/text', async (req, res) => {
  try {
    const json = await fs.readFile('./json_blobs/tos.json', 'utf8');
    res.json(JSON.parse(json));
  } catch (err) {
    res.status(500).json({ error: 'File not found' });
  }
});

app.post('/jgc/v5/client/:client_id/validate', (_, res) => {
  res.json({ data: null, error: null });
});

app.post('/jgc/v5/client/:client_id/guest/register', async (req, res) => {
  try {
    const { profile, password } = req.body;
    if (
  !profile ||
  !password ||
  !profile.username ||
  !profile.firstName ||
  !profile.parentEmail
    )
    {
      return res.status(400).json({ error: 'Incomplete registration data' });
    }

    const username = profile.username;
    const firstName = profile.firstName;
    const parentEmail = profile.parentEmail;
    const userID = crypto.randomUUID();

    const hashedPassword = await bcrypt.hash(password, 12);

    const accessToken = tokens.generateJwtToken(userID, parentEmail);
    const refreshToken = tokens.generateRefreshToken();

    await database.createUser(
      username,
      hashedPassword,
      firstName,
      parentEmail,
      userID,
      refreshToken
    );

    res.status(201).json({
      message: 'User registered successfully',
      accessToken,
      refreshToken
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.listen(port, () => {
  console.log(`OpenCPI API listening on port ${port}`);
});
