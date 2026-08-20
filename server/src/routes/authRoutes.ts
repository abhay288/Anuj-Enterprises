import { Router } from 'express';
import { login, logout, getMe, refreshToken, changePassword } from '../controllers/authController.js';
import { authenticateJWT, requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authenticateJWT, getMe);
router.post('/refresh', refreshToken);
router.post('/change-password', authenticateJWT, requireAuth, changePassword);

export default router;
