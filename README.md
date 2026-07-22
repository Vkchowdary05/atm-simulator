# ATM Simulator

A full-stack ATM simulator with realistic kiosk flow, secure PIN authentication, account lockout, cash withdrawals, deposits, transfers, mini statements, and session timeout.

## Features

- Account login via account number + 4-digit PIN
- bcrypt PIN hashing and JWT authentication
- Account lockout after 3 failed login attempts
- Session timeout warning and automatic logout
- Balance inquiry, cash withdraw, deposit, fund transfer with atomic DB transactions
- Mini-statement + paginated history filtering
- Express backend with PostgreSQL and parameterized SQL queries
- React + Vite frontend with ATM-style UI

## Repository Structure

- `/server` — Express backend
- `/client` — React frontend

## Setup

### 1. PostgreSQL

Create a database and user, then set environment variables in `/server/.env`.

### 2. Server

```bash
cd server
npm install
cp .env.example .env
# update .env values
node seed.js
npm run dev
```

### 3. Client

```bash
cd client
npm install
npm run dev
```

The frontend expects the backend at `http://localhost:4000`.

## Design Decisions

- **bcrypt PIN hashing**: protects sensitive PIN data in storage and prevents plaintext exposure.
- **JWT session with expiry**: simulates brief ATM sessions and avoids long-lived tokens.
- **Rate limiting + lockout**: defends against brute-force PIN guessing.
- **Atomic DB transactions**: ensures transfers and withdrawals cannot leave accounts inconsistent.
- **ROW-LEVEL locking**: uses `SELECT ... FOR UPDATE` during balance updates to prevent race conditions in concurrent transactions.

## API Endpoints

- `POST /api/auth/login` — login with `{ accountNumber, pin }`
- `POST /api/auth/refresh` — refresh JWT using refresh token cookie
- `POST /api/auth/logout`
- `GET /api/account/balance`
- `POST /api/account/pin/change`
- `POST /api/transactions/deposit`
- `POST /api/transactions/withdraw`
- `POST /api/transactions/transfer`
- `GET /api/transactions/mini-statement`
- `GET /api/transactions/history`

## Seed Accounts

The seed script creates demo accounts with these credentials:

- Account Number: `100000000001`, PIN: `1234`
- Account Number: `100000000002`, PIN: `4321`
- Account Number: `100000000003`, PIN: `0000`

## Testing

```bash
cd server
npm test
```

## Notes

- The frontend includes a two-step login flow: "Insert Card" (account number) and "Enter PIN".
- Session inactivity triggers logout after 80 seconds with a warning modal.
