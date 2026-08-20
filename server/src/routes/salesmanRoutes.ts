import { Router } from 'express';
import { 
  getSalesmen, getSalesmanById, createSalesman, updateSalesman, 
  toggleSalesmanStatus, resetPassword 
} from '../controllers/salesmanController.js';
import { authenticateJWT, requireAuth, requireRoles } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticateJWT, getSalesmen);
router.get('/:id', authenticateJWT, getSalesmanById);

// Admin Roster Controls
router.post('/', authenticateJWT, requireAuth, requireRoles('ADMIN'), createSalesman);
router.patch('/:id', authenticateJWT, requireAuth, requireRoles('ADMIN'), updateSalesman);
router.patch('/:id/status', authenticateJWT, requireAuth, requireRoles('ADMIN'), toggleSalesmanStatus);
router.post('/:id/reset-password', authenticateJWT, requireAuth, requireRoles('ADMIN'), resetPassword);

export default router;
