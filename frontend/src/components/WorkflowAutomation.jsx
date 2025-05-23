import { useState } from 'react';
import { apiService } from '../services/api';

function WorkflowAutomation({ accounts, currentUser }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const slackAccounts = accounts?.data?.filter(acc => acc.app?.name_slug === 'slack') || [];
  const googleAccounts = accounts?.data?.filter(acc => acc.app?.name_slug === 'google_sheets') || [];

  // Workflow: Slack Channel Members → Google Sheet
  const syncSlackToSheets = async () => {
    if (slackAccounts.length === 0 || googleAccounts.length === 0) {
      setError('You need both Slack and Google Sheets accounts connected');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('🔄 Starting Slack → Google Sheets workflow...');

      // Step 1: Get Slack channels
      console.log('📡 Fetching Slack channels...');
      const channelsResult = await apiService.makeAuthenticatedRequest(
        slackAccounts[0].id,
        'conversations.list',
        { method: 'GET' },
        currentUser
      );

      if (!channelsResult.ok) {
        throw new Error('Failed to get Slack channels: ' + channelsResult.error);
      }

      console.log('✅ Got Slack channels:', channelsResult.channels.length);

      // Step 2: Create Google Sheet with channel data
      console.log('📊 Creating new Google Sheet...');
      const sheetResult = await apiService.makeAuthenticatedRequest(
        googleAccounts[0].id,
        'https://sheets.googleapis.com/v4/spreadsheets',
        {
          method: 'POST',
          data: {
            properties: {
              title: `Slack Channels Export - ${new Date().toLocaleDateString()}`
            },
            sheets: [{
              properties: {
                title: 'Channels',
                gridProperties: {
                  rowCount: 100,
                  columnCount: 10
                }
              }
            }]
          }
        },
        currentUser
      );

      if (!sheetResult.spreadsheetId) {
        throw new Error('Failed to create Google Sheet');
      }

      console.log('✅ Created Google Sheet:', sheetResult.spreadsheetId);
      console.log('📊 Sheet details:', sheetResult);
      
      // Get the sheet ID from the creation response
      const firstSheet = sheetResult.sheets?.[0];
      const sheetId = firstSheet?.properties?.sheetId || 0;
      console.log('📊 Using sheet ID:', sheetId, 'for sheet:', firstSheet?.properties?.title);

      // Step 3: Prepare channel data
      const channelRows = [
        ['Channel Name', 'Channel ID', 'Members Count', 'Created Date', 'Is Private'], // Header
        ...channelsResult.channels.slice(0, 20).map(channel => [
          channel.name || 'N/A',
          channel.id || 'N/A',
          channel.num_members ? channel.num_members.toString() : 'N/A',
          channel.created ? new Date(channel.created * 1000).toLocaleDateString() : 'N/A',
          channel.is_private ? 'Yes' : 'No'
        ])
      ];

      console.log('📝 Channel data to add:', channelRows);
      console.log('📝 Number of rows:', channelRows.length);
      console.log('📝 First few rows:', channelRows.slice(0, 3));

      console.log('📝 Adding data to sheet...');
      
      // Use batchUpdate method which is more reliable for multi-row data
      const batchResult = await apiService.makeAuthenticatedRequest(
        googleAccounts[0].id,
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetResult.spreadsheetId}:batchUpdate`,
        {
          method: 'POST',
          data: {
            requests: [{
              updateCells: {
                start: {
                  sheetId: sheetId,  // Use the actual sheet ID
                  rowIndex: 0, // Start at row 0 (A1)
                  columnIndex: 0 // Start at column 0 (A)
                },
                rows: channelRows.map(row => ({
                  values: row.map(cell => ({
                    userEnteredValue: {
                      stringValue: cell.toString()
                    }
                  }))
                })),
                fields: 'userEnteredValue'
              }
            }]
          }
        },
        currentUser
      );
      
      console.log('📝 Batch update result:', batchResult);
      
      if (batchResult.replies && batchResult.replies.length > 0) {
        console.log('✅ Batch update successful - data written to sheet');
      } else {
        console.log('⚠️ Batch update completed but no replies received');
      }

      // Step 5: Verify data was written by reading it back
      console.log('🔍 Verifying data was written...');
      setTimeout(async () => {
        try {
          const verifyResult = await apiService.makeAuthenticatedRequest(
            googleAccounts[0].id,
            `https://sheets.googleapis.com/v4/spreadsheets/${sheetResult.spreadsheetId}/values/A1:E10`,
            { method: 'GET' },
            currentUser
          );
          
          console.log('🔍 Verification result:', verifyResult);
          if (verifyResult.values && verifyResult.values.length > 1) {
            console.log('✅ Data verification successful! Found', verifyResult.values.length, 'rows');
            console.log('Header row:', verifyResult.values[0]);
            console.log('First data row:', verifyResult.values[1]);
          } else if (verifyResult.values && verifyResult.values.length === 1) {
            console.log('⚠️ Only header row found - data may not have been written');
            console.log('Found data:', verifyResult.values[0]);
          } else {
            console.log('⚠️ Data verification failed - no data found in sheet');
          }
        } catch (verifyError) {
          console.log('⚠️ Could not verify data:', verifyError.message);
        }
      }, 2000); // Wait 2 seconds for Google Sheets to process

      console.log('✅ Workflow completed successfully!');
      setSuccess(`Workflow completed! Check your Google Sheet: https://docs.google.com/spreadsheets/d/${sheetResult.spreadsheetId}/edit`);
      setTimeout(() => setSuccess(null), 10000); // Show for 10 seconds

    } catch (err) {
      console.error('❌ Workflow failed:', err);
      setError('Workflow failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Workflow: Contact Form → Slack Notification
  const processContactForm = async () => {
    if (slackAccounts.length === 0) {
      setError('You need a Slack account connected');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('📋 Processing contact form...');

      // Simulate contact form data
      const formData = {
        name: 'Test User',
        email: 'test@example.com',
        message: 'This is a test contact form submission from Pipedream Connect!',
        timestamp: new Date().toISOString()
      };

      // Send to Slack
      const slackResult = await apiService.makeAuthenticatedRequest(
        slackAccounts[0].id,
        'chat.postMessage',
        {
          method: 'POST',
          data: {
            channel: 'general',
            text: `📋 *New Contact Form Submission*\n\n*Name:* ${formData.name}\n*Email:* ${formData.email}\n*Message:* ${formData.message}\n*Time:* ${new Date(formData.timestamp).toLocaleString()}`
          }
        },
        currentUser
      );

      if (!slackResult.ok) {
        throw new Error('Failed to send Slack message: ' + slackResult.error);
      }

      console.log('✅ Contact form processed successfully!');
      setSuccess('Contact form processed successfully! Check your Slack #general channel.');
      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      console.error('❌ Contact form processing failed:', err);
      setError('Contact form processing failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ backgroundColor: '#fef7f0' }}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        🔄 Workflow Automation
      </h3>

      {/* Connection Status */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Connected Apps:</h4>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ 
            padding: '0.75rem', 
            borderRadius: '6px',
            backgroundColor: slackAccounts.length > 0 ? '#dcfce7' : '#fef2f2',
            color: slackAccounts.length > 0 ? '#166534' : '#991b1b',
            border: '1px solid',
            borderColor: slackAccounts.length > 0 ? '#bbf7d0' : '#fecaca'
          }}>
            💬 Slack: {slackAccounts.length > 0 ? '✅ Connected' : '❌ Not Connected'}
          </div>
          <div style={{ 
            padding: '0.75rem', 
            borderRadius: '6px',
            backgroundColor: googleAccounts.length > 0 ? '#dcfce7' : '#fef2f2',
            color: googleAccounts.length > 0 ? '#166534' : '#991b1b',
            border: '1px solid',
            borderColor: googleAccounts.length > 0 ? '#bbf7d0' : '#fecaca'
          }}>
            📊 Google Sheets: {googleAccounts.length > 0 ? '✅ Connected' : '❌ Not Connected'}
          </div>
        </div>
      </div>

      {/* Workflow Actions */}
      <div className="form-group">
        <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Available Workflows:</h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Slack to Sheets Workflow */}
          <div style={{ 
            border: '1px solid #e5e5e5', 
            borderRadius: '8px', 
            padding: '1rem',
            backgroundColor: 'white'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h5 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  📊 Slack Channels → Google Sheets
                </h5>
                <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                  Export your Slack channels to a new Google Spreadsheet with channel details
                </p>
                <div style={{ fontSize: '0.75rem', color: '#888' }}>
                  Creates spreadsheet • Adds channel data • Includes member counts
                </div>
              </div>
              <button 
                onClick={syncSlackToSheets}
                disabled={loading || slackAccounts.length === 0 || googleAccounts.length === 0}
                className="btn btn-purple"
                style={{ minWidth: '120px' }}
              >
                {loading ? 'Running...' : '🚀 Run Workflow'}
              </button>
            </div>
          </div>

          {/* Contact Form Workflow */}
          <div style={{ 
            border: '1px solid #e5e5e5', 
            borderRadius: '8px', 
            padding: '1rem',
            backgroundColor: 'white'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h5 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  📋 Contact Form → Slack Notification
                </h5>
                <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                  Simulate a contact form submission with Slack notification
                </p>
                <div style={{ fontSize: '0.75rem', color: '#888' }}>
                  Sends formatted message to #general channel
                </div>
              </div>
              <button 
                onClick={processContactForm}
                disabled={loading || slackAccounts.length === 0}
                className="btn btn-green"
                style={{ minWidth: '120px' }}
              >
                {loading ? 'Running...' : '📤 Test Form'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {loading && (
        <div className="loading">
          ⏳ Running workflow automation...
        </div>
      )}

      {success && (
        <div className="success">
          ✅ {typeof success === 'string' ? success : 'Workflow completed successfully! Check your Google Sheets and Slack channels.'}
        </div>
      )}

      {error && (
        <div className="error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Instructions */}
      <div style={{ 
        backgroundColor: '#f8fafc', 
        padding: '1rem', 
        borderRadius: '6px',
        fontSize: '0.875rem',
        marginTop: '1.5rem',
        border: '1px solid #e2e8f0'
      }}>
        <strong>💡 How workflows work:</strong>
        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem', lineHeight: '1.6' }}>
          <li>Each workflow runs a sequence of API calls automatically</li>
          <li>Data flows between your connected apps in real-time</li>
          <li>Check the browser console for detailed workflow logs</li>
          <li>Results appear in your actual Google Sheets and Slack channels</li>
        </ul>
      </div>
    </div>
  );
}

export default WorkflowAutomation;