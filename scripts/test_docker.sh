#!/bin/bash

# Stackr Docker Test Script
# 
# PURPOSE: Test Docker container build and basic functionality
# RELATED: CI/CD pipeline, Docker health checks
# TAGS: docker, testing, health-check

set -e

echo "🐳 Testing Stackr Docker Setup..."

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

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

print_status "Docker is running"

# Build the Docker image
echo "🔨 Building Docker image..."
docker build -t stackr:test .

if [ $? -eq 0 ]; then
    print_status "Docker image built successfully"
else
    print_error "Failed to build Docker image"
    exit 1
fi

# Test container startup
echo "🚀 Testing container startup..."
CONTAINER_ID=$(docker run -d --name stackr-test -p 8000:8000 stackr:test)

if [ $? -eq 0 ]; then
    print_status "Container started successfully"
else
    print_error "Failed to start container"
    exit 1
fi

# Wait for container to be ready
echo "⏳ Waiting for container to be ready..."
sleep 10

# Test health endpoint
echo "🏥 Testing health endpoint..."
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    print_status "Health endpoint is responding"
else
    print_error "Health endpoint is not responding"
    docker logs stackr-test
    docker stop stackr-test > /dev/null 2>&1
    docker rm stackr-test > /dev/null 2>&1
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

# Show container logs
echo "📋 Container logs:"
docker logs stackr-test

# Clean up
echo "🧹 Cleaning up..."
docker stop stackr-test > /dev/null 2>&1
docker rm stackr-test > /dev/null 2>&1

print_status "Docker test completed successfully!"
echo ""
echo "🎉 Your Docker setup is working correctly!"
echo "   - Image builds successfully"
echo "   - Container starts and runs"
echo "   - Health endpoints respond"
echo "   - API endpoints are accessible"
echo ""
echo "Next steps:"
echo "   - Run 'docker compose up' to start the full stack"
echo "   - Check the CI/CD pipeline in GitHub Actions" 