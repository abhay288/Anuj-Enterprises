import { v2 as cloudinary } from 'cloudinary';
import { validateImagePayload } from '../utils/securityUtils.js';
const ALLOWED_FOLDERS = [
    'anuj_enterprises/products',
    'anuj_enterprises/avatars',
    'anuj_enterprises/categories'
];
const getCloudinaryConfig = () => {
    const cloudinaryUrl = process.env.CLOUDINARY_URL?.trim();
    if (cloudinaryUrl && cloudinaryUrl.startsWith('cloudinary://')) {
        const match = cloudinaryUrl.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
        if (match) {
            const [, apiKey, apiSecret, cloudName] = match;
            return { cloudName, apiKey, apiSecret, configured: true };
        }
    }
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.IMAGE_STORAGE_KEY || 'uazkw46b';
    const apiKey = process.env.CLOUDINARY_API_KEY || '147477273384131';
    const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.IMAGE_STORAGE_SECRET || 'UOPZgxNL4VkPW3kMaJPptIiJ1hQ';
    const configured = Boolean(cloudName && apiKey && apiSecret);
    return { cloudName, apiKey, apiSecret, configured };
};
export const uploadCloudinaryImage = async (req, res) => {
    try {
        const { image, folder } = req.body || {};
        if (!image) {
            return res.status(400).json({
                success: false,
                message: 'No image data provided for upload',
                code: 'MISSING_IMAGE_PAYLOAD'
            });
        }
        // Validate Image Payload format, MIME type, and size limit (6MB limit)
        const validation = validateImagePayload(image, 6 * 1024 * 1024); // 6MB limit
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: validation.error || 'Invalid image payload',
                code: 'INVALID_IMAGE'
            });
        }
        // Whitelist Destination Folder
        const targetFolder = ALLOWED_FOLDERS.includes(folder)
            ? folder
            : 'anuj_enterprises/products';
        const { cloudName, apiKey, apiSecret, configured } = getCloudinaryConfig();
        if (!configured) {
            // In development, return data URL if unconfigured, or fail safely
            if (process.env.NODE_ENV === 'production') {
                return res.status(503).json({
                    success: false,
                    message: 'Cloudinary CDN storage is not configured on the production server.',
                    code: 'CLOUDINARY_NOT_CONFIGURED'
                });
            }
            return res.json({
                success: true,
                url: image,
                public_id: `dev_${Date.now()}`,
                message: 'Development fallback: DataURL retained (Cloudinary unconfigured)'
            });
        }
        // Configure Cloudinary
        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
            secure: true
        });
        // Upload to Cloudinary CDN
        const uploadResponse = await cloudinary.uploader.upload(image, {
            folder: targetFolder,
            resource_type: 'image',
            transformation: [
                { quality: 'auto:good' },
                { fetch_format: 'auto' }
            ]
        });
        return res.json({
            success: true,
            url: uploadResponse.secure_url,
            public_id: uploadResponse.public_id,
            format: uploadResponse.format,
            bytes: uploadResponse.bytes,
            width: uploadResponse.width,
            height: uploadResponse.height
        });
    }
    catch (error) {
        console.error('Cloudinary Server Upload Error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload image to Cloudinary CDN',
            code: 'UPLOAD_ERROR'
        });
    }
};
