import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import pool from './src/config/db.js';
import fs from 'fs';

dotenv.config();

const accounts = [
  { accountNumber: '100000000001', fullName: 'Sonia Patel', pin: '1234', balance: 50000 },
  { accountNumber: '100000000002', fullName: 'Ravi Kumar', pin: '4321', balance: 15000 },
  { accountNumber: '100000000003', fullName: 'Aditi Sharma', pin: '0000', balance: 8000 },
];

const seed = async () => {
  try {
    await pool.query(fs.readFileSync(new URL('./schema.sql', import.meta.url), 'utf-8'));
    for (const acct of accounts) {
      const hash = await bcrypt.hash(acct.pin, 10);
      const result = await pool.query(
        'INSERT INTO accounts (account_number, full_name, pin_hash, balance) VALUES ($1, $2, $3, $4) ON CONFLICT (account_number) DO UPDATE SET full_name = EXCLUDED.full_name, pin_hash = EXCLUDED.pin_hash, balance = EXCLUDED.balance RETURNING id',
        [acct.accountNumber, acct.fullName, hash, acct.balance]
      );
      const accountId = result.rows[0].id;
      await pool.query(
        `INSERT INTO transactions (account_id, type, amount, balance_after, reference_id)
         VALUES ($1, 'DEPOSIT', $2, $2, $3)`,
        [accountId, acct.balance, `SEED${acct.accountNumber}`]
      );
    }
    console.log('Seed completed');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seed();
