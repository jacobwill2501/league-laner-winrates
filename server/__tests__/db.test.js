const { initDb, cacheMatch, getCachedMatch, storeMatchIds, getStoredMatchIds } = require('../db');

let db;
beforeAll(() => {
  db = initDb(':memory:');
});

test('getCachedMatch returns null for unknown matchId', () => {
  const result = getCachedMatch(db, 'NA1_MISSING');
  expect(result).toBeNull();
});

test('cacheMatch stores and getCachedMatch retrieves', () => {
  const matchData = { info: { participants: [] } };
  const timelineData = { info: { frames: [] } };
  cacheMatch(db, 'NA1_123', matchData, timelineData);

  const result = getCachedMatch(db, 'NA1_123');
  expect(result).not.toBeNull();
  expect(result.matchData).toEqual(matchData);
  expect(result.timelineData).toEqual(timelineData);
});

test('cacheMatch is idempotent (no error on duplicate)', () => {
  const matchData = { info: { participants: [] } };
  const timelineData = { info: { frames: [] } };
  cacheMatch(db, 'NA1_DUP', matchData, timelineData);
  expect(() => cacheMatch(db, 'NA1_DUP', matchData, timelineData)).not.toThrow();
});

test('storeMatchIds and getStoredMatchIds: round-trip', () => {
  const puuid = 'test-puuid-1';
  const ids = ['NA1_AAA', 'NA1_BBB', 'NA1_CCC'];
  const timestamps = [3000, 1000, 2000];
  storeMatchIds(db, puuid, ids, timestamps);

  const result = getStoredMatchIds(db, puuid);
  // Ordered by game_ts DESC: 3000, 2000, 1000
  expect(result).toEqual(['NA1_AAA', 'NA1_CCC', 'NA1_BBB']);
});

test('storeMatchIds is idempotent (no error on duplicate puuid+matchId)', () => {
  const puuid = 'test-puuid-2';
  storeMatchIds(db, puuid, ['NA1_DUP'], [1000]);
  expect(() => storeMatchIds(db, puuid, ['NA1_DUP'], [1000])).not.toThrow();
});
