import { useState } from 'react';

function UserManager({ currentUser, onUserChange }) {
  const [customUserId, setCustomUserId] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Generate a random user ID
  const generateRandomUser = () => {
    const randomId = 'user-' + Math.random().toString(36).substr(2, 9);
    onUserChange(randomId);
    setIsEditing(false);
  };

  // Use custom user ID
  const useCustomUser = () => {
    if (customUserId.trim()) {
      onUserChange(customUserId.trim());
      setCustomUserId('');
      setIsEditing(false);
    }
  };

  // Handle Enter key in custom input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      useCustomUser();
    }
  };

  return (
    <div className="card" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
      
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            backgroundColor: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem'
          }}>
            👤
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
              Current User
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
              Managing integrations for this user
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="btn"
          style={{ 
            fontSize: '0.875rem',
            padding: '0.5rem 1rem',
            backgroundColor: isEditing ? '#ef4444' : '#6b7280'
          }}
        >
          {isEditing ? '✕ Cancel' : '✏️ Edit'}
        </button>
      </div>

      {/* Current User Display */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '1rem',
          borderRadius: '8px',
          color: 'white'
        }}>
          <div style={{ fontSize: '0.75rem', opacity: 0.9, marginBottom: '0.25rem' }}>
            USER ID
          </div>
          <div style={{ 
            fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", monospace',
            fontSize: '1rem',
            fontWeight: '500',
            letterSpacing: '0.5px'
          }}>
            {currentUser}
          </div>
        </div>
      </div>

      {/* User Actions */}
      {isEditing && (
        <div style={{ 
          backgroundColor: '#f1f5f9', 
          padding: '1.5rem', 
          borderRadius: '8px',
          border: '2px dashed #cbd5e1'
        }}>
          <h4 style={{ 
            fontSize: '1rem', 
            fontWeight: '600', 
            marginBottom: '1rem',
            color: '#374151'
          }}>
            Change User Identity
          </h4>
          
          {/* Random User Generation */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              backgroundColor: 'white',
              padding: '1rem',
              borderRadius: '6px',
              border: '1px solid #e2e8f0'
            }}>
              <div>
                <div style={{ fontWeight: '500', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  🎲 Generate Random User
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Create a new random user ID for testing
                </div>
              </div>
              <button 
                onClick={generateRandomUser}
                className="btn btn-purple"
                style={{ fontSize: '0.875rem' }}
              >
                Generate
              </button>
            </div>
          </div>

          {/* Custom User Input */}
          <div>
            <div style={{ 
              backgroundColor: 'white',
              padding: '1rem',
              borderRadius: '6px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontWeight: '500', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                🎯 Set Custom User ID
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Enter custom user ID (e.g., john-doe-001)"
                  value={customUserId}
                  onChange={(e) => setCustomUserId(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="input"
                  style={{ 
                    flex: 1,
                    fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", monospace',
                    fontSize: '0.875rem'
                  }}
                />
                <button 
                  onClick={useCustomUser}
                  disabled={!customUserId.trim()}
                  className="btn btn-green"
                  style={{ fontSize: '0.875rem', whiteSpace: 'nowrap' }}
                >
                  Set User
                </button>
              </div>
              
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                💡 Tip: Press Enter to quickly set the custom user ID
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Info Footer */}
      <div style={{ 
        marginTop: '1.5rem',
        padding: '0.75rem',
        backgroundColor: '#fef7cd',
        borderRadius: '6px',
        border: '1px solid #fbbf24'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          fontSize: '0.875rem',
          color: '#92400e'
        }}>
          <span>ℹ️</span>
          <div>
            <strong>User Context:</strong> All connected accounts and API calls are associated with this user ID.
            Change it to test different user scenarios.
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserManager;