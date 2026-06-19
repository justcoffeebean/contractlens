const express = require('express')
const router = express.Router()
const { authenticateToken } = require('../middleware/auth')
const { suggestAlternativeClause, translateContract, extractKeyTerms, generateNegotiationPoints } = require('../services/enhancedAI')

// POST /api/enhanced-ai/suggest-alternative — suggest alternative clause language
router.post('/suggest-alternative', authenticateToken, async (req, res) => {
  try {
    const { clauseText, riskReason } = req.body

    if (!clauseText || !riskReason) {
      return res.status(400).json({ error: 'clauseText and riskReason are required' })
    }

    const suggestion = await suggestAlternativeClause(clauseText, riskReason)
    res.json({ suggestion })
  } catch (err) {
    console.error('Suggest alternative error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/enhanced-ai/translate — translate contract to another language
router.post('/translate', authenticateToken, async (req, res) => {
  try {
    const { contractText, targetLanguage } = req.body

    if (!contractText || !targetLanguage) {
      return res.status(400).json({ error: 'contractText and targetLanguage are required' })
    }

    const translation = await translateContract(contractText, targetLanguage)
    res.json({ translation, targetLanguage })
  } catch (err) {
    console.error('Translate error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/enhanced-ai/extract-terms — extract and define key terms
router.post('/extract-terms', authenticateToken, async (req, res) => {
  try {
    const { contractText } = req.body

    if (!contractText) {
      return res.status(400).json({ error: 'contractText is required' })
    }

    const keyTerms = await extractKeyTerms(contractText)
    res.json({ keyTerms })
  } catch (err) {
    console.error('Extract terms error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/enhanced-ai/negotiation-points — generate negotiation points
router.post('/negotiation-points', authenticateToken, async (req, res) => {
  try {
    const { analysis } = req.body

    if (!analysis) {
      return res.status(400).json({ error: 'analysis is required' })
    }

    const negotiationPoints = await generateNegotiationPoints(analysis)
    res.json({ negotiationPoints })
  } catch (err) {
    console.error('Generate negotiation points error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
