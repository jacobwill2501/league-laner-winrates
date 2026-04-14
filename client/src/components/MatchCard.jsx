import LaneRow from './LaneRow';

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function timeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function MatchCard({ match }) {
  const borderColor = match.win ? 'var(--win)' : 'var(--loss)';

  return (
    <div style={{ ...styles.card, borderLeft: `3px solid ${borderColor}` }}>
      {/* Header row */}
      <div style={styles.header}>
        <div style={styles.championInfo}>
          <img
            src={match.championIconUrl}
            alt={match.champion}
            width={36}
            height={36}
            style={styles.champIcon}
          />
          <span style={styles.champName}>{match.champion}</span>
        </div>

        <span
          style={{
            ...styles.resultBadge,
            background: match.win ? 'var(--win)22' : 'var(--loss)22',
            color: match.win ? 'var(--win)' : 'var(--loss)',
            border: `1px solid ${match.win ? 'var(--win)' : 'var(--loss)'}55`,
          }}
        >
          {match.win ? 'WIN' : 'LOSS'}
        </span>

        <span style={styles.meta}>{formatDuration(match.duration)}</span>
        <span style={styles.meta}>{timeAgo(match.date)}</span>
      </div>

      {/* Lane breakdown */}
      <div style={styles.lanes}>
        <LaneRow lane="top" stats={match.lanes.top} />
        <LaneRow lane="mid" stats={match.lanes.mid} />
        <LaneRow lane="bot" stats={match.lanes.bot} />
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '1rem 1.25rem',
    marginBottom: '0.75rem',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.75rem',
    flexWrap: 'wrap',
  },
  championInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  champIcon: {
    borderRadius: '50%',
    border: '1px solid var(--border)',
  },
  champName: {
    fontWeight: 600,
    fontSize: '0.95rem',
  },
  resultBadge: {
    fontSize: '0.75rem',
    fontWeight: 700,
    padding: '2px 10px',
    borderRadius: 4,
    letterSpacing: '0.05em',
  },
  meta: {
    color: 'var(--text-muted)',
    fontSize: '0.8rem',
    marginLeft: '0.25rem',
  },
  lanes: {
    display: 'flex',
    flexDirection: 'column',
  },
};
