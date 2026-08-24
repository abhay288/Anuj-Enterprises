import { Router } from 'express';
import { uploadCloudinaryImage } from '../controllers/uploadController.js';
import { authenticateJWT, requireAuth, requireRoles } from '../middleware/authMiddleware.js';

const router = Router();

// Cloudinary Image Upload Endpoint (Restricted to Authorized Admin)
router.post('/cloudinary', authenticateJWT, requireAuth, requireRoles('ADMIN'), uploadCloudinaryImage);
router.post('/image', authenticateJWT, requireAuth, requireRoles('ADMIN'), uploadCloudinaryImage);

export default router;
