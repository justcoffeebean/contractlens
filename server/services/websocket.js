const WebSocket = require('ws')
const { logAudit } = require('./audit')

class WebSocketServer {
  constructor(server) {
    this.wss = new WebSocket.Server({ server })
    this.clients = new Map() // userId -> Set of WebSocket connections

    this.wss.on('connection', (ws, req) => {
      const userId = this.extractUserId(req)

      if (!userId) {
        ws.close(1008, 'Unauthorized')
        return
      }

      // Add client to the set for this user
      if (!this.clients.has(userId)) {
        this.clients.set(userId, new Set())
      }
      this.clients.get(userId).add(ws)

      console.log(`WebSocket connected for user ${userId}`)

      ws.on('close', () => {
        this.clients.get(userId)?.delete(ws)
        if (this.clients.get(userId)?.size === 0) {
          this.clients.delete(userId)
        }
        console.log(`WebSocket disconnected for user ${userId}`)
      })

      ws.on('error', (error) => {
        console.error(`WebSocket error for user ${userId}:`, error)
      })

      // Send welcome message
      this.sendToUser(userId, {
        type: 'connected',
        message: 'WebSocket connection established',
      })
    })
  }

  extractUserId(req) {
    // Extract user ID from query parameter or session
    const url = new URL(req.url, `http://${req.headers.host}`)
    return url.searchParams.get('userId')
  }

  sendToUser(userId, data) {
    const userClients = this.clients.get(userId)
    if (!userClients) return

    const message = JSON.stringify(data)
    userClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message)
      }
    })
  }

  broadcast(data) {
    const message = JSON.stringify(data)
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message)
      }
    })
  }

  // Event notification methods
  notifyAnalysisComplete(userId, analysisId, filename) {
    this.sendToUser(userId, {
      type: 'analysis_complete',
      data: { analysisId, filename },
    })
  }

  notifyNewComment(userId, analysisId, comment) {
    this.sendToUser(userId, {
      type: 'new_comment',
      data: { analysisId, comment },
    })
  }

  notifyRiskHigh(userId, analysisId, filename) {
    this.sendToUser(userId, {
      type: 'high_risk_alert',
      data: { analysisId, filename },
    })
  }

  notifyShareCreated(userId, analysisId, shareUrl) {
    this.sendToUser(userId, {
      type: 'share_created',
      data: { analysisId, shareUrl },
    })
  }
}

let wsServer = null

function initializeWebSocket(server) {
  if (!wsServer) {
    wsServer = new WebSocketServer(server)
  }
  return wsServer
}

function getWebSocketServer() {
  return wsServer
}

module.exports = {
  initializeWebSocket,
  getWebSocketServer,
}
