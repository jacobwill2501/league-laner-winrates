require('dotenv').config();

const REGIONS = {
  NA:   { platform: 'na1',  routing: 'americas' },
  BR:   { platform: 'br1',  routing: 'americas' },
  LAN:  { platform: 'la1',  routing: 'americas' },
  LAS:  { platform: 'la2',  routing: 'americas' },
  EUW:  { platform: 'euw1', routing: 'europe'   },
  EUNE: { platform: 'eun1', routing: 'europe'   },
  TR:   { platform: 'tr1',  routing: 'europe'   },
  RU:   { platform: 'ru',   routing: 'europe'   },
  KR:   { platform: 'kr',   routing: 'asia'     },
  JP:   { platform: 'jp1',  routing: 'asia'     },
  OCE:  { platform: 'oc1',  routing: 'sea'      },
  PH:   { platform: 'ph2',  routing: 'sea'      },
  SG:   { platform: 'sg2',  routing: 'sea'      },
  TH:   { platform: 'th2',  routing: 'sea'      },
  TW:   { platform: 'tw2',  routing: 'sea'      },
  VN:   { platform: 'vn2',  routing: 'sea'      },
};

const RIOT_API_KEY = process.env.RIOT_API_KEY || '';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const PORT = parseInt(process.env.PORT || '3001', 10);

// 200ms between uncached Riot API calls — stays well within 20 req/s dev limit
const REQUEST_DELAY_MS = 200;

module.exports = { REGIONS, RIOT_API_KEY, CLIENT_ORIGIN, PORT, REQUEST_DELAY_MS };
