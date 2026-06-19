const Groq = require('groq-sdk')
const { createClient } = require('@supabase/supabase-js')
const fetch = require('node-fetch')

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  {
    global: {
      fetch: fetch,
    },
  }
)

async function askQuestion(contractText, question, contractId) {
  // Check cache first
  if (contractId) {
    const { data: cached, error: cacheError } = await supabase
      .from('question_cache')
      .select('answer')
      .eq('contract_id', contractId)
      .eq('question', question)
      .single()

    if (cached && !cacheError) {
      console.log('Cache hit for question on contract:', contractId)
      return cached.answer
    }
  }

  // Not in cache, call Groq
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are an expert contract lawyer. Answer questions about contracts clearly and in plain English. Be concise but thorough. Always reference specific clauses when relevant.`,
      },
      {
        role: 'user',
        content: `Here is the contract text:

${contractText.slice(0, 15000)}

Question: ${question}

Please answer clearly and in plain English.`,
      },
    ],
    temperature: 0.3,
  })

  const answer = completion.choices[0].message.content

  // Store in cache if contractId is provided
  if (contractId) {
    const { error: insertError } = await supabase
      .from('question_cache')
      .insert([{
        contract_id: contractId,
        question,
        answer,
      }])

    if (insertError) {
      console.error('Failed to cache question:', insertError.message)
    } else {
      console.log('Cached question for contract:', contractId)
    }
  }

  return answer
}

module.exports = { askQuestion }