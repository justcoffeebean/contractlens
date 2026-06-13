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

async function saveAnalysis({ filename, pages, contractText, analysis }) {
  const { data, error } = await supabase
    .from('contract_analyses')
    .insert([{
      filename,
      pages,
      contract_text: contractText,
      analysis,
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

async function getAnalyses() {
  const { data, error } = await supabase
    .from('contract_analyses')
    .select('id, filename, pages, analysis, created_at')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

async function getAnalysis(id) {
  const { data, error } = await supabase
    .from('contract_analyses')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

module.exports = { saveAnalysis, getAnalyses, getAnalysis }