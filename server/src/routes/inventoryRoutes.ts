import { Router } from 'express';
import { 
  getStockDashboard, 
  restockProduct, 
  adjustStock, 
  updateStockThreshold, 
  bulkUpdateStock, 
  getInventoryLogs 
} from '../controllers/inventoryController.js';
import { authenticateJWT, requireAuth, requireRoles } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/dashboard', authenticateJWT, requireAuth, requireRoles('ADMIN'), getStockDashboard);
router.get('/logs', authenticateJWT, requireAuth, requireRoles('ADMIN'), getInventoryLogs);
router.post('/restock/:id', authenticateJWT, requireAuth, requireRoles('ADMIN'), restockProduct);
router.post('/adjust/:id', authenticateJWT, requireAuth, requireRoles('ADMIN'), adjustStock);
router.patch('/threshold/:id', authenticateJWT, requireAuth, requireRoles('ADMIN'), updateStockThreshold);
router.post('/bulk-update', authenticateJWT, requireAuth, requireRoles('ADMIN'), bulkUpdateStock);

export default router;
