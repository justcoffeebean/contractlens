'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const API = 'https://contractlens-api.onrender.com'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post(`${API}/api/auth/login`, {
        email,
        password,
      })

      login(response.data.user, response.data.token)
      router.push('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f0f0f',
      padding: '20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: '#1a1a1a',
        borderRadius: '12px',
        padding: '32px',
        border: '1px solid #2a2a2a',
      }}>
        <h1 style={{
          color: '#fff',
          fontSize: '24px',
          fontWeight: '700',
          marginBottom: '8px',
          textAlign: 'center',
        }}>
          Welcome Back
        </h1>
        <p style={{
          color: '#888',
          fontSize: '14px',
          marginBottom: '32px',
          textAlign: 'center',
        }}>
          Sign in to ContractLens
        </p>

        {error && (
          <div style={{
            background: 'rgba(248, 113, 113, 0.1)',
            border: '1px solid #f87171',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            color: '#f87171',
            fontSize: '14px',
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{
              color: '#888',
              fontSize: '12px',
              display: 'block',
              marginBottom: '6px',
              fontWeight: '600',
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                width: '100%',
                padding: '12px',
                background: '#0f0f0f',
                border: '1px solid #2a2a2a',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#2a2a2a'}
            />
          </div>

          <div>
            <label style={{
              color: '#888',
              fontSize: '12px',
              display: 'block',
              marginBottom: '6px',
              fontWeight: '600',
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '12px',
                background: '#0f0f0f',
                border: '1px solid #2a2a2a',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#2a2a2a'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '14px',
              background: loading ? '#2a2a2a' : '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => !loading && (e.target.style.background = '#2563eb')}
            onMouseOut={(e) => !loading && (e.target.style.background = '#3b82f6')}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{
          color: '#888',
          fontSize: '13px',
          marginTop: '24px',
          textAlign: 'center',
        }}>
          Don't have an account?{' '}
          <a
            href="/register"
            style={{
              color: '#3b82f6',
              textDecoration: 'none',
              fontWeight: '600',
            }}
            onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
            onMouseOut={(e) => e.target.style.textDecoration = 'none'}
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  )
}
