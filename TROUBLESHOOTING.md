# Troubleshooting Agency Hang Issue

## Quick Diagnostic Tests

### Test 1: Check if basic terminal input works
```bash
python3 test_hang.py
```
If this hangs, the issue is with your terminal/VSCode setup, not the agency.

### Test 2: Check Python version and location
```bash
which python3
python3 --version
which python
```

### Test 3: Activate virtual environment first
```bash
source .venv/bin/activate
python agency.py
```

### Test 4: Run with explicit interpreter
```bash
.venv/bin/python agency.py
```

### Test 5: Check for background processes
```bash
ps aux | grep python
# Kill any hanging python processes
```

## Common Issues and Solutions

### Issue 1: Wrong Python interpreter
**Symptom:** Hangs at startup or during initialization

**Solution:** Make sure you're using the venv Python:
```bash
source .venv/bin/activate
# Your prompt should show (.venv) prefix
python agency.py
```

### Issue 2: VSCode terminal buffering
**Symptom:** No output visible, appears frozen

**Solution:**
1. Close the terminal tab in VSCode
2. Open a new terminal (Terminal → New Terminal)
3. Run: `source .venv/bin/activate && python agency.py`

### Issue 3: Input not working
**Symptom:** Prompt appears but keyboard input doesn't work

**Solution:**
- Try clicking in the terminal window first
- Press Ctrl+C to confirm terminal is responsive
- Use external terminal instead: `gnome-terminal -- bash -c 'source .venv/bin/activate && python agency.py; exec bash'`

### Issue 4: Agency initialization slow
**Symptom:** Hangs at "Starting agency initialization..."

**Solution:**
- Check your internet connection (OpenAI API calls)
- Verify your API key: `cat .env | grep OPENAI_API_KEY`
- Check API key is valid at https://platform.openai.com/api-keys

### Issue 5: Model doesn't exist
**Symptom:** Hangs or errors about model

**Current model:** gpt-5.1 (this may not exist!)

**Solution:** Edit idse_developer_agent/idse_developer_agent.py and change model to:
- `gpt-4-turbo` or
- `gpt-4` or
- `gpt-3.5-turbo`

## Best Practice: Run with timeout to test
```bash
timeout 30 python3 agency.py
```
If it times out after 30 seconds, something is definitely hanging.

## Manual Test Commands
Run these one by one to isolate the issue:

```bash
# 1. Test imports
python3 -c "from agency_swarm import Agency; print('OK')"

# 2. Test env loading
python3 -c "from dotenv import load_dotenv; import os; load_dotenv(); print('Key exists:', bool(os.getenv('OPENAI_API_KEY')))"

# 3. Test agent import
python3 -c "from idse_developer_agent import idse_developer_agent; print('Agent:', idse_developer_agent.name)"

# 4. Test agency creation (this is where it might hang)
timeout 30 python3 -c "
from dotenv import load_dotenv
from agency_swarm import Agency
from idse_developer_agent import idse_developer_agent
load_dotenv()
print('Creating agency...')
agency = Agency(idse_developer_agent, communication_flows=[], name='Test', shared_instructions='shared_instructions.md')
print('Success! Agency created.')
"
```

## Report Back
After running these tests, note which one hangs and report:
1. Which test command hangs?
2. Do you see "Starting agency initialization..." or does it hang before that?
3. Are you in the virtual environment? (check for `.venv` prefix in prompt)
4. What does `echo $TERM` output?
