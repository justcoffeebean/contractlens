'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'https://contractlens-api.onrender.com'

export default function AdvancedSearch({ onSelectAnalysis }) {
  const [query, setQuery] = useState('')
  const [riskLevel, setRiskLevel] = useState('')
  const [contractType, setContractType] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [tags, setTags] = useState('')
  const [folder, setFolder] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    setLoading(true)
    setSearched(true)

    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams()
      
      if (query) params.append('query', query)
      if (riskLevel) params.append('riskLevel', riskLevel)
      if (contractType) params.append('contractType', contractType)
      if (dateFrom) params.append('dateFrom', dateFrom)
      if (dateTo) params.append('dateTo', dateTo)
      if (tags) params.append('tags', tags)
      if (folder) params.append('folder', folder)

      const response = await axios.get(
        `${API}/api/contracts/search?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setResults(response.data.analyses)
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setQuery('')
    setRiskLevel('')
    setContractType('')
    setDateFrom('')
    setDateTo('')
    setTags('')
    setFolder('')
    setResults([])
    setSearched(false)
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
    <div style={{
      background: '#1a1a1a',
      padding: 24,
      borderRadius: 12,
      border: '1px solid #2a2a2a',
    }}>
      <h3 style={{ color: '#fff', fontSize: 16, marginBottom: 16 }}>
        Advanced Search
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 4 }}>
            Search Query
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search in filename, summary, clauses..."
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
            Risk Level
          </label>
          <select
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value)}
            style={{
              width: '100%',
              padding: 10,
              background: '#0f0f0f',
              border: '1px solid #2a2a2a',
              borderRadius: 6,
              color: '#fff',
              fontSize: 14,
            }}
          >
            <option value="">All Levels</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 4 }}>
            Contract Type
          </label>
          <input
            type="text"
            value={contractType}
            onChange={(e) => setContractType(e.target.value)}
            placeholder="e.g., NDA, Service Agreement"
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
            From Date
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
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
            To Date
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
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
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g., important, review"
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
            Folder
          </label>
          <input
            type="text"
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            placeholder="Folder name"
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
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handleSearch}
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
          {loading ? 'Searching...' : 'Search'}
        </button>
        <button
          onClick={handleReset}
          style={{
            padding: '10px 20px',
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid #2a2a2a',
            borderRadius: 6,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Reset
        </button>
      </div>

      {searched && (
        <div style={{ marginTop: 24 }}>
          <p style={{ color: '#888', fontSize: 13, marginBottom: 16 }}>
            Found {results.length} results
          </p>

          {results.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {results.map((analysis) => (
                <div
                  key={analysis.id}
                  onClick={() => onSelectAnalysis && onSelectAnalysis(analysis)}
                  style={{
                    background: '#0f0f0f',
                    padding: 16,
                    borderRadius: 8,
                    border: '1px solid #2a2a2a',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#4ade80'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2a2a2a'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <p style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>
                      {analysis.filename}
                    </p>
                    <span style={{
                      padding: '4px 8px',
                      background: getRiskColor(analysis.analysis.overallRisk),
                      color: '#000',
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 600,
                    }}>
                      {analysis.analysis.overallRisk.toUpperCase()}
                    </span>
                  </div>
                  <p style={{ color: '#888', fontSize: 12 }}>
                    {analysis.analysis.summary?.substring(0, 100)}...
                  </p>
                  <p style={{ color: '#666', fontSize: 11, marginTop: 4 }}>
                    {new Date(analysis.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#888', fontSize: 13, textAlign: 'center', padding: 32 }}>
              No results found
            </p>
          )}
        </div>
      )}
    </div>
  )
}
