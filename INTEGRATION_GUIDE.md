# CopilotKit + AG-UI + Pagedone Integration Guide

Complete guide for integrating embeddable chat widgets with the IDSE Developer Agency.

## Overview

This integration provides:
- ✅ **Backend**: Multi-protocol FastAPI server with AG-UI and CopilotKit support
- 🚧 **Frontend**: React widget with CopilotKit + Tailwind CSS + Pagedone (Next Step)
- ☁️ **Deployment**: Agencii Cloud with widget embedding

## Current Status

### ✅ Phase 1: Backend Complete

**What's Been Implemented:**
- Multi-protocol FastAPI backend at `backend/`
- AG-UI routes for admin interfaces (`/admin/ag-ui/*`)
- CopilotKit routes for chat widgets (`/api/copilot/*`)
- WebSocket support for real-time streaming
- Updated `agency.py` with web server mode

**Files Created:**
```
backend/
├── main.py                  # FastAPI app with CORS
├── adapters/
│   └── copilot_adapter.py   # CopilotKit ↔ Agency Swarm bridge
├── routes/
│   ├── agui_routes.py       # AG-UI endpoints
│   └── copilot_routes.py    # CopilotKit endpoints
└── README.md                # Backend documentation
```

**Dependencies Added to requirements.txt:**
- `ag-ui-protocol>=0.1.0`
- `python-multipart`
- `websockets`

### 🚧 Phase 2: Frontend (Next Steps)

Need to create React chat widget with CopilotKit and Pagedone styling.

---

## Quick Start

### 1. Install Backend Dependencies

```bash
# Install Python dependencies
pip install -r requirements.txt
```

### 2. Start Backend Server

```bash
# Start web server (default port 8000)
python agency.py --mode web

# Or with custom port
python agency.py --mode web --port 3000
```

### 3. Test Backend

Visit these URLs:
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health
- AG-UI Status: http://localhost:8000/admin/ag-ui/status
- CopilotKit Status: http://localhost:8000/api/copilot/status

### 4. Test WebSocket

```bash
# Install websocat for testing
# https://github.com/vi/websocat

websocat ws://localhost:8000/api/copilot/ws
# Then type: {"message": "Hello!"}
```

---

## Next Steps: Frontend Setup

### Step 1: Create React Widget

```bash
# Create frontend directory
mkdir -p frontend/widget
cd frontend/widget

# Initialize React app with TypeScript
npx create-react-app . --template typescript
```

### Step 2: Install Dependencies

```bash
# Install CopilotKit
npm install @copilotkit/react-core @copilotkit/react-ui

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install Pagedone
npm install pagedone
```

### Step 3: Configure Tailwind CSS

**Update `tailwind.config.js`:**

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/pagedone/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**Update `src/index.css`:**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Import Pagedone styles */
@import 'pagedone/dist/css/pagedone.css';
```

### Step 4: Create Chat Widget Component

**Create `src/components/ChatWidget.tsx`:**

```typescript
import { CopilotKit } from '@copilotkit/react-core';
import { CopilotPopup } from '@copilotkit/react-ui';
import '@copilotkit/react-ui/styles.css';

interface ChatWidgetProps {
  apiUrl?: string;
}

export function ChatWidget({ apiUrl = 'http://localhost:8000/api/copilot' }: ChatWidgetProps) {
  return (
    <CopilotKit url={`${apiUrl}/chat`}>
      <CopilotPopup
        instructions="You are the IDSE Developer Agent. You help with software development using Intent-Driven Systems Engineering principles."
        defaultOpen={false}
        clickOutsideToClose={true}
        className="custom-copilot-popup"
      />
    </CopilotKit>
  );
}
```

### Step 5: Update App Component

**Update `src/App.tsx`:**

```typescript
import React from 'react';
import { ChatWidget } from './components/ChatWidget';
import './App.css';

function App() {
  return (
    <div className="App min-h-screen bg-gray-50">
      {/* Your app content here */}
      <header className="p-8">
        <h1 className="text-3xl font-bold text-gray-900">
          IDSE Developer Agency Demo
        </h1>
        <p className="text-gray-600 mt-2">
          Click the chat icon to interact with the IDSE Developer Agent
        </p>
      </header>

      {/* CopilotKit Chat Widget */}
      <ChatWidget apiUrl="http://localhost:8000/api/copilot" />
    </div>
  );
}

export default App;
```

### Step 6: Add Pagedone Styling (Optional)

**Create `src/components/StyledChatWidget.tsx` with Pagedone components:**

```typescript
import { CopilotKit } from '@copilotkit/react-core';
import { CopilotPopup } from '@copilotkit/react-ui';

export function StyledChatWidget() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <CopilotKit url="http://localhost:8000/api/copilot/chat">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 pd-card">
          <CopilotPopup
            instructions="You are the IDSE Developer Agent"
            defaultOpen={false}
          />
        </div>
      </CopilotKit>
    </div>
  );
}
```

### Step 7: Run Frontend

```bash
npm start
```

Visit: http://localhost:3000

---

## Widget Embedding for External Sites

### Option 1: Build Embeddable Script

**Create `src/embed.tsx`:**

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChatWidget } from './components/ChatWidget';

// Create widget container
const widgetContainer = document.createElement('div');
widgetContainer.id = 'idse-chat-widget-root';
document.body.appendChild(widgetContainer);

// Get API URL from script tag data attribute
const scriptTag = document.currentScript as HTMLScriptElement;
const apiUrl = scriptTag?.dataset.apiUrl || 'https://your-agency.agencii.ai/api/copilot';

// Render widget
const root = ReactDOM.createRoot(widgetContainer);
root.render(
  <React.StrictMode>
    <ChatWidget apiUrl={apiUrl} />
  </React.StrictMode>
);
```

**Build script:**

```bash
npm run build

# The built files will be in build/
# Deploy widget.js to your CDN or Agencii Cloud
```

### Option 2: Embed on External Sites

**Add to any website:**

```html
<!-- In your HTML -->
<script
  src="https://your-agency.agencii.ai/widget.js"
  data-api-url="https://your-agency.agencii.ai/api/copilot"
></script>
```

---

## Pagedone Component Examples

### Chat Message Bubble

```tsx
function MessageBubble({ message, isUser }: { message: string; isUser: boolean }) {
  return (
    <div className={`pd-card p-4 mb-2 ${isUser ? 'bg-blue-50' : 'bg-gray-50'}`}>
      <p className="text-gray-800">{message}</p>
    </div>
  );
}
```

### Input Bar with Pagedone Button

```tsx
function ChatInput({ onSend }: { onSend: (msg: string) => void }) {
  const [input, setInput] = React.useState('');

  return (
    <div className="flex gap-2 p-4">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="pd-input flex-1"
        placeholder="Type a message..."
      />
      <button
        onClick={() => onSend(input)}
        className="pd-button pd-button-primary"
      >
        Send
      </button>
    </div>
  );
}
```

**Note:** Pagedone classes are from https://pagedone.io/docs - refer to their documentation for full component list.

---

## Deployment to Agencii Cloud

### 1. Prepare Repository

```bash
# Commit all changes
git add .
git commit -m "Add CopilotKit + AG-UI + Pagedone integration"
git push origin main
```

### 2. Connect to Agencii Cloud

1. Go to https://agencii.ai
2. Connect your GitHub repository
3. Agencii will auto-detect Agency Swarm configuration
4. Deploy automatically

### 3. Update Widget URLs

After deployment, update frontend to use production URLs:

```typescript
<ChatWidget apiUrl="https://your-agency.agencii.ai/api/copilot" />
```

### 4. Embed on External Sites

```html
<script src="https://your-agency.agencii.ai/widget.js"></script>
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     External Websites                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Website A  │  │  Website B  │  │  Website C  │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
│         │                 │                 │               │
│         └─────────────────┴─────────────────┘               │
│                           │                                 │
│                    CopilotKit Widget                        │
└───────────────────────────┼─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Agencii Cloud / Your Server                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            FastAPI Backend (agency.py)              │   │
│  │                                                      │   │
│  │  ┌──────────────────┐    ┌──────────────────────┐  │   │
│  │  │   AG-UI Routes   │    │  CopilotKit Routes   │  │   │
│  │  │  /admin/ag-ui/*  │    │   /api/copilot/*     │  │   │
│  │  └────────┬─────────┘    └──────────┬───────────┘  │   │
│  │           │                          │              │   │
│  │           └──────────┬───────────────┘              │   │
│  │                      │                              │   │
│  │              ┌───────▼────────┐                     │   │
│  │              │ IDSE Developer │                     │   │
│  │              │     Agent      │                     │   │
│  │              └────────────────┘                     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Testing Checklist

### Backend Tests

- [ ] Start server: `python agency.py --mode web`
- [ ] Visit http://localhost:8000/docs
- [ ] Test AG-UI status: http://localhost:8000/admin/ag-ui/status
- [ ] Test CopilotKit status: http://localhost:8000/api/copilot/status
- [ ] Test WebSocket connection
- [ ] Send test message via HTTP POST

### Frontend Tests

- [ ] Create React app
- [ ] Install CopilotKit + Tailwind + Pagedone
- [ ] Build chat widget component
- [ ] Test chat functionality
- [ ] Verify Pagedone styling
- [ ] Build embeddable script
- [ ] Test on external site

### Integration Tests

- [ ] Backend ↔ Frontend communication
- [ ] WebSocket streaming
- [ ] Error handling
- [ ] CORS configuration
- [ ] Widget embedding

---

## Troubleshooting

### Backend Issues

**Port in use:**
```bash
python agency.py --mode web --port 3000
```

**Module not found:**
```bash
pip install -r requirements.txt
```

**CORS errors:**
- Update `backend/main.py` CORS settings with your domain

### Frontend Issues

**CopilotKit not connecting:**
- Check API URL in widget props
- Verify backend is running
- Check browser console for errors

**Pagedone styles not loading:**
```bash
npm install pagedone
# Add to tailwind.config.js content array
```

**Build errors:**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Resources

- **Backend Documentation**: [backend/README.md](backend/README.md)
- **CopilotKit Docs**: https://docs.copilotkit.ai/
- **Pagedone Docs**: https://pagedone.io/docs
- **Agency Swarm**: https://github.com/VRSEN/agency-swarm
- **Agencii Cloud**: https://agencii.ai

---

## Summary

**Phase 1 Complete:** ✅
- Multi-protocol backend with AG-UI and CopilotKit support
- WebSocket streaming
- CORS configured for widget embedding

**Phase 2 Next:** 🚧
- Create React widget with CopilotKit
- Style with Tailwind CSS + Pagedone
- Build embeddable script
- Deploy to Agencii Cloud

**Answer to Your Question:**
YES, CopilotKit + AG-UI + Pagedone will significantly enhance your frontend usage for chatbot widgets on external websites. The backend is ready - now build the React frontend!
