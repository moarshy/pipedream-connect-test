import { useState, useEffect } from 'react';

function UserManager({ currentUser, onUserChange }) {
  const [customUserId, setCustomUserId] = useState('');

  // Generate a random user ID
  const generateRandomUser = () => {
    const randomId = 'user-' + Math.random().toString(36).substr(2, 9);
    onUserChange(randomId);
  };

  // Use custom user ID
  const useCustomUser = () => {
    if (customUserId.trim()) {
      onUserChange(customUserId.trim());
      setCustomUserId('');
    }
  };

  return (
    <div className="bg-blue-50 p-4 rounded-lg border">
      <h3 className="text-lg font-semibold mb-3">👤 Current User</h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">Current User ID:</p>
        <p className="font-mono bg-white p-2 rounded border">{currentUser}</p>
      </div>

      <div className="space-y-2">
        <button 
          onClick={generateRandomUser}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
        >
          Generate Random User
        </button>
        
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Enter custom user ID"
            value={customUserId}
            onChange={(e) => setCustomUserId(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
          />
          <button 
            onClick={useCustomUser}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Use Custom ID
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserManager;