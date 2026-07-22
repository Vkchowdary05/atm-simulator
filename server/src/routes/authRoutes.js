import express from 'express';
import { body } from 'express-validator';
import { login, logout, refreshToken } from '../controllers/authController.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post(
  '/login',
  authRateLimiter,
  body('accountNumber').isLength({ min: 10, max: 12 }).withMessage('Account number is required'),
  body('pin').isLength({ min: 4, max: 4 }).withMessage('PIN must be 4 digits'),
  login
);

router.post('/logout', logout);
router.post('/refresh', refreshToken);

export default router;
