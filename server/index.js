const express = require('express')
const cors = require('cors')
require('dotenv').config()

console.log('GEMINI_API_KEY loaded:', process.env.GEMINI_API_KEY ? 'YES' : 'NO')

const contractRoutes = require('./routes/contracts')

const app = express()

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }))
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ContractLens server is running' })
})

// Routes
app.use('/api/contracts', contractRoutes)

// Start server
const PORT = process.env.PORT || 3002
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})