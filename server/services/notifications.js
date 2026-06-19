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

async function createNotification(userId, type, title, message, analysisId = null) {
  const { data, error } = await supabase
    .from('notifications')
    .insert([{
      user_id: userId,
      type,
      title,
      message,
      analysis_id: analysisId,
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

async function getNotifications(userId, unreadOnly = false) {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (unreadOnly) {
    query = query.eq('is_read', false)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

async function markAsRead(notificationId, userId) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

async function markAllAsRead(userId) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  if (error) throw error
  return { success: true }
}

async function deleteNotification(notificationId, userId) {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)
    .eq('user_id', userId)

  if (error) throw error
  return { success: true }
}

// Check for renewal dates and create notifications
async function checkRenewalDates(userId) {
  const { getAnalyses } = require('./saveAnalysis')
  const analyses = await getAnalyses(userId)

  const today = new Date()
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(today.getDate() + 30)

  for (const analysis of analyses) {
    if (analysis.analysis.keyDates) {
      for (const date of analysis.analysis.keyDates) {
        if (date.label.toLowerCase().includes('renewal') || 
            date.label.toLowerCase().includes('expiry') ||
            date.label.toLowerCase().includes('expiration')) {
          
          const renewalDate = new Date(date.value)
          if (renewalDate >= today && renewalDate <= thirtyDaysFromNow) {
            const daysUntil = Math.ceil((renewalDate - today) / (1000 * 60 * 60 * 24))
            
            await createNotification(
              userId,
              'renewal',
              `Contract Renewal Alert: ${analysis.filename}`,
              `Your contract "${analysis.filename}" is due for renewal in ${daysUntil} days (${date.value}).`,
              analysis.id
            )
          }
        }
      }
    }
  }
}

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  checkRenewalDates,
}
