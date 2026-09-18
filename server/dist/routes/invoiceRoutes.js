import { Router } from 'express';
import { getInvoices, getInvoiceById, getInvoicePdf } from '../controllers/invoiceController.js';
import { authenticateJWT, requireAuth } from '../middleware/authMiddleware.js';
const router = Router();
// Secure Invoice Endpoints with Authentication & Authorization
router.get('/', authenticateJWT, requireAuth, getInvoices);
router.get('/:id', authenticateJWT, requireAuth, getInvoiceById);
router.get('/:id/pdf', authenticateJWT, requireAuth, getInvoicePdf);
export default router;
