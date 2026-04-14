import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { REGIONS } from '../constants';
import { fetchSummoner } from '../api';

const clusters = [...new Set(REGIONS.map((r) => r.cluster))];

export default function SearchPage() {
  const [input, setInput] = useState('');
  const [region, setRegion] = useState('NA');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSearch(e) {
    e.preventDefault();
    setError('');

    const parts = input.split('#');
    if (parts.length !== 2 || !parts[0].trim() || !parts[1].trim()) {
      setError('Enter your name in GameName#TAG format (e.g. Doublelift#NA1)');
      return;
    }

    const [gameName, tagLine] = parts.map((s) => s.trim());
    setLoading(true);
    try {
      const summoner = await fetchSummoner(gameName, tagLine, region);
      navigate('/dashboard', { state: { summoner, region } });
    } catch (err) {
      setError(err.message || 'Summoner not found');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Jungle Lane Stats</h1>
        <p style={styles.subtitle}>See how your lanes perform before you arrive</p>

        <form onSubmit={handleSearch} style={styles.form}>
          <input
            style={styles.input}
            type="text"
            placeholder="GameName#TAG"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />

          <select
            style={styles.select}
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            disabled={loading}
          >
            {clusters.map((cluster) => (
              <optgroup key={cluster} label={cluster}>
                {REGIONS.filter((r) => r.cluster === cluster).map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </optgroup>
            ))}
          </select>

          <button
            style={{ ...styles.button, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && <p style={styles.error}>{error}</p>}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '420px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: 'var(--gold)',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    textAlign: 'center',
    marginBottom: '0.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  input: {
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text)',
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    outline: 'none',
  },
  select: {
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text)',
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    outline: 'none',
  },
  button: {
    background: 'var(--gold)',
    color: '#000',
    border: 'none',
    borderRadius: 'var(--radius)',
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    fontWeight: 600,
    marginTop: '0.25rem',
  },
  error: {
    color: 'var(--loss)',
    fontSize: '0.875rem',
    textAlign: 'center',
  },
};
