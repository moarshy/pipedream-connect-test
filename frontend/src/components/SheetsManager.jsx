import { useState } from 'react';
import { apiService } from '../services/api';

function SheetsManager({ accounts, currentUser }) {
  const [loading, setLoading] = useState(false);
  const [sheets, setSheets] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedSheet, setSelectedSheet] = useState('');
  const [newSheetName, setNewSheetName] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  const googleAccounts = accounts?.data?.filter(acc => acc.app?.name_slug === 'google_sheets') || [];

  // Load spreadsheets when account is selected
  const loadSpreadsheets = async (accountId) => {
    if (!accountId || !currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Use Google Drive API to list spreadsheet files
      const result = await apiService.makeAuthenticatedRequest(
        accountId,
        'https://www.googleapis.com/drive/v3/files?q=mimeType="application/vnd.google-apps.spreadsheet"&fields=files(id,name,createdTime)',
        { method: 'GET' },
        currentUser
      );
      
      if (result.files) {
        setSheets(result.files);
      } else {
        setSheets([]);
      }
    } catch (err) {
      setError('Failed to load spreadsheets: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create new spreadsheet
  const createSpreadsheet = async () => {
    if (!selectedAccount || !newSheetName || !currentUser) return;
    
    setLoading(true);
    setError(null);
    setSuccess('');
    
    try {
      const result = await apiService.makeAuthenticatedRequest(
        selectedAccount,
        'https://sheets.googleapis.com/v4/spreadsheets',
        {
          method: 'POST',
          data: {
            properties: {
              title: newSheetName
            },
            sheets: [{
              properties: {
                title: 'Sheet1'
              }
            }]
          }
        },
        currentUser
      );
      
      if (result.spreadsheetId) {
        setSuccess(`✅ Spreadsheet "${newSheetName}" created successfully!`);
        setNewSheetName('');
        loadSpreadsheets(selectedAccount); // Refresh list
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError('Failed to create spreadsheet - no ID returned');
      }
    } catch (err) {
      setError('Failed to create spreadsheet: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add data to spreadsheet
  const addDataToSheet = async (rowData, description) => {
    if (!selectedAccount || !selectedSheet || !currentUser) return;
    
    setLoading(true);
    setError(null);
    setSuccess('');
    
    try {
      // Use the correct Google Sheets API format
      // The valueInputOption should be a query parameter, not in the body
      const result = await apiService.makeAuthenticatedRequest(
        selectedAccount,
        `https://sheets.googleapis.com/v4/spreadsheets/${selectedSheet}/values/A:A:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
        {
          method: 'POST',
          data: {
            values: [rowData]
          }
        },
        currentUser
      );
      
      if (result.updates || result.updatedRows) {
        setSuccess(`✅ ${description} added successfully!`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to add data - no updates returned');
      }
    } catch (err) {
      setError('Failed to add data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Read data from spreadsheet
  const readSheetData = async () => {
    if (!selectedAccount || !selectedSheet || !currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiService.makeAuthenticatedRequest(
        selectedAccount,
        `https://sheets.googleapis.com/v4/spreadsheets/${selectedSheet}/values/A1:Z100`,
        { method: 'GET' },
        currentUser
      );
      
      if (result.values) {
        alert(`Sheet contains ${result.values.length} rows of data. Check console for details.`);
      } else {
        alert('Sheet appears to be empty or no data in range A1:Z100');
      }
    } catch (err) {
      setError('Failed to read data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ backgroundColor: '#f9fdf9' }}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        📊 Google Sheets Manager
      </h3>

      {googleAccounts.length > 0 ? (
        <div>
          {/* Account Selection */}
          <div className="form-group">
            <label className="form-label">Google Account:</label>
            <select 
              value={selectedAccount}
              onChange={(e) => {
                setSelectedAccount(e.target.value);
                setSelectedSheet(''); // Reset sheet selection
                if (e.target.value) loadSpreadsheets(e.target.value);
              }}
              className="input"
            >
              <option value="">Choose account...</option>
              {googleAccounts.map(account => (
                <option key={account.id} value={account.id}>
                  📊 {account.name}
                </option>
              ))}
            </select>
          </div>

          {/* Create New Spreadsheet */}
          {selectedAccount && (
            <div className="form-group">
              <label className="form-label">Create New Spreadsheet:</label>
              <div className="flex">
                <input
                  type="text"
                  placeholder="Enter spreadsheet name (e.g., 'My Test Sheet')"
                  value={newSheetName}
                  onChange={(e) => setNewSheetName(e.target.value)}
                  className="input"
                  onKeyPress={(e) => e.key === 'Enter' && createSpreadsheet()}
                />
                <button 
                  onClick={createSpreadsheet}
                  disabled={loading || !newSheetName.trim()}
                  className="btn btn-green"
                >
                  ➕ Create
                </button>
              </div>
            </div>
          )}

          {/* Spreadsheet Selection */}
          {selectedAccount && (
            <div className="form-group">
              <label className="form-label">
                Your Spreadsheets:
                {loading && <span style={{ color: '#666', fontSize: '0.875rem' }}> (Loading...)</span>}
              </label>
              <select 
                value={selectedSheet}
                onChange={(e) => setSelectedSheet(e.target.value)}
                className="input"
                disabled={loading}
              >
                <option value="">Choose spreadsheet...</option>
                {sheets.map(sheet => (
                  <option key={sheet.id} value={sheet.id}>
                    {sheet.name} ({new Date(sheet.createdTime).toLocaleDateString()})
                  </option>
                ))}
              </select>
              {sheets.length === 0 && !loading && selectedAccount && (
                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                  No spreadsheets found. Create one above to get started.
                </div>
              )}
            </div>
          )}

          {/* Sheet Actions */}
          {selectedSheet && (
            <div className="form-group">
              <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Sheet Actions:</h4>
              <div className="btn-grid">
                <button 
                  onClick={() => addDataToSheet(
                    ['Name', 'Email', 'Date', 'Status'], 
                    'Header row'
                  )}
                  disabled={loading}
                  className="btn btn-purple"
                >
                  📝 Add Headers
                </button>
                <button 
                  onClick={() => addDataToSheet(
                    ['John Doe', 'john@example.com', new Date().toLocaleDateString(), 'Active'], 
                    'Sample data row'
                  )}
                  disabled={loading}
                  className="btn btn-green"
                >
                  🧪 Add Sample Row
                </button>
                <button 
                  onClick={() => addDataToSheet(
                    ['Pipedream User', 'test@pipedream.com', new Date().toISOString(), 'Connected'], 
                    'Pipedream test data'
                  )}
                  disabled={loading}
                  className="btn"
                >
                  🔗 Add Pipedream Data
                </button>
                <button 
                  onClick={readSheetData}
                  disabled={loading}
                  className="btn btn-purple"
                >
                  👁️ Read Sheet Data
                </button>
              </div>
            </div>
          )}

          {/* Status Messages */}
          {loading && (
            <div className="loading">
              ⏳ Processing Google Sheets operation...
            </div>
          )}

          {success && (
            <div className="success">
              {success}
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
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
            <h4 style={{ marginBottom: '0.5rem' }}>No Google Sheets Account Connected</h4>
            <p style={{ color: '#666', fontSize: '0.875rem' }}>
              Connect your Google Sheets account to create and manage spreadsheets.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SheetsManager;