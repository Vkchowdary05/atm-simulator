import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosClient.js';

export default function Deposit() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError('');
    setMessage(null);
    const numeric = Number(amount);
    if (!numeric || numeric <= 0) {
      return setError('Enter a valid amount');
    }
    setLoading(true);
    try {
      const response = await api.post('/transactions/deposit', { amount: numeric });
      setMessage(`Deposit successful: ₹${response.data.transaction.amount.toFixed(2)} Reference ${response.data.transaction.reference_id}`);
      setAmount('');
    } catch (err) {
      setError(err.response?.data?.message || 'Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="atm-screen">
      <div className="atm-card">
        <h1>Cash Deposit</h1>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className="atm-input"
        />
        <button className="atm-button" onClick={submit} disabled={loading}>{loading ? 'Processing...' : 'Deposit'}</button>
        {message && <div className="success-box">{message}</div>}
        {error && <div className="alert">{error}</div>}
        <button className="atm-button secondary" onClick={() => navigate('/dashboard')}>Back</button>
      </div>
    </div>
  );
}
