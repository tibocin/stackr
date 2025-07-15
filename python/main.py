"""
Stackr Bitcoin DCA Application - FastAPI Main Entry Point

PURPOSE: Main FastAPI application with health checks and basic endpoints
RELATED: Docker container, CI/CD pipeline, LangGraph workflows
TAGS: fastapi, health-check, docker
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from typing import Dict, Any
from pydantic import BaseModel, EmailStr


app = FastAPI(
    title="Stackr Bitcoin DCA",
    description="Privacy-first Bitcoin DCA and automated withdrawal system",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root() -> Dict[str, str]:
    """Root endpoint returning basic application info."""
    return {
        "message": "Stackr Bitcoin DCA API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check() -> Dict[str, Any]:
    """Health check endpoint for Docker and CI/CD monitoring."""
    try:
        # Check if we can access the python directory
        python_path = os.path.dirname(__file__)
        if not os.path.exists(python_path):
            raise HTTPException(status_code=500, detail="Python module path not found")
        
        # Check environment variables
        bitcoin_rpc_host = os.getenv("BITCOIN_RPC_HOST", "localhost")
        bitcoin_rpc_port = os.getenv("BITCOIN_RPC_PORT", "18332")
        
        return {
            "status": "healthy",
            "python_path": python_path,
            "bitcoin_rpc_host": bitcoin_rpc_host,
            "bitcoin_rpc_port": bitcoin_rpc_port,
            "environment": "production" if os.getenv("PYTHONPATH") else "development"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

@app.get("/api")
async def api_info() -> Dict[str, Any]:
    """API information endpoint."""
    return {
        "endpoints": {
            "root": "/",
            "health": "/health",
            "docs": "/docs",
            "redoc": "/redoc"
        },
        "workflows": {
            "bitcoin_news": "Available via LangGraph workflows"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 