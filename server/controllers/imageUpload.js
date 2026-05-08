const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { randomUUID } = require('crypto');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.SUPABASE_PROJECT_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SUPABASE_STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'product-images';

const hasSupabaseStorage = () => Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

const getSupabaseHeaders = () => ({
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    apikey: SUPABASE_SERVICE_ROLE_KEY
});

const ensureBucketExists = async () => {
    const response = await fetch(`${SUPABASE_URL}/storage/v1/bucket/${SUPABASE_STORAGE_BUCKET}`, {
        headers: getSupabaseHeaders()
    });

    if (response.ok) {
        return;
    }

    if (response.status !== 404) {
        throw new Error(`Failed to verify storage bucket: ${response.status}`);
    }

    const createResponse = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
        method: 'POST',
        headers: {
            ...getSupabaseHeaders(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: SUPABASE_STORAGE_BUCKET,
            name: SUPABASE_STORAGE_BUCKET,
            public: true
        })
    });

    if (!createResponse.ok && createResponse.status !== 409) {
        throw new Error(`Failed to create storage bucket: ${createResponse.status}`);
    }
};

const uploadToSupabaseStorage = async (filePath, originalName, mimeType) => {
    await ensureBucketExists();

    const ext = path.extname(originalName || '') || '.jpg';
    const objectName = `items/${Date.now()}-${randomUUID()}${ext}`;
    const encodedObjectName = objectName.split('/').map(encodeURIComponent).join('/');
    const fileBuffer = await fs.promises.readFile(filePath);

    const uploadResponse = await fetch(
        `${SUPABASE_URL}/storage/v1/object/${SUPABASE_STORAGE_BUCKET}/${encodedObjectName}`,
        {
            method: 'POST',
            headers: {
                ...getSupabaseHeaders(),
                'Content-Type': mimeType || 'application/octet-stream',
                'x-upsert': 'true'
            },
            body: fileBuffer
        }
    );

    if (!uploadResponse.ok) {
        throw new Error(`Supabase upload failed: ${uploadResponse.status}`);
    }

    return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_STORAGE_BUCKET}/${encodedObjectName}`;
};

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

        const localImagePath = `/assets/images/${req.file.filename}`;

        if (!hasSupabaseStorage()) {
            return res.status(200).json({
                message: 'Image uploaded successfully',
                imagePath: localImagePath
            });
        }

        uploadToSupabaseStorage(req.file.path, req.file.originalname, req.file.mimetype)
            .then(async (publicUrl) => {
                await fs.promises.unlink(req.file.path).catch(() => {});

                res.status(200).json({
                    message: 'Image uploaded successfully',
                    imagePath: publicUrl,
                    storage: 'supabase'
                });
            })
            .catch(async (storageError) => {
                console.error('Supabase storage upload failed, using local file instead:', storageError);

                res.status(200).json({
                    message: 'Image uploaded successfully',
                    imagePath: localImagePath,
                    storage: 'local-fallback'
                });
            });
    });
};
