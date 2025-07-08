#!/bin/bash

# Stackr Bitcoin Testnet Startup Script
#
# PURPOSE: Entrypoint to launch Bitcoin Knots testnet node and provide wallet info
# RELATED: docker-compose.yml, Bitcoin Knots integration
# TAGS: bitcoin-knots, testnet, startup-script

set -e

echo "🚀 Starting Stackr Bitcoin Testnet Environment..."
echo "================================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker compose is available
if ! docker compose version &> /dev/null; then
    echo "❌ docker compose is not available. Please install Docker Desktop or Docker Compose and try again."
    exit 1
fi

# Create necessary directories
mkdir -p logs
mkdir -p data

# Set default environment variables if not set
export BITCOIN_RPC_USER=${BITCOIN_RPC_USER:-stackr}
export BITCOIN_RPC_PASSWORD=${BITCOIN_RPC_PASSWORD:-stackr_password}

echo "📋 Configuration:"
echo "  - Bitcoin RPC User: $BITCOIN_RPC_USER"
echo "  - Bitcoin RPC Password: $BITCOIN_RPC_PASSWORD"
echo "  - Testnet Mode: Enabled"
echo ""

# Start the services
echo "🐳 Starting Docker containers..."
docker compose up -d

echo ""
echo "⏳ Waiting for Bitcoin Knots to start..."
echo "   This may take a few minutes on first run as it downloads the testnet blockchain."

# Wait for Bitcoin Knots to be ready
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if docker compose exec -T bitcoind bitcoin-cli -testnet \
        -rpcuser="$BITCOIN_RPC_USER" \
        -rpcpassword="$BITCOIN_RPC_PASSWORD" \
        getblockchaininfo > /dev/null 2>&1; then
        echo "✅ Bitcoin Knots is ready!"
        break
    fi
    
    attempt=$((attempt + 1))
    echo "   Attempt $attempt/$max_attempts - Waiting for Bitcoin Knots..."
    sleep 10
done

if [ $attempt -eq $max_attempts ]; then
    echo "❌ Bitcoin Knots failed to start within expected time."
    echo "   Check logs with: docker compose logs bitcoind"
    exit 1
fi

# Get blockchain info
echo ""
echo "📊 Bitcoin Knots Testnet Status:"
blockchain_info=$(docker compose exec -T bitcoind bitcoin-cli -testnet \
    -rpcuser="$BITCOIN_RPC_USER" \
    -rpcpassword="$BITCOIN_RPC_PASSWORD" \
    getblockchaininfo)

echo "  - Chain: $(echo "$blockchain_info" | grep -o '"chain":"[^"]*"' | cut -d'"' -f4)"
echo "  - Blocks: $(echo "$blockchain_info" | grep -o '"blocks":[0-9]*' | cut -d':' -f2)"
echo "  - Headers: $(echo "$blockchain_info" | grep -o '"headers":[0-9]*' | cut -d':' -f2)"
echo "  - Verification Progress: $(echo "$blockchain_info" | grep -o '"verificationprogress":[0-9.]*' | cut -d':' -f2 | head -c 6)%"

# Generate a test wallet if it doesn't exist
echo ""
echo "💰 Wallet Setup:"
if ! docker compose exec -T bitcoind bitcoin-cli -testnet \
    -rpcuser="$BITCOIN_RPC_USER" \
    -rpcpassword="$BITCOIN_RPC_PASSWORD" \
    listwallets | grep -q "stackr-wallet"; then
    
    echo "  Creating test wallet..."
    docker compose exec -T bitcoind bitcoin-cli -testnet \
        -rpcuser="$BITCOIN_RPC_USER" \
        -rpcpassword="$BITCOIN_RPC_PASSWORD" \
        createwallet "stackr-wallet" > /dev/null 2>&1
    
    echo "  ✅ Test wallet 'stackr-wallet' created"
else
    echo "  ✅ Test wallet 'stackr-wallet' already exists"
fi

# Get wallet info
wallet_info=$(docker compose exec -T bitcoind bitcoin-cli -testnet \
    -rpcuser="$BITCOIN_RPC_USER" \
    -rpcpassword="$BITCOIN_RPC_PASSWORD" \
    -rpcwallet="stackr-wallet" \
    getwalletinfo 2>/dev/null || echo "{}")

if echo "$wallet_info" | grep -q "balance"; then
    balance=$(echo "$wallet_info" | grep -o '"balance":[0-9.]*' | cut -d':' -f2)
    echo "  - Balance: $balance BTC"
else
    echo "  - Balance: 0.00000000 BTC (new wallet)"
fi

# Get a new address for testing
new_address=$(docker compose exec -T bitcoind bitcoin-cli -testnet \
    -rpcuser="$BITCOIN_RPC_USER" \
    -rpcpassword="$BITCOIN_RPC_PASSWORD" \
    -rpcwallet="stackr-wallet" \
    getnewaddress 2>/dev/null || echo "Failed to generate address")

echo "  - New Test Address: $new_address"

echo ""
echo "🌐 Service URLs:"
echo "  - Stackr App: http://localhost:3000"
echo "  - Bitcoin RPC: localhost:18332"
echo "  - Bitcoin P2P: localhost:18333"

echo ""
echo "📝 Useful Commands:"
echo "  - View logs: docker compose logs -f"
echo "  - Stop services: docker compose down"
echo "  - Restart services: docker compose restart"
echo "  - Access Bitcoin CLI: docker compose exec bitcoind bitcoin-cli -testnet -rpcuser=$BITCOIN_RPC_USER -rpcpassword=$BITCOIN_RPC_PASSWORD"

echo ""
echo "🎉 Stackr testnet environment is ready!"
echo "   The application will be available at http://localhost:3000"
echo ""
echo "💡 Note: This is running on Bitcoin testnet. No real funds are involved." 