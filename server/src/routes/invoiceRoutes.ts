import { Router } from 'express';
import { getInvoices, getInvoiceById, getInvoicePdf, toggleInvoiceRead, deleteInvoice, sendInvoiceEmail } from '../controllers/invoiceController.js';
import { authenticateJWT, requireAuth, requireRoles } from '../middleware/authMiddleware.js';

const router = Router();

// Secure Invoice Endpoints with Authentication & Authorization
router.get('/', authenticateJWT, requireAuth, getInvoices);
router.get('/:id', authenticateJWT, requireAuth, getInvoiceById);
router.get('/:id/pdf', authenticateJWT, requireAuth, getInvoicePdf);
router.post('/:id/email', authenticateJWT, requireAuth, sendInvoiceEmail);
router.patch('/:id/read', authenticateJWT, requireAuth, requireRoles('ADMIN'), toggleInvoiceRead);
router.delete('/:id', authenticateJWT, requireAuth, requireRoles('ADMIN'), deleteInvoice);

export default router;

