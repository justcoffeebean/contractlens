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

async function addComment(analysisId, userId, clauseTitle, commentText) {
  const { data, error } = await supabase
    .from('comments')
    .insert([{
      analysis_id: analysisId,
      user_id: userId,
      clause_title: clauseTitle,
      comment_text: commentText,
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

async function getComments(analysisId, userId) {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('analysis_id', analysisId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

async function updateComment(commentId, userId, commentText) {
  const { data, error } = await supabase
    .from('comments')
    .update({ 
      comment_text: commentText,
      updated_at: new Date().toISOString(),
    })
    .eq('id', commentId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

async function deleteComment(commentId, userId) {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', userId)

  if (error) throw error
  return { success: true }
}

module.exports = {
  addComment,
  getComments,
  updateComment,
  deleteComment,
}
