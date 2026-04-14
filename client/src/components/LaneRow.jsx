import { RESULT_COLOR } from '../constants';

const LANE_LABELS = { top: 'Top', mid: 'Mid', bot: 'Bot+Sup' };

function formatTime(seconds) {
  if (seconds == null) return 'No gank';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function gdLabel(gd) {
  if (gd == null) return '—';
  return `${gd >= 0 ? '+' : ''}${gd}g`;
}

export default function LaneRow({ lane, stats }) {
  const resultColor = RESULT_COLOR[stats.result];

  return (
    <div style={styles.row}>
      <div style={styles.laneLabel}>{LANE_LABELS[lane]}</div>

      <span
        style={{
          ...styles.resultChip,
          background: resultColor + '22',
          color: resultColor,
          border: `1px solid ${resultColor}55`,
        }}
      >
        {stats.result}
      </span>

      <div style={styles.primaryGD}>
        <span style={{ color: stats.preInterventionGD >= 0 ? 'var(--win)' : 'var(--loss)' }}>
          {gdLabel(stats.preInterventionGD)}
        </span>
        <span style={styles.gankTime}>{formatTime(stats.interventionTime)}</span>
      </div>

      <div style={styles.secondary}>
        <span style={styles.label}>@10</span>
        <span style={{ color: stats.gd10 >= 0 ? 'var(--win)' : 'var(--loss)' }}>
          {gdLabel(stats.gd10)}
        </span>
        <span style={styles.label}>@15</span>
        <span style={{ color: stats.gd15 >= 0 ? 'var(--win)' : 'var(--loss)' }}>
          {gdLabel(stats.gd15)}
        </span>
      </div>

      <div style={styles.kda}>
        <span style={styles.label}>KDA</span>
        <span>{stats.kda != null ? Number(stats.kda).toFixed(2) : '—'}</span>
      </div>
    </div>
  );
}

const styles = {
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.5rem 0',
    borderBottom: '1px solid var(--border)',
    flexWrap: 'wrap',
  },
  laneLabel: {
    width: '60px',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
  },
  resultChip: {
    fontSize: '0.75rem',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 4,
    minWidth: '40px',
    textAlign: 'center',
  },
  primaryGD: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
    minWidth: '110px',
    fontSize: '0.875rem',
    fontWeight: 600,
  },
  gankTime: {
    color: 'var(--text-muted)',
    fontWeight: 400,
    fontSize: '0.8rem',
  },
  secondary: {
    display: 'flex',
    gap: '0.35rem',
    alignItems: 'center',
    color: 'var(--text-muted)',
    fontSize: '0.8rem',
  },
  kda: {
    display: 'flex',
    gap: '0.35rem',
    alignItems: 'center',
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    marginLeft: 'auto',
  },
  label: {
    color: 'var(--text-muted)',
    fontSize: '0.75rem',
  },
};
