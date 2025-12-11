# How to Run the Agency CLI

## ✅ Correct Ways to Run:

```bash
# Method 1: Direct execution (EASIEST)
./agency.py

# Method 2: Use the run script
./run.sh

# Method 3: Activate venv first
source .venv/bin/activate
python agency.py

# Method 4: Use venv Python directly
.venv/bin/python agency.py
```

## ❌ This Will HANG:
```bash
python3 agency.py  # ← WRONG! Uses system Python with old agency-swarm 1.4.1
```

## Why This Happens

**The Problem:**
- System Python (`/usr/bin/python3`): has agency-swarm **1.4.1** → causes hangs
- Venv Python (`.venv/bin/python`): has agency-swarm **1.5.0** → works correctly

**Why Debugger Works:**
VSCode's debugger automatically uses the virtual environment's Python (1.5.0), so it works fine. When you run `python3 agency.py` in the terminal, it uses the system Python (1.4.1), which has a bug that causes hangs.

## Solution Applied

The [agency.py](agency.py) shebang now points directly to the venv Python:
```python
#!/home/tjpilant/projects/idse-developer-agency/.venv/bin/python
```

This means `./agency.py` will automatically use the correct Python version.

## Exit the CLI

- Type `/exit` or `/quit`
- Press `Ctrl+C`
- Press `Ctrl+D`
