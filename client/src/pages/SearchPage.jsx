import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { REGIONS } from '../constants';
import { fetchSummoner } from '../api';

const clusters = [...new Set(REGIONS.map((r) => r.cluster))];

const ROLES = [
  { value: 'top', label: 'Top' },
  { value: 'jungle', label: 'Jungle' },
  { value: 'mid', label: 'Mid' },
  { value: 'bot', label: 'Bot' },
  { value: 'support', label: 'Support' },
];

export default function SearchPage() {
  const [input, setInput] = useState('');
  const [region, setRegion] = useState('NA');
  const [role, setRole] = useState(null);
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
      navigate('/dashboard', { state: { summoner, region, role } });
    } catch (err) {
      setError(err.message || 'Summoner not found');
    } finally {
      setLoading(false);
    }
  }

  const canSearch = !loading && !!role;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Lane Stats</h1>
        <p style={styles.subtitle}>See how lanes perform in your ranked games</p>

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

          <div style={styles.roleRow}>
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                style={{
                  ...styles.roleBtn,
                  ...(role === r.value ? styles.roleBtnActive : {}),
                }}
                onClick={() => setRole(r.value)}
                disabled={loading}
              >
                {r.label}
              </button>
            ))}
          </div>

          <button
            style={{ ...styles.button, opacity: canSearch ? 1 : 0.4, cursor: canSearch ? 'pointer' : 'not-allowed' }}
            type="submit"
            disabled={!canSearch}
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
  roleRow: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  roleBtn: {
    flex: 1,
    minWidth: '60px',
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text-muted)',
    padding: '0.5rem 0.25rem',
    fontSize: '0.85rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
  roleBtnActive: {
    background: 'var(--gold)22',
    border: '1px solid var(--gold)',
    color: 'var(--gold)',
    fontWeight: 700,
  },
  error: {
    color: 'var(--loss)',
    fontSize: '0.875rem',
    textAlign: 'center',
  },
};
