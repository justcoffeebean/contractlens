const express = require('express')
const cors = require('cors')
const http = require('http')
require('dotenv').config()

console.log('GROQ_API_KEY loaded:', process.env.GROQ_API_KEY ? 'YES' : 'NO')

const contractRoutes = require('./routes/contracts')
const authRoutes = require('./routes/auth')
const commentRoutes = require('./routes/comments')
const notificationRoutes = require('./routes/notifications')
const webhookRoutes = require('./routes/webhooks')
const enhancedAIRoutes = require('./routes/enhancedAI')
const templateRoutes = require('./routes/templates')
const { initializeWebSocket } = require('./services/websocket')

const app = express()

// Middleware
app.use(cors({ 
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'https://contractlens-sepia.vercel.app',
  ],
  credentials: false,
}))
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ContractLens server is running' })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/contracts', contractRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/webhooks', webhookRoutes)
app.use('/api/enhanced-ai', enhancedAIRoutes)
app.use('/api/templates', templateRoutes)

// Create HTTP server and initialize WebSocket
const server = http.createServer(app)
initializeWebSocket(server)

// Start server
const PORT = process.env.PORT || 3002
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`WebSocket server initialized`)
})