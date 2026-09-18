import express from 'express';
import {
  adminLogin,
  adminGetProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminGetOrders,
  adminUpdateOrderStatus,
  adminGetStats,
} from '../controllers/adminController.js';
import { requireAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

// Public: admin login
router.post('/login', adminLogin);

// Protected: everything below requires a valid admin token
router.get('/stats', requireAdmin, adminGetStats);

router.get('/products', requireAdmin, adminGetProducts);
router.post('/products', requireAdmin, adminCreateProduct);
router.put('/products/:id', requireAdmin, adminUpdateProduct);
router.delete('/products/:id', requireAdmin, adminDeleteProduct);

router.get('/orders', requireAdmin, adminGetOrders);
router.patch('/orders/:id/status', requireAdmin, adminUpdateOrderStatus);

export default router;
