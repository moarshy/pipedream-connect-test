import { useState } from 'react';
import { apiService } from '../services/api';

function ApiTester({ accounts, currentUser }) {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState('');

  const slackAccounts = accounts?.data?.filter(acc => acc.app?.name_slug === 'slack') || [];

  // Test Slack API calls
  const testSlackCall = async (endpoint, method = 'GET', data = null) => {
    if (!selectedAccount) {
      setError('Please select a Slack account first');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await apiService.makeAuthenticatedRequest(
        selectedAccount, 
        endpoint, 
        { method, data },
        currentUser
      );
      setResponse(result);
    } catch (err) {
      setError('API call failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ backgroundColor: '#fef3f2' }}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        🧪 API Testing Lab
      </h3>

      {/* Account Selection */}
      {slackAccounts.length > 0 ? (
        <div className="form-group">
          <label className="form-label">
            Select Slack Account:
          </label>
          <select 
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="input"
          >
            <option value="">Choose account...</option>
            {slackAccounts.map(account => (
              <option key={account.id} value={account.id}>
                💬 {account.name} ({account.id.substring(0, 8)}...)
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="error">
          ⚠️ No Slack accounts connected. Connect a Slack account first!
        </div>
      )}

      {/* Quick Test Buttons */}
      {selectedAccount && (
        <div className="form-group">
          <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Quick Tests:</h4>
          <div className="btn-grid">
            <button 
              onClick={() => testSlackCall('auth.test')}
              disabled={loading}
              className="btn btn-green"
            >
              👤 Get User Info
            </button>
            <button 
              onClick={() => testSlackCall('conversations.list')}
              disabled={loading}
              className="btn btn-purple"
            >
              📋 List Channels
            </button>
            <button 
              onClick={() => testSlackCall('team.info')}
              disabled={loading}
              className="btn"
            >
              🏢 Team Info
            </button>
            <button 
              onClick={() => testSlackCall('users.profile.get')}
              disabled={loading}
              className="btn"
            >
              👨‍💼 My Profile
            </button>
          </div>
        </div>
      )}

      {/* Custom API Call */}
      {selectedAccount && <CustomApiCall onApiCall={testSlackCall} loading={loading} />}

      {/* Response Display */}
      {loading && (
        <div className="loading">
          ⏳ Making API call...
        </div>
      )}

      {error && (
        <div className="error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div className="success">
          <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
            ✅ API Response:
          </h4>
          <pre>
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// Custom API Call Component
function CustomApiCall({ onApiCall, loading }) {
  const [endpoint, setEndpoint] = useState('');
  const [method, setMethod] = useState('GET');

  return (
    <div className="api-endpoint-form">
      <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Custom API Call:</h4>
      
      <div className="endpoint-input-group">
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
            Slack API Endpoint:
          </label>
          <input
            type="text"
            placeholder="e.g., conversations.list or chat.postMessage"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            className="input"
          />
        </div>
        
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
            Method:
          </label>
          <select 
            value={method} 
            onChange={(e) => setMethod(e.target.value)}
            className="input"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
          </select>
        </div>
        
        <button 
          onClick={() => onApiCall(endpoint, method)}
          disabled={loading || !endpoint}
          className="btn"
          style={{ fontSize: '0.875rem' }}
        >
          🚀 Call API
        </button>
      </div>
      
      <div className="endpoint-hint">
        💡 Try: <code>auth.test</code>, <code>conversations.list</code>, <code>users.list</code>
      </div>
    </div>
  );
}

export default ApiTester;