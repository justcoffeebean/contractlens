const Groq = require('groq-sdk')
const fetch = require('node-fetch')

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  fetch: fetch,
})

const SYSTEM_PROMPT = `You are a senior contract lawyer with 20 years of experience reviewing commercial contracts. Your job is to protect the CLIENT who is signing this contract.

You MUST identify ALL of the following risk patterns:
- Automatic renewal clauses (very common, very dangerous)
- Cancellation or termination penalties
- Liability caps or exclusions that favor the other party
- Non-refundable payment clauses
- IP ownership restrictions until full payment
- Unilateral amendment rights (one party can change terms without consent)
- Jurisdiction or governing law clauses unfavorable to the client
- Indemnification clauses that expose the client
- Non-compete or exclusivity clauses
- Hidden fees or rate escalation clauses

Rate each clause honestly:
- LOW: Standard, fair, no special concern
- MEDIUM: Warrants attention, negotiate if possible
- HIGH: Significant risk, do not sign without legal advice

Respond ONLY with valid JSON, no markdown, no backticks, no extra text.`

const ANALYSIS_SCHEMA = `{
  "summary": "A 3-4 sentence plain English summary of what this contract is about and who it favors",
  "parties": ["Party 1 name", "Party 2 name"],
  "contractType": "Type of contract e.g. NDA, Service Agreement, Employment Contract",
  "keyDates": [
    { "label": "Effective Date", "value": "date or Not specified" }
  ],
  "clauses": [
    {
      "title": "Clause title",
      "summary": "Plain English explanation of this clause and what it means for the client",
      "riskLevel": "low|medium|high",
      "riskReason": "Specific reason why this is a risk for the client, or null if low risk"
    }
  ],
  "overallRisk": "low|medium|high",
  "redFlags": ["Specific red flag 1", "Specific red flag 2"],
  "recommendations": ["Specific actionable recommendation 1", "Specific actionable recommendation 2"]
}`

async function runAnalysis(text) {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: `Analyze this contract and respond ONLY with a valid JSON object in exactly this format:

${ANALYSIS_SCHEMA}

CONTRACT TEXT:
${text}`,
      },
    ],
    temperature: 0.1,
    max_tokens: 4000,
  })

  const raw = completion.choices[0].message.content
  const clean = raw.replace(/```json|```/g, '').trim()

  try {
    return JSON.parse(clean)
  } catch (err) {
    throw new Error('Failed to parse AI response as JSON')
  }
}

async function runRedFlagHunt(text) {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are a contract lawyer specializing in finding hidden risks. 
Search specifically for:
1. Automatic renewal clauses — does the contract renew automatically? What is the notice period required to cancel?
2. Termination penalties — what does the client pay if they cancel early?
3. Cancellation fees — are there any fees for ending the contract?
4. Non-refundable payments — are any payments explicitly non-refundable?
5. IP restrictions — does the client get full ownership? Are there conditions?
6. Unilateral changes — can either party change terms without the other's consent?

Respond ONLY with a JSON array of strings. Each string should be a specific, concrete red flag found in the contract. If none found for a category, skip it. Example:
["Automatic renewal clause: contract renews for 12 months unless cancelled 60 days before completion", "Termination penalty: client pays 30% of remaining contract value if they cancel"]`,
      },
      {
        role: 'user',
        content: `Find all red flags in this contract:\n\n${text}`,
      },
    ],
    temperature: 0.1,
    max_tokens: 1000,
  })

  const raw = completion.choices[0].message.content
  const clean = raw.replace(/```json|```/g, '').trim()

  try {
    const result = JSON.parse(clean)
    return Array.isArray(result) ? result : []
  } catch (err) {
    console.error('Red flag hunt parse error:', err.message)
    return []
  }
}

async function analyzeContract(contractText) {
  const CHUNK_SIZE = 12000
  const OVERLAP = 500

  let firstResult

  if (contractText.length <= CHUNK_SIZE) {
    // Short contract — analyze in one pass
    console.log('Running single pass analysis...')
    firstResult = await runAnalysis(contractText)
  } else {
    // Long contract — analyze in chunks and merge
    const chunks = []
    for (let i = 0; i < contractText.length; i += CHUNK_SIZE - OVERLAP) {
      chunks.push(contractText.slice(i, i + CHUNK_SIZE))
      if (chunks.length >= 3) break // Max 3 chunks to stay within rate limits
    }

    console.log(`Running chunked analysis on ${chunks.length} chunks...`)

    const results = await Promise.all(chunks.map(chunk => runAnalysis(chunk)))

    // Merge all chunk results
    firstResult = {
      summary: results[0].summary,
      parties: results[0].parties,
      contractType: results[0].contractType,
      keyDates: results.flatMap(r => r.keyDates || []),
      clauses: results.flatMap(r => r.clauses || []),
      overallRisk: results.some(r => r.overallRisk === 'high') ? 'high'
        : results.some(r => r.overallRisk === 'medium') ? 'medium' : 'low',
      redFlags: [...new Set(results.flatMap(r => r.redFlags || []))],
      recommendations: [...new Set(results.flatMap(r => r.recommendations || []))],
    }
  }

  // Second pass — focused red flag hunt
  console.log('Running red flag hunt...')
  const additionalFlags = await runRedFlagHunt(
    contractText.slice(0, CHUNK_SIZE)
  )

  // Merge red flags from both passes, remove duplicates
  const allRedFlags = [...new Set([
    ...(firstResult.redFlags || []),
    ...additionalFlags,
  ])]

  // Upgrade overall risk if red flags were found
  let overallRisk = firstResult.overallRisk
  if (allRedFlags.length >= 4 && overallRisk === 'medium') {
    overallRisk = 'high'
  }

  return {
    ...firstResult,
    redFlags: allRedFlags,
    overallRisk,
  }
}

module.exports = { analyzeContract }