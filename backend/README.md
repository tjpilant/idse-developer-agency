# IDSE Developer Agency Backend

Multi-protocol backend supporting embeddable chat widgets and admin interfaces for the IDSE Developer Agency.

## Architecture

### Multi-Protocol Support

The backend provides two parallel protocol implementations:

1. **AG-UI Protocol** (`/admin/ag-ui/*`)
   - Admin interface for monitoring and testing
   - Built on Agency Swarm's native `AguiAdapter`
   - Event streaming and message conversion

2. **CopilotKit Protocol** (`/api/copilot/*`)
   - Embeddable chat widgets for external websites
   - Custom `CopilotAdapter` bridging to Agency Swarm
   - WebSocket support for real-time streaming

## Directory Structure

```
backend/
├── __init__.py              # Package initialization
├── main.py                  # FastAPI application
├── README.md                # This file
├── adapters/
│   ├── __init__.py
│   └── copilot_adapter.py   # CopilotKit protocol adapter
└── routes/
    ├── __init__.py
    ├── agui_routes.py       # AG-UI endpoints
    ├── copilot_routes.py    # CopilotKit endpoints
    └── puck_routes.py       # Puck page storage endpoints
```

## Installation

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

Required packages:
- `agency-swarm[fastapi]>=1.2.1`
- `fastapi`
- `uvicorn`
- `ag-ui-protocol>=0.1.0`
- `python-multipart`
- `websockets`

### 2. Environment Configuration

Create or update `.env` file:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

## Running the Backend

### Method 1: Via agency.py (Recommended)

**Start Web Server:**
```bash
python agency.py --mode web
```

**Start on Custom Port:**
```bash
python agency.py --mode web --port 3000
```

**Production Mode (No Auto-Reload):**
```bash
python agency.py --mode web --no-reload
```

**CLI Mode (Original):**
```bash
python agency.py --mode cli
```

### Admin Shell (Puck + Status Browser)
- The admin UI is provided by the React/Vite app in `frontend/widget/` and includes the Puck editor shell plus the Status Browser tab (enabled when `VITE_STATUS_BROWSER_ENABLED` is not `false`).
- Run it in another terminal:
  ```bash
  cd frontend/widget
  npm install
  npm run dev  # Vite dev server (default port 5173; set VITE_API_BASE to point at your backend)
  ```
- Point the frontend at the backend web server via `VITE_API_BASE` (e.g., `http://localhost:8000`). Use `--port` on `agency.py --mode web` if you need a different backend port.
- Admin tools (Puck, Status Browser) are configured and accessed from this shell; the backend only serves the APIs (`/admin/ag-ui`, `/api/copilot`, `/api/pages`, `/status*`).

### Method 2: Direct Uvicorn

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

### Root Endpoints

- **GET /** - Service information and health check
- **GET /health** - Detailed health status
- **GET /docs** - Interactive API documentation (Swagger UI)

### AG-UI Protocol Endpoints

Base path: `/admin/ag-ui`

- **GET /admin/ag-ui/** - Protocol information
- **POST /admin/ag-ui/events** - Process AG-UI events
- **POST /admin/ag-ui/messages** - Convert AG-UI messages
- **POST /admin/ag-ui/chat** - Chat with agent via AG-UI
- **GET /admin/ag-ui/status** - Protocol status

### CopilotKit Protocol Endpoints

Base path: `/api/copilot`

- **GET /api/copilot/** - Protocol information
- **WS /api/copilot/ws** - WebSocket for real-time chat
- **POST /api/copilot/chat** - HTTP chat endpoint
- **POST /api/copilot/stream** - Streaming chat responses
- **GET /api/copilot/status** - Protocol status
- **GET /api/copilot/config** - Widget configuration
- **POST /api/copilot/feedback** - Collect user feedback

### Puck Page Builder Endpoints

Base path: `/api/pages`

- **GET /api/pages/** - List stored Puck pages
- **POST /api/pages/** - Create a new Puck page (JSON payload)
- **GET /api/pages/{id}** - Fetch a Puck page by id
- **PUT /api/pages/{id}** - Update a Puck page
- **DELETE /api/pages/{id}** - Delete a Puck page

## Usage Examples

### AG-UI Admin Interface

```python
import requests

# Send chat message via AG-UI
response = requests.post(
    "http://localhost:8000/admin/ag-ui/chat",
    json={"message": "Hello, how can you help me?"}
)

print(response.json())
```

### CopilotKit Widget (WebSocket)

```javascript
const ws = new WebSocket('ws://localhost:8000/api/copilot/ws');

ws.onopen = () => {
    ws.send(JSON.stringify({
        message: 'Hello from CopilotKit widget!'
    }));
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Response:', data);
};
```

### CopilotKit Widget (HTTP)

```javascript
fetch('http://localhost:8000/api/copilot/chat', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        message: 'What is IDSE?'
    })
})
.then(res => res.json())
.then(data => console.log(data));
```

## Development

### Testing the Backend

```bash
# Start development server with auto-reload
python agency.py --mode web

# In another terminal, test endpoints
curl http://localhost:8000/
curl http://localhost:8000/admin/ag-ui/status
curl http://localhost:8000/api/copilot/status
```

### View API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### CORS Configuration

The backend includes CORS middleware for widget embedding. For production, update `backend/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-domain.com"],  # Specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Deployment

### Agencii Cloud Deployment

The backend is designed for Agencii Cloud deployment:

1. **Push to GitHub**
2. **Connect to Agencii Cloud**
3. **Auto-deployment** will detect changes
4. **Widget URL**: `https://your-agency.agencii.ai/api/copilot/ws`

### Docker Deployment (Optional)

Create `Dockerfile` in project root:

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "agency.py", "--mode", "web", "--host", "0.0.0.0", "--port", "8000", "--no-reload"]
```

Build and run:

```bash
docker build -t idse-agency .
docker run -p 8000:8000 --env-file .env idse-agency
```

## Protocol Details

### CopilotKit Message Format

**Incoming Message:**
```json
{
  "message": "User question here",
  "timestamp": "2025-12-13T..."
}
```

**Outgoing Response:**
```json
{
  "type": "message",
  "role": "assistant",
  "content": "Agent response here",
  "timestamp": "2025-12-13T...",
  "metadata": {
    "agent": "IDSE Developer Agent",
    "protocol": "copilotkit"
  }
}
```

**Streaming Chunk:**
```json
{
  "type": "chunk",
  "delta": "partial text...",
  "is_final": false,
  "timestamp": "2025-12-13T..."
}
```

### AG-UI Event Format

See Agency Swarm documentation for AG-UI protocol details:
- Event types: TextMessage, ToolCall, MessagesSnapshot
- Built-in adapter handles conversion

## Troubleshooting

### Common Issues

**Import Errors:**
```bash
# Make sure you're in the project root
cd /home/tjpilant/projects/idse-developer-agency

# Reinstall dependencies
pip install -r requirements.txt
```

**Port Already in Use:**
```bash
# Use a different port
python agency.py --mode web --port 3000
```

**WebSocket Connection Refused:**
- Check CORS settings in `backend/main.py`
- Ensure firewall allows WebSocket connections
- Verify WebSocket URL uses `ws://` or `wss://` protocol

**AG-UI Protocol Not Found:**
```bash
pip install ag-ui-protocol
```

## Next Steps

1. **Test Backend**: Run `python agency.py --mode web` and visit http://localhost:8000/docs
2. **Build Frontend**: See `frontend/widget/README.md` for CopilotKit + Pagedone setup
3. **Deploy to Agencii**: Push to GitHub and connect to Agencii Cloud
4. **Embed Widget**: Add widget script to external websites

## Support

For issues or questions:
- Check API docs: http://localhost:8000/docs
- Review logs for error details
- Ensure all dependencies are installed
- Verify `.env` file has required keys

---

**Built with:**
- [Agency Swarm](https://github.com/VRSEN/agency-swarm) - Multi-agent framework
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [CopilotKit](https://copilotkit.ai/) - Chat widget integration
- [IDSE Framework](https://github.com/tjpilant/idse-developer-agent) - Intent-driven engineering
