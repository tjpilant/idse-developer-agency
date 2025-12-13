# IDSE Widget Frontend (Puck + CopilotKit + Pagedone)

React + Vite + TypeScript app that lets you design pages with Puck, embed a CopilotKit chat widget, and style content with Tailwind/Pagedone utilities.

## Prerequisites
- Node 18+
- Backend running (defaults to `http://localhost:8000`)

## Install
```bash
cd frontend/widget
npm install
```

## Configure
- Create `.env` (optional) to override backend base:
```
VITE_API_BASE=http://localhost:8000
```

## Run
```bash
npm run dev
# http://localhost:3000
```

## Build
```bash
npm run build
npm run preview
```

## Key Paths
- `src/puck/components/` — Puck components (ChatWidget, Hero, Card)
- `src/puck/config.tsx` — Registers components for the editor/renderer
- `src/puck/PuckEditor.tsx` — Visual editor with publish to `/api/pages`
- `src/puck/PuckRenderer.tsx` — Renders saved pages by id
- `src/App.tsx` — Routes (`/`, `/editor`, `/page/:pageId`)

## Backend contracts
- `POST /api/pages` — Save Puck JSON (returns `{ id }`)
- `GET /api/pages/{id}` — Load a page JSON
- CopilotKit chat: `POST /api/copilot/chat`
- CopilotKit WebSocket: `WS /api/copilot/ws`

## Deploy (Agencii-ready)
- Build static assets: `npm run build`
- Serve `dist/` alongside the FastAPI backend (Agencii Cloud will host both)
- Update `VITE_API_BASE` to your deployed backend URL.
