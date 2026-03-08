'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

export default function UploadZone({ onUpload }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0])
    }
  }, [onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  })

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{
          display: 'inline-block',
          background: '#0d2e1f',
          border: '1px solid #1a5c3a',
          borderRadius: 100,
          padding: '6px 14px',
          fontSize: 12,
          color: '#4ade80',
          fontWeight: 600,
          marginBottom: 24,
        }}>
          🔍 AI-Powered Contract Analysis
        </div>
        <h1 style={{
          fontSize: 56,
          fontWeight: 800,
          letterSpacing: -2,
          marginBottom: 16,
          lineHeight: 1.1,
        }}>
          Understand any contract
          <br />
          <span style={{ color: '#4ade80' }}>in seconds.</span>
        </h1>
        <p style={{ fontSize: 18, color: '#555', maxWidth: 480, lineHeight: 1.7 }}>
          Upload a PDF contract and get an instant AI-powered risk analysis,
          plain-English summary, and red flag detection.
        </p>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        style={{
          width: '100%',
          maxWidth: 560,
          padding: 48,
          border: `2px dashed ${isDragActive ? '#4ade80' : '#2a2a2a'}`,
          borderRadius: 16,
          background: isDragActive ? '#0d2e1f' : '#1a1a1a',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <input {...getInputProps()} />
        <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
        {isDragActive ? (
          <p style={{ color: '#4ade80', fontSize: 16, fontWeight: 600 }}>
            Drop your contract here...
          </p>
        ) : (
          <>
            <p style={{ color: '#ffffff', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
              Drag & drop your PDF contract
            </p>
            <p style={{ color: '#555', fontSize: 14, marginBottom: 24 }}>
              or click to browse files
            </p>
            <div style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: '#4ade80',
              color: '#000',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
            }}>
              Choose PDF File
            </div>
          </>
        )}
      </div>

      {/* Feature pills */}
      <div style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
        {['⚡ Instant analysis', '🔍 Risk detection', '📋 Plain English', '🚩 Red flags'].map((f) => (
          <div key={f} style={{
            background: '#1a1a1a',
            border: '1px solid #2a2a2a',
            borderRadius: 100,
            padding: '8px 16px',
            fontSize: 13,
            color: '#555',
          }}>
            {f}
          </div>
        ))}
      </div>
    </div>
  )
}