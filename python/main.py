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

# Import our AuthService
from python.services.auth_service import AuthService

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

# Initialize AuthService
auth_service = AuthService()

# Pydantic models for request/response
class RequestLinkRequest(BaseModel):
    email: EmailStr

class RequestLinkResponse(BaseModel):
    message: str
    token: str

class VerifyTokenResponse(BaseModel):
    message: str

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
            "redoc": "/redoc",
            "auth": {
                "request_link": "POST /auth/request-link",
                "verify_token": "GET /auth/verify"
            }
        },
        "workflows": {
            "bitcoin_news": "Available via LangGraph workflows"
        }
    }

@app.post("/auth/request-link", response_model=RequestLinkResponse)
async def request_magic_link(request: RequestLinkRequest) -> RequestLinkResponse:
    """Request a magic link to be sent to the provided email."""
    try:
        token = auth_service.send_link(request.email)
        return RequestLinkResponse(
            message="Magic link requested successfully",
            token=token
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/auth/verify", response_model=VerifyTokenResponse)
async def verify_magic_link(token: str) -> VerifyTokenResponse:
    """Verify a magic link token."""
    if not token:
        raise HTTPException(status_code=400, detail="Token is required")
    
    if auth_service.verify_token(token):
        return VerifyTokenResponse(message="Token verified successfully")
    else:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 