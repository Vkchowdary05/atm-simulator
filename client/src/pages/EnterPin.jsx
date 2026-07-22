import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosClient.js';
import { useAuth } from '../context/AuthContext.jsx';

const keypad = ['1','2','3','4','5','6','7','8','9','0'];

export default function EnterPin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [pin, setPin] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const pending = localStorage.getItem('atm_pending_account');
    if (!pending) {
      navigate('/');
      return;
    }
    setAccountNumber(pending);
  }, [navigate]);

  const addDigit = (digit) => {
    if (pin.length >= 4) return;
    setPin((prev) => prev + digit);
    setError('');
  };

  const clearPin = () => setPin('');

  const submit = async () => {
    if (pin.length !== 4) return;
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { accountNumber, pin });
      login(response.data);
      localStorage.removeItem('atm_pending_account');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to login');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="atm-screen">
      <div className="atm-card">
        <h1>Enter PIN</h1>
        <p>{accountNumber}</p>
        <div className="pin-display">{pin.replace(/./g, '•')}</div>
        <div className="keypad-grid">
          {keypad.map((digit) => (
            <button key={digit} onClick={() => addDigit(digit)} className="keypad-key">{digit}</button>
          ))}
        </div>
        <div className="keypad-row">
          <button onClick={clearPin} className="atm-button secondary">Clear</button>
          <button onClick={submit} className="atm-button" disabled={pin.length !== 4 || loading}>{loading ? 'Checking...' : 'Enter'}</button>
        </div>
        {error && <div className="alert">{error}</div>}
      </div>
    </div>
  );
}
