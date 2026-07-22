import pool from '../config/db.js';

const generateReference = () => `ATM${Date.now()}${Math.floor(Math.random() * 1000)}`;

export const getMiniStatement = async (accountId) => {
  const result = await pool.query(
    `SELECT type, amount, balance_after, related_account_id, reference_id, created_at
     FROM transactions WHERE account_id = $1 ORDER BY created_at DESC LIMIT 10`,
    [accountId]
  );
  return result.rows;
};

export const getTransactionHistory = async (accountId, page = 1, limit = 10, from, to) => {
  const offset = (page - 1) * limit;
  const filters = ['account_id = $1'];
  const values = [accountId];
  let idx = 2;
  if (from) {
    filters.push(`created_at >= $${idx++}`);
    values.push(from);
  }
  if (to) {
    filters.push(`created_at <= $${idx++}`);
    values.push(to);
  }
  const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const [dataResult, countResult] = await Promise.all([
    pool.query(
      `SELECT type, amount, balance_after, related_account_id, reference_id, created_at
       FROM transactions ${whereClause} ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`,
      [...values, limit, offset]
    ),
    pool.query(`SELECT COUNT(*) FROM transactions ${whereClause}`, values),
  ]);
  return {
    total: Number(countResult.rows[0].count),
    page,
    limit,
    history: dataResult.rows,
  };
};

export const createTransaction = async ({ accountId, type, amount, balanceAfter, relatedAccountId = null }) => {
  const referenceId = generateReference();
  const result = await pool.query(
    `INSERT INTO transactions (account_id, type, amount, balance_after, related_account_id, reference_id)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [accountId, type, amount, balanceAfter, relatedAccountId, referenceId]
  );
  return result.rows[0];
};

export const deposit = async (accountId, amount) => {
  if (amount <= 0) {
    const error = new Error('Deposit amount must be positive');
    error.status = 400;
    error.code = 'INVALID_AMOUNT';
    throw error;
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const accountResult = await client.query('SELECT balance FROM accounts WHERE id = $1 FOR UPDATE', [accountId]);
    if (!accountResult.rowCount) throw new Error('Account not found');
    const newBalance = Number(accountResult.rows[0].balance) + Number(amount);
    await client.query('UPDATE accounts SET balance = $1 WHERE id = $2', [newBalance, accountId]);
    const txn = await client.query(
      `INSERT INTO transactions (account_id, type, amount, balance_after, reference_id) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [accountId, 'DEPOSIT', amount, newBalance, generateReference()]
    );
    await client.query('COMMIT');
    return txn.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const withdraw = async (accountId, amount) => {
  if (amount <= 0 || amount % 100 !== 0) {
    const error = new Error('Withdrawal amount must be a positive multiple of 100');
    error.status = 400;
    error.code = 'INVALID_AMOUNT';
    throw error;
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const accountResult = await client.query(
      'SELECT balance, daily_withdrawal_limit FROM accounts WHERE id = $1 FOR UPDATE',
      [accountId]
    );
    if (!accountResult.rowCount) throw new Error('Account not found');
    const { balance, daily_withdrawal_limit } = accountResult.rows[0];
    const todayTotalResult = await client.query(
      `SELECT COALESCE(SUM(amount), 0) AS total FROM transactions
       WHERE account_id = $1 AND type = 'WITHDRAWAL' AND created_at >= CURRENT_DATE`,
      [accountId]
    );
    const todayTotal = Number(todayTotalResult.rows[0].total);
    if (amount > Number(balance)) {
      const error = new Error('Insufficient funds');
      error.status = 400;
      error.code = 'INSUFFICIENT_FUNDS';
      throw error;
    }
    if (todayTotal + Number(amount) > Number(daily_withdrawal_limit)) {
      const error = new Error('Daily withdrawal limit exceeded');
      error.status = 400;
      error.code = 'DAILY_LIMIT_EXCEEDED';
      throw error;
    }
    const newBalance = Number(balance) - Number(amount);
    await client.query('UPDATE accounts SET balance = $1 WHERE id = $2', [newBalance, accountId]);
    const txn = await client.query(
      `INSERT INTO transactions (account_id, type, amount, balance_after, reference_id) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [accountId, 'WITHDRAWAL', amount, newBalance, generateReference()]
    );
    await client.query('COMMIT');
    return txn.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const transfer = async (fromAccountId, toAccountNumber, amount) => {
  if (amount <= 0) {
    const error = new Error('Transfer amount must be positive');
    error.status = 400;
    error.code = 'INVALID_AMOUNT';
    throw error;
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const fromAccount = await client.query('SELECT balance FROM accounts WHERE id = $1 FOR UPDATE', [fromAccountId]);
    if (!fromAccount.rowCount) throw new Error('Sender account not found');
    const toAccount = await client.query('SELECT id, balance FROM accounts WHERE account_number = $1 FOR UPDATE', [toAccountNumber]);
    if (!toAccount.rowCount) {
      const error = new Error('Destination account not found');
      error.status = 400;
      error.code = 'INVALID_DESTINATION';
      throw error;
    }
    const senderBalance = Number(fromAccount.rows[0].balance);
    if (amount > senderBalance) {
      const error = new Error('Insufficient funds');
      error.status = 400;
      error.code = 'INSUFFICIENT_FUNDS';
      throw error;
    }
    const receiverBalance = Number(toAccount.rows[0].balance) + Number(amount);
    const senderNewBalance = senderBalance - Number(amount);
    await client.query('UPDATE accounts SET balance = $1 WHERE id = $2', [senderNewBalance, fromAccountId]);
    await client.query('UPDATE accounts SET balance = $1 WHERE id = $2', [receiverBalance, toAccount.rows[0].id]);
    const reference = generateReference();
    await client.query(
      `INSERT INTO transactions (account_id, type, amount, balance_after, related_account_id, reference_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [fromAccountId, 'TRANSFER_OUT', amount, senderNewBalance, toAccount.rows[0].id, reference]
    );
    await client.query(
      `INSERT INTO transactions (account_id, type, amount, balance_after, related_account_id, reference_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [toAccount.rows[0].id, 'TRANSFER_IN', amount, receiverBalance, fromAccountId, reference]
    );
    await client.query('COMMIT');
    return { referenceId: reference, fromBalance: senderNewBalance, toBalance: receiverBalance };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const inquiry = async (accountId) => {
  const result = await pool.query('SELECT balance FROM accounts WHERE id = $1', [accountId]);
  const balance = result.rows[0]?.balance ?? 0;
  await createTransaction({ accountId, type: 'INQUIRY', amount: 0, balanceAfter: balance });
  return balance;
};
