import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosClient.js';

export default function MiniStatement() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get('/transactions/mini-statement');
        setTransactions(response.data.transactions);
      } catch (err) {
        setError('Unable to load mini statement');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="atm-screen">
      <div className="atm-card wide">
        <h1>Mini Statement</h1>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="alert">{error}</p>
        ) : (
          <table className="statement-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Balance</th>
                <th>Reference</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.reference_id}>
                  <td>{new Date(txn.created_at).toLocaleString()}</td>
                  <td>{txn.type}</td>
                  <td>₹{Number(txn.amount).toFixed(2)}</td>
                  <td>₹{Number(txn.balance_after).toFixed(2)}</td>
                  <td>{txn.reference_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <button className="atm-button secondary" onClick={() => navigate('/dashboard')}>Back</button>
      </div>
    </div>
  );
}
