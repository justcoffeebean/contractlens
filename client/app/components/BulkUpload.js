'use client'

import { useState } from 'react'
import axios from 'axios'

const API = 'https://contractlens-api.onrender.com'

export default function BulkUpload() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [error, setError] = useState('')

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files)
    if (selectedFiles.length > 10) {
      setError('Maximum 10 files allowed')
      return
    }
    setFiles(selectedFiles)
    setError('')
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select files to upload')
      return
    }

    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      files.forEach(file => {
        formData.append('contracts', file)
      })

      const response = await axios.post(
        `${API}/api/contracts/bulk`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setResults(response.data.results)
    } catch (err) {
      setError(err.response?.data?.error || 'Bulk upload failed')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFiles([])
    setResults([])
    setError('')
  }

  return (
    <div style={{
      background: '#1a1a1a',
      padding: 24,
      borderRadius: 12,
      border: '1px solid #2a2a2a',
    }}>
      <h3 style={{ color: '#fff', fontSize: 16, marginBottom: 16 }}>
        Bulk Upload
      </h3>

      {!results.length ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <input
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileSelect}
              style={{
                width: '100%',
                padding: 20,
                background: '#0f0f0f',
                border: '2px dashed #2a2a2a',
                borderRadius: 8,
                color: '#fff',
                cursor: 'pointer',
              }}
            />
            <p style={{ color: '#888', fontSize: 12, marginTop: 8 }}>
              Select up to 10 PDF files
            </p>
          </div>

          {files.length > 0 && (
            <div>
              <p style={{ color: '#4ade80', fontSize: 13, marginBottom: 8 }}>
                {files.length} file(s) selected:
              </p>
              <ul style={{ color: '#fff', fontSize: 12, paddingLeft: 20 }}>
                {files.map((file, i) => (
                  <li key={i}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <p style={{ color: '#f87171', fontSize: 13 }}>{error}</p>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleUpload}
              disabled={loading || files.length === 0}
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
              {loading ? 'Uploading...' : 'Upload All'}
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
        </div>
      ) : (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <p style={{ color: '#fff', fontSize: 14 }}>
              Results: {results.filter(r => r.status === 'success').length} successful, {results.filter(r => r.status === 'failed').length} failed
            </p>
            <button
              onClick={handleReset}
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
              Upload More
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {results.map((result, i) => (
              <div
                key={i}
                style={{
                  background: result.status === 'success' ? '#0f0f0f' : '#1a0f0f',
                  padding: 12,
                  borderRadius: 6,
                  border: result.status === 'success' ? '1px solid #2a2a2a' : '1px solid #f87171',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#fff', fontSize: 13 }}>
                    {result.status === 'success' ? '✓' : '✗'} {result.filename}
                  </span>
                  <span style={{
                    padding: '4px 8px',
                    background: result.status === 'success' ? '#4ade80' : '#f87171',
                    color: '#000',
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 600,
                  }}>
                    {result.status.toUpperCase()}
                  </span>
                </div>
                {result.error && (
                  <p style={{ color: '#f87171', fontSize: 11, marginTop: 4 }}>
                    {result.error}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
