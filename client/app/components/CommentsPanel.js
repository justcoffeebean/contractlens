'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'https://contractlens-api.onrender.com'

export default function CommentsPanel({ analysisId }) {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [clauseTitle, setClauseTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')

  useEffect(() => {
    if (analysisId) {
      fetchComments()
    }
  }, [analysisId])

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${API}/api/comments/${analysisId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setComments(response.data.comments)
    } catch (err) {
      console.error('Failed to fetch comments:', err)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${API}/api/comments`,
        {
          analysisId,
          clauseTitle: clauseTitle || undefined,
          commentText: newComment,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setNewComment('')
      setClauseTitle('')
      fetchComments()
    } catch (err) {
      console.error('Failed to add comment:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateComment = async (commentId) => {
    if (!editText.trim()) return

    try {
      const token = localStorage.getItem('token')
      await axios.put(
        `${API}/api/comments/${commentId}`,
        { commentText: editText },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setEditingId(null)
      setEditText('')
      fetchComments()
    } catch (err) {
      console.error('Failed to update comment:', err)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      const token = localStorage.getItem('token')
      await axios.delete(
        `${API}/api/comments/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      fetchComments()
    } catch (err) {
      console.error('Failed to delete comment:', err)
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
        Comments ({comments.length})
      </h3>

      {/* Add Comment Form */}
      <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #2a2a2a' }}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 4 }}>
            Clause (optional)
          </label>
          <input
            type="text"
            value={clauseTitle}
            onChange={(e) => setClauseTitle(e.target.value)}
            placeholder="Reference a specific clause"
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

        <div style={{ marginBottom: 12 }}>
          <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 4 }}>
            Your Comment
          </label>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add your notes or questions about this contract..."
            rows={3}
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
          onClick={handleAddComment}
          disabled={loading || !newComment.trim()}
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
          {loading ? 'Adding...' : 'Add Comment'}
        </button>
      </div>

      {/* Comments List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {comments.length === 0 ? (
          <p style={{ color: '#888', fontSize: 13, textAlign: 'center', padding: 32 }}>
            No comments yet. Be the first to add one!
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              style={{
                background: '#0f0f0f',
                padding: 16,
                borderRadius: 8,
                border: '1px solid #2a2a2a',
              }}
            >
              {comment.clause_title && (
                <p style={{ color: '#60a5fa', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
                  📌 {comment.clause_title}
                </p>
              )}

              {editingId === comment.id ? (
                <div style={{ marginBottom: 12 }}>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: 10,
                      background: '#1a1a1a',
                      border: '1px solid #2a2a2a',
                      borderRadius: 6,
                      color: '#fff',
                      fontSize: 14,
                      resize: 'vertical',
                    }}
                  />
                </div>
              ) : (
                <p style={{ color: '#fff', fontSize: 13, lineHeight: 1.5, marginBottom: 12 }}>
                  {comment.comment_text}
                </p>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ color: '#666', fontSize: 11 }}>
                  {new Date(comment.created_at).toLocaleString()}
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {editingId === comment.id ? (
                    <>
                      <button
                        onClick={() => handleUpdateComment(comment.id)}
                        style={{
                          padding: '4px 8px',
                          background: '#4ade80',
                          color: '#000',
                          border: 'none',
                          borderRadius: 4,
                          fontSize: 11,
                          cursor: 'pointer',
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null)
                          setEditText('')
                        }}
                        style={{
                          padding: '4px 8px',
                          background: '#2a2a2a',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 4,
                          fontSize: 11,
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(comment.id)
                          setEditText(comment.comment_text)
                        }}
                        style={{
                          padding: '4px 8px',
                          background: '#2a2a2a',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 4,
                          fontSize: 11,
                          cursor: 'pointer',
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        style={{
                          padding: '4px 8px',
                          background: '#f87171',
                          color: '#000',
                          border: 'none',
                          borderRadius: 4,
                          fontSize: 11,
                          cursor: 'pointer',
                        }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
