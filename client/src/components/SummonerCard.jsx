import LaneStatChip from './LaneStatChip';

export default function SummonerCard({ summoner, aggregates, role }) {
  return (
    <div style={styles.card}>
      <div style={styles.left}>
        <div style={styles.iconWrap}>
          <img
            src={summoner.iconUrl}
            alt="icon"
            width={64}
            height={64}
            style={styles.icon}
          />
          <span style={styles.level}>{summoner.level}</span>
        </div>
        <div>
          <div style={styles.name}>
            {summoner.name}
            <span style={styles.tag}>#{summoner.tag}</span>
          </div>
          <div style={styles.rank}>{summoner.rank}</div>
          <div style={styles.lp}>{summoner.lp} LP</div>
          <div style={styles.wl}>
            <span style={{ color: 'var(--win)' }}>{summoner.wins}W</span>
            {' / '}
            <span style={{ color: 'var(--loss)' }}>{summoner.losses}L</span>
          </div>
        </div>
      </div>

      <div style={styles.right}>
        {aggregates && (
          <>
            <div style={styles.aggHeader}>
              Laning Stats
              <span style={styles.coverage}>
                ({aggregates.cachedGames} games analyzed)
              </span>
            </div>
            <div style={styles.chips}>
              <LaneStatChip lane="top" stats={aggregates.top} role={role} />
              <LaneStatChip lane="mid" stats={aggregates.mid} role={role} />
              <LaneStatChip lane="bot" stats={aggregates.bot} role={role} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '1.5rem',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1.5rem',
    alignItems: 'flex-start',
    marginBottom: '1.5rem',
  },
  left: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  iconWrap: {
    position: 'relative',
    flexShrink: 0,
  },
  icon: {
    borderRadius: '50%',
    border: '2px solid var(--gold)',
  },
  level: {
    position: 'absolute',
    bottom: -4,
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 4,
    fontSize: '0.7rem',
    padding: '1px 4px',
    color: 'var(--text-muted)',
  },
  name: {
    fontSize: '1.25rem',
    fontWeight: 700,
  },
  tag: {
    color: 'var(--text-muted)',
    fontWeight: 400,
    fontSize: '1rem',
    marginLeft: '0.25rem',
  },
  rank: {
    color: 'var(--gold)',
    fontWeight: 600,
    fontSize: '0.9rem',
    marginTop: '0.25rem',
  },
  lp: {
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
  },
  wl: {
    fontSize: '0.85rem',
    marginTop: '0.1rem',
  },
  right: {
    flex: 1,
    minWidth: '280px',
  },
  aggHeader: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    marginBottom: '0.75rem',
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  coverage: {
    fontWeight: 400,
    fontSize: '0.8rem',
  },
  chips: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
};
