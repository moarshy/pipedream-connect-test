import { useState, useEffect } from 'react';
import UserManager from './components/UserManager';
import TokenTester from './components/TokenTester';
import { apiService } from './services/api';

function App() {
  const [currentUser, setCurrentUser] = useState('test-user-123');
  const [backendStatus, setBackendStatus] = useState('checking');

  // Check if backend is running when app loads
  useEffect(() => {
    checkBackend();
  }, []);

  const checkBackend = async () => {
    try {
      await apiService.checkHealth();
      setBackendStatus('connected');
    } catch (error) {
      setBackendStatus('disconnected');
      console.error('Backend connection failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔗 Pipedream Connect Test
          </h1>
          <p className="text-gray-600">
            Testing Pipedream Connect integration step by step
          </p>
        </div>

        {/* Backend Status */}
        <div className={`p-4 rounded-lg border text-center ${
          backendStatus === 'connected' 
            ? 'bg-green-100 border-green-300 text-green-800' 
            : backendStatus === 'disconnected'
            ? 'bg-red-100 border-red-300 text-red-800'
            : 'bg-yellow-100 border-yellow-300 text-yellow-800'
        }`}>
          <strong>Backend Status:</strong> {
            backendStatus === 'connected' ? '✅ Connected' :
            backendStatus === 'disconnected' ? '❌ Disconnected' : 
            '⏳ Checking...'
          }
          {backendStatus === 'disconnected' && (
            <div className="mt-2">
              <button 
                onClick={checkBackend}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
              >
                Retry Connection
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        {backendStatus === 'connected' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* User Management */}
            <UserManager 
              currentUser={currentUser} 
              onUserChange={setCurrentUser} 
            />
            
            {/* API Testing */}
            <TokenTester currentUser={currentUser} />
            
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h3 className="font-semibold mb-2">📝 How to Use:</h3>
          <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
            <li>Make sure your backend is running (npm run dev in backend folder)</li>
            <li>Choose or generate a user ID</li>
            <li>Click "Generate Connect Token" to create a token</li>
            <li>Use the "Connect Link" to test the OAuth flow</li>
            <li>After connecting an account, click "Fetch Accounts" to see it</li>
          </ol>
        </div>

      </div>
    </div>
  );
}

export default App;