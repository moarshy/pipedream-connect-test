require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { createBackendClient } = require('@pipedream/sdk/server');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Pipedream client
const pd = createBackendClient({
  environment: process.env.PIPEDREAM_ENVIRONMENT,
  credentials: {
    clientId: process.env.PIPEDREAM_CLIENT_ID,
    clientSecret: process.env.PIPEDREAM_CLIENT_SECRET,
  },
  projectId: process.env.PIPEDREAM_PROJECT_ID
});

// Test route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend is running!', timestamp: new Date().toISOString() });
});

// Generate connect token
app.post('/api/connect-token', async (req, res) => {
  try {
    const { external_user_id } = req.body;
    
    if (!external_user_id) {
      return res.status(400).json({ error: 'external_user_id is required' });
    }

    const result = await pd.createConnectToken({
      external_user_id: external_user_id,
    });

    res.json({
      token: result.token,
      expires_at: result.expires_at,
      connect_link_url: result.connect_link_url
    });
  } catch (error) {
    console.error('Error creating connect token:', error);
    res.status(500).json({ error: 'Failed to create connect token' });
  }
});

// Get accounts for a user
app.get('/api/accounts/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const accounts = await pd.getAccounts({
      external_user_id: userId,
      include_credentials: 1
    });

    res.json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

// Proxy authenticated API requests using Pipedream's built-in proxy
app.post('/api/proxy/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    const { endpoint, method = 'GET', data, external_user_id } = req.body;

    if (!external_user_id) {
      return res.status(400).json({ error: 'external_user_id is required' });
    }

    // Build the full URL for the API call
    let fullUrl;
    if (endpoint.startsWith('http')) {
      fullUrl = endpoint;
    } else {
      // Handle different app APIs
      if (endpoint.includes('sheets.googleapis.com') || endpoint.includes('drive.googleapis.com')) {
        // Google Sheets/Drive API - endpoint is already complete
        fullUrl = endpoint;
      } else if (endpoint.includes(':batchUpdate')) {
        // Google Sheets batchUpdate endpoint
        fullUrl = `https://sheets.googleapis.com/v4/${endpoint}`;
      } else if (endpoint.startsWith('spreadsheets') || endpoint.startsWith('files')) {
        // Google Sheets API endpoints
        if (endpoint.startsWith('spreadsheets') && !endpoint.includes('/')) {
          // Create spreadsheet
          fullUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
        } else if (endpoint.startsWith('files')) {
          // Google Drive API for listing files
          fullUrl = `https://www.googleapis.com/drive/v3/${endpoint}`;
        } else if (endpoint.includes('values')) {
          // Sheets values API
          fullUrl = `https://sheets.googleapis.com/v4/${endpoint}`;
        } else {
          fullUrl = `https://sheets.googleapis.com/v4/${endpoint}`;
        }
      } else {
        // Default to Slack API
        fullUrl = `https://slack.com/api/${endpoint}`;
      }
    }

    console.log('Making proxy request to:', fullUrl);

    // Use Pipedream's makeProxyRequest
    const proxyResponse = await pd.makeProxyRequest(
      {
        searchParams: {
          account_id: accountId,
          external_user_id: external_user_id,
        }
      },
      {
        url: fullUrl,
        options: {
          method: method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: method === 'POST' && data ? data : undefined,
        },
      }
    );

    // Handle the response based on its structure
    let responseData;
    if (proxyResponse.json && typeof proxyResponse.json === 'function') {
      responseData = await proxyResponse.json();
    } else if (proxyResponse.data) {
      responseData = proxyResponse.data;
    } else {
      responseData = proxyResponse;
    }

    res.json(responseData);

  } catch (error) {
    console.error('Proxy request failed:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Proxy request failed',
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.PIPEDREAM_ENVIRONMENT}`);
  console.log(`🔑 Project ID: ${process.env.PIPEDREAM_PROJECT_ID}`);
});