import { Router } from 'express';
import { 
  getSalesmen, getSalesmanById, createSalesman, updateSalesman, 
  toggleSalesmanStatus, resetPassword, deleteSalesman 
} from '../controllers/salesmanController.js';
import { authenticateJWT, requireAuth, requireRoles } from '../middleware/authMiddleware.js';

const router = Router();

// Salesman Profile & Roster Routes (Secured)
router.get('/', authenticateJWT, requireAuth, requireRoles('ADMIN', 'SALESMAN'), getSalesmen);
router.get('/:id', authenticateJWT, requireAuth, requireRoles('ADMIN', 'SALESMAN'), getSalesmanById);

// Admin Roster Management Controls
router.post('/', authenticateJWT, requireAuth, requireRoles('ADMIN'), createSalesman);
router.patch('/:id', authenticateJWT, requireAuth, requireRoles('ADMIN'), updateSalesman);
router.patch('/:id/status', authenticateJWT, requireAuth, requireRoles('ADMIN'), toggleSalesmanStatus);
router.delete('/:id', authenticateJWT, requireAuth, requireRoles('ADMIN'), deleteSalesman);
router.post('/:id/reset-password', authenticateJWT, requireAuth, requireRoles('ADMIN'), resetPassword);

export default router;
