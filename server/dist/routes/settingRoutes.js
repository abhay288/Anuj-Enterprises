import { Router } from 'express';
import { getSettings, updateSetting, updateRetentionSettings, runAutoCleanup } from '../controllers/settingController.js';
import { authenticateJWT, requireAuth, requireRoles } from '../middleware/authMiddleware.js';
const router = Router();
router.get('/', authenticateJWT, getSettings);
router.patch('/:key', authenticateJWT, requireAuth, requireRoles('ADMIN'), updateSetting);
router.put('/retention', authenticateJWT, requireAuth, requireRoles('ADMIN'), updateRetentionSettings);
router.post('/cleanup', authenticateJWT, requireAuth, requireRoles('ADMIN'), runAutoCleanup);
export default router;
