'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import UploadZone from './components/UploadZone'
import AnalysisReport from './components/AnalysisReport'
import LoadingState from './components/LoadingState'
import HistoryPanel from './components/HistoryPanel'
import axios from 'axios'
import { useAuth } from './context/AuthContext'

const API = 'https://contractlens-api.onrender.com'

export default function Home() {
  const router = useRouter()
  const { user, logout, loading } = useAuth()
  const [status, setStatus] = useState('idle')
  const [report, setReport] = useState(null)
  const [filename, setFilename] = useState('')
  const [error, setError] = useState('')
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f0f0f',
        color: '#fff',
      }}>
        Loading...
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleUpload = async (file) => {
    setFilename(file.name)
    setStatus('loading')
    setError('')

    try {
      const formData = new FormData()
      formData.append('contract', file)

      const res = await axios.post(
        `${API}/api/contracts/analyze`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )

      setReport(res.data)
      setStatus('done')
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
      setStatus('error')
    }
  }

  const handleReset = () => {
    setStatus('idle')
    setReport(null)
    setFilename('')
    setError('')
  }

  const handleLoadFromHistory = (item) => {
    setReport({
      id: item.id,
      filename: item.filename,
      pages: item.pages,
      analysis: item.analysis,
    })
    setStatus('done')
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0f0f0f' }}>

      {/* Navbar */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 60,
        background: 'rgba(15,15,15,0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #2a2a2a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        zIndex: 50,
      }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>
          🔍 ContractLens
        </span>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#888' }}>
            {user.email}
          </span>
          <button
            onClick={() => setShowHistory(true)}
            style={{
              padding: '8px 16px',
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid #2a2a2a',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            🕐 Past Analyses
          </button>
          <button
            onClick={logout}
            style={{
              padding: '8px 16px',
              background: '#1a1a1a',
              color: '#f87171',
              border: '1px solid #2a2a2a',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main content — offset for navbar */}
      <div style={{ paddingTop: 60 }}>
        {status === 'idle' && <UploadZone onUpload={handleUpload} />}
        {status === 'loading' && <LoadingState filename={filename} />}
        {status === 'error' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'calc(100vh - 60px)',
            gap: 16,
          }}>
            <p style={{ color: '#f87171', fontSize: 16 }}>❌ {error}</p>
            <button
              onClick={handleReset}
              style={{
                padding: '12px 24px',
                background: '#1a1a1a',
                color: '#fff',
                border: '1px solid #2a2a2a',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              Try Again
            </button>
          </div>
        )}
        {status === 'done' && report && (
          <AnalysisReport report={report} onReset={handleReset} />
        )}
      </div>

      {showHistory && (
        <HistoryPanel
          onLoad={handleLoadFromHistory}
          onClose={() => setShowHistory(false)}
        />
      )}
    </main>
  )
}