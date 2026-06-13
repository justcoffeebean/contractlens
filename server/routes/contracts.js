const express = require('express')
const router = express.Router()
const upload = require('../middleware/upload')
const { parsePdf } = require('../services/parsePdf')
const { analyzeContract } = require('../services/analyzeContract')
const { saveAnalysis, getAnalyses, getAnalysis } = require('../services/saveAnalysis')
const { askQuestion } = require('../services/askQuestion')

// POST /api/contracts/analyze
router.post('/analyze', upload.single('contract'), async (req, res) => {
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
    const analysis = await analyzeContract(text)
    console.log('Analysis complete')

    // Step 3: Save to Supabase
    console.log('Saving to Supabase...')
    const saved = await saveAnalysis({
      filename: req.file.originalname,
      pages,
      contractText: text,
      analysis,
    })
    console.log('Saved analysis:', saved.id)

    res.json({
      id: saved.id,
      filename: req.file.originalname,
      pages,
      analysis,
    })
  } catch (err) {
    console.error('Analysis error:', err.message)
    console.error('Full error:', JSON.stringify(err, Object.getOwnPropertyNames(err)))
    res.status(500).json({ error: err.message })
  }
})

// GET /api/contracts — get all past analyses
router.get('/', async (req, res) => {
  try {
    const analyses = await getAnalyses()
    res.json({ analyses })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/contracts/:id — get a single analysis
router.get('/:id', async (req, res) => {
  try {
    const analysis = await getAnalysis(req.params.id)
    res.json({ analysis })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/contracts/:id/ask
router.post('/:id/ask', async (req, res) => {
  try {
    const { question } = req.body

    if (!question) {
      return res.status(400).json({ error: 'Question is required' })
    }

    // Fetch the saved contract text from Supabase
    const saved = await getAnalysis(req.params.id)

    if (!saved.contract_text) {
      return res.status(404).json({ error: 'Contract text not found' })
    }

    // Ask Groq the question about the contract
    const answer = await askQuestion(saved.contract_text, question)

    res.json({ answer })
  } catch (err) {
    console.error('Question error:', err.message)
    console.error('Full error:', JSON.stringify(err, Object.getOwnPropertyNames(err)))
    res.status(500).json({ error: err.message })
  }
})

module.exports = router