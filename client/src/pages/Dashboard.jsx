import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axiosClient.js';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { authState, logout } = useAuth();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await api.get('/account/balance');
        setBalance(response.data.balance);
      } catch (err) {
        setError('Unable to load balance');
      } finally {
        setLoading(false);
      }
    };
    fetchBalance();
  }, []);

  const refreshInquiry = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/transactions/inquiry');
      setBalance(response.data.balance);
    } catch (err) {
      setError('Unable to refresh balance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="atm-screen">
      <div className="atm-card">
        <h1>Welcome, {authState.fullName}</h1>
        {loading ? (
          <p>Loading balance...</p>
        ) : error ? (
          <p className="alert">{error}</p>
        ) : (
          <div className="balance-panel">
            <span>Available Balance</span>
            <strong>₹{balance?.toFixed(2)}</strong>
          </div>
        )}
        <div className="menu-grid">
          <button className="menu-button" onClick={refreshInquiry}>Balance Inquiry</button>
          <Link to="/withdraw" className="menu-button">Withdraw</Link>
          <Link to="/deposit" className="menu-button">Deposit</Link>
          <Link to="/transfer" className="menu-button">Transfer</Link>
          <Link to="/pin-change" className="menu-button">Change PIN</Link>
          <Link to="/mini-statement" className="menu-button">Mini Statement</Link>
          <Link to="/history" className="menu-button">History</Link>
          <button className="menu-button secondary" onClick={() => { logout(); navigate('/'); }}>Logout</button>
        </div>
      </div>
    </div>
  );
}
