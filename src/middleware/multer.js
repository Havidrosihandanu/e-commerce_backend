const multer = require('multer');

// Gunakan memory storage karena kita akan melempar data (buffer) gambarnya langsung ke AWS S3
const storage = multer.memoryStorage();

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Batas maksimal ukuran gambar 5 MB
});

module.exports = upload;
