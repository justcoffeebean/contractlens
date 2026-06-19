const NodeCache = require('node-cache')

// Create cache instance with default TTL of 1 hour
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 })

function get(key) {
  return cache.get(key)
}

function set(key, value, ttl = null) {
  if (ttl) {
    return cache.set(key, value, ttl)
  }
  return cache.set(key, value)
}

function del(key) {
  return cache.del(key)
}

function flush() {
  return cache.flushAll()
}

function getStats() {
  return cache.getStats()
}

// Cache keys helpers
const cacheKeys = {
  analysis: (id) => `analysis:${id}`,
  userAnalyses: (userId) => `user_analyses:${userId}`,
  sharedAnalysis: (token) => `shared:${token}`,
  template: (id) => `template:${id}`,
}

module.exports = {
  get,
  set,
  del,
  flush,
  getStats,
  cacheKeys,
}
