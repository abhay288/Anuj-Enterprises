import { Router } from 'express';
import { createOrder, getOrders, updateOrderStatus, toggleOrderRead, deleteOrder, toggleOrderUrgent } from '../controllers/orderController.js';
import { authenticateJWT, requireAuth, requireRoles } from '../middleware/authMiddleware.js';

const router = Router();

// Order Endpoints
router.post('/', authenticateJWT, createOrder);
router.get('/', authenticateJWT, requireAuth, getOrders);
router.get('/salesman/:salesmanId', authenticateJWT, requireAuth, getOrders);
router.patch('/:id/status', authenticateJWT, requireAuth, requireRoles('ADMIN'), updateOrderStatus);
router.patch('/:id/urgent', authenticateJWT, requireAuth, toggleOrderUrgent);
router.patch('/:id/read', authenticateJWT, requireAuth, requireRoles('ADMIN'), toggleOrderRead);
router.delete('/:id', authenticateJWT, requireAuth, requireRoles('ADMIN'), deleteOrder);


export default router;

