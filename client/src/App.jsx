import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import InsertCard from './pages/InsertCard.jsx';
import EnterPin from './pages/EnterPin.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Withdraw from './pages/Withdraw.jsx';
import Deposit from './pages/Deposit.jsx';
import Transfer from './pages/Transfer.jsx';
import MiniStatement from './pages/MiniStatement.jsx';
import History from './pages/History.jsx';
import PinChange from './pages/PinChange.jsx';
import SessionTimeoutModal from './components/SessionTimeoutModal.jsx';

function App() {
  const { authState } = useAuth();

  return (
    <div className="app-shell">
      <SessionTimeoutModal />
      <Routes>
        <Route path="/" element={<InsertCard />} />
        <Route path="/pin" element={<EnterPin />} />
        <Route path="/dashboard" element={authState.token ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/withdraw" element={authState.token ? <Withdraw /> : <Navigate to="/" />} />
        <Route path="/deposit" element={authState.token ? <Deposit /> : <Navigate to="/" />} />
        <Route path="/transfer" element={authState.token ? <Transfer /> : <Navigate to="/" />} />
        <Route path="/mini-statement" element={authState.token ? <MiniStatement /> : <Navigate to="/" />} />
        <Route path="/history" element={authState.token ? <History /> : <Navigate to="/" />} />
        <Route path="/pin-change" element={authState.token ? <PinChange /> : <Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
