import { Router } from 'express';
import { createOrder, getOrders, updateOrderStatus } from '../controllers/orderController.js';
import { authenticateJWT, requireAuth, requireRoles } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', authenticateJWT, createOrder);
router.get('/', authenticateJWT, getOrders);
router.get('/salesman/:salesmanId', authenticateJWT, getOrders);
router.patch('/:id/status', authenticateJWT, requireAuth, requireRoles('ADMIN'), updateOrderStatus);

export default router;
