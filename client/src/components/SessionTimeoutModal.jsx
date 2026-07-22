import { useAuth } from '../context/AuthContext.jsx';

export default function SessionTimeoutModal() {
  const { showTimeoutWarning, setShowTimeoutWarning } = useAuth();

  if (!showTimeoutWarning) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h2>Session Timeout Warning</h2>
        <p>Your session will expire soon due to inactivity.</p>
        <button onClick={() => setShowTimeoutWarning(false)}>Continue Session</button>
      </div>
    </div>
  );
}
