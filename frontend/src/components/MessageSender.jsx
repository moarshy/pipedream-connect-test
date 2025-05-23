import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

function MessageSender({ accounts, currentUser }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState('');
  const [channels, setChannels] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [loadingChannels, setLoadingChannels] = useState(false);

  const slackAccounts = accounts?.data?.filter(acc => acc.app?.name_slug === 'slack') || [];

  // Load channels when account is selected
  const loadChannels = async (accountId) => {
    if (!accountId || !currentUser) return;
    
    setLoadingChannels(true);
    setError(null);
    
    try {
      console.log('Loading channels for account:', accountId);
      const result = await apiService.makeAuthenticatedRequest(
        accountId, 
        'conversations.list',
        { method: 'GET' },
        currentUser
      );
      
      console.log('Channels API response:', result);
      
      if (result.ok && result.channels) {
        // Filter to only show public channels and direct messages
        const availableChannels = result.channels.filter(ch => 
          !ch.is_archived && (ch.is_channel || ch.is_group || ch.is_im)
        );
        setChannels(availableChannels);
        console.log('Available channels:', availableChannels.length);
      } else {
        setError('Failed to load channels: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Failed to load channels:', err);
      setError('Failed to load channels: ' + err.message);
    } finally {
      setLoadingChannels(false);
    }
  };

  const handleAccountChange = (accountId) => {
    setSelectedAccount(accountId);
    setChannel(''); // Reset channel selection
    setChannels([]); // Clear previous channels
    if (accountId) {
      loadChannels(accountId);
    }
  };

  const sendMessage = async () => {
    if (!selectedAccount || !message || !channel) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      console.log('Sending message:', { channel, message });
      const result = await apiService.makeAuthenticatedRequest(
        selectedAccount,
        'chat.postMessage',
        {
          method: 'POST',
          data: {
            channel: channel,
            text: message
          }
        },
        currentUser
      );

      console.log('Send message response:', result);

      if (result.ok) {
        setSuccess(true);
        setMessage('');
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError('Slack API error: ' + result.error);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ backgroundColor: '#f0f9ff' }}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        💬 Send Slack Message
      </h3>

      {slackAccounts.length > 0 ? (
        <div>
          {/* Account Selection */}
          <div className="form-group">
            <label className="form-label">
              Slack Account:
            </label>
            <select 
              value={selectedAccount}
              onChange={(e) => handleAccountChange(e.target.value)}
              className="input"
            >
              <option value="">Choose account...</option>
              {slackAccounts.map(account => (
                <option key={account.id} value={account.id}>
                  💬 {account.name}
                </option>
              ))}
            </select>
          </div>

          {/* Channel Selection */}
          {selectedAccount && (
            <div className="form-group">
              <label className="form-label">
                Channel:
                {loadingChannels && <span style={{ color: '#666', fontSize: '0.875rem' }}> (Loading...)</span>}
              </label>
              <select 
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="input"
                disabled={loadingChannels}
              >
                <option value="">Choose channel...</option>
                {channels.map(ch => (
                  <option key={ch.id} value={ch.id}>
                    {ch.is_channel ? '#' : ch.is_group ? '🔒' : '💬'} {ch.name || ch.user || 'Unknown'}
                  </option>
                ))}
              </select>
              {channels.length === 0 && !loadingChannels && selectedAccount && (
                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                  No channels found. Make sure your Slack account has access to channels.
                </div>
              )}
            </div>
          )}

          {/* Message Input */}
          {selectedAccount && (
            <div className="form-group">
              <label className="form-label">
                Message:
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here... (e.g., 'Hello from Pipedream Connect!')"
                rows={3}
                className="input"
              />
            </div>
          )}

          {/* Send Button */}
          {selectedAccount && (
            <div className="form-group">
              <button 
                onClick={sendMessage}
                disabled={loading || !message || !channel}
                className="btn btn-green"
              >
                {loading ? 'Sending...' : '📤 Send Message'}
              </button>
            </div>
          )}

          {/* Status Messages */}
          {success && (
            <div className="success">
              ✅ Message sent successfully!
            </div>
          )}

          {error && (
            <div className="error">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state">
          Connect a Slack account first to send messages
        </div>
      )}
    </div>
  );
}

export default MessageSender;