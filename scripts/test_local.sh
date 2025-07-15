#!/bin/bash

# Stackr Local Test Script
# 
# PURPOSE: Test FastAPI application locally with proper Python path
# RELATED: CI/CD pipeline, Docker health checks
# TAGS: fastapi, testing, local

set -e

echo "🚀 Testing Stackr FastAPI Application Locally..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "requirements.txt" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Set Python path
export PYTHONPATH=$(pwd)

print_status "Python path set to: $PYTHONPATH"

# Test if we can import the main module
echo "🔍 Testing module imports..."
if python -c "from python.main import app; print('✅ FastAPI app imported successfully')"; then
    print_status "Module imports work correctly"
else
    print_error "Failed to import FastAPI app"
    exit 1
fi

# Run tests
echo "🧪 Running tests..."
if python -m pytest python/tests/ -v; then
    print_status "All tests passed"
else
    print_error "Tests failed"
    exit 1
fi

# Start the server in background
echo "🌐 Starting FastAPI server..."
python -m uvicorn python.main:app --host 0.0.0.0 --port 8000 &
SERVER_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 5

# Test health endpoint
echo "🏥 Testing health endpoint..."
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    print_status "Health endpoint is responding"
else
    print_error "Health endpoint is not responding"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# Test root endpoint
echo "🏠 Testing root endpoint..."
if curl -f http://localhost:8000/ > /dev/null 2>&1; then
    print_status "Root endpoint is responding"
else
    print_error "Root endpoint is not responding"
fi

# Test API docs endpoint
echo "📚 Testing API docs endpoint..."
if curl -f http://localhost:8000/docs > /dev/null 2>&1; then
    print_status "API docs endpoint is responding"
else
    print_error "API docs endpoint is not responding"
fi

# Show server info
echo "📋 Server information:"
curl -s http://localhost:8000/health | python -m json.tool

# Clean up
echo "🧹 Stopping server..."
kill $SERVER_PID 2>/dev/null || true

print_status "Local test completed successfully!"
echo ""
echo "🎉 Your FastAPI application is working correctly!"
echo "   - Module imports work"
echo "   - All tests pass"
echo "   - Server starts and runs"
echo "   - Health endpoints respond"
echo "   - API endpoints are accessible"
echo ""
echo "Next steps:"
echo "   - Run 'docker build -t stackr:test .' to test Docker build"
echo "   - Run 'docker compose up' to start the full stack"
echo "   - Check the CI/CD pipeline in GitHub Actions" 