# Pipedream Connect Test Project

This React application demonstrating **Pipedream Connect's managed authentication system**. This project shows how to integrate OAuth flows for 2,500+ APIs, make authenticated requests, and build user-friendly connection experiences.

## 🎯 Project Motivation

**Why this project exists:**
- **Learn Pipedream Connect** - Understand how managed OAuth works at scale
- **Real-world integration patterns** - See how to handle user account connections in production
- **API testing playground** - Experiment with authenticated API calls safely
- **Foundation for future projects** - Reusable patterns for any OAuth integration

## ✨ Features

### 🔐 **Managed Authentication**
- Generate secure, user-scoped connection tokens
- Complete OAuth flows for Slack, Google Sheets, Gmail, GitHub
- Automatic token refresh and credential management
- User-friendly connection interface

### 🧪 **API Testing Lab**
- Make authenticated API calls to connected services
- Pre-built actions for common operations
- Custom API endpoint testing
- Real-time response inspection

### 💬 **Slack Integration Demo**
- Send messages to channels
- List channels and team info
- Get user profiles
- Full Slack API access

### 🏗️ **Production-Ready Patterns**
- Backend proxy for secure credential handling
- Error handling and user feedback
- Clean React component architecture
- Environment-based configuration

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher) 
- **Pipedream account** with project created
- **OAuth credentials** from Pipedream dashboard

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd pipedream-connect-test

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies  
cd ../frontend
npm install
```

### 2. Configure Environment

Create `backend/.env`:
```env
PIPEDREAM_CLIENT_ID=your_client_id_here
PIPEDREAM_CLIENT_SECRET=your_client_secret_here
PIPEDREAM_PROJECT_ID=your_project_id_here
PIPEDREAM_ENVIRONMENT=development
PORT=3001
```

**🔑 Get these credentials:**
1. Go to [pipedream.com/projects](https://pipedream.com/projects)
2. Create/select your project → copy **Project ID**
3. Go to workspace **API settings** → create **OAuth client**

### 3. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
*Should show: 🚀 Backend server running on http://localhost:3001*

**Terminal 2 - Frontend:**
```bash
cd frontend  
npm run dev
```
*Should show: Local: http://localhost:5173/*

### 4. Test the Integration

1. **Open** http://localhost:5173/
2. **Verify** backend status shows "✅ Connected" 
3. **Generate** connect token
4. **Connect** a Slack account
5. **Send** a test message
6. **Explore** API testing features

## 📁 Project Structure

```
pipedream-connect-test/
├── backend/                    # Express server
│   ├── server.js              # Main server with Pipedream SDK
│   ├── package.json           # Backend dependencies
│   └── .env                   # Environment variables
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── TokenTester.jsx    # Token generation & account display
│   │   │   ├── UserManager.jsx    # User ID management
│   │   │   ├── ApiTester.jsx      # API testing interface
│   │   │   └── MessageSender.jsx  # Slack message sender
│   │   ├── services/
│   │   │   └── api.js             # Backend API wrapper
│   │   ├── App.jsx                # Main application
│   │   └── index.css              # Styles
│   └── package.json               # Frontend dependencies
└── README.md                      # This file
```

## 🔧 API Endpoints

### Backend Routes
- `GET /api/health` - Server health check
- `POST /api/connect-token` - Generate user connect token  
- `GET /api/accounts/:userId` - List user's connected accounts
- `POST /api/proxy/:accountId` - Proxy authenticated API requests

### Supported Apps
- **Slack** - Messaging, channels, team info
- **Google Sheets** - Spreadsheet operations  
- **Gmail** - Email sending and reading
- **GitHub** - Repository and user data
- *Easily extensible to 2,500+ other apps*
