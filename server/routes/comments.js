const express = require('express')
const router = express.Router()
const { authenticateToken } = require('../middleware/auth')
const { addComment, getComments, updateComment, deleteComment } = require('../services/comments')

// POST /api/comments — add a comment to an analysis
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { analysisId, clauseTitle, commentText } = req.body

    if (!analysisId || !commentText) {
      return res.status(400).json({ error: 'analysisId and commentText are required' })
    }

    const comment = await addComment(analysisId, req.user.userId, clauseTitle, commentText)
    res.json({ comment })
  } catch (err) {
    console.error('Add comment error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/comments/:analysisId — get all comments for an analysis
router.get('/:analysisId', authenticateToken, async (req, res) => {
  try {
    const comments = await getComments(req.params.analysisId, req.user.userId)
    res.json({ comments })
  } catch (err) {
    console.error('Get comments error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/comments/:id — update a comment
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { commentText } = req.body

    if (!commentText) {
      return res.status(400).json({ error: 'commentText is required' })
    }

    const comment = await updateComment(req.params.id, req.user.userId, commentText)
    res.json({ comment })
  } catch (err) {
    console.error('Update comment error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/comments/:id — delete a comment
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await deleteComment(req.params.id, req.user.userId)
    res.json({ success: true })
  } catch (err) {
    console.error('Delete comment error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
