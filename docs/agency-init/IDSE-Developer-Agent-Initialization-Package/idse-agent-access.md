## 🌐 5. idse-agent-access.md

### MCP Server Integration

The IDSE Developer Agent exposes its functionality via an **MCP-compatible API**, allowing IDEs and other Swarm nodes to call its tools directly.

#### Example Endpoints

| Endpoint       | Method | Description                                            |
| -------------- | ------ | ------------------------------------------------------ |
| `/mcp/tools`   | GET    | List all callable tools                                |
| `/mcp/execute` | POST   | Execute any defined tool (e.g., `create_spec`)         |
| `/mcp/status`  | GET    | Returns agent health and constitution compliance state |

#### Example Call

```bash
curl -X POST http://localhost:8801/mcp/execute \
     -H "Content-Type: application/json" \
     -d '{"tool": "create_spec", "inputs": {"intent_file": "./intents/current/intent.md", "context_file": "./contexts/current/context.md"}}'
```

#### Response

```json
{
  "status": "success",
  "output": "./specs/current/spec.md",
  "timestamp": "2025-12-10T01:42:00Z"
}
```

---

### IDE / External Integration Examples

| Integration            | Usage                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------- |
| **VS Code Copilot**    | Connect via MCP extension to invoke IDSE tools directly from workspace.               |
| **Claude / Anthropic** | Contextualize this agent as a co-developer by referencing `AGENT_INIT_README.md`.     |
| **Agency Swarm**       | Load manifest directly; Swarm runtime will register this as a single cognitive agent. |
| **Agencii Cloud**      | Deploy via GitHub App integration; will run in managed Swarm instance automatically.  |

---

### 🧾 Summary

✅ Files for initial commit:

```
/docs/agency-init/IDSE-Developer-Agent-Initialization-Package/
│
├── AGENT_INIT_README.md
├── idse-developer-agent.manifest.yaml
├── idse-agent-tools.json
├── idse-agent-init-sequence.md
└── idse-agent-access.md
```

✅ Outcome:
Once Agency Swarm or Cursor loads this package:

* It creates the **IDSE Developer Agent** as an autonomous, constitutionally governed system.
* It can be queried, instructed, and extended through MCP, CLI, or orchestration APIs.
* It begins its first intent-context cycle interactively with the human developer.
