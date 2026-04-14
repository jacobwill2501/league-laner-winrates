function getFrameIndexBeforeMs(frames, targetMs) {
  let idx = 0;
  for (let i = 0; i < frames.length; i++) {
    if (frames[i].timestamp < targetMs) idx = i;
    else break;
  }
  return idx;
}

function getFrameIndexAtMinute(frames, minute) {
  const targetMs = minute * 60 * 1000;
  let idx = 0;
  for (let i = 0; i < frames.length; i++) {
    if (frames[i].timestamp <= targetMs) idx = i;
    else break;
  }
  return idx;
}

function sumGold(frame, participantIds) {
  return participantIds.reduce((sum, id) => {
    const pf = frame.participantFrames[String(id)];
    return sum + (pf ? pf.totalGold : 0);
  }, 0);
}

function findFirstIntervention(frames, junglerIds, laneIds) {
  const junglerSet = new Set(junglerIds);
  const laneSet = new Set(laneIds);

  const killEvents = [];
  for (const frame of frames) {
    for (const event of frame.events) {
      if (event.type === 'CHAMPION_KILL') killEvents.push(event);
    }
  }
  killEvents.sort((a, b) => a.timestamp - b.timestamp);

  for (const event of killEvents) {
    const involved = [
      event.killerId,
      event.victimId,
      ...(event.assistingParticipantIds || []),
    ].filter(Boolean);

    const hasJungler = involved.some((id) => junglerSet.has(id));
    const hasLaner = involved.some((id) => laneSet.has(id));

    if (hasJungler && hasLaner) return event.timestamp;
  }
  return null;
}

function computeLaneStats(frames, allyIds, enemyIds, junglerIds, allyParticipants) {
  const laneIds = [...allyIds, ...enemyIds];
  const interventionTs = findFirstIntervention(frames, junglerIds, laneIds);

  let preInterventionFrameIdx;
  let interventionTimeSec = null;

  if (interventionTs !== null) {
    preInterventionFrameIdx = getFrameIndexBeforeMs(frames, interventionTs);
    interventionTimeSec = Math.floor(interventionTs / 1000);
  } else {
    preInterventionFrameIdx = getFrameIndexAtMinute(frames, 15);
  }

  const preFrame = frames[preInterventionFrameIdx];
  const frame10 = frames[getFrameIndexAtMinute(frames, 10)];
  const frame15 = frames[getFrameIndexAtMinute(frames, 15)];

  const preInterventionGD = sumGold(preFrame, allyIds) - sumGold(preFrame, enemyIds);
  const gd10 = sumGold(frame10, allyIds) - sumGold(frame10, enemyIds);
  const gd15 = sumGold(frame15, allyIds) - sumGold(frame15, enemyIds);

  let result;
  if (preInterventionGD > 300) result = 'W';
  else if (preInterventionGD < -300) result = 'L';
  else result = 'E';

  const allyKills = allyParticipants.reduce((s, p) => s + p.kills + p.assists, 0);
  const allyDeaths = Math.max(1, allyParticipants.reduce((s, p) => s + p.deaths, 0));
  const kda = allyKills / allyDeaths;

  return { preInterventionGD, gd10, gd15, result, interventionTime: interventionTimeSec, kda };
}

function computeMatchStats(participants, searchedId, frames) {
  const searched = participants.find((p) => p.participantId === searchedId);
  const allyTeamId = searched.teamId;
  const enemyTeamId = allyTeamId === 100 ? 200 : 100;

  function byPos(pos, teamId) {
    return participants.filter((p) => p.teamPosition === pos && p.teamId === teamId);
  }

  const allyTop = byPos('TOP', allyTeamId);
  const enemyTop = byPos('TOP', enemyTeamId);
  const allyMid = byPos('MIDDLE', allyTeamId);
  const enemyMid = byPos('MIDDLE', enemyTeamId);
  const allyBot = [...byPos('BOTTOM', allyTeamId), ...byPos('UTILITY', allyTeamId)];
  const enemyBot = [...byPos('BOTTOM', enemyTeamId), ...byPos('UTILITY', enemyTeamId)];
  const allyJungle = byPos('JUNGLE', allyTeamId);
  const enemyJungle = byPos('JUNGLE', enemyTeamId);

  if (!frames || frames.length === 0) {
    const empty = { preInterventionGD: 0, gd10: 0, gd15: 0, result: 'E', interventionTime: null, kda: 0 };
    return { top: empty, mid: empty, bot: empty };
  }

  const junglerIds = [...allyJungle, ...enemyJungle].map((p) => p.participantId);
  const ids = (arr) => arr.map((p) => p.participantId);

  return {
    top: computeLaneStats(frames, ids(allyTop), ids(enemyTop), junglerIds, allyTop),
    mid: computeLaneStats(frames, ids(allyMid), ids(enemyMid), junglerIds, allyMid),
    bot: computeLaneStats(frames, ids(allyBot), ids(enemyBot), junglerIds, allyBot),
  };
}

module.exports = { computeMatchStats };
