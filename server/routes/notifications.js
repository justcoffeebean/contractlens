const express = require('express')
const router = express.Router()
const { authenticateToken } = require('../middleware/auth')
const { createNotification, getNotifications, markAsRead, markAllAsRead, deleteNotification, checkRenewalDates } = require('../services/notifications')

// GET /api/notifications — get user's notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { unreadOnly } = req.query
    const notifications = await getNotifications(req.user.userId, unreadOnly === 'true')
    res.json({ notifications })
  } catch (err) {
    console.error('Get notifications error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/notifications/:id/read — mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const notification = await markAsRead(req.params.id, req.user.userId)
    res.json({ notification })
  } catch (err) {
    console.error('Mark as read error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/notifications/read-all — mark all notifications as read
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    await markAllAsRead(req.user.userId)
    res.json({ success: true })
  } catch (err) {
    console.error('Mark all as read error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/notifications/:id — delete notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await deleteNotification(req.params.id, req.user.userId)
    res.json({ success: true })
  } catch (err) {
    console.error('Delete notification error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/notifications/check-renewals — check for upcoming renewal dates
router.post('/check-renewals', authenticateToken, async (req, res) => {
  try {
    await checkRenewalDates(req.user.userId)
    res.json({ success: true })
  } catch (err) {
    console.error('Check renewals error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
