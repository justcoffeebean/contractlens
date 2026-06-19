const { analyzeContract } = require('./analyzeContract')
const { parsePdf } = require('./parsePdf')

async function compareContracts(text1, text2) {
  // Analyze both contracts
  const [analysis1, analysis2] = await Promise.all([
    analyzeContract(text1),
    analyzeContract(text2),
  ])

  // Compare risk changes
  const comparison = {
    overallRisk: {
      from: analysis1.overallRisk,
      to: analysis2.overallRisk,
      changed: analysis1.overallRisk !== analysis2.overallRisk,
      direction: getRiskDirection(analysis1.overallRisk, analysis2.overallRisk),
    },
    redFlags: {
      added: analysis2.redFlags?.filter(flag => !analysis1.redFlags?.includes(flag)) || [],
      removed: analysis1.redFlags?.filter(flag => !analysis2.redFlags?.includes(flag)) || [],
      unchanged: analysis1.redFlags?.filter(flag => analysis2.redFlags?.includes(flag)) || [],
    },
    clauses: {
      added: analysis2.clauses?.filter(c2 => !analysis1.clauses?.some(c1 => c1.title === c2.title)) || [],
      removed: analysis1.clauses?.filter(c1 => !analysis2.clauses?.some(c2 => c2.title === c1.title)) || [],
      modified: findModifiedClauses(analysis1.clauses || [], analysis2.clauses || []),
      unchanged: findUnchangedClauses(analysis1.clauses || [], analysis2.clauses || []),
    },
    recommendations: {
      added: analysis2.recommendations?.filter(rec => !analysis1.recommendations?.includes(rec)) || [],
      removed: analysis1.recommendations?.filter(rec => !analysis2.recommendations?.includes(rec)) || [],
    },
    parties: {
      changed: !arraysEqual(analysis1.parties || [], analysis2.parties || []),
      from: analysis1.parties || [],
      to: analysis2.parties || [],
    },
    contractType: {
      changed: analysis1.contractType !== analysis2.contractType,
      from: analysis1.contractType,
      to: analysis2.contractType,
    },
  }

  return comparison
}

function getRiskDirection(from, to) {
  const riskLevels = { low: 1, medium: 2, high: 3 }
  const fromLevel = riskLevels[from] || 1
  const toLevel = riskLevels[to] || 1

  if (toLevel > fromLevel) return 'increased'
  if (toLevel < fromLevel) return 'decreased'
  return 'unchanged'
}

function findModifiedClauses(clauses1, clauses2) {
  return clauses2
    .filter(c2 => clauses1.some(c1 => c1.title === c2.title))
    .map(c2 => {
      const c1 = clauses1.find(c => c.title === c2.title)
      const isModified = 
        c1.summary !== c2.summary ||
        c1.riskLevel !== c2.riskLevel ||
        c1.riskReason !== c2.riskReason
      
      if (isModified) {
        return {
          title: c2.title,
          changes: {
            summary: c1.summary !== c2.summary ? { from: c1.summary, to: c2.summary } : null,
            riskLevel: c1.riskLevel !== c2.riskLevel ? { from: c1.riskLevel, to: c2.riskLevel } : null,
            riskReason: c1.riskReason !== c2.riskReason ? { from: c1.riskReason, to: c2.riskReason } : null,
          },
        }
      }
      return null
    })
    .filter(Boolean)
}

function findUnchangedClauses(clauses1, clauses2) {
  return clauses2
    .filter(c2 => clauses1.some(c1 => c1.title === c2.title))
    .filter(c2 => {
      const c1 = clauses1.find(c => c.title === c2.title)
      return (
        c1.summary === c2.summary &&
        c1.riskLevel === c2.riskLevel &&
        c1.riskReason === c2.riskReason
      )
    })
}

function arraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false
  const sorted1 = [...arr1].sort()
  const sorted2 = [...arr2].sort()
  return sorted1.every((val, index) => val === sorted2[index])
}

module.exports = {
  compareContracts,
}
