const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const interactionLogController = require('../controllers/interactionLogController');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/interactions');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to accept only images and documents
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images and documents are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Create a new interaction log with file uploads
router.post('/', 
    auth, 
    upload.fields([
        { name: 'product_photo', maxCount: 1 },
        { name: 'additional_files', maxCount: 5 }
    ]),
    interactionLogController.createInteractionLog
);

// Get all interaction logs (admin only)
router.get('/', auth, checkRole('admin'), interactionLogController.getAllInteractionLogs);

// Get interaction logs by client ID
router.get('/client/:client_id', auth, interactionLogController.getInteractionLogsByClient);

// Get interaction logs by beauty advisor ID
router.get('/advisor/:beauty_advisor_id', auth, interactionLogController.getInteractionLogsByBeautyAdvisor);

// Get a specific interaction log by ID
router.get('/:id', auth, interactionLogController.getInteractionLogById);

// Update an interaction log with file uploads
router.put('/:id', 
    auth, 
    upload.fields([
        { name: 'product_photo', maxCount: 1 },
        { name: 'additional_files', maxCount: 5 }
    ]),
    interactionLogController.updateInteractionLog
);

// Delete an interaction log (admin only)
router.delete('/:id', auth, checkRole('admin'), interactionLogController.deleteInteractionLog);

module.exports = router; 