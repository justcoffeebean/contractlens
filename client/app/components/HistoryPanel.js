'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

const riskColors = {
  low: { bg: '#0d2e1f', border: '#1a5c3a', text: '#4ade80' },
  medium: { bg: '#2e1f0d', border: '#6e3a1a', text: '#fb923c' },
  high: { bg: '#3a0d0d', border: '#6e1a1a', text: '#f87171' },
}

export default function HistoryPanel({ onLoad, onClose }) {
  const [analyses, setAnalyses] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        const res = await axios.get('http://localhost:3002/api/contracts')
        setAnalyses(res.data.analyses)
      } catch (err) {
        console.error('Failed to fetch analyses:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAnalyses()
  }, [])

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: '#1a1a1a',
        border: '1px solid #2a2a2a',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 560,
        maxHeight: '80vh',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Past Analyses</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#555', fontSize: 20, cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {isLoading && (
          <p style={{ color: '#555', fontSize: 13 }}>Loading...</p>
        )}

        {!isLoading && analyses.length === 0 && (
          <p style={{ color: '#555', fontSize: 13 }}>No analyses yet. Upload a contract to get started.</p>
        )}

        {analyses.map((item) => {
          const risk = item.analysis?.overallRisk || 'low'
          const colors = riskColors[risk]
          return (
            <div
              key={item.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 16px',
                background: '#0f0f0f',
                border: '1px solid #2a2a2a',
                borderRadius: 10,
                marginBottom: 8,
                cursor: 'pointer',
              }}
            >
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>
                  📄 {item.filename}
                </p>
                <p style={{ fontSize: 11, color: '#555' }}>
                  {item.pages} pages · {new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                  padding: '3px 10px',
                  borderRadius: 100,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}>
                  {risk}
                </span>
                <button
                  onClick={() => { onLoad(item); onClose() }}
                  style={{
                    padding: '6px 12px',
                    background: '#1a3a6e',
                    color: '#60a5fa',
                    border: '1px solid #1a3a6e',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  View
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}