import { Router } from 'express';
import { getCompanies, createCompany, deleteCompany } from '../controllers/companyController.js';
import { authenticateJWT, requireAuth, requireRoles } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', getCompanies);
router.post('/', authenticateJWT, requireAuth, requireRoles('ADMIN'), createCompany);
router.delete('/:id', authenticateJWT, requireAuth, requireRoles('ADMIN'), deleteCompany);

export default router;
