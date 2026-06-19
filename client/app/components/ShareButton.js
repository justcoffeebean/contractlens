'use client'

import { useState } from 'react'
import axios from 'axios'

const API = 'https://contractlens-api.onrender.com'

export default function ShareButton({ analysisId }) {
  const [showModal, setShowModal] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [password, setPassword] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleGenerateShare = async () => {
    setLoading(true)
    setError('')
    
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${API}/api/contracts/${analysisId}/share`,
        {
          password: password || undefined,
          expiresAt: expiresAt || undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      setShareUrl(response.data.shareUrl)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate share link')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClose = () => {
    setShowModal(false)
    setShareUrl('')
    setPassword('')
    setExpiresAt('')
    setError('')
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        style={{
          padding: '8px 16px',
          background: '#1a1a1a',
          color: '#fff',
          border: '1px solid #2a2a2a',
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 500,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        🔗 Share
      </button>

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}>
          <div style={{
            background: '#1a1a1a',
            padding: 24,
            borderRadius: 12,
            width: '100%',
            maxWidth: 480,
            border: '1px solid #2a2a2a',
          }}>
            <h3 style={{ color: '#fff', fontSize: 18, marginBottom: 16 }}>
              Share Analysis
            </h3>

            {!shareUrl ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 4 }}>
                    Password (optional)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password to protect"
                    style={{
                      width: '100%',
                      padding: 10,
                      background: '#0f0f0f',
                      border: '1px solid #2a2a2a',
                      borderRadius: 6,
                      color: '#fff',
                      fontSize: 14,
                    }}
                  />
                </div>

                <div>
                  <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 4 }}>
                    Expires At (optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    style={{
                      width: '100%',
                      padding: 10,
                      background: '#0f0f0f',
                      border: '1px solid #2a2a2a',
                      borderRadius: 6,
                      color: '#fff',
                      fontSize: 14,
                    }}
                  />
                </div>

                {error && (
                  <p style={{ color: '#f87171', fontSize: 13 }}>{error}</p>
                )}

                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button
                    onClick={handleClose}
                    style={{
                      padding: '8px 16px',
                      background: '#2a2a2a',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerateShare}
                    disabled={loading}
                    style={{
                      padding: '8px 16px',
                      background: loading ? '#2a2a2a' : '#4ade80',
                      color: loading ? '#888' : '#000',
                      border: 'none',
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: loading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {loading ? 'Generating...' : 'Generate Link'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 4 }}>
                    Share Link
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      style={{
                        flex: 1,
                        padding: 10,
                        background: '#0f0f0f',
                        border: '1px solid #2a2a2a',
                      borderRadius: 6,
                      color: '#fff',
                      fontSize: 13,
                    }}
                    />
                    <button
                      onClick={handleCopy}
                      style={{
                        padding: '8px 16px',
                        background: copied ? '#4ade80' : '#1a1a1a',
                        color: copied ? '#000' : '#fff',
                        border: '1px solid #2a2a2a',
                        borderRadius: 6,
                        fontSize: 13,
                        cursor: 'pointer',
                      }}
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button
                    onClick={handleClose}
                    style={{
                      padding: '8px 16px',
                      background: '#1a1a1a',
                      color: '#fff',
                      border: '1px solid #2a2a2a',
                      borderRadius: 6,
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
