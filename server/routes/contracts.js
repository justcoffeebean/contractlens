const express = require('express')
const router = express.Router()
const { uploadSingle, uploadMultiple, uploadBulk } = require('../middleware/upload')
const { analyzeRateLimit, askRateLimit } = require('../middleware/rateLimit')
const { authenticateToken } = require('../middleware/auth')
const { parsePdf } = require('../services/parsePdf')
const { analyzeContract } = require('../services/analyzeContract')
const { saveAnalysis, getAnalyses, getAnalysis, updateAnalysis, deleteAnalysis } = require('../services/saveAnalysis')
const { askQuestion } = require('../services/askQuestion')
const { generateShareLink, getSharedAnalysis, revokeShareLink, getUserShareLinks } = require('../services/sharing')
const { exportToPdf, exportToJson } = require('../services/export')
const { compareContracts } = require('../services/comparison')
const { addComment, getComments, updateComment, deleteComment } = require('../services/comments')
const { createNotification, getNotifications, markAsRead, markAllAsRead, deleteNotification, checkRenewalDates } = require('../services/notifications')
const { logAudit, getAuditLogs } = require('../services/audit')

// POST /api/contracts/analyze
router.post('/analyze', authenticateToken, analyzeRateLimit, uploadSingle, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' })
    }

    console.log(`Analyzing contract: ${req.file.originalname}`)

    // Step 1: Extract text from PDF
    const { text, pages } = await parsePdf(req.file.buffer)
    console.log(`Extracted ${text.length} characters from ${pages} pages`)

    // Step 2: Send text to Groq for analysis
    console.log('Sending to Groq...')
    let analysis
    try {
      analysis = await analyzeContract(text)
      console.log('Groq analysis complete')
    } catch (groqErr) {
      console.error('GROQ FAILED:', groqErr.message)
      return res.status(500).json({ error: `Groq failed: ${groqErr.message}` })
    }

    // Step 3: Save to Supabase
    console.log('Saving to Supabase...')
    let saved
    try {
      saved = await saveAnalysis({
        filename: req.file.originalname,
        pages,
        contractText: text,
        analysis,
        userId: req.user.userId,
      })
      console.log('Saved to Supabase:', saved.id)
    } catch (supaErr) {
      console.error('SUPABASE FAILED:', supaErr.message)
      return res.status(500).json({ error: `Supabase failed: ${supaErr.message}` })
    }

    res.json({
      id: saved.id,
      filename: req.file.originalname,
      pages,
      analysis,
    })
  } catch (err) {
    console.error('Analysis error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/contracts — get all past analyses
router.get('/', authenticateToken, async (req, res) => {
  try {
    const analyses = await getAnalyses(req.user.userId)
    res.json({ analyses })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/contracts/:id — get a single analysis
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const analysis = await getAnalysis(req.params.id, req.user.userId)
    res.json({ analysis })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/contracts/:id/ask
router.post('/:id/ask', authenticateToken, askRateLimit, async (req, res) => {
  try {
    const { question } = req.body

    if (!question) {
      return res.status(400).json({ error: 'Question is required' })
    }

    // Sanitize and validate question length
    const MAX_QUESTION_LENGTH = 1000
    const sanitizedQuestion = question.trim()
    
    if (sanitizedQuestion.length === 0) {
      return res.status(400).json({ error: 'Question cannot be empty' })
    }
    
    if (sanitizedQuestion.length > MAX_QUESTION_LENGTH) {
      return res.status(400).json({ 
        error: `Question too long. Maximum ${MAX_QUESTION_LENGTH} characters allowed.` 
      })
    }

    // Fetch the saved contract text from Supabase
    const saved = await getAnalysis(req.params.id, req.user.userId)

    if (!saved.contract_text) {
      return res.status(404).json({ error: 'Contract text not found' })
    }

    // Ask Groq the question about the contract
    const answer = await askQuestion(saved.contract_text, sanitizedQuestion, req.params.id)

    res.json({ answer })
  } catch (err) {
    console.error('Question error:', err.message)
    console.error('Full error:', JSON.stringify(err, Object.getOwnPropertyNames(err)))
    res.status(500).json({ error: err.message })
  }
})

// POST /api/contracts/compare — compare two contract versions
router.post('/compare', authenticateToken, analyzeRateLimit, uploadMultiple, async (req, res) => {
  try {
    const { contract1, contract2 } = req.files

    if (!contract1 || !contract2) {
      return res.status(400).json({ error: 'Both contract files are required' })
    }

    console.log(`Comparing contracts: ${contract1[0].originalname} vs ${contract2[0].originalname}`)

    // Step 1: Extract text from both PDFs
    const { text: text1, pages: pages1 } = await parsePdf(contract1[0].buffer)
    const { text: text2, pages: pages2 } = await parsePdf(contract2[0].buffer)

    console.log(`Extracted ${text1.length} characters from ${pages1} pages (v1)`)
    console.log(`Extracted ${text2.length} characters from ${pages2} pages (v2)`)

    // Step 2: Analyze both contracts
    console.log('Analyzing both contracts...')
    const [analysis1, analysis2] = await Promise.all([
      analyzeContract(text1),
      analyzeContract(text2),
    ])
    console.log('Both analyses complete')

    // Step 3: Use comparison service
    const comparison = await compareContracts(text1, text2)

    // Step 4: Save both analyses to Supabase
    console.log('Saving to Supabase...')
    const [saved1, saved2] = await Promise.all([
      saveAnalysis({
        filename: contract1[0].originalname,
        pages: pages1,
        contractText: text1,
        analysis: analysis1,
        userId: req.user.userId,
      }),
      saveAnalysis({
        filename: contract2[0].originalname,
        pages: pages2,
        contractText: text2,
        analysis: analysis2,
        userId: req.user.userId,
      }),
    ])
    console.log('Saved to Supabase:', saved1.id, saved2.id)

    res.json({
      comparison,
      version1: { filename: contract1[0].originalname, id: saved1.id, analysis: analysis1 },
      version2: { filename: contract2[0].originalname, id: saved2.id, analysis: analysis2 },
    })
  } catch (err) {
    console.error('Comparison error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/contracts/bulk — upload multiple contracts at once
router.post('/bulk', authenticateToken, analyzeRateLimit, uploadBulk, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No PDF files uploaded' })
    }

    if (req.files.length > 10) {
      return res.status(400).json({ error: 'Maximum 10 files allowed per bulk upload' })
    }

    console.log(`Bulk uploading ${req.files.length} contracts`)

    const results = []

    for (const file of req.files) {
      try {
        console.log(`Processing: ${file.originalname}`)

        // Extract text
        const { text, pages } = await parsePdf(file.buffer)
        console.log(`Extracted ${text.length} characters from ${pages} pages`)

        // Analyze
        const analysis = await analyzeContract(text)
        console.log(`Analysis complete for ${file.originalname}`)

        // Save
        const saved = await saveAnalysis({
          filename: file.originalname,
          pages,
          contractText: text,
          analysis,
          userId: req.user.userId,
        })

        results.push({
          id: saved.id,
          filename: file.originalname,
          pages,
          analysis,
          status: 'success',
        })
      } catch (err) {
        console.error(`Failed to process ${file.originalname}:`, err.message)
        results.push({
          filename: file.originalname,
          status: 'failed',
          error: err.message,
        })
      }
    }

    const successful = results.filter(r => r.status === 'success')
    const failed = results.filter(r => r.status === 'failed')

    res.json({
      total: results.length,
      successful: successful.length,
      failed: failed.length,
      results,
    })
  } catch (err) {
    console.error('Bulk upload error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/contracts/:id/export/pdf — export analysis as PDF
router.get('/:id/export/pdf', authenticateToken, async (req, res) => {
  try {
    const pdfBuffer = await exportToPdf(req.params.id, req.user.userId)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="contract-analysis-${req.params.id}.pdf"`)
    res.send(pdfBuffer)
  } catch (err) {
    console.error('PDF export error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/contracts/:id/export/json — export analysis as JSON
router.get('/:id/export/json', authenticateToken, async (req, res) => {
  try {
    const jsonData = await exportToJson(req.params.id, req.user.userId)

    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename="contract-analysis-${req.params.id}.json"`)
    res.json(jsonData)
  } catch (err) {
    console.error('JSON export error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/contracts/:id/share — generate share link
router.post('/:id/share', authenticateToken, async (req, res) => {
  try {
    const { expiresAt, password } = req.body

    const shareInfo = await generateShareLink(req.params.id, req.user.userId, {
      expiresAt,
      password,
    })

    res.json(shareInfo)
  } catch (err) {
    console.error('Share link generation error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/contracts/shared/:token — access shared analysis (public endpoint)
router.get('/shared/:token', async (req, res) => {
  try {
    const { token } = req.params
    const { password } = req.query

    const analysis = await getSharedAnalysis(token, password)
    res.json({ analysis })
  } catch (err) {
    console.error('Shared analysis error:', err.message)
    res.status(401).json({ error: err.message })
  }
})

// DELETE /api/contracts/:id/share/:token — revoke share link
router.delete('/:id/share/:token', authenticateToken, async (req, res) => {
  try {
    await revokeShareLink(req.params.token, req.user.userId)
    res.json({ success: true })
  } catch (err) {
    console.error('Revoke share link error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/contracts/shares — get all user's share links
router.get('/shares/list', authenticateToken, async (req, res) => {
  try {
    const shareLinks = await getUserShareLinks(req.user.userId)
    res.json({ shareLinks })
  } catch (err) {
    console.error('Get share links error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/contracts/:id — update analysis metadata
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { tags, folder, notes } = req.body

    const updated = await updateAnalysis(req.params.id, req.user.userId, {
      tags,
      folder,
      notes,
    })

    res.json({ analysis: updated })
  } catch (err) {
    console.error('Update analysis error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/contracts/:id — delete analysis
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await deleteAnalysis(req.params.id, req.user.userId)
    res.json({ success: true })
  } catch (err) {
    console.error('Delete analysis error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/contracts/search — advanced search
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { riskLevel, contractType, dateFrom, dateTo, query, tags, folder } = req.query

    const analyses = await getAnalyses(req.user.userId)

    let filtered = analyses

    // Filter by risk level
    if (riskLevel) {
      filtered = filtered.filter(a => a.analysis.overallRisk === riskLevel)
    }

    // Filter by contract type
    if (contractType) {
      filtered = filtered.filter(a => 
        a.analysis.contractType?.toLowerCase().includes(contractType.toLowerCase())
      )
    }

    // Filter by date range
    if (dateFrom) {
      filtered = filtered.filter(a => new Date(a.created_at) >= new Date(dateFrom))
    }
    if (dateTo) {
      filtered = filtered.filter(a => new Date(a.created_at) <= new Date(dateTo))
    }

    // Filter by text query (search in filename, summary, clauses)
    if (query) {
      const lowerQuery = query.toLowerCase()
      filtered = filtered.filter(a => 
        a.filename.toLowerCase().includes(lowerQuery) ||
        a.analysis.summary?.toLowerCase().includes(lowerQuery) ||
        a.analysis.clauses?.some(c => 
          c.title.toLowerCase().includes(lowerQuery) ||
          c.summary.toLowerCase().includes(lowerQuery)
        )
      )
    }

    // Filter by tags
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',')
      filtered = filtered.filter(a => 
        tagArray.some(tag => a.tags?.includes(tag))
      )
    }

    // Filter by folder
    if (folder) {
      filtered = filtered.filter(a => a.folder === folder)
    }

    res.json({ analyses: filtered, total: filtered.length })
  } catch (err) {
    console.error('Search error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/contracts/stats — get analytics statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const analyses = await getAnalyses(req.user.userId)

    const stats = {
      total: analyses.length,
      byRiskLevel: {
        low: analyses.filter(a => a.analysis.overallRisk === 'low').length,
        medium: analyses.filter(a => a.analysis.overallRisk === 'medium').length,
        high: analyses.filter(a => a.analysis.overallRisk === 'high').length,
      },
      byContractType: {},
      commonRedFlags: {},
      riskTrend: [],
    }

    // Count by contract type
    analyses.forEach(a => {
      const type = a.analysis.contractType || 'Unknown'
      stats.byContractType[type] = (stats.byContractType[type] || 0) + 1
    })

    // Count common red flags
    analyses.forEach(a => {
      a.analysis.redFlags?.forEach(flag => {
        stats.commonRedFlags[flag] = (stats.commonRedFlags[flag] || 0) + 1
      })
    })

    // Risk trend over time (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentAnalyses = analyses.filter(a => new Date(a.created_at) >= thirtyDaysAgo)
    const trendByDay = {}

    recentAnalyses.forEach(a => {
      const date = new Date(a.created_at).toISOString().split('T')[0]
      if (!trendByDay[date]) {
        trendByDay[date] = { low: 0, medium: 0, high: 0 }
      }
      trendByDay[date][a.analysis.overallRisk]++
    })

    stats.riskTrend = Object.entries(trendByDay)
      .map(([date, risks]) => ({ date, ...risks }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))

    res.json(stats)
  } catch (err) {
    console.error('Stats error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router