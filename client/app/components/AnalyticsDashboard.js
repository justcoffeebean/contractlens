'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'https://contractlens-api.onrender.com'

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${API}/api/contracts/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setStats(response.data)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{
        background: '#1a1a1a',
        padding: 24,
        borderRadius: 12,
        border: '1px solid #2a2a2a',
      }}>
        <p style={{ color: '#888', fontSize: 13 }}>Loading analytics...</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div style={{
        background: '#1a1a1a',
        padding: 24,
        borderRadius: 12,
        border: '1px solid #2a2a2a',
      }}>
        <p style={{ color: '#888', fontSize: 13 }}>No analytics data available</p>
      </div>
    )
  }

  const riskColors = {
    low: '#4ade80',
    medium: '#fbbf24',
    high: '#f87171',
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ color: '#fff', fontSize: 24, marginBottom: 24 }}>
        Analytics Dashboard
      </h1>

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{
          background: '#1a1a1a',
          padding: 20,
          borderRadius: 12,
          border: '1px solid #2a2a2a',
        }}>
          <p style={{ color: '#888', fontSize: 12, marginBottom: 8 }}>Total Analyses</p>
          <p style={{ color: '#fff', fontSize: 32, fontWeight: 700 }}>{stats.total}</p>
        </div>

        <div style={{
          background: '#1a1a1a',
          padding: 20,
          borderRadius: 12,
          border: '1px solid #2a2a2a',
        }}>
          <p style={{ color: '#888', fontSize: 12, marginBottom: 8 }}>Low Risk</p>
          <p style={{ color: riskColors.low, fontSize: 32, fontWeight: 700 }}>{stats.byRiskLevel.low}</p>
        </div>

        <div style={{
          background: '#1a1a1a',
          padding: 20,
          borderRadius: 12,
          border: '1px solid #2a2a2a',
        }}>
          <p style={{ color: '#888', fontSize: 12, marginBottom: 8 }}>Medium Risk</p>
          <p style={{ color: riskColors.medium, fontSize: 32, fontWeight: 700 }}>{stats.byRiskLevel.medium}</p>
        </div>

        <div style={{
          background: '#1a1a1a',
          padding: 20,
          borderRadius: 12,
          border: '1px solid #2a2a2a',
        }}>
          <p style={{ color: '#888', fontSize: 12, marginBottom: 8 }}>High Risk</p>
          <p style={{ color: riskColors.high, fontSize: 32, fontWeight: 700 }}>{stats.byRiskLevel.high}</p>
        </div>
      </div>

      {/* Contract Types */}
      <div style={{
        background: '#1a1a1a',
        padding: 24,
        borderRadius: 12,
        border: '1px solid #2a2a2a',
        marginBottom: 24,
      }}>
        <h3 style={{ color: '#fff', fontSize: 16, marginBottom: 16 }}>
          Contract Types
        </h3>
        {Object.keys(stats.byContractType).length === 0 ? (
          <p style={{ color: '#888', fontSize: 13 }}>No data available</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(stats.byContractType)
              .sort(([, a], [, b]) => b - a)
              .map(([type, count]) => (
                <div key={type}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: '#fff', fontSize: 13 }}>{type}</span>
                    <span style={{ color: '#888', fontSize: 13 }}>{count}</span>
                  </div>
                  <div style={{
                    height: 8,
                    background: '#0f0f0f',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${(count / stats.total) * 100}%`,
                      background: '#4ade80',
                      borderRadius: 4,
                    }} />
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Common Red Flags */}
      <div style={{
        background: '#1a1a1a',
        padding: 24,
        borderRadius: 12,
        border: '1px solid #2a2a2a',
        marginBottom: 24,
      }}>
        <h3 style={{ color: '#fff', fontSize: 16, marginBottom: 16 }}>
          Common Red Flags
        </h3>
        {Object.keys(stats.commonRedFlags).length === 0 ? (
          <p style={{ color: '#888', fontSize: 13 }}>No red flags found</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(stats.commonRedFlags)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 10)
              .map(([flag, count]) => (
                <div key={flag} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 12,
                  background: '#0f0f0f',
                  borderRadius: 6,
                }}>
                  <span style={{ color: '#fff', fontSize: 13, flex: 1 }}>⚠ {flag}</span>
                  <span style={{
                    padding: '4px 8px',
                    background: '#f87171',
                    color: '#000',
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 600,
                  }}>
                    {count}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Risk Trend */}
      {stats.riskTrend.length > 0 && (
        <div style={{
          background: '#1a1a1a',
          padding: 24,
          borderRadius: 12,
          border: '1px solid #2a2a2a',
        }}>
          <h3 style={{ color: '#fff', fontSize: 16, marginBottom: 16 }}>
            Risk Trend (Last 30 Days)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {stats.riskTrend.map((day) => (
              <div key={day.date} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 8,
                background: '#0f0f0f',
                borderRadius: 6,
              }}>
                <span style={{ color: '#888', fontSize: 11, width: 100 }}>
                  {new Date(day.date).toLocaleDateString()}
                </span>
                <div style={{ flex: 1, display: 'flex', gap: 8 }}>
                  <div style={{
                    flex: 1,
                    height: 24,
                    background: '#0f0f0f',
                    borderRadius: 4,
                    overflow: 'hidden',
                    position: 'relative',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${(day.low / (day.low + day.medium + day.high || 1)) * 100}%`,
                      background: riskColors.low,
                      borderRadius: 4,
                    }} />
                  </div>
                  <div style={{
                    flex: 1,
                    height: 24,
                    background: '#0f0f0f',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${(day.medium / (day.low + day.medium + day.high || 1)) * 100}%`,
                      background: riskColors.medium,
                      borderRadius: 4,
                    }} />
                  </div>
                  <div style={{
                    flex: 1,
                    height: 24,
                    background: '#0f0f0f',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${(day.high / (day.low + day.medium + day.high || 1)) * 100}%`,
                      background: riskColors.high,
                      borderRadius: 4,
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 24, marginTop: 16, justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 12, height: 12, background: riskColors.low, borderRadius: 2 }} />
              <span style={{ color: '#888', fontSize: 12 }}>Low</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 12, height: 12, background: riskColors.medium, borderRadius: 2 }} />
              <span style={{ color: '#888', fontSize: 12 }}>Medium</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 12, height: 12, background: riskColors.high, borderRadius: 2 }} />
              <span style={{ color: '#888', fontSize: 12 }}>High</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
