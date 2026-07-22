import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import {
  findAccountByNumber,
  checkLockedAccount,
  createJwt,
  createRefreshJwt,
  verifyRefreshToken,
  recordLoginAttempt,
  incrementFailedLogin,
  resetFailedAttempts,
  lockAccount,
  verifyPin,
} from '../services/authService.js';

export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg, code: 'INVALID_INPUT' });
    }
    const { accountNumber, pin } = req.body;
    const account = await findAccountByNumber(accountNumber);
    if (!account) {
      return res.status(401).json({ success: false, message: 'Invalid account number or PIN', code: 'INVALID_CREDENTIALS' });
    }
    if (checkLockedAccount(account)) {
      return res.status(403).json({ success: false, message: 'Account is locked. Try again later.', code: 'ACCOUNT_LOCKED' });
    }
    const pinMatches = await verifyPin(pin, account.pin_hash);
    if (!pinMatches) {
      await incrementFailedLogin(account.id);
      await recordLoginAttempt(account.id, false, req.ip);
      const updatedAccount = await findAccountByNumber(accountNumber);
      if (updatedAccount.failed_login_attempts >= 3) {
        await lockAccount(account.id);
      }
      return res.status(401).json({ success: false, message: 'Invalid account number or PIN', code: 'INVALID_CREDENTIALS' });
    }
    await resetFailedAttempts(account.id);
    await recordLoginAttempt(account.id, true, req.ip);
    const token = createJwt(account.id);
    const refreshToken = createRefreshJwt(account.id);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ success: true, token, accountNumber: account.account_number, fullName: account.full_name });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.status(401).json({ success: false, message: 'Refresh token missing', code: 'UNAUTHORIZED' });
    const payload = verifyRefreshToken(refreshToken);
    const token = createJwt(payload.accountId);
    res.json({ success: true, token });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token', code: 'UNAUTHORIZED' });
  }
};

export const logout = (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out' });
};
