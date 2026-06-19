const express = require('express')
const router = express.Router()
const { authenticateToken } = require('../middleware/auth')
const { createTemplate, getTemplates, getTemplate, updateTemplate, deleteTemplate, getPublicTemplates } = require('../services/templates')

// POST /api/templates — create a new template
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, templateType, content, isPublic } = req.body

    if (!name || !templateType || !content) {
      return res.status(400).json({ error: 'name, templateType, and content are required' })
    }

    const template = await createTemplate(
      req.user.userId,
      name,
      description,
      templateType,
      content,
      isPublic || false
    )
    res.json({ template })
  } catch (err) {
    console.error('Create template error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/templates — get user's templates (and public templates)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { includePublic } = req.query
    const templates = await getTemplates(req.user.userId, includePublic !== 'false')
    res.json({ templates })
  } catch (err) {
    console.error('Get templates error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/templates/public — get all public templates
router.get('/public', async (req, res) => {
  try {
    const templates = await getPublicTemplates()
    res.json({ templates })
  } catch (err) {
    console.error('Get public templates error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/templates/:id — get a specific template
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const template = await getTemplate(req.params.id, req.user.userId)
    res.json({ template })
  } catch (err) {
    console.error('Get template error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/templates/:id — update a template
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, description, templateType, content, isPublic } = req.body

    const updates = {}
    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description
    if (templateType !== undefined) updates.template_type = templateType
    if (content !== undefined) updates.content = content
    if (isPublic !== undefined) updates.is_public = isPublic

    const template = await updateTemplate(req.params.id, req.user.userId, updates)
    res.json({ template })
  } catch (err) {
    console.error('Update template error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/templates/:id — delete a template
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await deleteTemplate(req.params.id, req.user.userId)
    res.json({ success: true })
  } catch (err) {
    console.error('Delete template error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
