export default function Pagination({ page, hasMore, onPrev, onNext, loading }) {
  return (
    <div style={styles.container}>
      <button
        style={{ ...styles.btn, opacity: page === 1 || loading ? 0.4 : 1 }}
        onClick={onPrev}
        disabled={page === 1 || loading}
      >
        ← Previous
      </button>

      <span style={styles.pageInfo}>Page {page}</span>

      <button
        style={{ ...styles.btn, opacity: !hasMore || loading ? 0.4 : 1 }}
        onClick={onNext}
        disabled={!hasMore || loading}
      >
        Next →
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    marginTop: '1.5rem',
    paddingBottom: '2rem',
  },
  btn: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text)',
    padding: '0.5rem 1.25rem',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  pageInfo: {
    color: 'var(--text-muted)',
    fontSize: '0.875rem',
    minWidth: '60px',
    textAlign: 'center',
  },
};
