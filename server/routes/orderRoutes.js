import express from 'express';
import {
  createRazorpayOrder,
  verifyAndSavePaymentOrder,
  createCodOrder,
  getMyOrders,
  getOrderById,
} from '../controllers/orderController.js';

const router = express.Router();

router.post('/razorpay', createRazorpayOrder);
router.post('/verify', verifyAndSavePaymentOrder);
router.post('/cod', createCodOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);

export default router;
