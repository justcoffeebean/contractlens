'use client'

import { useState } from 'react'
import axios from 'axios'

const API = 'https://contractlens-api.onrender.com'

export default function ComparisonView() {
  const [file1, setFile1] = useState(null)
  const [file2, setFile2] = useState(null)
  const [loading, setLoading] = useState(false)
  const [comparison, setComparison] = useState(null)
  const [error, setError] = useState('')

  const handleCompare = async () => {
    if (!file1 || !file2) {
      setError('Please select both files')
      return
    }

    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('contract1', file1)
      formData.append('contract2', file2)

      const response = await axios.post(
        `${API}/api/contracts/compare`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setComparison(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Comparison failed')
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (risk) => {
    const colors = {
      low: '#4ade80',
      medium: '#fbbf24',
      high: '#f87171',
    }
    return colors[risk] || '#888'
  }

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <h1 style={{ color: '#fff', fontSize: 24, marginBottom: 24 }}>
        Contract Comparison
      </h1>

      {!comparison ? (
        <div style={{
          background: '#1a1a1a',
          padding: 32,
          borderRadius: 12,
          border: '1px solid #2a2a2a',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            <div>
              <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 8 }}>
                First Contract (Original)
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile1(e.target.files[0])}
                style={{
                  width: '100%',
                  padding: 12,
                  background: '#0f0f0f',
                  border: '1px dashed #2a2a2a',
                  borderRadius: 8,
                  color: '#fff',
                }}
              />
              {file1 && (
                <p style={{ color: '#4ade80', fontSize: 12, marginTop: 8 }}>
                  ✓ {file1.name}
                </p>
              )}
            </div>

            <div>
              <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 8 }}>
                Second Contract (Revised)
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile2(e.target.files[0])}
                style={{
                  width: '100%',
                  padding: 12,
                  background: '#0f0f0f',
                  border: '1px dashed #2a2a2a',
                  borderRadius: 8,
                  color: '#fff',
                }}
              />
              {file2 && (
                <p style={{ color: '#4ade80', fontSize: 12, marginTop: 8 }}>
                  ✓ {file2.name}
                </p>
              )}
            </div>
          </div>

          {error && (
            <p style={{ color: '#f87171', fontSize: 13, marginBottom: 16 }}>{error}</p>
          )}

          <button
            onClick={handleCompare}
            disabled={loading || !file1 || !file2}
            style={{
              padding: '12px 24px',
              background: loading ? '#2a2a2a' : '#4ade80',
              color: loading ? '#888' : '#000',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Comparing...' : 'Compare Contracts'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Overall Risk Change */}
          <div style={{
            background: '#1a1a1a',
            padding: 24,
            borderRadius: 12,
            border: '1px solid #2a2a2a',
          }}>
            <h3 style={{ color: '#fff', fontSize: 16, marginBottom: 16 }}>
              Overall Risk Change
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#888', fontSize: 12, marginBottom: 4 }}>Original</p>
                <span style={{
                  color: getRiskColor(comparison.comparison.overallRisk.from),
                  fontSize: 24,
                  fontWeight: 700,
                }}>
                  {comparison.comparison.overallRisk.from.toUpperCase()}
                </span>
              </div>
              <span style={{ color: '#888', fontSize: 24 }}>→</span>
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#888', fontSize: 12, marginBottom: 4 }}>Revised</p>
                <span style={{
                  color: getRiskColor(comparison.comparison.overallRisk.to),
                  fontSize: 24,
                  fontWeight: 700,
                }}>
                  {comparison.comparison.overallRisk.to.toUpperCase()}
                </span>
              </div>
              {comparison.comparison.overallRisk.changed && (
                <span style={{
                  padding: '4px 12px',
                  background: comparison.comparison.overallRisk.direction === 'increased' ? '#f87171' : '#4ade80',
                  color: '#000',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 600,
                }}>
                  {comparison.comparison.overallRisk.direction === 'increased' ? '⚠ Increased' : '✓ Decreased'}
                </span>
              )}
            </div>
          </div>

          {/* Red Flags Changes */}
          {(comparison.comparison.redFlags.added.length > 0 || comparison.comparison.redFlags.removed.length > 0) && (
            <div style={{
              background: '#1a1a1a',
              padding: 24,
              borderRadius: 12,
              border: '1px solid #2a2a2a',
            }}>
              <h3 style={{ color: '#fff', fontSize: 16, marginBottom: 16 }}>
                Red Flags Changes
              </h3>
              
              {comparison.comparison.redFlags.added.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <p style={{ color: '#f87171', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                    Added Red Flags ({comparison.comparison.redFlags.added.length})
                  </p>
                  <ul style={{ color: '#fff', fontSize: 13, paddingLeft: 20 }}>
                    {comparison.comparison.redFlags.added.map((flag, i) => (
                      <li key={i} style={{ marginBottom: 4 }}>⚠ {flag}</li>
                    ))}
                  </ul>
                </div>
              )}

              {comparison.comparison.redFlags.removed.length > 0 && (
                <div>
                  <p style={{ color: '#4ade80', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                    Removed Red Flags ({comparison.comparison.redFlags.removed.length})
                  </p>
                  <ul style={{ color: '#fff', fontSize: 13, paddingLeft: 20 }}>
                    {comparison.comparison.redFlags.removed.map((flag, i) => (
                      <li key={i} style={{ marginBottom: 4 }}>✓ {flag}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Clause Changes */}
          {(comparison.comparison.clauses.added.length > 0 || comparison.comparison.clauses.removed.length > 0 || comparison.comparison.clauses.modified.length > 0) && (
            <div style={{
              background: '#1a1a1a',
              padding: 24,
              borderRadius: 12,
              border: '1px solid #2a2a2a',
            }}>
              <h3 style={{ color: '#fff', fontSize: 16, marginBottom: 16 }}>
                Clause Changes
              </h3>

              {comparison.comparison.clauses.added.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <p style={{ color: '#60a5fa', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                    New Clauses ({comparison.comparison.clauses.added.length})
                  </p>
                  {comparison.comparison.clauses.added.map((clause, i) => (
                    <div key={i} style={{
                      background: '#0f0f0f',
                      padding: 12,
                      borderRadius: 6,
                      marginBottom: 8,
                    }}>
                      <p style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{clause.title}</p>
                      <p style={{ color: '#888', fontSize: 12 }}>{clause.summary}</p>
                    </div>
                  ))}
                </div>
              )}

              {comparison.comparison.clauses.removed.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <p style={{ color: '#f87171', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                    Removed Clauses ({comparison.comparison.clauses.removed.length})
                  </p>
                  {comparison.comparison.clauses.removed.map((clause, i) => (
                    <div key={i} style={{
                      background: '#0f0f0f',
                      padding: 12,
                      borderRadius: 6,
                      marginBottom: 8,
                      opacity: 0.6,
                    }}>
                      <p style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{clause.title}</p>
                      <p style={{ color: '#888', fontSize: 12 }}>{clause.summary}</p>
                    </div>
                  ))}
                </div>
              )}

              {comparison.comparison.clauses.modified.length > 0 && (
                <div>
                  <p style={{ color: '#fbbf24', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                    Modified Clauses ({comparison.comparison.clauses.modified.length})
                  </p>
                  {comparison.comparison.clauses.modified.map((clause, i) => (
                    <div key={i} style={{
                      background: '#0f0f0f',
                      padding: 12,
                      borderRadius: 6,
                      marginBottom: 8,
                      border: '1px solid #fbbf24',
                    }}>
                      <p style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{clause.title}</p>
                      {clause.changes.riskLevel && (
                        <p style={{ color: '#888', fontSize: 12 }}>
                          Risk: {clause.changes.riskLevel.from} → {clause.changes.riskLevel.to}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => {
              setComparison(null)
              setFile1(null)
              setFile2(null)
            }}
            style={{
              padding: '12px 24px',
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid #2a2a2a',
              borderRadius: 8,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Compare Another Pair
          </button>
        </div>
      )}
    </div>
  )
}
