const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Generate unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for allowed MIME types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and PDF files are allowed.'), false);
  }
};

// Product photo filter - only images
const productPhotoFilter = (req, file, cb) => {
  const allowedImageTypes = [
    'image/jpeg',
    'image/png',
    'image/gif'
  ];

  if (allowedImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and GIF images are allowed for product photos.'), false);
  }
};

// Configure multer for regular files
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Maximum 5 files per upload
  }
});

// Configure multer for product photos
const productPhotoUpload = multer({
  storage: storage,
  fileFilter: productPhotoFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit for product photos
    files: 1 // Only one product photo allowed
  }
});

// Combined upload middleware
const combinedUpload = (req, res, next) => {
  const uploadFields = [
    { name: 'productPhoto', maxCount: 1 },
    { name: 'files', maxCount: 5 }
  ];

  multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
      if (file.fieldname === 'productPhoto') {
        productPhotoFilter(req, file, cb);
      } else {
        fileFilter(req, file, cb);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
      files: 6 // Maximum 6 files total (1 product photo + 5 other files)
    }
  }).fields(uploadFields)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        message: 'File upload error',
        error: err.message
      });
    } else if (err) {
      return res.status(400).json({
        message: 'Invalid file type',
        error: err.message
      });
    }
    next();
  });
};

module.exports = {
  upload,
  productPhotoUpload,
  combinedUpload
}; 