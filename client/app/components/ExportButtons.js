'use client'

import { useState } from 'react'
import axios from 'axios'

const API = 'https://contractlens-api.onrender.com'

export default function ExportButtons({ analysisId, filename }) {
  const [loading, setLoading] = useState(null)
  const [error, setError] = useState('')

  const handleExportPdf = async () => {
    setLoading('pdf')
    setError('')
    
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${API}/api/contracts/${analysisId}/export/pdf`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      )
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `contract-analysis-${filename}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      setError('Failed to export PDF')
    } finally {
      setLoading(null)
    }
  }

  const handleExportJson = async () => {
    setLoading('json')
    setError('')
    
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${API}/api/contracts/${analysisId}/export/json`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      
      // Create download link
      const dataStr = JSON.stringify(response.data, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = window.URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `contract-analysis-${filename}.json`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      setError('Failed to export JSON')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <button
        onClick={handleExportPdf}
        disabled={loading === 'pdf'}
        style={{
          padding: '8px 16px',
          background: loading === 'pdf' ? '#2a2a2a' : '#1a1a1a',
          color: '#fff',
          border: '1px solid #2a2a2a',
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 500,
          cursor: loading === 'pdf' ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {loading === 'pdf' ? '⏳' : '📄'} Export PDF
      </button>
      
      <button
        onClick={handleExportJson}
        disabled={loading === 'json'}
        style={{
          padding: '8px 16px',
          background: loading === 'json' ? '#2a2a2a' : '#1a1a1a',
          color: '#fff',
          border: '1px solid #2a2a2a',
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 500,
          cursor: loading === 'json' ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {loading === 'json' ? '⏳' : '📋'} Export JSON
      </button>
      
      {error && (
        <span style={{ color: '#f87171', fontSize: 12 }}>{error}</span>
      )}
    </div>
  )
}
