import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const JWT_EXPIRY = process.env.JWT_EXPIRY || '10m';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET;

export const findAccountByNumber = async (accountNumber) => {
  const result = await pool.query('SELECT * FROM accounts WHERE account_number = $1', [accountNumber]);
  return result.rows[0];
};

export const checkLockedAccount = (account) => {
  if (!account.locked_until) return false;
  return new Date(account.locked_until) > new Date();
};

export const createJwt = (accountId) => {
  return jwt.sign({ accountId }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRY });
};

export const createRefreshJwt = (accountId) => {
  return jwt.sign({ accountId }, REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_SECRET);
};

export const recordLoginAttempt = async (accountId, success, ipAddress) => {
  await pool.query(
    'INSERT INTO login_audit (account_id, success, ip_address) VALUES ($1, $2, $3)',
    [accountId, success, ipAddress]
  );
};

export const incrementFailedLogin = async (accountId) => {
  await pool.query(
    'UPDATE accounts SET failed_login_attempts = failed_login_attempts + 1 WHERE id = $1',
    [accountId]
  );
};

export const resetFailedAttempts = async (accountId) => {
  await pool.query('UPDATE accounts SET failed_login_attempts = 0, locked_until = NULL WHERE id = $1', [accountId]);
};

export const lockAccount = async (accountId) => {
  const lockUntil = new Date(Date.now() + 15 * 60 * 1000);
  await pool.query('UPDATE accounts SET locked_until = $1 WHERE id = $2', [lockUntil, accountId]);
};

export const verifyPin = async (plainPin, pinHash) => {
  return bcrypt.compare(plainPin, pinHash);
};
