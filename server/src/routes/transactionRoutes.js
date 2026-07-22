import express from 'express';
import { body, query } from 'express-validator';
import auth from '../middleware/auth.js';
import {
  depositController,
  withdrawController,
  transferController,
  miniStatementController,
  historyController,
  inquiryController,
} from '../controllers/transactionController.js';

const router = express.Router();

router.post(
  '/deposit',
  auth,
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than zero'),
  depositController
);

router.post(
  '/withdraw',
  auth,
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than zero'),
  withdrawController
);

router.post(
  '/transfer',
  auth,
  body('toAccountNumber').isLength({ min: 10, max: 12 }).withMessage('Destination account number is required'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than zero'),
  transferController
);

router.get('/mini-statement', auth, miniStatementController);
router.get(
  '/history',
  auth,
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  historyController
);
router.post('/inquiry', auth, inquiryController);

export default router;
