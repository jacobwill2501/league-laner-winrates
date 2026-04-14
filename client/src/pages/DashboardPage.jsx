import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchMatches } from '../api';
import SummonerCard from '../components/SummonerCard';
import MatchCard from '../components/MatchCard';
import Pagination from '../components/Pagination';

export default function DashboardPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirect to search if navigated directly without summoner state
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
        if (!cancelled) setMatchData(data);
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

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Back button */}
        <button style={styles.back} onClick={() => navigate('/')}>
          ← New Search
        </button>

        {/* Summoner header */}
        <SummonerCard
          summoner={state.summoner}
          aggregates={matchData?.aggregates}
        />

        {/* Match list */}
        {loading && <div style={styles.loading}>Loading matches...</div>}

        {error && <div style={styles.error}>{error}</div>}

        {!loading && matchData && matchData.matches.length === 0 && (
          <div style={styles.empty}>
            No jungle games found in recent match history.
          </div>
        )}

        {!loading && matchData?.matches.map((match) => (
          <MatchCard key={match.matchId} match={match} />
        ))}

        {matchData && (
          <Pagination
            page={page}
            hasMore={matchData.pagination.hasMore}
            onPrev={() => setPage((p) => p - 1)}
            onNext={() => setPage((p) => p + 1)}
            loading={loading}
          />
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
  back: {
    background: 'none',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text-muted)',
    padding: '0.4rem 0.9rem',
    fontSize: '0.85rem',
    marginBottom: '1.25rem',
  },
  loading: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    padding: '3rem 0',
    fontSize: '0.95rem',
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
};
