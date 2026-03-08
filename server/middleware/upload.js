const multer = require('multer')

// Store uploaded files in memory as a Buffer
// This means we don't save files to disk — we process them on the fly
const storage = multer.memoryStorage()

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    // Only allow PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Only PDF files are allowed'), false)
    }
  },
})

module.exports = upload