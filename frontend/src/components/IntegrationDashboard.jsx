import { useState, useEffect } from 'react';

function IntegrationDashboard({ accounts, currentUser }) {
  const [stats, setStats] = useState({
    totalAccounts: 0,
    connectedApps: [],
    healthyConnections: 0,
    lastActivity: null
  });

  useEffect(() => {
    if (accounts?.data) {
      const connectedApps = [...new Set(accounts.data.map(acc => acc.app?.name || 'Unknown'))];
      const healthyConnections = accounts.data.filter(acc => acc.healthy).length;
      
      setStats({
        totalAccounts: accounts.data.length,
        connectedApps,
        healthyConnections,
        lastActivity: new Date().toLocaleString()
      });
    }
  }, [accounts]);

  const getAppIcon = (appName) => {
    const icons = {
      'Slack': '💬',
      'Google Sheets': '📊',
      'Gmail': '📧',
      'GitHub': '🐙'
    };
    return icons[appName] || '🔗';
  };

  return (
    <div className="card" style={{ backgroundColor: '#f8fafc' }}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        📊 Integration Dashboard
      </h3>

      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔗</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.totalAccounts}</div>
          <div style={{ fontSize: '0.875rem', color: '#666' }}>Connected Accounts</div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🚀</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.connectedApps.length}</div>
          <div style={{ fontSize: '0.875rem', color: '#666' }}>Integrated Apps</div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.healthyConnections}</div>
          <div style={{ fontSize: '0.875rem', color: '#666' }}>Healthy Connections</div>
        </div>
      </div>

      {/* Connected Apps List */}
      <div>
        <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Connected Applications:</h4>
        {stats.connectedApps.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {stats.connectedApps.map((app, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                border: '1px solid #e5e5e5',
                fontSize: '0.875rem'
              }}>
                {getAppIcon(app)} {app}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: '#666', fontStyle: 'italic' }}>
            No apps connected yet
          </div>
        )}
      </div>

      {/* Activity Status */}
      <div style={{ 
        marginTop: '1rem', 
        padding: '0.75rem', 
        backgroundColor: '#f0f9ff', 
        borderRadius: '4px',
        fontSize: '0.875rem'
      }}>
        <strong>Last Updated:</strong> {stats.lastActivity}
      </div>
    </div>
  );
}

export default IntegrationDashboard;