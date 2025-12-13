# Puck Page Builder Integration Guide

Complete guide for integrating Puck visual page builder with CopilotKit chat widgets and Pagedone components.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Puck Visual Editor                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Drag & Drop Interface                                   │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐ │  │
│  │  │  Pagedone  │  │ CopilotKit │  │  Custom Components │ │  │
│  │  │ Components │  │   Widget   │  │                    │ │  │
│  │  └────────────┘  └────────────┘  └────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                     │
│                           ▼                                     │
│                      JSON Output                                │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              Backend (Agency Swarm + FastAPI)                   │
│  ┌──────────────────┐    ┌──────────────────────────────────┐  │
│  │  Puck Pages API  │    │  CopilotKit Chat API            │  │
│  │  /api/pages/*    │    │  /api/copilot/*                 │  │
│  └──────────────────┘    └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Use Cases

### 1. **Admin Dashboard with Visual Editor**
- Build custom dashboards using Puck
- Embed CopilotKit chat widget in any page
- Style with Pagedone components
- Save/load page configurations as JSON

### 2. **Customer-Facing Landing Pages**
- Let users visually design their own pages
- Include chat widget component
- Customize layout and styling
- Deploy to external sites

### 3. **Widget Configuration Pages**
- Visual editor for chat widget customization
- Preview changes in real-time
- Export widget configurations
- Share embeddable code

## Installation

### Step 1: Install Puck

```bash
cd frontend/widget
npm install @measured/puck
```

### Step 2: Install Additional Dependencies

```bash
# If not already installed
npm install @copilotkit/react-core @copilotkit/react-ui
npm install pagedone
npm install -D tailwindcss postcss autoprefixer
```

### Step 3: Project Structure

```
frontend/
├── widget/
│   ├── src/
│   │   ├── puck/
│   │   │   ├── config.tsx          # Puck configuration
│   │   │   ├── components/          # Custom Puck components
│   │   │   │   ├── ChatWidget.tsx   # CopilotKit wrapper
│   │   │   │   ├── Hero.tsx         # Pagedone hero section
│   │   │   │   ├── Card.tsx         # Pagedone card
│   │   │   │   └── Button.tsx       # Pagedone button
│   │   │   ├── PuckEditor.tsx       # Main editor component
│   │   │   └── PuckRenderer.tsx     # Page renderer
│   │   ├── App.tsx
│   │   └── index.tsx
│   └── package.json
```

## Implementation

### 1. Create Puck Components

**Create `src/puck/components/ChatWidget.tsx`:**

```typescript
import { ComponentConfig } from '@measured/puck';
import { CopilotKit } from '@copilotkit/react-core';
import { CopilotPopup } from '@copilotkit/react-ui';
import '@copilotkit/react-ui/styles.css';

export interface ChatWidgetProps {
  apiUrl: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  primaryColor: string;
  title: string;
}

export const ChatWidget: ComponentConfig<ChatWidgetProps> = {
  fields: {
    apiUrl: {
      type: 'text',
      label: 'API URL',
    },
    position: {
      type: 'select',
      label: 'Position',
      options: [
        { label: 'Bottom Right', value: 'bottom-right' },
        { label: 'Bottom Left', value: 'bottom-left' },
        { label: 'Top Right', value: 'top-right' },
        { label: 'Top Left', value: 'top-left' },
      ],
    },
    primaryColor: {
      type: 'text',
      label: 'Primary Color',
    },
    title: {
      type: 'text',
      label: 'Widget Title',
    },
  },
  defaultProps: {
    apiUrl: 'http://localhost:8000/api/copilot',
    position: 'bottom-right',
    primaryColor: '#4F46E5',
    title: 'IDSE Developer Agent',
  },
  render: ({ apiUrl, position, primaryColor, title }) => {
    const positionClasses = {
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
    };

    return (
      <div className={`fixed ${positionClasses[position]} z-50`}>
        <CopilotKit url={`${apiUrl}/chat`}>
          <CopilotPopup
            instructions={`You are ${title}. Help users with software development.`}
            defaultOpen={false}
            labels={{
              title,
              initial: `Hi! I'm ${title}. How can I help?`,
            }}
          />
        </CopilotKit>
      </div>
    );
  },
};
```

**Create `src/puck/components/Hero.tsx` (Pagedone-styled):**

```typescript
import { ComponentConfig } from '@measured/puck';

export interface HeroProps {
  heading: string;
  subheading: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage?: string;
}

export const Hero: ComponentConfig<HeroProps> = {
  fields: {
    heading: { type: 'text', label: 'Heading' },
    subheading: { type: 'textarea', label: 'Subheading' },
    ctaText: { type: 'text', label: 'CTA Button Text' },
    ctaLink: { type: 'text', label: 'CTA Button Link' },
    backgroundImage: { type: 'text', label: 'Background Image URL' },
  },
  defaultProps: {
    heading: 'Welcome to IDSE Developer Agency',
    subheading: 'Build better software with AI-powered assistance',
    ctaText: 'Get Started',
    ctaLink: '#',
  },
  render: ({ heading, subheading, ctaText, ctaLink, backgroundImage }) => (
    <section
      className="relative py-20 bg-gradient-to-r from-indigo-600 to-purple-600"
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h1 className="text-5xl font-bold mb-6">{heading}</h1>
          <p className="text-xl mb-8 opacity-90">{subheading}</p>
          <a
            href={ctaLink}
            className="pd-button pd-button-lg bg-white text-indigo-600 hover:bg-gray-100"
          >
            {ctaText}
          </a>
        </div>
      </div>
    </section>
  ),
};
```

**Create `src/puck/components/Card.tsx` (Pagedone card):**

```typescript
import { ComponentConfig } from '@measured/puck';

export interface CardProps {
  title: string;
  description: string;
  icon?: string;
}

export const Card: ComponentConfig<CardProps> = {
  fields: {
    title: { type: 'text', label: 'Title' },
    description: { type: 'textarea', label: 'Description' },
    icon: { type: 'text', label: 'Icon (emoji or URL)' },
  },
  defaultProps: {
    title: 'Feature Title',
    description: 'Feature description goes here',
    icon: '🚀',
  },
  render: ({ title, description, icon }) => (
    <div className="pd-card p-6 hover:shadow-lg transition-shadow">
      {icon && <div className="text-4xl mb-4">{icon}</div>}
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  ),
};
```

### 2. Create Puck Configuration

**Create `src/puck/config.tsx`:**

```typescript
import { Config } from '@measured/puck';
import { ChatWidget } from './components/ChatWidget';
import { Hero } from './components/Hero';
import { Card } from './components/Card';

export const puckConfig: Config = {
  components: {
    ChatWidget,
    Hero,
    Card,
  },
  categories: {
    widgets: {
      components: ['ChatWidget'],
    },
    content: {
      components: ['Hero', 'Card'],
    },
  },
};
```

### 3. Create Puck Editor Component

**Create `src/puck/PuckEditor.tsx`:**

```typescript
import { Puck } from '@measured/puck';
import '@measured/puck/puck.css';
import { puckConfig } from './config';
import { useState } from 'react';

export function PuckEditor() {
  const [data, setData] = useState({
    content: [],
    root: {},
  });

  const handlePublish = async () => {
    // Save to backend
    const response = await fetch('http://localhost:8000/api/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Page published:', result);
      alert(`Page published! ID: ${result.id}`);
    }
  };

  return (
    <div className="h-screen">
      <Puck
        config={puckConfig}
        data={data}
        onChange={setData}
        onPublish={handlePublish}
      />
    </div>
  );
}
```

### 4. Create Puck Renderer

**Create `src/puck/PuckRenderer.tsx`:**

```typescript
import { Render } from '@measured/puck';
import { puckConfig } from './config';
import { useEffect, useState } from 'react';

interface PuckRendererProps {
  pageId?: string;
  data?: any;
}

export function PuckRenderer({ pageId, data: initialData }: PuckRendererProps) {
  const [data, setData] = useState(initialData);

  useEffect(() => {
    if (pageId && !initialData) {
      // Fetch page data from backend
      fetch(`http://localhost:8000/api/pages/${pageId}`)
        .then(res => res.json())
        .then(setData);
    }
  }, [pageId, initialData]);

  if (!data) return <div>Loading...</div>;

  return <Render config={puckConfig} data={data} />;
}
```

### 5. Update App Component

**Update `src/App.tsx`:**

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PuckEditor } from './puck/PuckEditor';
import { PuckRenderer } from './puck/PuckRenderer';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Puck Editor - Admin only */}
        <Route path="/editor" element={<PuckEditor />} />

        {/* Render published page */}
        <Route path="/page/:pageId" element={<PuckRenderer />} />

        {/* Default home page */}
        <Route path="/" element={
          <div className="min-h-screen bg-gray-50 p-8">
            <h1 className="text-3xl font-bold mb-4">IDSE Developer Agency</h1>
            <div className="space-y-4">
              <a href="/editor" className="pd-button pd-button-primary">
                Open Page Editor
              </a>
            </div>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

## Backend API for Puck Pages

### Add Puck Routes to Backend

**Create `backend/routes/puck_routes.py`:**

```python
"""
Puck Page Builder Routes

Handles saving and loading Puck page configurations.
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
import json
from pathlib import Path
import uuid

router = APIRouter()

# Simple file-based storage (replace with database in production)
PAGES_DIR = Path("data/puck_pages")
PAGES_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/")
async def create_page(page_data: Dict[str, Any]):
    """Save a new Puck page configuration"""
    page_id = str(uuid.uuid4())
    page_file = PAGES_DIR / f"{page_id}.json"

    page_data["id"] = page_id

    with open(page_file, "w") as f:
        json.dump(page_data, f, indent=2)

    return {"id": page_id, "status": "created"}


@router.get("/{page_id}")
async def get_page(page_id: str):
    """Get a Puck page configuration by ID"""
    page_file = PAGES_DIR / f"{page_id}.json"

    if not page_file.exists():
        raise HTTPException(status_code=404, detail="Page not found")

    with open(page_file, "r") as f:
        return json.load(f)


@router.put("/{page_id}")
async def update_page(page_id: str, page_data: Dict[str, Any]):
    """Update an existing Puck page"""
    page_file = PAGES_DIR / f"{page_id}.json"

    if not page_file.exists():
        raise HTTPException(status_code=404, detail="Page not found")

    page_data["id"] = page_id

    with open(page_file, "w") as f:
        json.dump(page_data, f, indent=2)

    return {"id": page_id, "status": "updated"}


@router.delete("/{page_id}")
async def delete_page(page_id: str):
    """Delete a Puck page"""
    page_file = PAGES_DIR / f"{page_id}.json"

    if not page_file.exists():
        raise HTTPException(status_code=404, detail="Page not found")

    page_file.unlink()
    return {"id": page_id, "status": "deleted"}


@router.get("/")
async def list_pages():
    """List all Puck pages"""
    pages = []

    for page_file in PAGES_DIR.glob("*.json"):
        with open(page_file, "r") as f:
            page_data = json.load(f)
            pages.append({
                "id": page_data.get("id"),
                "title": page_data.get("root", {}).get("title", "Untitled"),
            })

    return {"pages": pages}
```

**Update `backend/main.py` to include Puck routes:**

```python
# Add to register_routes() function
from backend.routes import puck_routes

app.include_router(
    puck_routes.router,
    prefix="/api/pages",
    tags=["Puck Pages"],
)
```

## Complete Integration Flow

### 1. **Admin Creates Page with Puck**
```
User → /editor → Puck Visual Editor
  ↓ Drag ChatWidget component
  ↓ Drag Hero section (Pagedone styled)
  ↓ Drag Card components (Pagedone styled)
  ↓ Configure chat widget settings
  ↓ Click "Publish"
  → POST /api/pages (saves JSON)
```

### 2. **Page is Rendered**
```
User → /page/:id → PuckRenderer
  ↓ GET /api/pages/:id (loads JSON)
  ↓ Render React components
  → ChatWidget connects to /api/copilot/ws
```

### 3. **User Chats with Widget**
```
User types message → CopilotKit
  → WebSocket /api/copilot/ws
  → CopilotAdapter → Agency Swarm
  → IDSE Developer Agent processes
  → Response streams back
```

## Example: Complete Landing Page

```typescript
// Example Puck data structure
const landingPageData = {
  content: [
    {
      type: 'Hero',
      props: {
        heading: 'AI-Powered Development Assistant',
        subheading: 'Get instant help with IDSE methodology',
        ctaText: 'Start Chatting',
        ctaLink: '#chat',
      },
    },
    {
      type: 'Card',
      props: {
        title: 'Intent-Driven Engineering',
        description: 'Build software with clear intent and purpose',
        icon: '🎯',
      },
    },
    {
      type: 'ChatWidget',
      props: {
        apiUrl: 'https://your-agency.agencii.ai/api/copilot',
        position: 'bottom-right',
        primaryColor: '#4F46E5',
        title: 'IDSE Assistant',
      },
    },
  ],
  root: {
    title: 'IDSE Landing Page',
  },
};
```

## Deployment

### Development

```bash
# Terminal 1: Backend
python agency.py --mode web

# Terminal 2: Frontend
cd frontend/widget
npm start
```

Visit:
- Editor: http://localhost:3000/editor
- Page: http://localhost:3000/page/:id

### Production (Agencii Cloud)

1. **Build Frontend:**
```bash
cd frontend/widget
npm run build
```

2. **Deploy Backend + Frontend:**
```bash
git add .
git commit -m "Add Puck page builder integration"
git push origin main
```

3. **Agencii auto-deploys** both backend and frontend

4. **Access:**
- Editor: `https://your-agency.agencii.ai/editor`
- Pages: `https://your-agency.agencii.ai/page/:id`

## Benefits of This Stack

✅ **Puck** - Visual page building without coding
✅ **CopilotKit** - Professional chat widget
✅ **Pagedone** - Beautiful Tailwind components
✅ **AG-UI** - Admin monitoring
✅ **Agency Swarm** - Powerful AI agent backend

## Resources

- **Puck Docs**: https://puckeditor.com/docs
- **Puck GitHub**: https://github.com/puckeditor/puck
- **CopilotKit**: https://docs.copilotkit.ai/
- **Pagedone**: https://pagedone.io/docs
- **Backend API**: http://localhost:8000/docs

---

**Next Steps:**
1. Install Puck: `npm install @measured/puck`
2. Create Puck components (ChatWidget, Hero, Card)
3. Set up editor and renderer
4. Add backend Puck routes
5. Test page building and chat functionality
6. Deploy to Agencii Cloud

This gives you the **ultimate flexibility**: visually design pages, embed chat widgets anywhere, and style everything with Pagedone components!
