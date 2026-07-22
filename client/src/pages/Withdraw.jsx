import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosClient.js';

export default function Withdraw() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError('');
    setMessage(null);
    const numeric = Number(amount);
    if (!numeric || numeric % 100 !== 0) {
      return setError('Enter a multiple of 100');
    }
    setLoading(true);
    try {
      const response = await api.post('/transactions/withdraw', { amount: numeric });
      setMessage(`Withdrawal successful: ₹${response.data.transaction.amount.toFixed(2)} Reference ${response.data.transaction.reference_id}`);
      setAmount('');
    } catch (err) {
      setError(err.response?.data?.message || 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="atm-screen">
      <div className="atm-card">
        <h1>Cash Withdrawal</h1>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount (multiple of 100)"
          className="atm-input"
        />
        <button className="atm-button" onClick={submit} disabled={loading}>{loading ? 'Processing...' : 'Withdraw'}</button>
        {message && <div className="success-box">{message}</div>}
        {error && <div className="alert">{error}</div>}
        <button className="atm-button secondary" onClick={() => navigate('/dashboard')}>Back</button>
      </div>
    </div>
  );
}
