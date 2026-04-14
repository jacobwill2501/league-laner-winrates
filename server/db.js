const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

function initDb(dbPath) {
  if (dbPath !== ':memory:') {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS match_cache (
      match_id    TEXT PRIMARY KEY,
      match_data  TEXT NOT NULL,
      timeline_data TEXT NOT NULL,
      cached_at   INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS match_id_index (
      puuid    TEXT NOT NULL,
      match_id TEXT NOT NULL,
      game_ts  INTEGER NOT NULL,
      PRIMARY KEY (puuid, match_id)
    );
  `);

  return db;
}

function cacheMatch(db, matchId, matchData, timelineData) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO match_cache (match_id, match_data, timeline_data, cached_at)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(matchId, JSON.stringify(matchData), JSON.stringify(timelineData), Date.now());
}

function getCachedMatch(db, matchId) {
  const row = db.prepare('SELECT match_data, timeline_data FROM match_cache WHERE match_id = ?').get(matchId);
  if (!row) return null;
  return {
    matchData: JSON.parse(row.match_data),
    timelineData: JSON.parse(row.timeline_data),
  };
}

function storeMatchIds(db, puuid, matchIds, gameTimestamps) {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO match_id_index (puuid, match_id, game_ts) VALUES (?, ?, ?)
  `);
  const insertMany = db.transaction((ids) => {
    ids.forEach(({ id, ts }) => stmt.run(puuid, id, ts));
  });
  insertMany(matchIds.map((id, i) => ({ id, ts: gameTimestamps[i] || 0 })));
}

function getStoredMatchIds(db, puuid) {
  return db
    .prepare('SELECT match_id FROM match_id_index WHERE puuid = ? ORDER BY game_ts DESC')
    .all(puuid)
    .map((r) => r.match_id);
}

module.exports = { initDb, cacheMatch, getCachedMatch, storeMatchIds, getStoredMatchIds };
