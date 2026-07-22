import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Missing token', code: 'UNAUTHORIZED' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query('SELECT id, account_number, full_name, locked_until, pin_hash FROM accounts WHERE id = $1', [payload.accountId]);
    const account = result.rows[0];
    if (!account) return res.status(401).json({ success: false, message: 'Invalid credentials', code: 'UNAUTHORIZED' });
    req.account = account;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token', code: 'UNAUTHORIZED' });
  }
};

export default auth;
