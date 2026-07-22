import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosClient.js';

export default function PinChange() {
  const navigate = useNavigate();
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError('');
    setMessage('');
    if (currentPin.length !== 4 || newPin.length !== 4) {
      return setError('Both PINs must be 4 digits');
    }
    setLoading(true);
    try {
      await api.post('/account/pin/change', { currentPin, newPin });
      setMessage('PIN changed successfully');
      setCurrentPin('');
      setNewPin('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to change PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="atm-screen">
      <div className="atm-card">
        <h1>Change PIN</h1>
        <input
          value={currentPin}
          onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
          maxLength={4}
          placeholder="Current PIN"
          className="atm-input"
          type="password"
        />
        <input
          value={newPin}
          onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
          maxLength={4}
          placeholder="New PIN"
          className="atm-input"
          type="password"
        />
        <button className="atm-button" onClick={submit} disabled={loading}>{loading ? 'Processing...' : 'Change PIN'}</button>
        {message && <div className="success-box">{message}</div>}
        {error && <div className="alert">{error}</div>}
        <button className="atm-button secondary" onClick={() => navigate('/dashboard')}>Back</button>
      </div>
    </div>
  );
}
