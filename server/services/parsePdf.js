const pdfParse = require('pdf-parse')

async function parsePdf(buffer) {
  try {
    const data = await pdfParse(buffer)

    if (!data.text || data.text.trim().length === 0) {
      throw new Error('No text found in PDF — it may be a scanned image')
    }

    return {
      text: data.text,
      pages: data.numpages,
      info: data.info,
    }
  } catch (err) {
    throw new Error(`PDF parsing failed: ${err.message}`)
  }
}

module.exports = { parsePdf }