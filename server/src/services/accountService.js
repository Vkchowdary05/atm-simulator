import pool from '../config/db.js';
import bcrypt from 'bcrypt';

export const getBalance = async (accountId) => {
  const result = await pool.query('SELECT balance FROM accounts WHERE id = $1', [accountId]);
  return result.rows[0]?.balance;
};

export const changePin = async (accountId, currentPin, newPin, currentHash) => {
  const isMatch = await bcrypt.compare(currentPin, currentHash);
  if (!isMatch) {
    const error = new Error('Current PIN is incorrect');
    error.status = 400;
    error.code = 'INVALID_PIN';
    throw error;
  }
  const newHash = await bcrypt.hash(newPin, 10);
  await pool.query('UPDATE accounts SET pin_hash = $1 WHERE id = $2', [newHash, accountId]);
};
