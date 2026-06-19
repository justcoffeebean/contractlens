const { createClient } = require('@supabase/supabase-js')
const fetch = require('node-fetch')
const crypto = require('crypto')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  {
    global: {
      fetch: fetch,
    },
  }
)

async function createWebhook(userId, url, events, secret = null) {
  const { data, error } = await supabase
    .from('webhooks')
    .insert([{
      user_id: userId,
      url,
      events,
      secret: secret || crypto.randomBytes(32).toString('hex'),
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

async function getWebhooks(userId) {
  const { data, error } = await supabase
    .from('webhooks')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

async function updateWebhook(webhookId, userId, updates) {
  const { data, error } = await supabase
    .from('webhooks')
    .update(updates)
    .eq('id', webhookId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

async function deleteWebhook(webhookId, userId) {
  const { error } = await supabase
    .from('webhooks')
    .delete()
    .eq('id', webhookId)
    .eq('user_id', userId)

  if (error) throw error
  return { success: true }
}

async function triggerWebhook(webhook, payload) {
  try {
    const signature = crypto
      .createHmac('sha256', webhook.secret)
      .update(JSON.stringify(payload))
      .digest('hex')

    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-ContractLens-Signature': signature,
        'X-ContractLens-Event': payload.event,
      },
      body: JSON.stringify(payload),
    })

    // Update last_triggered_at
    await supabase
      .from('webhooks')
      .update({ last_triggered_at: new Date().toISOString() })
      .eq('id', webhook.id)

    return { success: response.ok, status: response.status }
  } catch (err) {
    console.error('Webhook trigger error:', err.message)
    return { success: false, error: err.message }
  }
}

async function triggerEvent(event, payload) {
  // Get all webhooks that listen for this event
  const { data: webhooks } = await supabase
    .from('webhooks')
    .select('*')
    .eq('is_active', true)
    .contains('events', [event])

  if (!webhooks) return

  // Trigger all matching webhooks
  const results = await Promise.all(
    webhooks.map(webhook => triggerWebhook(webhook, { event, ...payload }))
  )

  return results
}

module.exports = {
  createWebhook,
  getWebhooks,
  updateWebhook,
  deleteWebhook,
  triggerEvent,
}
