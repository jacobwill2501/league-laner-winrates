const { initDb, cacheMatch, getCachedMatch } = require('../db');

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
