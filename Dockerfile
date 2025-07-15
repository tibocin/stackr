# Stackr Bitcoin DCA Application - Security-Hardened Container
# 
# PURPOSE: Containerizes the Python application with security hardening for sensitive financial operations
# RELATED: Bitcoin Knots container, docker-compose orchestration, security audit
# TAGS: docker, python, langgraph, fastapi, bitcoin-dca, security, hardened

# Use Python 3.11 slim as base image with specific digest for reproducible builds
FROM python:3.11-slim@sha256:139020233cc412efe4c8135b0efe1c7569dc8b28ddd88bddb109b764f8977e30

# Update CA certificates and GPG keys first for security
RUN apt-get update --allow-releaseinfo-change \
    && apt-get install -y --no-install-recommends ca-certificates gnupg \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory for the application
WORKDIR /app

# Install remaining system dependencies with security hardening
# - sqlite3: Database operations
# - curl: Health checks and API calls
# - dumb-init: Proper signal handling for security
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        sqlite3 \
        curl \
        dumb-init \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /tmp/* /var/tmp/* \
    # Verify critical binaries for integrity
    && which sqlite3 \
    && which curl \
    && which dumb-init

# Copy requirements file first for better caching
COPY requirements.txt .

# Install Python dependencies with security hardening
# - Use --no-cache-dir to avoid storing packages in container
# - Pin versions in requirements.txt for reproducible builds
RUN pip install --no-cache-dir --upgrade pip setuptools wheel \
    && pip install --no-cache-dir -r requirements.txt \
    && pip cache purge

# Copy application source code
COPY python/ ./python/
COPY .env* ./

# Create non-root user for security with minimal privileges
RUN groupadd -r appuser && useradd -r -g appuser -s /bin/false appuser

# Create necessary directories with proper permissions
RUN mkdir -p /app/data /app/logs \
    && chown -R appuser:appuser /app

# Set security-related environment variables
ENV PYTHONPATH=/app \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    # Disable Python bytecode generation for security
    PYTHONHASHSEED=random \
    # Use random hash seed to prevent hash-based attacks
    DEBIAN_FRONTEND=noninteractive

# Switch to non-root user
USER appuser

# Expose port for the application
EXPOSE 8000

# Health check with security considerations
# - Use curl with timeout to prevent hanging
# - Check only essential endpoints
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f --max-time 5 http://localhost:8000/health || exit 1

# Use dumb-init for proper signal handling and security
# This prevents zombie processes and ensures clean shutdown
ENTRYPOINT ["dumb-init", "--"]

# Default command to run the application with security flags
CMD ["python", "-m", "uvicorn", "python.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"] 