import { useState } from 'react';
import { apiService } from '../services/api';

function TokenTester({ currentUser }) {
  const [loading, setLoading] = useState(false);
  const [tokenData, setTokenData] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [error, setError] = useState(null);

  // Generate token for current user
  const generateToken = async () => {
    setLoading(true);
    setError(null);
    setTokenData(null);
    
    try {
      const data = await apiService.createConnectToken(currentUser);
      setTokenData(data);
    } catch (err) {
      setError('Failed to generate token: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch accounts for current user
  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiService.getAccounts(currentUser);
      setAccounts(data);
    } catch (err) {
      setError('Failed to fetch accounts: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Refresh accounts automatically after connecting
  const handleAccountConnect = () => {
    setTimeout(() => {
      fetchAccounts();
    }, 2000); // Wait 2 seconds for connection to process
  };

  return (
    <div className="card" style={{ backgroundColor: '#f0fdf4' }}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        🔗 Connect & Test Accounts
      </h3>
      
      {/* Action buttons */}
      <div style={{ marginBottom: '1.5rem' }}>
        <button 
          onClick={generateToken}
          disabled={loading}
          className="btn btn-green"
          style={{ marginBottom: '0.5rem' }}
        >
          {loading ? 'Generating...' : '🔑 Generate Connect Token'}
        </button>
        
        <button 
          onClick={fetchAccounts}
          disabled={loading}
          className="btn btn-purple"
        >
          {loading ? 'Fetching...' : '📋 Refresh Accounts'}
        </button>
      </div>

      {/* Error display */}
      {error && (
        <div className="error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Token generation success */}
      {tokenData && (
        <div className="success" style={{ marginBottom: '1rem' }}>
          <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
            ✅ Ready to Connect Accounts
          </h4>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Token expires: {new Date(tokenData.expires_at).toLocaleString()}
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <a 
              href={`${tokenData.connect_link_url}&app=slack`}
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={handleAccountConnect}
              className="btn"
              style={{ textDecoration: 'none', textAlign: 'center', fontSize: '0.875rem' }}
            >
              💬 Connect Slack
            </a>
            <a 
              href={`${tokenData.connect_link_url}&app=google_sheets`}
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={handleAccountConnect}
              className="btn btn-green"
              style={{ textDecoration: 'none', textAlign: 'center', fontSize: '0.875rem' }}
            >
              📊 Connect Sheets
            </a>
            <a 
              href={`${tokenData.connect_link_url}&app=gmail`}
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={handleAccountConnect}
              className="btn btn-purple"
              style={{ textDecoration: 'none', textAlign: 'center', fontSize: '0.875rem' }}
            >
              📧 Connect Gmail
            </a>
            <a 
              href={`${tokenData.connect_link_url}&app=github`}
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={handleAccountConnect}
              className="btn"
              style={{ textDecoration: 'none', textAlign: 'center', fontSize: '0.875rem', background: '#374151' }}
            >
              🐙 Connect GitHub
            </a>
          </div>
        </div>
      )}

      {/* Connected Accounts Display */}
      <div className="success">
        <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
          📋 Connected Accounts
        </h4>
        
        {accounts ? (
          accounts.data && accounts.data.length > 0 ? (
            <div style={{ space: '0.5rem' }}>
              {accounts.data.map((account, index) => {
                // Safely handle account data
                const accountId = account.id || `account-${index}`;
                const appName = account.app?.name_slug || account.app?.name || 'unknown';
                const appDisplayName = account.app?.name || appName;
                
                return (
                  <div 
                    key={accountId} 
                    style={{ 
                      background: 'white', 
                      padding: '0.75rem', 
                      borderRadius: '6px',
                      marginBottom: '0.5rem',
                      border: '1px solid #e5e5e5',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
                        {getAppIcon(appName)} {appDisplayName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#666' }}>
                        {getAccountDisplayName(account)}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>
                      ID: {accountId.substring(0, 8)}...
                    </div>
                  </div>
                );
              })}
              
              {/* Account count summary */}
              <div style={{ 
                fontSize: '0.75rem', 
                color: '#666', 
                textAlign: 'center',
                marginTop: '0.5rem',
                fontStyle: 'italic'
              }}>
                {accounts.data.length} account{accounts.data.length !== 1 ? 's' : ''} connected
              </div>
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              color: '#666', 
              fontSize: '0.875rem',
              padding: '1rem',
              fontStyle: 'italic'
            }}>
              No accounts connected yet.<br/>
              Generate a token and connect an account above.
            </div>
          )
        ) : (
          <div style={{ 
            textAlign: 'center', 
            color: '#666', 
            fontSize: '0.875rem',
            padding: '1rem'
          }}>
            Click "📋 Refresh Accounts" to check for connected accounts
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to get app icons
function getAppIcon(appName) {
  const icons = {
    slack: '💬',
    google_sheets: '📊', 
    gmail: '📧',
    github: '🐙',
    twitter: '🐦',
    notion: '📝',
    airtable: '🗂️',
    discord: '🎮'
  };
  return icons[appName] || '🔗';
}

// Helper function to safely get account display name
function getAccountDisplayName(account) {
  // Handle different account data structures
  if (typeof account.name === 'string' && account.name) {
    return account.name;
  }
  
  if (typeof account.external_id === 'string' && account.external_id) {
    return account.external_id;
  }
  
  // For Slack, try to get workspace info
  if (account.app?.name_slug === 'slack') {
    return account.name || 'Slack Workspace';
  }
  
  // For Google Sheets, show Google account
  if (account.app?.name_slug === 'google_sheets') {
    return account.name || 'Google Account';
  }
  
  // For Gmail
  if (account.app?.name_slug === 'gmail') {
    return account.name || 'Gmail Account';
  }
  
  return account.name || 'Connected Account';
}

export default TokenTester;