const multer = require('multer')

// PDF magic bytes (file signature)
const PDF_MAGIC_BYTES = Buffer.from([0x25, 0x50, 0x44, 0x46]) // %PDF

function isValidPdf(buffer) {
  if (buffer.length < 4) return false
  return buffer.slice(0, 4).equals(PDF_MAGIC_BYTES)
}

// Store uploaded files in memory as a Buffer
// This means we don't save files to disk — we process them on the fly
const storage = multer.memoryStorage()

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max per file
  },
  fileFilter: (req, file, cb) => {
    // Check mimetype
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'), false)
    }

    // Check magic bytes (file signature) to prevent renamed files
    if (file.buffer && !isValidPdf(file.buffer)) {
      return cb(new Error('Invalid PDF file signature'), false)
    }

    cb(null, true)
  },
})

// Upload for single file
const uploadSingle = upload.single('contract')

// Upload for multiple files (for comparison)
const uploadMultiple = upload.fields([
  { name: 'contract1', maxCount: 1 },
  { name: 'contract2', maxCount: 1 },
])

// Upload for bulk (multiple contracts at once)
const uploadBulk = upload.array('contracts', 10) // Max 10 files at once

module.exports = { uploadSingle, uploadMultiple, uploadBulk }