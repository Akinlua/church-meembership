const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const backupController = require('../controllers/backupController');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', 'public', 'uploads'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '.sql');
    }
});

const upload = multer({ storage: storage });

// Define routes
router.get('/download', backupController.downloadBackup);
router.post('/restore', upload.single('backupFile'), backupController.restoreBackup);

module.exports = router;
