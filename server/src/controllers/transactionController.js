import { validationResult } from 'express-validator';
import {
  deposit,
  withdraw,
  transfer,
  getMiniStatement,
  getTransactionHistory,
  inquiry,
} from '../services/transactionService.js';

export const depositController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg, code: 'INVALID_INPUT' });
    }
    const { amount } = req.body;
    const txn = await deposit(req.account.id, Number(amount));
    res.json({ success: true, transaction: txn });
  } catch (error) {
    next(error);
  }
};

export const withdrawController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg, code: 'INVALID_INPUT' });
    }
    const { amount } = req.body;
    const txn = await withdraw(req.account.id, Number(amount));
    res.json({ success: true, transaction: txn });
  } catch (error) {
    next(error);
  }
};

export const transferController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg, code: 'INVALID_INPUT' });
    }
    const { toAccountNumber, amount } = req.body;
    const result = await transfer(req.account.id, toAccountNumber, Number(amount));
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const miniStatementController = async (req, res, next) => {
  try {
    const transactions = await getMiniStatement(req.account.id);
    res.json({ success: true, transactions });
  } catch (error) {
    next(error);
  }
};

export const historyController = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, from, to } = req.query;
    const history = await getTransactionHistory(req.account.id, Number(page), Number(limit), from, to);
    res.json({ success: true, ...history });
  } catch (error) {
    next(error);
  }
};

export const inquiryController = async (req, res, next) => {
  try {
    const balance = await inquiry(req.account.id);
    res.json({ success: true, balance });
  } catch (error) {
    next(error);
  }
};
