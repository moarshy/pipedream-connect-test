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

// Proxy authenticated API requests
app.post('/api/proxy/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    const { endpoint, method = 'GET', data } = req.body;

    // Get account credentials
    const account = await pd.getAccount(accountId, { include_credentials: 1 });
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Build request based on the connected app
    let apiRequest;
    const credentials = account.credentials;
    const appName = account.app?.name_slug || account.app?.name || 'unknown';

    if (appName === 'slack') {
      apiRequest = {
        method,
        url: endpoint.startsWith('http') ? endpoint : `https://slack.com/api/${endpoint}`,
        headers: {
          'Authorization': `Bearer ${credentials.oauth_access_token}`,
          'Content-Type': 'application/json'
        },
        data: method !== 'GET' ? data : undefined,
        params: method === 'GET' ? data : undefined
      };
    } else if (appName === 'google_sheets') {
      apiRequest = {
        method,
        url: endpoint.startsWith('http') ? endpoint : `https://sheets.googleapis.com/v4/${endpoint}`,
        headers: {
          'Authorization': `Bearer ${credentials.oauth_access_token}`,
          'Content-Type': 'application/json'
        },
        data: method !== 'GET' ? data : undefined,
        params: method === 'GET' ? data : undefined
      };
    } else if (appName === 'gmail') {
      apiRequest = {
        method,
        url: endpoint.startsWith('http') ? endpoint : `https://gmail.googleapis.com/gmail/v1/${endpoint}`,
        headers: {
          'Authorization': `Bearer ${credentials.oauth_access_token}`,
          'Content-Type': 'application/json'
        },
        data: method !== 'GET' ? data : undefined,
        params: method === 'GET' ? data : undefined
      };
    } else {
      return res.status(400).json({ error: `App ${appName} not supported for proxy requests` });
    }

    // Make the API request
    const response = await axios(apiRequest);
    res.json(response.data);

  } catch (error) {
    console.error('Error in proxy request:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Proxy request failed',
      details: error.response?.data || error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.PIPEDREAM_ENVIRONMENT}`);
  console.log(`🔑 Project ID: ${process.env.PIPEDREAM_PROJECT_ID}`);
});