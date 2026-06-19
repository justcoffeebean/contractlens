'use client'

import { useState } from 'react'
import axios from 'axios'

const API = 'https://contractlens-api.onrender.com'

export default function EnhancedAIPanel({ analysis }) {
  const [activeTab, setActiveTab] = useState('alternatives')
  const [clauseText, setClauseText] = useState('')
  const [riskReason, setRiskReason] = useState('')
  const [targetLanguage, setTargetLanguage] = useState('')
  const [contractText, setContractText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleSuggestAlternative = async () => {
    if (!clauseText || !riskReason) {
      setError('Please provide clause text and risk reason')
      return
    }

    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${API}/api/enhanced-ai/suggest-alternative`,
        { clauseText, riskReason },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setResult(response.data.suggestion)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate suggestion')
    } finally {
      setLoading(false)
    }
  }

  const handleTranslate = async () => {
    if (!contractText || !targetLanguage) {
      setError('Please provide contract text and target language')
      return
    }

    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${API}/api/enhanced-ai/translate`,
        { contractText, targetLanguage },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setResult(response.data.translation)
    } catch (err) {
      setError(err.response?.data?.error || 'Translation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleExtractTerms = async () => {
    if (!contractText) {
      setError('Please provide contract text')
      return
    }

    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${API}/api/enhanced-ai/extract-terms`,
        { contractText },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setResult(response.data.keyTerms)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to extract terms')
    } finally {
      setLoading(false)
    }
  }

  const handleNegotiationPoints = async () => {
    if (!analysis) {
      setError('No analysis available')
      return
    }

    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${API}/api/enhanced-ai/negotiation-points`,
        { analysis },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setResult(response.data.negotiationPoints)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate negotiation points')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: '#1a1a1a',
      padding: 24,
      borderRadius: 12,
      border: '1px solid #2a2a2a',
    }}>
      <h3 style={{ color: '#fff', fontSize: 16, marginBottom: 16 }}>
        Enhanced AI Features
      </h3>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, borderBottom: '1px solid #2a2a2a', paddingBottom: 12 }}>
        <button
          onClick={() => {
            setActiveTab('alternatives')
            setResult(null)
            setError('')
          }}
          style={{
            padding: '8px 16px',
            background: activeTab === 'alternatives' ? '#4ade80' : '#1a1a1a',
            color: activeTab === 'alternatives' ? '#000' : '#fff',
            border: 'none',
            borderRadius: 6,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Suggest Alternatives
        </button>
        <button
          onClick={() => {
            setActiveTab('translate')
            setResult(null)
            setError('')
          }}
          style={{
            padding: '8px 16px',
            background: activeTab === 'translate' ? '#4ade80' : '#1a1a1a',
            color: activeTab === 'translate' ? '#000' : '#fff',
            border: 'none',
            borderRadius: 6,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Translate
        </button>
        <button
          onClick={() => {
            setActiveTab('terms')
            setResult(null)
            setError('')
          }}
          style={{
            padding: '8px 16px',
            background: activeTab === 'terms' ? '#4ade80' : '#1a1a1a',
            color: activeTab === 'terms' ? '#000' : '#fff',
            border: 'none',
            borderRadius: 6,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Extract Terms
        </button>
        <button
          onClick={() => {
            setActiveTab('negotiation')
            setResult(null)
            setError('')
          }}
          style={{
            padding: '8px 16px',
            background: activeTab === 'negotiation' ? '#4ade80' : '#1a1a1a',
            color: activeTab === 'negotiation' ? '#000' : '#fff',
            border: 'none',
            borderRadius: 6,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Negotiation Points
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'alternatives' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 4 }}>
              Clause Text
            </label>
            <textarea
              value={clauseText}
              onChange={(e) => setClauseText(e.target.value)}
              placeholder="Paste the risky clause here..."
              rows={4}
              style={{
                width: '100%',
                padding: 10,
                background: '#0f0f0f',
                border: '1px solid #2a2a2a',
                borderRadius: 6,
                color: '#fff',
                fontSize: 14,
                resize: 'vertical',
              }}
            />
          </div>

          <div>
            <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 4 }}>
              Risk Reason
            </label>
            <input
              type="text"
              value={riskReason}
              onChange={(e) => setRiskReason(e.target.value)}
              placeholder="Why is this clause risky?"
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

          <button
            onClick={handleSuggestAlternative}
            disabled={loading}
            style={{
              padding: '10px 20px',
              background: loading ? '#2a2a2a' : '#4ade80',
              color: loading ? '#888' : '#000',
              border: 'none',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Generating...' : 'Suggest Alternative'}
          </button>
        </div>
      )}

      {activeTab === 'translate' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 4 }}>
              Contract Text
            </label>
            <textarea
              value={contractText}
              onChange={(e) => setContractText(e.target.value)}
              placeholder="Paste contract text to translate..."
              rows={4}
              style={{
                width: '100%',
                padding: 10,
                background: '#0f0f0f',
                border: '1px solid #2a2a2a',
                borderRadius: 6,
                color: '#fff',
                fontSize: 14,
                resize: 'vertical',
              }}
            />
          </div>

          <div>
            <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 4 }}>
              Target Language
            </label>
            <input
              type="text"
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              placeholder="e.g., Spanish, French, German"
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

          <button
            onClick={handleTranslate}
            disabled={loading}
            style={{
              padding: '10px 20px',
              background: loading ? '#2a2a2a' : '#4ade80',
              color: loading ? '#888' : '#000',
              border: 'none',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Translating...' : 'Translate'}
          </button>
        </div>
      )}

      {activeTab === 'terms' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 4 }}>
              Contract Text
            </label>
            <textarea
              value={contractText}
              onChange={(e) => setContractText(e.target.value)}
              placeholder="Paste contract text to extract key terms..."
              rows={4}
              style={{
                width: '100%',
                padding: 10,
                background: '#0f0f0f',
                border: '1px solid #2a2a2a',
                borderRadius: 6,
                color: '#fff',
                fontSize: 14,
                resize: 'vertical',
              }}
            />
          </div>

          <button
            onClick={handleExtractTerms}
            disabled={loading}
            style={{
              padding: '10px 20px',
              background: loading ? '#2a2a2a' : '#4ade80',
              color: loading ? '#888' : '#000',
              border: 'none',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Extracting...' : 'Extract Terms'}
          </button>
        </div>
      )}

      {activeTab === 'negotiation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ color: '#888', fontSize: 13 }}>
            Generate negotiation points based on the current contract analysis.
          </p>

          <button
            onClick={handleNegotiationPoints}
            disabled={loading}
            style={{
              padding: '10px 20px',
              background: loading ? '#2a2a2a' : '#4ade80',
              color: loading ? '#888' : '#000',
              border: 'none',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Generating...' : 'Generate Points'}
          </button>
        </div>
      )}

      {error && (
        <p style={{ color: '#f87171', fontSize: 13 }}>{error}</p>
      )}

      {result && (
        <div style={{
          marginTop: 16,
          padding: 16,
          background: '#0f0f0f',
          borderRadius: 8,
          border: '1px solid #2a2a2a',
        }}>
          <h4 style={{ color: '#fff', fontSize: 14, marginBottom: 12 }}>Result</h4>
          <pre style={{ color: '#fff', fontSize: 13, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {typeof result === 'object' ? JSON.stringify(result, null, 2) : result}
          </pre>
        </div>
      )}
    </div>
  )
}
