'use client'

import { useEffect, useRef } from 'react'
import AskQuestion from './AskQuestion'

const riskColors = {
  low: { bg: '#0d2e1f', border: '#1a5c3a', text: '#4ade80' },
  medium: { bg: '#2e1f0d', border: '#6e3a1a', text: '#fb923c' },
  high: { bg: '#3a0d0d', border: '#6e1a1a', text: '#f87171' },
}

function RiskBadge({ level }) {
  const colors = riskColors[level] || riskColors.low
  return (
    <span style={{
      background: colors.bg,
      border: `1px solid ${colors.border}`,
      color: colors.text,
      padding: '3px 10px',
      borderRadius: 100,
      fontSize: 11,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    }}>
      {level} risk
    </span>
  )
}

function Section({ title, children }) {
  return (
    <div style={{
      background: '#1a1a1a',
      border: '1px solid #2a2a2a',
      borderRadius: 12,
      padding: 24,
      marginBottom: 16,
      animation: 'fadeIn 0.3s ease forwards',
    }}>
      <h3 style={{
        fontSize: 14,
        fontWeight: 700,
        color: '#555',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 16,
      }}>
        {title}
      </h3>
      {children}
    </div>
  )
}

export default function AnalysisReport({ report, onReset }) {
  const { filename, pages, analysis } = report
  const askRef = useRef(null)

  // Smooth scroll to Q&A section after report loads
  useEffect(() => {
    const timer = setTimeout(() => {
      askRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 32,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 24 }}>📄</span>
            <h1 style={{ fontSize: 24, fontWeight: 700 }}>{filename}</h1>
          </div>
          <p style={{ color: '#555', fontSize: 14 }}>
            {pages} pages · {analysis.contractType}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <RiskBadge level={analysis.overallRisk} />
          <button
            onClick={onReset}
            style={{
              padding: '10px 20px',
              background: '#4ade80',
              color: '#000',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            + New Analysis
          </button>
        </div>
      </div>

      {/* Overall risk banner for high risk contracts */}
      {analysis.overallRisk === 'high' && (
        <div style={{
          padding: '16px 20px',
          background: '#3a0d0d',
          border: '1px solid #6e1a1a',
          borderRadius: 12,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          animation: 'fadeIn 0.3s ease forwards',
        }}>
          <span style={{ fontSize: 20 }}>🚨</span>
          <div>
            <p style={{ color: '#f87171', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
              High Risk Contract Detected
            </p>
            <p style={{ color: '#888', fontSize: 13 }}>
              This contract contains clauses that may put you at significant risk. Review all red flags carefully before signing.
            </p>
          </div>
        </div>
      )}

      {/* Summary */}
      <Section title="📋 Summary">
        <p style={{ color: '#ccc', lineHeight: 1.7, fontSize: 15 }}>{analysis.summary}</p>
      </Section>

      {/* Parties */}
      {analysis.parties?.length > 0 && (
        <Section title="👥 Parties Involved">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {analysis.parties.map((party, i) => (
              <div key={i} style={{
                background: '#0f0f0f',
                border: '1px solid #2a2a2a',
                borderRadius: 8,
                padding: '8px 14px',
                fontSize: 14,
                color: '#fff',
              }}>
                {party}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Key Dates */}
      {analysis.keyDates?.length > 0 && (
        <Section title="📅 Key Dates">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {analysis.keyDates.map((date, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: '#555' }}>{date.label}</span>
                <span style={{ color: '#fff' }}>{date.value}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Red Flags */}
      {analysis.redFlags?.length > 0 && (
        <Section title="🚩 Red Flags">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {analysis.redFlags.map((flag, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '10px 14px',
                background: '#3a0d0d',
                border: '1px solid #6e1a1a',
                borderRadius: 8,
                fontSize: 14,
                color: '#f87171',
              }}>
                <span>⚠️</span>
                <span>{flag}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Clauses */}
      {analysis.clauses?.length > 0 && (
        <Section title="📑 Clause Analysis">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {analysis.clauses.map((clause, i) => (
              <div key={i} style={{
                padding: '16px',
                background: '#0f0f0f',
                border: `1px solid ${riskColors[clause.riskLevel]?.border || '#2a2a2a'}`,
                borderRadius: 10,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{clause.title}</span>
                  <RiskBadge level={clause.riskLevel} />
                </div>
                <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6 }}>
                  {clause.summary}
                </p>
                {clause.riskReason && (
                  <p style={{ fontSize: 12, color: riskColors[clause.riskLevel]?.text, marginTop: 8 }}>
                    ⚠️ {clause.riskReason}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Recommendations */}
      {analysis.recommendations?.length > 0 && (
        <Section title="💡 Recommendations">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {analysis.recommendations.map((rec, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                fontSize: 14,
                color: '#ccc',
                lineHeight: 1.6,
              }}>
                <span style={{ color: '#4ade80', marginTop: 2 }}>→</span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Ask a question */}
      <div ref={askRef}>
        {report.id && <AskQuestion contractId={report.id} />}
      </div>
    </div>
  )
}