import express from 'express';
import { body } from 'express-validator';
import auth from '../middleware/auth.js';
import { getBalanceController, changePinController } from '../controllers/accountController.js';

const router = express.Router();

router.get('/balance', auth, getBalanceController);
router.post(
  '/pin/change',
  auth,
  body('currentPin').isLength({ min: 4, max: 4 }).withMessage('Current PIN must be 4 digits'),
  body('newPin').isLength({ min: 4, max: 4 }).withMessage('New PIN must be 4 digits'),
  changePinController
);

export default router;
