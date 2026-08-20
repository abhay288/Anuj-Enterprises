import { Router } from 'express';
import { getDashboardAnalytics, getInventoryAnalytics } from '../controllers/analyticsController.js';
import { authenticateJWT, requireAuth, requireRoles } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/dashboard', authenticateJWT, requireAuth, requireRoles('ADMIN'), getDashboardAnalytics);
router.get('/inventory', authenticateJWT, requireAuth, requireRoles('ADMIN'), getInventoryAnalytics);

export default router;
