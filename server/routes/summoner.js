const { Router } = require('express');
const { REGIONS } = require('../config');
const { getAccount, getSummonerByPuuid, getLeagueEntries, getDdVersion } = require('../riotClient');

const router = Router();

router.get('/', async (req, res) => {
  const { gameName, tagLine, region } = req.query;

  if (!gameName || !tagLine || !region) {
    return res.status(400).json({ error: 'gameName, tagLine, and region are required' });
  }
  if (!REGIONS[region.toUpperCase()]) {
    return res.status(400).json({ error: `Unknown region: ${region}` });
  }

  const regionKey = region.toUpperCase();

  try {
    const account = await getAccount(gameName, tagLine, regionKey);
    if (!account) return res.status(404).json({ error: 'Summoner not found' });

    const [summoner, ddVersion] = await Promise.all([
      getSummonerByPuuid(account.puuid, regionKey),
      getDdVersion(),
    ]);
    if (!summoner) return res.status(404).json({ error: 'Summoner profile not found' });

    const leagueEntries = await getLeagueEntries(summoner.id, regionKey);
    const rankedSolo = Array.isArray(leagueEntries)
      ? leagueEntries.find((e) => e.queueType === 'RANKED_SOLO_5x5')
      : null;

    const rank = rankedSolo
      ? `${rankedSolo.tier} ${rankedSolo.rank}`
      : 'Unranked';

    res.json({
      puuid: account.puuid,
      name: account.gameName,
      tag: account.tagLine,
      level: summoner.summonerLevel,
      iconId: summoner.profileIconId,
      iconUrl: `https://ddragon.leagueoflegends.com/cdn/${ddVersion}/img/profileicon/${summoner.profileIconId}.png`,
      rank,
      lp: rankedSolo?.leaguePoints ?? 0,
      wins: rankedSolo?.wins ?? 0,
      losses: rankedSolo?.losses ?? 0,
    });
  } catch (err) {
    console.error('Summoner route error:', err.message);
    const msg = err.message || '';
    const errorMessage = msg.includes('Riot API 401:') || msg.includes('Riot API 403:')
      ? 'API key is invalid or expired — regenerate it at developer.riotgames.com'
      : msg.includes('Riot API 429:')
      ? 'Rate limited by Riot API — try again in a moment'
      : 'Failed to fetch summoner data from Riot API';
    res.status(502).json({ error: errorMessage });
  }
});

module.exports = router;
