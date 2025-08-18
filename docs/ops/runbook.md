# Stackr Runbook (MVP)

- **Boot locally:** `cp .env.example .env && make db-init && make dev`
- **Health:** GET `/healthz`, `/readyz`, `/metrics`
- **Common failures:**
  - **DB missing:** Run `make db-init`
  - **Port in use:** Set `PORT` in `.env`
- **Secrets:** Never commit. Use `.env`.
