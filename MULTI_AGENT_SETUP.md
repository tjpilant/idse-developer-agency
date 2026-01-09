# Multi-Agent Agency Setup - Working Configuration

## Status: ✅ WORKING

Your multi-agent Agency Swarm setup is now fully operational with proper agent-to-agent handoffs.

## How It Works

### Architecture

```
User → IDSE Developer Agent
         ↓ (detects component keywords)
         ↓ (calls transfer_to_ComponentDesigner)
         ↓
      ComponentDesigner Agent ✅
         ↓ (processes component design)
         ↓ (responds to user)
         ↓
      User receives response
```

### Key Configuration

**1. Agency Setup ([agency.py](agency.py:159-166))**
```python
agency = Agency(
    idse_developer_agent,  # Entry point
    communication_flows=[
        (idse_developer_agent, component_designer_agent),  # Forward handoff
        (component_designer_agent, idse_developer_agent),  # Return handoff
    ],
    send_message_tool_class=SendMessageHandoff,  # Creates handoff tools
)
```

**2. Agent Configuration**
- Agents DON'T need `handoffs=[]` parameter
- Framework automatically creates `transfer_to_<AgentName>` tools from `communication_flows`
- Models set to `gpt-4o-mini` (valid model name)

**3. Instructions ([instructions.md](idse_developer_agent/instructions.md:100-114))**
- References `transfer_to_ComponentDesigner` tool (auto-created by framework)
- Specifies component-related keywords that trigger delegation
- Clear delegation workflow for the LLM to follow

## What Was Fixed

### Problem 1: Missing SendMessageHandoff Configuration
**Before:**
```python
Agent(...) # No send_message_tool_class
Agency(...) # No send_message_tool_class
```

**After:**
```python
Agency(
    idse_developer_agent,
    communication_flows=[...],
    send_message_tool_class=SendMessageHandoff,  # ✅ Added
)
```

### Problem 2: Invalid Model Names
**Before:** `model="gpt-5-mini"` (doesn't exist)
**After:** `model="gpt-4o-mini"` ✅

### Problem 3: Incompatible Model Settings
**Before:** `reasoning=Reasoning(effort="medium", summary="auto")` (not supported by gpt-4o-mini)
**After:** Removed reasoning parameter ✅

### Problem 4: Custom Routing Tools
**Before:** Used `RouteToComponentDesigner` custom tool (doesn't get `agents` dict injected)
**After:** Use framework-generated `transfer_to_ComponentDesigner` tool ✅

## How the Framework Works

### Handoff Tool Creation

When you define communication_flows:
```python
communication_flows = [
    (idse_developer_agent, component_designer_agent),
]
```

Agency Swarm automatically creates:
- Tool name: `transfer_to_ComponentDesigner`
- Tool type: `HandoffCallItem`
- Behavior: Transfers conversation to ComponentDesigner agent

### No Manual Tool Implementation Needed

❌ **Don't do this:**
```python
# Don't create custom routing tools
class RouteToComponentDesigner(BaseTool):
    def run(self):
        self.send_message(...)  # Won't work - agents dict not injected
```

✅ **Do this instead:**
```python
# Let framework create handoff tools from communication_flows
# Reference them in instructions as transfer_to_ComponentDesigner
```

## Testing

### Quick Test
```bash
python test_direct_delegation.py
```

Expected output:
```
Creating agency...
Agents in agency:
  - IDSE Developer Agent
  - ComponentDesigner

Final output:
Let's define the variants for your Button component...
[ComponentDesigner's clarifying questions]
```

### CLI Test
```bash
python agency.py --mode cli
```

Try: `"Help me design a button component with primary and secondary variants"`

You should see ComponentDesigner take over and ask for design details.

## File Changes Summary

| File | Changes |
|------|---------|
| [agency.py](agency.py) | Added `send_message_tool_class=SendMessageHandoff` |
| [idse_developer_agent.py](idse_developer_agent/idse_developer_agent.py) | Fixed model name, removed reasoning parameter |
| [component_designer_agent.py](idse_developer_agent/component_designer_agent/component_designer_agent.py) | Fixed model name |
| [instructions.md](idse_developer_agent/instructions.md) | Updated to reference `transfer_to_ComponentDesigner` |

## Key Learnings

1. **Agency Swarm v1.0.0 uses OpenAI Agents SDK handoff system**
   - Handoffs are configured via `communication_flows` in Agency
   - Framework auto-creates `transfer_to_<AgentName>` tools
   - No need to manually implement routing tools

2. **SendMessageHandoff is required**
   - Must be set on Agency level: `send_message_tool_class=SendMessageHandoff`
   - Enables the framework to create proper handoff tools

3. **Custom routing tools don't work**
   - Framework doesn't inject `agents` dict into custom BaseTool subclasses
   - Only framework-generated handoff tools have access to agent registry

4. **Model compatibility matters**
   - Use valid model names (`gpt-4o-mini` not `gpt-5-mini`)
   - Check model capabilities (reasoning parameter not supported on all models)

## References

- [OpenAI Agents SDK - Handoffs](https://openai.github.io/openai-agents-python/handoffs/)
- [OpenAI Agents SDK - Multi-Agent](https://openai.github.io/openai-agents-python/multi_agent/)
- Agency Swarm v1.0.0 Documentation

## Troubleshooting

### Handoff not working?

1. **Check communication_flows**: Ensure both agents are in the flows list
2. **Check send_message_tool_class**: Must be set on Agency
3. **Check instructions**: Reference correct tool name `transfer_to_<AgentName>`
4. **Check model names**: Use valid OpenAI model IDs

### Agent not found?

Verify both agents are imported in agency.py:
```python
from idse_developer_agent import component_designer_agent, idse_developer_agent
```

### Tool not appearing?

The framework creates handoff tools at Agency initialization. Check:
```python
runtime_state = agency.get_agent_runtime_state("IDSE Developer Agent")
print(runtime_state.handoffs)  # Should list ComponentDesigner
```

---

**Status:** Multi-agent delegation is working correctly as of 2026-01-09 ✅
