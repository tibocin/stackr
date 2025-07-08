# Stackr Environment Variables

This document lists all environment variables required for the Stackr Bitcoin DCA application.

## Quick Start

Copy the variables below into a `.env` file in your project root:

```bash
# Application Configuration
NODE_ENV=development
PORT=3000
DEBUG=stackr:*
LOG_LEVEL=debug

# Bitcoin Knots RPC Configuration
BITCOIN_RPC_HOST=localhost
BITCOIN_RPC_PORT=18332
BITCOIN_RPC_USER=stackr
BITCOIN_RPC_PASSWORD=stackr_password
BITCOIN_NETWORK=testnet

# Database Configuration
DATABASE_PATH=./data/stackr.db

# Development Settings
WATCH=true
```

## Complete Environment Variables Reference

### Application Configuration

| Variable    | Default       | Description                                      |
| ----------- | ------------- | ------------------------------------------------ |
| `NODE_ENV`  | `development` | Application environment (development/production) |
| `PORT`      | `3000`        | Port for the web server                          |
| `DEBUG`     | `stackr:*`    | Debug logging scope                              |
| `LOG_LEVEL` | `debug`       | Logging level (debug/info/warn/error)            |
| `WATCH`     | `true`        | Enable file watching for development             |

### Bitcoin Knots RPC Configuration

| Variable                     | Default           | Description                         |
| ---------------------------- | ----------------- | ----------------------------------- |
| `BITCOIN_RPC_HOST`           | `localhost`       | Bitcoin Knots RPC host              |
| `BITCOIN_RPC_PORT`           | `18332`           | Bitcoin Knots RPC port (testnet)    |
| `BITCOIN_RPC_USER`           | `stackr`          | Bitcoin Knots RPC username          |
| `BITCOIN_RPC_PASSWORD`       | `stackr_password` | Bitcoin Knots RPC password          |
| `BITCOIN_NETWORK`            | `testnet`         | Bitcoin network (testnet/mainnet)   |
| `BITCOIN_RPC_TIMEOUT`        | `30000`           | RPC request timeout in milliseconds |
| `BITCOIN_RPC_RETRY_ATTEMPTS` | `3`               | Number of RPC retry attempts        |

### Database Configuration

| Variable                   | Default                     | Description                   |
| -------------------------- | --------------------------- | ----------------------------- |
| `DATABASE_PATH`            | `./data/stackr.db`          | SQLite database file path     |
| `DATABASE_MIGRATIONS_PATH` | `./src/database/migrations` | Database migrations directory |

### Security Configuration

| Variable                | Default                     | Description                       |
| ----------------------- | --------------------------- | --------------------------------- |
| `JWT_SECRET`            | `your-super-secret-jwt-key` | JWT signing secret                |
| `SESSION_SECRET`        | `your-session-secret-key`   | Session encryption secret         |
| `API_RATE_LIMIT`        | `100`                       | API rate limit per window         |
| `API_RATE_LIMIT_WINDOW` | `900000`                    | Rate limit window in milliseconds |

### Exchange Integration (Future)

| Variable              | Default        | Description                        |
| --------------------- | -------------- | ---------------------------------- |
| `EXCHANGE_API_KEY`    | -              | Exchange API key for DCA purchases |
| `EXCHANGE_API_SECRET` | -              | Exchange API secret                |
| `EXCHANGE_NAME`       | `coinbase-pro` | Exchange name                      |

### Notification Configuration (Future)

| Variable                     | Default          | Description                   |
| ---------------------------- | ---------------- | ----------------------------- |
| `PUSH_NOTIFICATION_ENABLED`  | `false`          | Enable push notifications     |
| `PUSH_NOTIFICATION_PROVIDER` | `web-push`       | Push notification provider    |
| `PUSH_PUBLIC_KEY`            | -                | Push notification public key  |
| `PUSH_PRIVATE_KEY`           | -                | Push notification private key |
| `EMAIL_ENABLED`              | `false`          | Enable email notifications    |
| `EMAIL_PROVIDER`             | `smtp`           | Email provider                |
| `SMTP_HOST`                  | `smtp.gmail.com` | SMTP host                     |
| `SMTP_PORT`                  | `587`            | SMTP port                     |
| `SMTP_USER`                  | -                | SMTP username                 |
| `SMTP_PASSWORD`              | -                | SMTP password                 |

### Monitoring and Analytics (Future)

| Variable             | Default       | Description                   |
| -------------------- | ------------- | ----------------------------- |
| `MONITORING_ENABLED` | `false`       | Enable application monitoring |
| `METRICS_PORT`       | `9090`        | Metrics server port           |
| `SENTRY_DSN`         | -             | Sentry error tracking DSN     |
| `SENTRY_ENVIRONMENT` | `development` | Sentry environment            |

### Development Overrides

| Variable                     | Default         | Description                     |
| ---------------------------- | --------------- | ------------------------------- |
| `BITCOIN_RPC_HOST_OVERRIDE`  | `bitcoind`      | Override RPC host for Docker    |
| `BITCOIN_RPC_PORT_OVERRIDE`  | `18332`         | Override RPC port for Docker    |
| `DEV_WALLET_XPUB`            | -               | Testnet xpub for development    |
| `DEV_WALLET_DERIVATION_PATH` | `m/44'/1'/0'/0` | Derivation path for development |

### Feature Flags

| Variable                           | Default | Description                     |
| ---------------------------------- | ------- | ------------------------------- |
| `FEATURE_DCA_AUTOMATION`           | `true`  | Enable DCA automation           |
| `FEATURE_SELF_CUSTODY_WITHDRAWALS` | `true`  | Enable self-custody withdrawals |
| `FEATURE_LANGGRAPH_ORCHESTRATION`  | `true`  | Enable LangGraph orchestration  |
| `FEATURE_PUSH_NOTIFICATIONS`       | `false` | Enable push notifications       |
| `FEATURE_EMAIL_NOTIFICATIONS`      | `false` | Enable email notifications      |

## Docker Environment

When running with Docker, the following variables are automatically set:

- `BITCOIN_RPC_HOST=bitcoind` (Docker service name)
- `NODE_ENV=production` (in production compose)
- `NODE_ENV=development` (in development override)

## Security Notes

1. **Never commit `.env` files** to version control
2. **Use strong secrets** in production
3. **Rotate API keys** regularly
4. **Use environment-specific** configurations
5. **Validate all inputs** from environment variables

## Validation

The application validates required environment variables on startup. Missing required variables will cause the application to exit with an error message.
