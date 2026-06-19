const Groq = require('groq-sdk')

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

async function suggestAlternativeClause(clauseText, riskReason) {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are a senior contract lawyer. Your job is to suggest alternative language for contract clauses that are risky or unfair to the client.

Provide a rewritten version of the clause that:
1. Removes or mitigates the identified risk
2. Is still legally sound and professional
3. Maintains the core intent of the original clause where possible
4. Uses clear, plain English

Respond with a JSON object:
{
  "originalClause": "the original clause text",
  "riskReason": "why this is risky",
  "suggestedAlternative": "the rewritten clause",
  "explanation": "brief explanation of how this fixes the risk"
}`,
      },
      {
        role: 'user',
        content: `Here is a risky contract clause:

${clauseText}

Risk reason: ${riskReason}

Please suggest an alternative that addresses this risk.`,
      },
    ],
    temperature: 0.3,
  })

  const raw = completion.choices[0].message.content
  const clean = raw.replace(/```json|```/g, '').trim()

  try {
    return JSON.parse(clean)
  } catch (err) {
    throw new Error('Failed to parse AI response as JSON')
  }
}

async function translateContract(contractText, targetLanguage) {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are a professional legal translator. Translate contract text from English to ${targetLanguage}.

Maintain:
- Legal terminology accuracy
- Professional tone
- Original meaning and intent
- Clause structure

Respond ONLY with the translated text, no explanations or additional content.`,
      },
      {
        role: 'user',
        content: `Translate this contract text to ${targetLanguage}:

${contractText}`,
      },
    ],
    temperature: 0.1,
  })

  return completion.choices[0].message.content
}

async function extractKeyTerms(contractText) {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are a contract analysis expert. Extract and define key legal terms from the contract.

For each important term, provide:
- The term as it appears in the contract
- A plain English definition
- Why it matters in this context

Respond with a JSON object:
{
  "keyTerms": [
    {
      "term": "the term",
      "definition": "plain English definition",
      "importance": "why it matters"
    }
  ]
}`,
      },
      {
        role: 'user',
        content: `Extract key terms from this contract:

${contractText}`,
      },
    ],
    temperature: 0.2,
  })

  const raw = completion.choices[0].message.content
  const clean = raw.replace(/```json|```/g, '').trim()

  try {
    return JSON.parse(clean)
  } catch (err) {
    throw new Error('Failed to parse AI response as JSON')
  }
}

async function generateNegotiationPoints(analysis) {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are a skilled contract negotiator. Based on the contract analysis, generate specific negotiation points the client can use.

For each negotiation point:
- Reference the specific clause or issue
- Suggest what to ask for
- Explain why this is reasonable
- Provide a fallback position if the other party refuses

Respond with a JSON object:
{
  "negotiationPoints": [
    {
      "clause": "clause title or section",
      "currentIssue": "what's wrong with current terms",
      "request": "what to ask for",
      "justification": "why this is reasonable",
      "fallback": "alternative if request is denied"
    }
  ]
}`,
      },
      {
        role: 'user',
        content: `Generate negotiation points based on this contract analysis:

${JSON.stringify(analysis, null, 2)}`,
      },
    ],
    temperature: 0.3,
  })

  const raw = completion.choices[0].message.content
  const clean = raw.replace(/```json|```/g, '').trim()

  try {
    return JSON.parse(clean)
  } catch (err) {
    throw new Error('Failed to parse AI response as JSON')
  }
}

module.exports = {
  suggestAlternativeClause,
  translateContract,
  extractKeyTerms,
  generateNegotiationPoints,
}
