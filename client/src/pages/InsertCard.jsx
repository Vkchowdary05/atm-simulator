import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function InsertCard() {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [accountNumber, setAccountNumber] = useState('');

  const handleContinue = () => {
    if (accountNumber.trim().length < 10) return;
    localStorage.setItem('atm_pending_account', accountNumber.trim());
    navigate('/pin');
  };

  return (
    <div className="atm-screen">
      <div className="atm-card">
        <h1>Insert Card</h1>
        <p>Enter your account number to begin.</p>
        <input
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
          maxLength={12}
          placeholder="Account Number"
          className="atm-input"
        />
        <button className="atm-button" onClick={handleContinue} disabled={accountNumber.length < 10}>Continue</button>
      </div>
    </div>
  );
}
