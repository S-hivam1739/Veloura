import express from 'express';
import { register, verifyOtp, resendOtp, login, getProfile } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/login', login);
router.get('/me', getProfile);

export default router;
