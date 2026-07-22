import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosClient.js';

export default function Transfer() {
  const navigate = useNavigate();
  const [toAccountNumber, setToAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError('');
    setMessage(null);
    if (toAccountNumber.trim().length < 10) {
      return setError('Enter a valid destination account number');
    }
    const numeric = Number(amount);
    if (!numeric || numeric <= 0) {
      return setError('Enter a valid amount');
    }
    setLoading(true);
    try {
      const response = await api.post('/transactions/transfer', { toAccountNumber, amount: numeric });
      setMessage(`Transfer successful: Reference ${response.data.referenceId} New balance ₹${response.data.fromBalance.toFixed(2)}`);
      setToAccountNumber('');
      setAmount('');
    } catch (err) {
      setError(err.response?.data?.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="atm-screen">
      <div className="atm-card">
        <h1>Fund Transfer</h1>
        <input
          value={toAccountNumber}
          onChange={(e) => setToAccountNumber(e.target.value.replace(/\D/g, ''))}
          maxLength={12}
          placeholder="Destination Account"
          className="atm-input"
        />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className="atm-input"
        />
        <button className="atm-button" onClick={submit} disabled={loading}>{loading ? 'Processing...' : 'Transfer'}</button>
        {message && <div className="success-box">{message}</div>}
        {error && <div className="alert">{error}</div>}
        <button className="atm-button secondary" onClick={() => navigate('/dashboard')}>Back</button>
      </div>
    </div>
  );
}
