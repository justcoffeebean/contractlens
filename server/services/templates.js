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

async function createTemplate(userId, name, description, templateType, content, isPublic = false) {
  const { data, error } = await supabase
    .from('contract_templates')
    .insert([{
      user_id: userId,
      name,
      description,
      template_type: templateType,
      content,
      is_public,
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

async function getTemplates(userId, includePublic = true) {
  let query = supabase
    .from('contract_templates')
    .select('*')
    .order('created_at', { ascending: false })

  if (includePublic) {
    query = query.or(`user_id.eq.${userId},is_public.eq.true`)
  } else {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

async function getTemplate(templateId, userId) {
  const { data, error } = await supabase
    .from('contract_templates')
    .select('*')
    .eq('id', templateId)
    .or(`user_id.eq.${userId},is_public.eq.true`)
    .single()

  if (error) throw error
  return data
}

async function updateTemplate(templateId, userId, updates) {
  const { data, error } = await supabase
    .from('contract_templates')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', templateId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

async function deleteTemplate(templateId, userId) {
  const { error } = await supabase
    .from('contract_templates')
    .delete()
    .eq('id', templateId)
    .eq('user_id', userId)

  if (error) throw error
  return { success: true }
}

async function getPublicTemplates() {
  const { data, error } = await supabase
    .from('contract_templates')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

module.exports = {
  createTemplate,
  getTemplates,
  getTemplate,
  updateTemplate,
  deleteTemplate,
  getPublicTemplates,
}
