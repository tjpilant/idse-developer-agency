#!/usr/bin/env python3
import sys
import time

print("Testing if terminal is responsive...", flush=True)
print("If you see this, terminal output is working.", flush=True)
print("Now testing input()...", flush=True)
sys.stdout.flush()

try:
    user_input = input("Type something and press Enter: ")
    print(f"You typed: {user_input}", flush=True)
    print("SUCCESS: Terminal is working properly!", flush=True)
except Exception as e:
    print(f"ERROR: {e}", flush=True)
