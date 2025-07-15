#!/bin/bash
# scripts/dev/run_api.sh
# Run the FastAPI app with correct import context from project root

set -e
cd "$(dirname "$0")/../.."

# Export PYTHONPATH to ensure absolute imports work
export PYTHONPATH=$(pwd)

exec uvicorn python.main:app --reload --host 0.0.0.0 --port 8000 