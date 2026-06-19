const { createClient } = require('@supabase/supabase-js')
const fetch = require('node-fetch')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  {
    global: {
      fetch: fetch,
    },
  }
)

async function logAudit(userId, action, analysisId = null, details = null, req = null) {
  const { data, error } = await supabase
    .from('audit_logs')
    .insert([{
      user_id: userId,
      action,
      analysis_id: analysisId,
      details,
      ip_address: req?.ip || null,
      user_agent: req?.get('user-agent') || null,
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

async function getAuditLogs(userId, analysisId = null, limit = 50) {
  let query = supabase
    .from('audit_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (analysisId) {
    query = query.eq('analysis_id', analysisId)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

module.exports = {
  logAudit,
  getAuditLogs,
}
