import { Router } from 'express';
import { getCustomers, getCustomerById, getCustomerOrderHistory, createCustomer, updateCustomer, deleteCustomer } from '../controllers/customerController.js';
import { authenticateJWT, requireAuth, requireRoles } from '../middleware/authMiddleware.js';
const router = Router();
// Customer Endpoints (Secured for Admin, Salesman, and Customers)
router.get('/', authenticateJWT, requireAuth, requireRoles('ADMIN', 'SALESMAN', 'CUSTOMER', 'USER'), getCustomers);
router.get('/:id', authenticateJWT, requireAuth, requireRoles('ADMIN', 'SALESMAN', 'CUSTOMER', 'USER'), getCustomerById);
router.get('/:id/history', authenticateJWT, requireAuth, requireRoles('ADMIN', 'SALESMAN', 'CUSTOMER', 'USER'), getCustomerOrderHistory);
router.post('/', authenticateJWT, requireAuth, requireRoles('ADMIN', 'SALESMAN'), createCustomer);
router.patch('/:id', authenticateJWT, requireAuth, updateCustomer);
router.delete('/:id', authenticateJWT, requireAuth, requireRoles('ADMIN'), deleteCustomer);
export default router;
