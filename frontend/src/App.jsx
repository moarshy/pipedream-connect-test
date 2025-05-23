import { useState, useEffect } from 'react';
import UserManager from './components/UserManager';
import TokenTester from './components/TokenTester';
import ApiTester from './components/ApiTester';
import MessageSender from './components/MessageSender';
import { apiService } from './services/api';

function App() {
  const [currentUser, setCurrentUser] = useState('test-user-123');
  const [backendStatus, setBackendStatus] = useState('checking');
  const [accounts, setAccounts] = useState(null);

  // Check if backend is running when app loads
  useEffect(() => {
    checkBackend();
  }, []);

  // Auto-fetch accounts when user changes
  useEffect(() => {
    if (backendStatus === 'connected') {
      fetchAccounts();
    }
  }, [currentUser, backendStatus]);

  const checkBackend = async () => {
    try {
      await apiService.checkHealth();
      setBackendStatus('connected');
    } catch (error) {
      setBackendStatus('disconnected');
    }
  };

  const fetchAccounts = async () => {
    try {
      const data = await apiService.getAccounts(currentUser);
      setAccounts(data);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    }
  };

  return (
    <div className="container">
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          🔗 Pipedream Connect Test
        </h1>
        <p style={{ color: '#666' }}>
          Phase 3: Making authenticated API calls with connected accounts
        </p>
      </div>

      {/* Backend Status */}
      <div className={`card status-${backendStatus}`} style={{ textAlign: 'center' }}>
        <strong>Backend Status:</strong> {
          backendStatus === 'connected' ? '✅ Connected' :
          backendStatus === 'disconnected' ? '❌ Disconnected' : 
          '⏳ Checking...'
        }
        {backendStatus === 'disconnected' && (
          <div style={{ marginTop: '1rem' }}>
            <button onClick={checkBackend} className="btn btn-red">
              Retry Connection
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      {backendStatus === 'connected' && (
        <div className="grid">
          
          {/* Left Column */}
          <div>
            <UserManager 
              currentUser={currentUser} 
              onUserChange={setCurrentUser} 
            />
            
            <TokenTester 
              currentUser={currentUser}
              onAccountsChange={fetchAccounts}
            />
          </div>
          
          {/* Right Column */}
          <div>
            <MessageSender 
              accounts={accounts} 
              currentUser={currentUser}
            />
            
            <ApiTester 
              accounts={accounts} 
              currentUser={currentUser}
            />
          </div>
          
        </div>
      )}

      {/* Instructions */}
      <div className="card" style={{ backgroundColor: '#f9f9f9' }}>
        <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>🚀 Phase 3 Goals:</h3>
        <ol style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
          <li>Connect your Slack account (if not already done)</li>
          <li>Test API calls with the "API Testing Lab"</li>
          <li>Send a message to a Slack channel</li>
          <li>Explore different Slack API endpoints</li>
          <li>Check the API responses and understand the data structure</li>
        </ol>
      </div>

    </div>
  );
}

export default App;