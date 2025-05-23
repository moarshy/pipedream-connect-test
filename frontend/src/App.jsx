import { useState, useEffect } from 'react';
import UserManager from './components/UserManager';
import TokenTester from './components/TokenTester';
import ApiTester from './components/ApiTester';
import MessageSender from './components/MessageSender';
import SheetsManager from './components/SheetsManager';
import WorkflowAutomation from './components/WorkflowAutomation';
import IntegrationDashboard from './components/IntegrationDashboard';
import { apiService } from './services/api';

function App() {
  const [currentUser, setCurrentUser] = useState('test-user-123');
  const [backendStatus, setBackendStatus] = useState('checking');
  const [accounts, setAccounts] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

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

  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard', component: IntegrationDashboard },
    { id: 'connect', label: '🔗 Connect Apps', component: TokenTester },
    { id: 'slack', label: '💬 Slack', component: MessageSender },
    { id: 'sheets', label: '📊 Google Sheets', component: SheetsManager },
    { id: 'workflows', label: '🔄 Workflows', component: WorkflowAutomation },
    { id: 'testing', label: '🧪 API Testing', component: ApiTester }
  ];

  return (
    <div className="container">
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          🔗 Pipedream Connect Test
        </h1>
        <p style={{ color: '#666' }}>
          Phase 4: Advanced Features & Multi-App Integration
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
        <div>
          {/* User Management - Always Visible */}
          <UserManager 
            currentUser={currentUser} 
            onUserChange={setCurrentUser} 
          />

          {/* Tab Navigation */}
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem', 
            marginBottom: '1.5rem',
            overflowX: 'auto'
          }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`btn ${activeTab === tab.id ? 'btn-green' : ''}`}
                style={{ 
                  whiteSpace: 'nowrap',
                  fontSize: '0.875rem'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Active Tab Content */}
          <div>
            {tabs.map(tab => {
              if (activeTab !== tab.id) return null;
              
              const Component = tab.component;
              return (
                <Component
                  key={tab.id}
                  accounts={accounts}
                  currentUser={currentUser}
                  onAccountsChange={fetchAccounts}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Phase 4 Goals */}
      <div className="card" style={{ backgroundColor: '#f9f9f9' }}>
        <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>🚀 Phase 4 Checklist:</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Multi-App Integration:</h4>
            <ul style={{ fontSize: '0.875rem', paddingLeft: '1.5rem', lineHeight: '1.6' }}>
              <li>✅ Connect Google Sheets account</li>
              <li>✅ Create and manage spreadsheets</li>
              <li>✅ Cross-app workflow automation</li>
              <li>✅ Integration health monitoring</li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Advanced Features:</h4>
            <ul style={{ fontSize: '0.875rem', paddingLeft: '1.5rem', lineHeight: '1.6' }}>
              <li>✅ Professional dashboard interface</li>
              <li>✅ Tabbed navigation system</li>
              <li>✅ Real-time status monitoring</li>
              <li>✅ Workflow automation examples</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
}

export default App;