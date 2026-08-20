import { Router } from 'express';
import { getCategories, createCategory, deleteCategory } from '../controllers/categoryController.js';
import { authenticateJWT, requireAuth, requireRoles } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', getCategories);
router.post('/', authenticateJWT, requireAuth, requireRoles('ADMIN'), createCategory);
router.delete('/:id', authenticateJWT, requireAuth, requireRoles('ADMIN'), deleteCategory);

export default router;
