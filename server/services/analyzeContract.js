const Groq = require('groq-sdk')

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

async function analyzeContract(contractText) {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are an expert contract lawyer. Analyze contracts and respond ONLY with valid JSON, no markdown, no backticks, no extra text.`,
      },
      {
        role: 'user',
        content: `Analyze this contract and respond ONLY with a valid JSON object in exactly this format:

{
  "summary": "A 2-3 sentence plain English summary of what this contract is about",
  "parties": ["Party 1 name", "Party 2 name"],
  "contractType": "Type of contract e.g. NDA, Service Agreement, Employment Contract",
  "keyDates": [
    { "label": "Effective Date", "value": "date or Not specified" }
  ],
  "clauses": [
    {
      "title": "Clause title",
      "summary": "Plain English explanation of this clause",
      "riskLevel": "low|medium|high",
      "riskReason": "Why this is a risk or null if low risk"
    }
  ],
  "overallRisk": "low|medium|high",
  "redFlags": ["Red flag 1", "Red flag 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}

CONTRACT TEXT:
${contractText.slice(0, 15000)}`,
      },
    ],
    temperature: 0.1,
  })

  const text = completion.choices[0].message.content

  // Strip markdown code blocks if model wraps the response
  const clean = text.replace(/```json|```/g, '').trim()

  try {
    return JSON.parse(clean)
  } catch (err) {
    throw new Error('Failed to parse AI response as JSON')
  }
}

module.exports = { analyzeContract }