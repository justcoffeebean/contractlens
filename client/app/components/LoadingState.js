export default function LoadingState({ filename }) {
  const steps = [
    { label: 'Extracting text from PDF', icon: '📄' },
    { label: 'Reading contract clauses', icon: '🔍' },
    { label: 'Analyzing risks', icon: '⚠️' },
    { label: 'Generating report', icon: '📋' },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 32,
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
          Analyzing your contract
        </h2>
        <p style={{ color: '#555', fontSize: 14 }}>{filename}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 320 }}>
        {steps.map((step, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            background: '#1a1a1a',
            border: '1px solid #2a2a2a',
            borderRadius: 10,
            animation: `fadeIn 0.3s ease ${i * 0.3}s forwards`,
            opacity: 0,
          }}>
            <span style={{ fontSize: 20 }}>{step.icon}</span>
            <span style={{ fontSize: 14, color: '#ccc' }}>{step.label}</span>
            <span style={{
              marginLeft: 'auto',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#4ade80',
              animation: 'pulse 1.5s ease infinite',
              animationDelay: `${i * 0.3}s`,
            }} />
          </div>
        ))}
      </div>
    </div>
  )
}