import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosClient.js';

export default function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = async (pageNumber = 1) => {
    setLoading(true);
    setError('');
    try {
      const query = new URLSearchParams({ page: pageNumber.toString(), limit: '10', from, to }).toString();
      const response = await api.get(`/transactions/history?${query}`);
      setHistory(response.data.history);
      setTotal(response.data.total);
      setPage(response.data.page);
    } catch (err) {
      setError('Unable to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(1); }, []);

  return (
    <div className="atm-screen">
      <div className="atm-card wide">
        <h1>Transaction History</h1>
        <div className="filter-row">
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="atm-input" />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="atm-input" />
          <button className="atm-button" onClick={() => fetchHistory(1)}>Filter</button>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="alert">{error}</p>
        ) : (
          <>
            <table className="statement-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Balance</th>
                  <th>Ref</th>
                </tr>
              </thead>
              <tbody>
                {history.map((txn) => (
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
            <div className="pagination-row">
              <button className="atm-button secondary" disabled={page <= 1} onClick={() => fetchHistory(page - 1)}>Prev</button>
              <span>Page {page} / {Math.max(1, Math.ceil(total / 10))}</span>
              <button className="atm-button secondary" disabled={page * 10 >= total} onClick={() => fetchHistory(page + 1)}>Next</button>
            </div>
          </>
        )}
        <button className="atm-button secondary" onClick={() => navigate('/dashboard')}>Back</button>
      </div>
    </div>
  );
}
