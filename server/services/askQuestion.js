const Groq = require('groq-sdk')

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

async function askQuestion(contractText, question) {
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

  return completion.choices[0].message.content
}

module.exports = { askQuestion }