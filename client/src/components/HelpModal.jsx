export default function HelpModal({ onClose }) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <span style={styles.title}>How Stats Are Calculated</span>
          <button style={styles.close} onClick={onClose}>✕</button>
        </div>

        <div style={styles.body}>

          {/* Lane Result */}
          <section style={styles.section}>
            <div style={styles.sectionTitle}>Lane Result (W / E / L)</div>
            <p style={styles.text}>
              Each lane is scored based on <strong>gold difference at the moment a jungler first gets involved</strong> — defined as the first kill, death, or assist where a jungler and a laner from that lane are both part of the event.
            </p>
            <p style={styles.text}>
              If no jungler gets involved in a lane, <strong>GD@15</strong> is used as the snapshot instead.
            </p>
            <div style={styles.thresholdRow}>
              <span style={{ ...styles.chip, background: '#22c55e22', color: '#22c55e', border: '1px solid #22c55e55' }}>W</span>
              <span style={styles.thresholdLabel}>GD &gt; <strong>+300g</strong> — lane ahead at intervention</span>
            </div>
            <div style={styles.thresholdRow}>
              <span style={{ ...styles.chip, background: '#6b728022', color: '#6b7280', border: '1px solid #6b728055' }}>E</span>
              <span style={styles.thresholdLabel}><strong>−300g</strong> to <strong>+300g</strong> — lane even</span>
            </div>
            <div style={styles.thresholdRow}>
              <span style={{ ...styles.chip, background: '#ef444422', color: '#ef4444', border: '1px solid #ef444455' }}>L</span>
              <span style={styles.thresholdLabel}>GD &lt; <strong>−300g</strong> — lane behind at intervention</span>
            </div>
          </section>

          {/* Lane Stat Chips */}
          <section style={styles.section}>
            <div style={styles.sectionTitle}>Lane Stat Chips (Top / Mid / Bot+Sup)</div>
            <p style={styles.text}>
              These aggregate across all jungle games analyzed so far and update as you load more.
            </p>

            {/* Example chip */}
            <div style={styles.exampleChip}>
              <div style={styles.exampleLaneLabel}>TOP</div>
              <div style={styles.exampleRateRow}>
                <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#22c55e' }} title="Win rate">54%</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#86efac' }} title="Win or even rate">71%</span>
              </div>
              <div style={styles.exampleStat}><span style={styles.exLabel}>Avg GD</span><span style={{ color: '#22c55e' }}>+210g</span></div>
              <div style={styles.exampleStat}><span style={styles.exLabel}>KDA</span><span>2.1</span></div>
              <div style={styles.exampleStat}><span style={styles.exLabel}>GD@10</span><span style={{ color: '#22c55e' }}>+180</span></div>
              <div style={styles.exampleStat}><span style={styles.exLabel}>GD@15</span><span style={{ color: '#22c55e' }}>+220</span></div>
            </div>

            <div style={styles.legendList}>
              <div style={styles.legendRow}>
                <span style={{ ...styles.legendSwatch, color: '#22c55e', fontWeight: 700, fontSize: '1rem' }}>54%</span>
                <span style={styles.legendText}><strong>Win rate</strong> — % of lanes scored W (GD &gt; +300 at intervention)</span>
              </div>
              <div style={styles.legendRow}>
                <span style={{ ...styles.legendSwatch, color: '#86efac', fontWeight: 600 }}>71%</span>
                <span style={styles.legendText}><strong>Win or even rate</strong> — % of lanes not lost (GD &gt; −300 at intervention). Pastel green.</span>
              </div>
              <div style={styles.legendRow}>
                <span style={styles.legendSwatch}>Avg GD</span>
                <span style={styles.legendText}>Average gold difference at intervention (or @15 if no gank)</span>
              </div>
              <div style={styles.legendRow}>
                <span style={styles.legendSwatch}>KDA</span>
                <span style={styles.legendText}>Average laner KDA at end of game (kills + assists) / max(1, deaths)</span>
              </div>
              <div style={styles.legendRow}>
                <span style={styles.legendSwatch}>GD@10</span>
                <span style={styles.legendText}>Average gold difference at the 10-minute mark regardless of intervention</span>
              </div>
              <div style={styles.legendRow}>
                <span style={styles.legendSwatch}>GD@15</span>
                <span style={styles.legendText}>Average gold difference at the 15-minute mark regardless of intervention</span>
              </div>
            </div>
          </section>

          {/* Per-match lane row */}
          <section style={styles.section}>
            <div style={styles.sectionTitle}>Per-Match Lane Rows</div>
            <div style={styles.exampleRow}>
              <span style={styles.exampleLaneTag}>Top</span>
              <span style={{ ...styles.chip, background: '#22c55e22', color: '#22c55e', border: '1px solid #22c55e55', marginRight: 8 }}>W</span>
              <span style={{ color: '#22c55e', fontWeight: 600, marginRight: 8 }}>+420g</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginRight: 16 }}>8:00</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>@10 <span style={{ color: '#22c55e' }}>+200g</span></span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: 8 }}>@15 <span style={{ color: '#22c55e' }}>+380g</span></span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: 'auto' }}>KDA 2.50</span>
            </div>
            <div style={styles.legendList}>
              <div style={styles.legendRow}>
                <span style={styles.legendSwatch}>+420g</span>
                <span style={styles.legendText}>Gold difference at intervention time (green = ahead, red = behind)</span>
              </div>
              <div style={styles.legendRow}>
                <span style={styles.legendSwatch}>8:00</span>
                <span style={styles.legendText}>Timestamp of first jungler involvement. "No gank" if jungler never touched this lane.</span>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  modal: {
    background: '#13131a',
    border: '1px solid #1e1e2e',
    borderRadius: 10,
    width: '100%',
    maxWidth: 580,
    maxHeight: '85vh',
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.1rem 1.5rem',
    borderBottom: '1px solid #1e1e2e',
    position: 'sticky',
    top: 0,
    background: '#13131a',
    zIndex: 1,
  },
  title: {
    fontWeight: 700,
    fontSize: '1rem',
  },
  close: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '1rem',
    cursor: 'pointer',
    padding: '0.25rem',
  },
  body: {
    padding: '1.25rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  },
  sectionTitle: {
    fontWeight: 700,
    fontSize: '0.9rem',
    color: '#f59e0b',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  text: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    lineHeight: 1.55,
    margin: 0,
  },
  thresholdRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginTop: '0.2rem',
  },
  chip: {
    fontSize: '0.75rem',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 4,
    minWidth: '32px',
    textAlign: 'center',
    flexShrink: 0,
  },
  thresholdLabel: {
    fontSize: '0.83rem',
    color: '#94a3b8',
  },
  exampleChip: {
    background: '#1a1a24',
    border: '1px solid #1e1e2e',
    borderRadius: 8,
    padding: '0.75rem 1rem',
    display: 'inline-flex',
    flexDirection: 'column',
    gap: '0.3rem',
    minWidth: '130px',
    alignSelf: 'flex-start',
  },
  exampleLaneLabel: {
    fontSize: '0.7rem',
    fontWeight: 600,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  exampleRateRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.4rem',
  },
  exampleStat: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.78rem',
    gap: '0.5rem',
    color: '#f1f5f9',
  },
  exLabel: {
    color: '#94a3b8',
  },
  legendList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    marginTop: '0.25rem',
  },
  legendRow: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'flex-start',
  },
  legendSwatch: {
    fontSize: '0.78rem',
    color: '#94a3b8',
    minWidth: '52px',
    flexShrink: 0,
    paddingTop: '0.05rem',
  },
  legendText: {
    fontSize: '0.83rem',
    color: '#94a3b8',
    lineHeight: 1.5,
  },
  exampleRow: {
    background: '#1a1a24',
    border: '1px solid #1e1e2e',
    borderRadius: 6,
    padding: '0.5rem 0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    flexWrap: 'wrap',
  },
  exampleLaneTag: {
    fontSize: '0.78rem',
    fontWeight: 600,
    color: '#94a3b8',
    width: '32px',
  },
};
