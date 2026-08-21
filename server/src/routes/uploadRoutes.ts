import { Router } from 'express';
import { uploadCloudinaryImage } from '../controllers/uploadController.js';

const router = Router();

// Cloudinary Image Upload Endpoint
router.post('/cloudinary', uploadCloudinaryImage);
router.post('/image', uploadCloudinaryImage);

export default router;
