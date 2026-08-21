import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';

const getCloudinaryConfig = () => {
  const cloudinaryUrl = process.env.CLOUDINARY_URL?.trim();

  if (cloudinaryUrl && cloudinaryUrl.startsWith('cloudinary://')) {
    const match = cloudinaryUrl.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
    if (match) {
      const [, apiKey, apiSecret, cloudName] = match;
      return { cloudName, apiKey, apiSecret };
    }
  }

  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || process.env.IMAGE_STORAGE_KEY || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || process.env.IMAGE_STORAGE_SECRET || ''
  };
};

export const uploadCloudinaryImage = async (req: Request, res: Response) => {
  try {
    const { image, folder = 'anuj_enterprises/products' } = req.body;

    if (!image) {
      return res.status(400).json({ success: false, message: 'No image data provided for upload' });
    }

    const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();

    // Check if valid credentials exist
    const hasValidCredentials = (cloudName && apiKey && apiSecret) || process.env.CLOUDINARY_URL;

    if (!hasValidCredentials) {
      return res.json({
        success: true,
        url: image,
        public_id: `temp_${Date.now()}`,
        message: 'No Cloudinary credentials found in .env, image saved via DataURL'
      });
    }

    // Configure Cloudinary instance dynamically
    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true
      });
    }

    // Upload to Cloudinary CDN
    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder,
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
  } catch (error: any) {
    console.error('Cloudinary Server Upload Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload image to Cloudinary CDN'
    });
  }
};
