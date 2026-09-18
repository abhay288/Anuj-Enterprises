import { Router } from 'express';
import { getCustomers, getCustomerById, getCustomerOrderHistory, createCustomer } from '../controllers/customerController.js';
import { authenticateJWT, requireAuth, requireRoles } from '../middleware/authMiddleware.js';
const router = Router();
// Customer Endpoints (Secured for Admin & Salesman roles)
router.get('/', authenticateJWT, requireAuth, requireRoles('ADMIN', 'SALESMAN'), getCustomers);
router.get('/:id', authenticateJWT, requireAuth, requireRoles('ADMIN', 'SALESMAN'), getCustomerById);
router.get('/:id/history', authenticateJWT, requireAuth, requireRoles('ADMIN', 'SALESMAN'), getCustomerOrderHistory);
router.post('/', authenticateJWT, requireAuth, requireRoles('ADMIN', 'SALESMAN'), createCustomer);
export default router;
