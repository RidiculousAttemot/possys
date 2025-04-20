const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define storage location and filename strategy
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../public/assets/images');
        
        // Check if directory exists, if not create it
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Use a custom filename from headers or generate one
        const customFilename = req.headers['x-custom-filename'];
        
        if (customFilename) {
            cb(null, customFilename);
        } else {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const ext = path.extname(file.originalname);
            cb(null, 'item_' + uniqueSuffix + ext);
        }
    }
});

// Filter to only allow image files
const fileFilter = (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Initialize multer with our storage configuration
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB file size limit
    },
    fileFilter: fileFilter
}).single('image');

// Handle image upload
exports.uploadImage = (req, res) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ error: `Multer error: ${err.message}` });
        } else if (err) {
            return res.status(500).json({ error: `Unknown error: ${err.message}` });
        }
        
        // If no file was uploaded
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        // File uploaded successfully
        const imageUrl = `/assets/images/${req.file.filename}`;
        res.status(200).json({
            message: 'Image uploaded successfully',
            imagePath: imageUrl
        });
    });
};
