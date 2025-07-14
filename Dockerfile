# Stackr Bitcoin DCA Application - Main Service Container
# 
# PURPOSE: Containerizes the Python application with LangGraph, FastAPI, and SQLite
# RELATED: Bitcoin Knots container, docker-compose orchestration
# TAGS: docker, python, langgraph, fastapi, bitcoin-dca

# Use Python 3.11 slim as base image
FROM python:3.11-slim

# Set working directory for the application
WORKDIR /app

# Install system dependencies for SQLite and other native modules
RUN apt-get update && apt-get install -y \
    sqlite3 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY python/ ./python/
COPY .env* ./

# Create non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Change ownership of app directory
RUN chown -R appuser:appuser /app
USER appuser

# Set Python path
ENV PYTHONPATH=/app

# Expose port for the application
EXPOSE 8000

# Health check to ensure application is running
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Default command to run the application
CMD ["python", "-m", "uvicorn", "python.main:app", "--host", "0.0.0.0", "--port", "8000"] 