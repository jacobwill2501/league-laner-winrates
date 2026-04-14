const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function apiFetch(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data;
}

export function fetchSummoner(gameName, tagLine, region) {
  return apiFetch(
    `/api/summoner?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}&region=${region}`
  );
}

export function fetchMatches(puuid, region, page) {
  return apiFetch(`/api/matches?puuid=${puuid}&region=${region}&page=${page}`);
}
