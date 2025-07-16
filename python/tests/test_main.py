"""
Tests for the main FastAPI application

PURPOSE: Test the health check and basic endpoints
RELATED: CI/CD pipeline, Docker health checks
TAGS: fastapi, testing, health-check
"""

import pytest
from fastapi.testclient import TestClient
import os
import sys

# Add the parent directory to the path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the app with proper module path
from python.main import app

client = TestClient(app)

def test_root_endpoint():
    """Test the root endpoint returns correct information."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Stackr Bitcoin DCA API"
    assert data["version"] == "1.0.0"
    assert data["status"] == "running"

def test_health_endpoint():
    """Test the health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "python_path" in data
    assert "bitcoin_rpc_host" in data
    assert "bitcoin_rpc_port" in data

def test_api_info_endpoint():
    """Test the API information endpoint."""
    response = client.get("/api")
    assert response.status_code == 200
    data = response.json()
    assert "endpoints" in data
    assert "workflows" in data
    assert "health" in data["endpoints"]
    assert "docs" in data["endpoints"]

def test_health_endpoint_with_environment_variables():
    """Test health endpoint with environment variables set."""
    # Set environment variables for testing
    os.environ["BITCOIN_RPC_HOST"] = "test-host"
    os.environ["BITCOIN_RPC_PORT"] = "18332"
    
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["bitcoin_rpc_host"] == "test-host"
    assert data["bitcoin_rpc_port"] == "18332"
    
    # Clean up
    del os.environ["BITCOIN_RPC_HOST"]
    del os.environ["BITCOIN_RPC_PORT"]

def test_docs_endpoint():
    """Test that the docs endpoint is accessible."""
    response = client.get("/docs")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"] 