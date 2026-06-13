const pool = require('./db')

async function saveAnalysis({ filename, pages, contractText, analysis }) {
  const result = await pool.query(
    `INSERT INTO contract_analyses (filename, pages, contract_text, analysis)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [filename, pages, contractText, JSON.stringify(analysis)]
  )
  return result.rows[0]
}

async function getAnalyses() {
  const result = await pool.query(
    `SELECT id, filename, pages, analysis, created_at
     FROM contract_analyses
     ORDER BY created_at DESC`
  )
  return result.rows
}

async function getAnalysis(id) {
  const result = await pool.query(
    `SELECT * FROM contract_analyses WHERE id = $1`,
    [id]
  )
  return result.rows[0]
}

module.exports = { saveAnalysis, getAnalyses, getAnalysis }