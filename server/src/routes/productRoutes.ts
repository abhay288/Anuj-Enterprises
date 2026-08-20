import { Router } from 'express';
import { 
  getProducts, getProductById, createProduct, updateProduct, deleteProduct, 
  toggleStatus, toggleFeatured, toggleNew, validateBulkCsv, importBulkCsv 
} from '../controllers/productController.js';
import { authenticateJWT, requireAuth, requireRoles } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticateJWT, getProducts);
router.get('/:id', authenticateJWT, getProductById);

// Admin Only Routes
router.post('/', authenticateJWT, requireAuth, requireRoles('ADMIN'), createProduct);
router.patch('/:id', authenticateJWT, requireAuth, requireRoles('ADMIN'), updateProduct);
router.delete('/:id', authenticateJWT, requireAuth, requireRoles('ADMIN'), deleteProduct);

router.patch('/:id/status', authenticateJWT, requireAuth, requireRoles('ADMIN'), toggleStatus);
router.patch('/:id/featured', authenticateJWT, requireAuth, requireRoles('ADMIN'), toggleFeatured);
router.patch('/:id/new', authenticateJWT, requireAuth, requireRoles('ADMIN'), toggleNew);

// Bulk CSV Upload APIs
router.post('/bulk/validate', authenticateJWT, requireAuth, requireRoles('ADMIN'), validateBulkCsv);
router.post('/bulk/import', authenticateJWT, requireAuth, requireRoles('ADMIN'), importBulkCsv);

export default router;
