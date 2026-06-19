const rateLimit = require('express-rate-limit')

// Rate limit for /analyze endpoint - 5 requests per 15 minutes per IP
const analyzeRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: { error: 'Too many analysis requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// Rate limit for /ask endpoint - 20 requests per hour per IP
const askRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 requests per window
  message: { error: 'Too many questions. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

module.exports = { analyzeRateLimit, askRateLimit }
