import { Router } from 'express';
import { getInvoices, getInvoiceById, getInvoicePdf } from '../controllers/invoiceController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticateJWT, getInvoices);
router.get('/:id', authenticateJWT, getInvoiceById);
router.get('/:id/pdf', authenticateJWT, getInvoicePdf);

export default router;
