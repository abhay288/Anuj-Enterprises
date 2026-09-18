import { Router } from 'express';
import { getTickets, createTicket, updateTicket, deleteTicket } from '../controllers/ticketController.js';
import { authenticateJWT, requireAuth, requireRoles } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticateJWT, requireAuth, requireRoles('ADMIN'), getTickets);
router.post('/', createTicket);  // Anyone can submit a support ticket
router.patch('/:id', authenticateJWT, requireAuth, requireRoles('ADMIN'), updateTicket);
router.delete('/:id', authenticateJWT, requireAuth, requireRoles('ADMIN'), deleteTicket);

export default router;
