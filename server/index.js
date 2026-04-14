const express = require('express');
const cors = require('cors');
const path = require('path');
const { CLIENT_ORIGIN, PORT } = require('./config');
const { initDb } = require('./db');
const summonerRouter = require('./routes/summoner');
const matchesRouter = require('./routes/matches');

const app = express();

const db = initDb(path.join(__dirname, 'data', 'cache.db'));
app.locals.db = db;

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

app.use('/api/summoner', summonerRouter);
app.use('/api/matches', matchesRouter);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
