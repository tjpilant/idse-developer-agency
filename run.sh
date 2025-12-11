#!/bin/bash
# Run the agency with unbuffered output using venv Python
cd "$(dirname "$0")"
.venv/bin/python -u agency.py "$@"
