const LANE_LABELS = { top: 'Top', mid: 'Mid', bot: 'Bot+Sup' };

export default function LaneStatChip({ lane, stats }) {
  if (!stats) return null;
  const winPct = Math.round(stats.winRate * 100);
  const winOrEvenPct = Math.round((stats.winOrEvenRate ?? 0) * 100);
  const gdSign = stats.avgGD >= 0 ? '+' : '';
  const color = stats.winRate > 0.52 ? 'var(--win)' : stats.winRate < 0.45 ? 'var(--loss)' : 'var(--text)';

  return (
    <div style={styles.chip}>
      <div style={styles.laneLabel}>{LANE_LABELS[lane]}</div>
      <div style={styles.rateRow}>
        <span
          style={{ ...styles.winRate, color }}
          title="Win rate (lane GD > +300)"
        >
          {winPct}%
        </span>
        <span
          style={styles.winOrEven}
          title="Win or even rate (lane GD > -300)"
        >
          {winOrEvenPct}%
        </span>
      </div>
      <div style={styles.stat}>
        <span style={styles.statLabel} title="Avg gold difference at time of first jungler intervention (or @15 if no gank)">Avg GD</span>
        <span style={{ color: stats.avgGD >= 0 ? 'var(--win)' : 'var(--loss)' }}>
          {gdSign}{stats.avgGD}g
        </span>
      </div>
      <div style={styles.stat}>
        <span style={styles.statLabel} title="Avg laner KDA at end of game">KDA</span>
        <span>{stats.avgKDA}</span>
      </div>
      <div style={styles.secondary}>
        <span style={styles.statLabel} title="Avg gold difference at 10 minutes">GD@10</span>
        <span style={{ color: stats.avgGD10 >= 0 ? 'var(--win)' : 'var(--loss)' }}>
          {stats.avgGD10 >= 0 ? '+' : ''}{stats.avgGD10}
        </span>
      </div>
      <div style={styles.secondary}>
        <span style={styles.statLabel} title="Avg gold difference at 15 minutes">GD@15</span>
        <span style={{ color: stats.avgGD15 >= 0 ? 'var(--win)' : 'var(--loss)' }}>
          {stats.avgGD15 >= 0 ? '+' : ''}{stats.avgGD15}
        </span>
      </div>
    </div>
  );
}

const styles = {
  chip: {
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '0.875rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    minWidth: '110px',
  },
  laneLabel: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  rateRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.4rem',
  },
  winRate: {
    fontSize: '1.5rem',
    fontWeight: 700,
  },
  winOrEven: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#86efac',
  },
  stat: {
    fontSize: '0.8rem',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '0.5rem',
  },
  secondary: {
    fontSize: '0.75rem',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '0.5rem',
    color: 'var(--text-muted)',
  },
  statLabel: {
    color: 'var(--text-muted)',
  },
};
