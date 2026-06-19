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

async function saveAnalysis({ filename, pages, contractText, analysis, userId }) {
  const { data, error } = await supabase
    .from('contract_analyses')
    .insert([{
      filename,
      pages,
      contract_text: contractText,
      analysis,
      user_id: userId,
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

async function getAnalyses(userId) {
  const { data, error } = await supabase
    .from('contract_analyses')
    .select('id, filename, pages, analysis, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

async function getAnalysis(id, userId) {
  const { data, error } = await supabase
    .from('contract_analyses')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data
}

async function updateAnalysis(id, userId, updates) {
  const { data, error } = await supabase
    .from('contract_analyses')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

async function deleteAnalysis(id, userId) {
  const { error } = await supabase
    .from('contract_analyses')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw error
  return { success: true }
}

module.exports = { saveAnalysis, getAnalyses, getAnalysis, updateAnalysis, deleteAnalysis }