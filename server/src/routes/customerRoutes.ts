import { Router } from 'express';
import { getCustomers, getCustomerById, getCustomerOrderHistory, createCustomer } from '../controllers/customerController.js';
import { authenticateJWT, requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticateJWT, getCustomers);
router.get('/:id', authenticateJWT, getCustomerById);
router.get('/:id/history', authenticateJWT, requireAuth, getCustomerOrderHistory);
router.post('/', authenticateJWT, requireAuth, createCustomer);

export default router;
