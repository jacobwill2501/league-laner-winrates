import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchMatches } from '../api';
import SummonerCard from '../components/SummonerCard';
import MatchCard from '../components/MatchCard';
import HelpModal from '../components/HelpModal';

export default function DashboardPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [allMatches, setAllMatches] = useState([]);
  const [aggregates, setAggregates] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (!state?.summoner) {
      navigate('/', { replace: true });
    }
  }, [state, navigate]);

  useEffect(() => {
    if (!state?.summoner) return;
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError('');
      try {
        const data = await fetchMatches(state.summoner.puuid, state.region, page);
        if (!cancelled) {
          setAllMatches((prev) => page === 1 ? data.matches : [...prev, ...data.matches]);
          setAggregates(data.aggregates);
          setHasMore(data.pagination.hasMore);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load matches');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [page, state]);

  if (!state?.summoner) return null;

  const isFirstLoad = loading && allMatches.length === 0;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topBar}>
          <button style={styles.back} onClick={() => navigate('/')}>
            ← New Search
          </button>
          <button style={styles.helpBtn} onClick={() => setShowHelp(true)}>
            ? How stats work
          </button>
        </div>
        {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

        <SummonerCard
          summoner={state.summoner}
          aggregates={aggregates}
        />

        {isFirstLoad && <div style={styles.loading}>Loading matches...</div>}

        {error && <div style={styles.error}>{error}</div>}

        {!isFirstLoad && allMatches.length === 0 && (
          <div style={styles.empty}>
            No jungle games found in recent match history.
          </div>
        )}

        {allMatches.map((match) => (
          <MatchCard key={match.matchId} match={match} />
        ))}

        {loading && allMatches.length > 0 && (
          <div style={styles.loadingMore}>Loading more matches...</div>
        )}

        {!loading && hasMore && (
          <div style={styles.loadMoreWrap}>
            <button style={styles.loadMore} onClick={() => setPage((p) => p + 1)}>
              Load More
            </button>
            {aggregates && (
              <span style={styles.counter}>
                {allMatches.length} of {aggregates.totalIds} ranked matches analyzed
              </span>
            )}
          </div>
        )}

        {!loading && !hasMore && allMatches.length > 0 && (
          <div style={styles.allLoaded}>
            All {allMatches.length} jungle games loaded
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    padding: '1.5rem 1rem',
  },
  container: {
    maxWidth: '900px',
    margin: '0 auto',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem',
  },
  back: {
    background: 'none',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text-muted)',
    padding: '0.4rem 0.9rem',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  helpBtn: {
    background: 'none',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text-muted)',
    padding: '0.4rem 0.9rem',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  loading: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    padding: '3rem 0',
    fontSize: '0.95rem',
  },
  loadingMore: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    padding: '1rem 0',
    fontSize: '0.875rem',
  },
  error: {
    textAlign: 'center',
    color: 'var(--loss)',
    padding: '2rem 0',
  },
  empty: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    padding: '3rem 0',
  },
  loadMoreWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.6rem',
    marginTop: '1.5rem',
    paddingBottom: '2rem',
  },
  loadMore: {
    background: 'var(--surface)',
    border: '1px solid var(--gold)',
    borderRadius: 'var(--radius)',
    color: 'var(--gold)',
    padding: '0.5rem 2rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  counter: {
    color: 'var(--text-muted)',
    fontSize: '0.8rem',
  },
  allLoaded: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '0.8rem',
    padding: '1.5rem 0 2rem',
  },
};
