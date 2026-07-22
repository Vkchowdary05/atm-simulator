import { validationResult } from 'express-validator';
import { getBalance, changePin } from '../services/accountService.js';

export const getBalanceController = async (req, res, next) => {
  try {
    const balance = await getBalance(req.account.id);
    res.json({ success: true, balance });
  } catch (error) {
    next(error);
  }
};

export const changePinController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg, code: 'INVALID_INPUT' });
    }
    const { currentPin, newPin } = req.body;
    await changePin(req.account.id, currentPin, newPin, req.account.pin_hash);
    res.json({ success: true, message: 'PIN changed successfully' });
  } catch (error) {
    next(error);
  }
};
