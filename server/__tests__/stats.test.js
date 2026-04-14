const { computeMatchStats } = require('../stats');

function makeParticipant(id, teamId, position, kills = 0, deaths = 0, assists = 0, champion = 'Dummy') {
  return { participantId: id, teamId, teamPosition: position, kills, deaths, assists, championName: champion, win: teamId === 100 };
}

function makeFrame(timestamp, goldByParticipantId, events = []) {
  const participantFrames = {};
  for (const [id, gold] of Object.entries(goldByParticipantId)) {
    participantFrames[id] = { totalGold: gold, participantId: parseInt(id) };
  }
  return { timestamp, participantFrames, events };
}

// Team 100 (ally): Top=1, Jungle=2, Mid=3, Bot=4, Sup=5
// Team 200 (enemy): Top=6, Jungle=7, Mid=8, Bot=9, Sup=10
// Searched player = participantId=2 (JUNGLE, team 100)
function makeParticipants() {
  return [
    makeParticipant(1, 100, 'TOP',     2, 1, 3, 'Garen'),
    makeParticipant(2, 100, 'JUNGLE',  3, 2, 5, 'Vi'),
    makeParticipant(3, 100, 'MIDDLE',  1, 3, 2, 'Lux'),
    makeParticipant(4, 100, 'BOTTOM',  4, 1, 6, 'Jinx'),
    makeParticipant(5, 100, 'UTILITY', 0, 4, 8, 'Thresh'),
    makeParticipant(6, 200, 'TOP',     1, 2, 1, 'Darius'),
    makeParticipant(7, 200, 'JUNGLE',  4, 3, 2, 'Hecarim'),
    makeParticipant(8, 200, 'MIDDLE',  3, 1, 4, 'Syndra'),
    makeParticipant(9, 200, 'BOTTOM',  2, 4, 3, 'Caitlyn'),
    makeParticipant(10, 200, 'UTILITY',1, 2, 5, 'Blitzcrank'),
  ];
}

test('no jungler intervention → falls back to GD@15 for all lanes', () => {
  const participants = makeParticipants();
  const frames = [];
  for (let min = 0; min <= 15; min++) {
    frames.push(makeFrame(min * 60000, {
      1: 2000, 2: 1800, 3: 1500, 4: 1700, 5: 900,
      6: 1500, 7: 1900, 8: 1800, 9: 1200, 10: 700,
    }));
  }

  const result = computeMatchStats(participants, 2, frames);

  // Top ally=1 (2000g) vs enemy=6 (1500g) at frame15 → GD=+500 → W
  expect(result.top.preInterventionGD).toBe(500);
  expect(result.top.result).toBe('W');
  expect(result.top.interventionTime).toBeNull();

  // Mid ally=3 (1500g) vs enemy=8 (1800g) at frame15 → GD=-300 → E (not < -300)
  expect(result.mid.preInterventionGD).toBe(-300);
  expect(result.mid.result).toBe('E');

  // Bot ally=(1700+900) vs enemy=(1200+700) at frame15 → 2600-1900=700 → W
  expect(result.bot.preInterventionGD).toBe(700);
  expect(result.bot.result).toBe('W');

  expect(result.top.gd15).toBe(500);
});

test('jungler kills top laner → top uses frame before event, others use GD@15', () => {
  const participants = makeParticipants();
  const frames = [];
  for (let min = 0; min <= 15; min++) {
    const events = [];
    if (min === 5) {
      events.push({
        type: 'CHAMPION_KILL',
        timestamp: 330000,
        killerId: 7,
        victimId: 1,
        assistingParticipantIds: [],
      });
    }
    frames.push(makeFrame(min * 60000, {
      1: 1000 + min * 100, 2: 900 + min * 100, 3: 800 + min * 100,
      4: 1100 + min * 100, 5: 500 + min * 100,
      6: 950 + min * 100,  7: 1000 + min * 100, 8: 900 + min * 100,
      9: 800 + min * 100,  10: 400 + min * 100,
    }, events));
  }

  const result = computeMatchStats(participants, 2, frames);

  // Intervention at 330000ms → last frame before = frame at 5min (300000ms)
  // At frame 5: ally top = 1000+500=1500, enemy top = 950+500=1450 → GD=+50 → E
  expect(result.top.preInterventionGD).toBe(50);
  expect(result.top.result).toBe('E');
  expect(result.top.interventionTime).toBe(330);

  // Mid: no intervention → uses GD@15
  expect(result.mid.preInterventionGD).toBe(-100);
  expect(result.mid.interventionTime).toBeNull();
});

test('jungler is assister → counts as intervention', () => {
  const participants = makeParticipants();
  const frames = [];
  for (let min = 0; min <= 15; min++) {
    const events = [];
    if (min === 8) {
      events.push({
        type: 'CHAMPION_KILL',
        timestamp: 480000,
        killerId: 1,
        victimId: 6,
        assistingParticipantIds: [2],
      });
    }
    frames.push(makeFrame(min * 60000, {
      1: 500 + min * 200, 6: 500 + min * 150,
      2: 400, 3: 400, 4: 400, 5: 400,
      7: 400, 8: 400, 9: 400, 10: 400,
    }, events));
  }

  const result = computeMatchStats(participants, 2, frames);

  // Intervention at 480000ms → last frame before = frame at 7min (420000ms)
  // ally top = 500+1400=1900, enemy top = 500+1050=1550 → GD=+350 → W
  expect(result.top.preInterventionGD).toBe(350);
  expect(result.top.result).toBe('W');
  expect(result.top.interventionTime).toBe(480);
});

test('intervention at minute 0 → uses frame 0 (GD=0)', () => {
  const participants = makeParticipants();
  const frames = [
    makeFrame(0, { 1: 500, 6: 500, 2: 500, 3: 500, 4: 500, 5: 500, 7: 500, 8: 500, 9: 500, 10: 500 }, [
      {
        type: 'CHAMPION_KILL',
        timestamp: 15000,
        killerId: 7,
        victimId: 1,
        assistingParticipantIds: [],
      },
    ]),
    ...Array.from({ length: 15 }, (_, i) => makeFrame((i + 1) * 60000, {
      1: 500, 6: 500, 2: 500, 3: 500, 4: 500, 5: 500, 7: 500, 8: 500, 9: 500, 10: 500,
    })),
  ];

  const result = computeMatchStats(participants, 2, frames);

  expect(result.top.preInterventionGD).toBe(0);
  expect(result.top.result).toBe('E');
  expect(result.top.interventionTime).toBe(15);
});

test('GD threshold: exactly +300 is Even, +301 is Win', () => {
  const participants = makeParticipants();
  const frames = Array.from({ length: 16 }, (_, min) =>
    makeFrame(min * 60000, {
      1: 1300, 6: 1000,
      2: 1000, 3: 1000, 4: 1000, 5: 1000,
      7: 1000, 8: 1000, 9: 1000, 10: 1000,
    })
  );

  const result = computeMatchStats(participants, 2, frames);
  expect(result.top.preInterventionGD).toBe(300);
  expect(result.top.result).toBe('E');
});

test('KDA: computed correctly per lane, death=0 uses 1 as denominator', () => {
  const participants = [
    makeParticipant(1, 100, 'TOP',     5, 0, 3, 'Garen'),
    makeParticipant(2, 100, 'JUNGLE',  3, 2, 5, 'Vi'),
    makeParticipant(3, 100, 'MIDDLE',  2, 4, 1, 'Lux'),
    makeParticipant(4, 100, 'BOTTOM',  3, 1, 6, 'Jinx'),
    makeParticipant(5, 100, 'UTILITY', 0, 2, 4, 'Thresh'),
    makeParticipant(6, 200, 'TOP',     1, 5, 0, 'Darius'),
    makeParticipant(7, 200, 'JUNGLE',  4, 3, 2, 'Hecarim'),
    makeParticipant(8, 200, 'MIDDLE',  4, 2, 3, 'Syndra'),
    makeParticipant(9, 200, 'BOTTOM',  2, 3, 1, 'Caitlyn'),
    makeParticipant(10, 200, 'UTILITY',1, 1, 2, 'Blitzcrank'),
  ];
  const frames = Array.from({ length: 16 }, (_, min) =>
    makeFrame(min * 60000, { 1:1000,2:1000,3:1000,4:1000,5:1000,6:1000,7:1000,8:1000,9:1000,10:1000 })
  );

  const result = computeMatchStats(participants, 2, frames);
  expect(result.top.kda).toBeCloseTo(8, 2);    // (5+3)/max(1,0) = 8
  expect(result.mid.kda).toBeCloseTo(0.75, 2); // (2+1)/4 = 0.75
  // bot: (3+0+6+4) / max(1, 1+2) = 13/3 ≈ 4.33
  expect(result.bot.kda).toBeCloseTo(13 / 3, 2);
});
