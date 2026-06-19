const express = require('express')
const router = express.Router()
const { authenticateToken } = require('../middleware/auth')
const { createWebhook, getWebhooks, updateWebhook, deleteWebhook } = require('../services/webhooks')

// POST /api/webhooks — create a new webhook
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { url, events, secret } = req.body

    if (!url || !events || !Array.isArray(events)) {
      return res.status(400).json({ error: 'url and events array are required' })
    }

    const validEvents = ['analysis.complete', 'contract.uploaded', 'risk.high', 'comment.added', 'share.created']
    const invalidEvents = events.filter(e => !validEvents.includes(e))

    if (invalidEvents.length > 0) {
      return res.status(400).json({ 
        error: `Invalid events: ${invalidEvents.join(', ')}. Valid events: ${validEvents.join(', ')}` 
      })
    }

    const webhook = await createWebhook(req.user.userId, url, events, secret)
    res.json({ webhook })
  } catch (err) {
    console.error('Create webhook error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/webhooks — get user's webhooks
router.get('/', authenticateToken, async (req, res) => {
  try {
    const webhooks = await getWebhooks(req.user.userId)
    res.json({ webhooks })
  } catch (err) {
    console.error('Get webhooks error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/webhooks/:id — update webhook
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { url, events, secret, isActive } = req.body

    const updates = {}
    if (url !== undefined) updates.url = url
    if (events !== undefined) updates.events = events
    if (secret !== undefined) updates.secret = secret
    if (isActive !== undefined) updates.is_active = isActive

    const webhook = await updateWebhook(req.params.id, req.user.userId, updates)
    res.json({ webhook })
  } catch (err) {
    console.error('Update webhook error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/webhooks/:id — delete webhook
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await deleteWebhook(req.params.id, req.user.userId)
    res.json({ success: true })
  } catch (err) {
    console.error('Delete webhook error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
