'use client'

import { useState } from 'react'
import axios from 'axios'

const suggestedQuestions = [
  'What are my main obligations?',
  'Can I terminate this contract early?',
  'What happens if I breach this contract?',
  'Are there any automatic renewal clauses?',
  'What are the payment terms?',
]

export default function AskQuestion({ contractId }) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [history, setHistory] = useState([])

  const handleAsk = async (q) => {
    const questionToAsk = q || question
    if (!questionToAsk.trim() || isLoading) return

    setIsLoading(true)
    setAnswer('')

    try {
      const res = await axios.post(
        `http://localhost:3002/api/contracts/${contractId}/ask`,
        { question: questionToAsk }
      )

      const newEntry = {
        question: questionToAsk,
        answer: res.data.answer,
      }

      setHistory((prev) => [...prev, newEntry])
      setQuestion('')
    } catch (err) {
      console.error('Failed to get answer:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      background: '#1a1a1a',
      border: '1px solid #2a2a2a',
      borderRadius: 12,
      padding: 24,
      marginBottom: 16,
    }}>
      <h3 style={{
        fontSize: 14,
        fontWeight: 700,
        color: '#555',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 16,
      }}>
        💬 Ask About This Contract
      </h3>

      {/* Suggested questions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {suggestedQuestions.map((q) => (
          <button
            key={q}
            onClick={() => handleAsk(q)}
            disabled={isLoading}
            style={{
              padding: '6px 12px',
              background: '#0f0f0f',
              color: '#888',
              border: '1px solid #2a2a2a',
              borderRadius: 100,
              fontSize: 12,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Q&A History */}
      {history.length > 0 && (
        <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {history.map((entry, i) => (
            <div key={i}>
              <div style={{
                padding: '10px 14px',
                background: '#0d1f3c',
                border: '1px solid #1a3a6e',
                borderRadius: 8,
                fontSize: 13,
                color: '#60a5fa',
                marginBottom: 8,
              }}>
                🙋 {entry.question}
              </div>
              <div style={{
                padding: '14px 16px',
                background: '#0f0f0f',
                border: '1px solid #2a2a2a',
                borderRadius: 8,
                fontSize: 14,
                color: '#ccc',
                lineHeight: 1.7,
              }}>
                {entry.answer}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div style={{
          padding: '14px 16px',
          background: '#0f0f0f',
          border: '1px solid #2a2a2a',
          borderRadius: 8,
          fontSize: 14,
          color: '#555',
          marginBottom: 16,
          animation: 'pulse 1.5s ease infinite',
        }}>
          🤔 Analyzing your question...
        </div>
      )}

      {/* Input */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          placeholder="Ask anything about this contract..."
          disabled={isLoading}
          style={{
            flex: 1,
            background: '#0f0f0f',
            border: '1px solid #2a2a2a',
            borderRadius: 8,
            padding: '12px 14px',
            color: '#fff',
            fontSize: 14,
            outline: 'none',
          }}
        />
        <button
          onClick={() => handleAsk()}
          disabled={isLoading || !question.trim()}
          style={{
            padding: '12px 20px',
            background: question.trim() && !isLoading ? '#4ade80' : '#1a1a1a',
            color: question.trim() && !isLoading ? '#000' : '#555',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 700,
            cursor: question.trim() && !isLoading ? 'pointer' : 'not-allowed',
            transition: 'all 0.15s ease',
          }}
        >
          Ask
        </button>
      </div>
    </div>
  )
}