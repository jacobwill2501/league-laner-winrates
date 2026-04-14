const { REGIONS, RIOT_API_KEY, REQUEST_DELAY_MS } = require('./config');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function riotGet(url) {
  await sleep(REQUEST_DELAY_MS);
  console.log(`Riot API request: ${url}`);
  const res = await fetch(url, {
    headers: { 'X-Riot-Token': RIOT_API_KEY },
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Riot API ${res.status}: ${text}`);
  }
  return res.json();
}

// Account-v1: resolve GameName#Tag -> PUUID
async function getAccount(gameName, tagLine, region) {
  const { routing } = REGIONS[region];
  const url = `https://${routing}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
  return riotGet(url);
}

// Summoner-v4: PUUID -> summoner (level, iconId, id)
async function getSummonerByPuuid(puuid, region) {
  const { platform } = REGIONS[region];
  const url = `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
  return riotGet(url);
}

// League-v4: puuid -> ranked entries
async function getLeagueEntries(puuid, region) {
  const { platform } = REGIONS[region];
  const url = `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`;
  return riotGet(url);
}

// Match-v5: get match IDs for a PUUID (ranked solo, queue 420)
async function getMatchIds(puuid, region, start = 0, count = 100) {
  const { routing } = REGIONS[region];
  const url = `https://${routing}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=420&start=${start}&count=${count}`;
  return riotGet(url);
}

// Match-v5: full match detail
async function getMatch(matchId, region) {
  const { routing } = REGIONS[region];
  const url = `https://${routing}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
  return riotGet(url);
}

// Match-v5: timeline (gold frames + events)
async function getTimeline(matchId, region) {
  const { routing } = REGIONS[region];
  const url = `https://${routing}.api.riotgames.com/lol/match/v5/matches/${matchId}/timeline`;
  return riotGet(url);
}

// Fetch current DDragon version (used for icon URLs)
let ddVersion = null;
async function getDdVersion() {
  if (ddVersion) return ddVersion;
  const res = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
  if (!res.ok) throw new Error(`DDragon versions fetch failed: ${res.status}`);
  const versions = await res.json();
  ddVersion = versions[0];
  return ddVersion;
}

module.exports = {
  getAccount,
  getSummonerByPuuid,
  getLeagueEntries,
  getMatchIds,
  getMatch,
  getTimeline,
  getDdVersion,
};
