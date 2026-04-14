const { Router } = require('express');
const { REGIONS } = require('../config');
const { getMatchIds, getMatch, getTimeline, getDdVersion } = require('../riotClient');
const { cacheMatch, getCachedMatch, storeMatchIds, getStoredMatchIds } = require('../db');
const { computeMatchStats } = require('../stats');

const router = Router();

const PAGE_SIZE = 10;

router.get('/', async (req, res) => {
  const { puuid, region, page = '1' } = req.query;
  if (!puuid || !region) {
    return res.status(400).json({ error: 'puuid and region are required' });
  }
  if (!REGIONS[region.toUpperCase()]) {
    return res.status(400).json({ error: `Unknown region: ${region}` });
  }

  const regionKey = region.toUpperCase();
  const pageNum = Math.max(1, parseInt(page, 10));
  const db = req.app.locals.db;

  try {
    // 1. Fetch and store all match IDs (cheap, ~1-3 API calls)
    let allIds = getStoredMatchIds(db, puuid);

    if (allIds.length === 0) {
      let start = 0;
      let batch;
      do {
        batch = await getMatchIds(puuid, regionKey, start, 100);
        if (batch && batch.length > 0) {
          // Use negative position as timestamp so ORDER BY game_ts DESC returns
          // matches in the same newest-first order Riot returns them
          const timestamps = batch.map((_, i) => -(start + i));
          storeMatchIds(db, puuid, batch, timestamps);
          allIds = [...allIds, ...batch];
          start += batch.length;
        }
      } while (batch && batch.length === 100);
    }

    const totalIds = allIds.length;

    // 2. Scan match details, filter to jungle games, collect up to pageNum*PAGE_SIZE
    const jungleMatches = [];
    const ddVersion = await getDdVersion();

    let brokeEarly = false;
    for (const matchId of allIds) {
      let cached = getCachedMatch(db, matchId);

      if (!cached) {
        const [matchData, timelineData] = await Promise.all([
          getMatch(matchId, regionKey),
          getTimeline(matchId, regionKey),
        ]);
        if (!matchData || !timelineData) continue;
        cacheMatch(db, matchId, matchData, timelineData);
        cached = { matchData, timelineData };
      }

      const { matchData, timelineData } = cached;
      const participants = matchData.info?.participants;
      if (!participants) continue;

      const searchedPlayer = participants.find((p) => p.puuid === puuid);
      if (!searchedPlayer) continue;

      if (searchedPlayer.teamPosition !== 'JUNGLE') continue;

      const frames = timelineData.info?.frames;
      if (!frames) continue;

      const laneStats = computeMatchStats(participants, searchedPlayer.participantId, frames);

      jungleMatches.push({
        matchId,
        champion: searchedPlayer.championName,
        championIconUrl: `https://ddragon.leagueoflegends.com/cdn/${ddVersion}/img/champion/${searchedPlayer.championName}.png`,
        win: searchedPlayer.win,
        duration: matchData.info.gameDuration,
        date: matchData.info.gameCreation,
        lanes: laneStats,
      });

      if (jungleMatches.length >= pageNum * PAGE_SIZE) {
        brokeEarly = true;
        break;
      }
    }

    const totalJungleFound = jungleMatches.length;
    const pageMatches = jungleMatches.slice((pageNum - 1) * PAGE_SIZE, pageNum * PAGE_SIZE);
    const hasMore = brokeEarly;

    const aggregates = computeAggregates(jungleMatches);

    res.json({
      aggregates: {
        cachedGames: totalJungleFound,
        totalIds,
        ...aggregates,
      },
      matches: pageMatches,
      pagination: { page: pageNum, hasMore },
    });
  } catch (err) {
    console.error('Matches route error:', err.message);
    const msg = err.message || '';
    const errorMessage = msg.includes('Riot API 401:')
      ? 'API key is invalid or expired — regenerate it at developer.riotgames.com'
      : msg.includes('Riot API 429:')
      ? 'Rate limited by Riot API — try again in a moment'
      : 'Failed to fetch match data';
    res.status(502).json({ error: errorMessage });
  }
});

function computeAggregates(jungleMatches) {
  if (jungleMatches.length === 0) {
    const empty = { winRate: 0, avgGD: 0, avgGD10: 0, avgGD15: 0, avgKDA: 0 };
    return { top: empty, mid: empty, bot: empty };
  }

  function laneAgg(lane) {
    const n = jungleMatches.length;
    const wins = jungleMatches.filter((m) => m.lanes[lane].result === 'W').length;
    const avgGD = jungleMatches.reduce((s, m) => s + m.lanes[lane].preInterventionGD, 0) / n;
    const avgGD10 = jungleMatches.reduce((s, m) => s + m.lanes[lane].gd10, 0) / n;
    const avgGD15 = jungleMatches.reduce((s, m) => s + m.lanes[lane].gd15, 0) / n;
    const avgKDA = jungleMatches.reduce((s, m) => s + m.lanes[lane].kda, 0) / n;
    return {
      winRate: parseFloat((wins / n).toFixed(3)),
      avgGD: Math.round(avgGD),
      avgGD10: Math.round(avgGD10),
      avgGD15: Math.round(avgGD15),
      avgKDA: parseFloat(avgKDA.toFixed(2)),
    };
  }

  return { top: laneAgg('top'), mid: laneAgg('mid'), bot: laneAgg('bot') };
}

module.exports = router;
