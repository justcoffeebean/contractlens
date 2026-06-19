const { createClient } = require('@supabase/supabase-js')
const crypto = require('crypto')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

async function generateShareLink(analysisId, userId, options = {}) {
  const { expiresAt = null, password = null } = options

  // Generate unique share token
  const shareToken = crypto.randomBytes(32).toString('hex')

  // Calculate expiration (default 7 days)
  const expiration = expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  // Hash password if provided
  let passwordHash = null
  if (password) {
    passwordHash = crypto.createHash('sha256').update(password).digest('hex')
  }

  // Save share link to database
  const { data, error } = await supabase
    .from('share_links')
    .insert({
      analysis_id: analysisId,
      user_id: userId,
      share_token: shareToken,
      password_hash: passwordHash,
      expires_at: expiration,
    })
    .select()
    .single()

  if (error) throw error

  return {
    shareUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/shared/${shareToken}`,
    expiresAt: expiration,
    hasPassword: !!password,
  }
}

async function getSharedAnalysis(shareToken, password = null) {
  // Get share link
  const { data: shareLink, error: linkError } = await supabase
    .from('share_links')
    .select('*')
    .eq('share_token', shareToken)
    .single()

  if (linkError || !shareLink) {
    throw new Error('Invalid or expired share link')
  }

  // Check expiration
  if (new Date(shareLink.expires_at) < new Date()) {
    throw new Error('Share link has expired')
  }

  // Check password if required
  if (shareLink.password_hash) {
    if (!password) {
      throw new Error('Password required')
    }
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex')
    if (passwordHash !== shareLink.password_hash) {
      throw new Error('Invalid password')
    }
  }

  // Get the analysis
  const { data: analysis, error: analysisError } = await supabase
    .from('contract_analyses')
    .select('*')
    .eq('id', shareLink.analysis_id)
    .single()

  if (analysisError || !analysis) {
    throw new Error('Analysis not found')
  }

  return analysis
}

async function revokeShareLink(shareToken, userId) {
  const { error } = await supabase
    .from('share_links')
    .delete()
    .eq('share_token', shareToken)
    .eq('user_id', userId)

  if (error) throw error

  return { success: true }
}

async function getUserShareLinks(userId) {
  const { data, error } = await supabase
    .from('share_links')
    .select(`
      *,
      contract_analyses (
        filename,
        created_at
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return data
}

module.exports = {
  generateShareLink,
  getSharedAnalysis,
  revokeShareLink,
  getUserShareLinks,
}
