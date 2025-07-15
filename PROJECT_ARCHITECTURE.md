# Stackr: Project Architecture

## Overview

Stackr is a privacy-first Bitcoin DCA and automated withdrawal system built to support sovereign usage and secure automation. The system is modular, extensible, and structured for concurrent development across UI, core logic, exchange integrations, and self-custody workflows.

---

## Domains & Responsibilities

### 1. Web & Mobile Interface (React + Next.js)

- **User login and onboarding**
- **API key and xpub submission**
- **Schedule and trigger configuration**
- **Transaction + withdrawal history UI**
- **Export/download interface**
- **Settings for managed vs local-first mode**
- **Mobile UX with push notifications for HITL (Human-in-the-Loop)**

### 2. LangGraph Engine (Python)

- **Trigger orchestration (time, fiat, price, etc.)**
- **Buy decision nodes**
- **Strategy evaluation nodes (e.g., Power Law, Percentile Analysis)**
- **Withdrawal condition nodes**
- **Human-in-the-loop approval (optional node)**
- **Logging, alerts, and fallbacks**
- **State management and durable execution**

### 3. Exchange Integration Layer (Python)

- **Pluggable exchange adapters**
- **Unified interface**
- **Rate limits, retry logic, and credential rotation**
- **Price feed and balance check abstraction**

### 4. Bitcoin Wallet + Node Integration (Python)

- **Connect to Bitcoin Knots RPC**
- **Scan xpub for unused addresses**
- **Send BTC using unsigned PSBT or full RPC wallet**
- **Optional integration with hardware wallets**

### 5. Storage & Data Layer

- **Local-first file storage (SQLite or JSON)**
- **Managed DB (Postgres on Vercel/Neon)**
- **Encrypted storage of API keys and user config**
- **Export tools for GDPR-compliant data access/deletion**

### 6. Security + Compliance Layer

- **End-to-end encryption for all secrets**
- **Zero address reuse**
- **Magic link and password login with optional 2FA**
- **Full GDPR compliance: data deletion, export, opt-in consent**

### 7. Dockerized Infrastructure

- **Docker-first development and deployment**
- **Consistent local and cloud environments**
- **Optional Docker Compose setup for self-hosting (Start9, Umbrel)**

---

## LangGraph Topology

### Nodes

- `check_schedule_trigger`
- `check_price_trigger`
- `check_balance_trigger`
- `evaluate_strategy`
- `calculate_dca_amount`
- `buy_btc`
- `confirm_buy_success`
- `check_withdrawal_condition`
- `select_unused_address`
- `initiate_withdrawal`
- `record_transaction`
- `notify_user`

### Conditional Edges

- Price above/below trigger
- Schedule hit vs not due
- Balance meets threshold or not
- Strategy logic returns "buy", "wait", or "sell"
- Withdrawal logic met or blocked

### Human-in-the-Loop Nodes

- `confirm_withdrawal` (optional)
- `manual_review_required`
- **Mobile push notifications for approval workflow**

---

## Data Flow Summary

```mermaid
flowchart TD
    A[User Inputs Settings] --> B[Stored Securely (Local/DB)]
    B --> C[LangGraph Engine Reads Configs]
    C --> D{Trigger Met?}
    D -- Yes --> E[evaluate_strategy]
    E --> F{Strategy: Buy?}
    F -- Yes --> G[calculate_dca_amount]
    G --> H[Buy BTC]
    H --> I{Withdrawal Needed?}
    I -- Yes --> J[Check Unused Address]
    J --> K[Withdraw BTC to xpub]
    K --> L[Update Logs + Notify]
```

---

## Strategy Modules

### Strategy Interface

```python
def evaluate_strategy(
    strategy_id: str,
    current_price: float,
    historical_data: List[PriceFeed],
    days_since_genesis: int
) -> StrategyResult:
    pass
```

- Allows for selection of multiple strategies
- Modular logic per strategy file
- Common `StrategyResult`: `{"action": "buy" | "sell" | "hold", "multiplier": float}`

### Power Law 95th Percentile Strategy

- **Model Price**: `model_price = A * (days_since_genesis ^ B)`
- **Percentile Band**: 95th percentile of all actual prices historically above model price
- **Buy Condition**: If current price < model price → `buy`
- **Sell Condition**: If current price > 95th percentile band → `sell`
- **Multiplier**: Scaled by distance below model line, clamped to range (e.g. 0.5 to 3.0)
- **Fallback**: No model data → use flat DCA

---

## Key Function Specs

### `evaluate_strategy(strategy_id: str, current_price: float, historical_data: List[PriceFeed], days_since_genesis: int) -> StrategyResult`

- **Inputs**: strategy ID, current price, historical price data, block age in days
- **Outputs**: action (`buy`, `sell`, `hold`) + multiplier (e.g., 0.5, 1.0, 2.0)
- **Side effects**: none
- **Edge cases handled**:

  - Missing model parameters → fallback
  - No historical data → fallback to static DCA
  - API unresponsive → retry/backoff

### `calculate_dca_amount(base_amount: float, multiplier: float) -> float`

- **Inputs**: base DCA amount, multiplier from strategy
- **Outputs**: adjusted DCA buy amount
- **Side effects**: none
- **Edge cases**:

  - Multiplier < 0.1 or > 10 → clamp to safe range

### `buy_bitcoin(amount: float, strategy_id: str) -> TxReceipt`

- **Inputs**: amount (fiat or sats), strategy_id
- **Outputs**: transaction receipt
- **Side effects**: API call to exchange, updates to log
- **Edge cases handled**:

  - API timeout → retry
  - Order failed → alert + fallback

### `withdraw_to_xpub(xpub: str, amount: float) -> str`

- **Inputs**: validated xpub, BTC amount
- **Outputs**: Bitcoin transaction ID
- **Side effects**: Create new address, send via RPC
- **Edge cases**:

  - No unused address → alert
  - RPC offline → retry with exponential backoff

### `check_triggers() -> List[TriggerState]`

- Checks all conditions (price, balance, time)
- Routes logic in LangGraph

---

## Compliance & Security

- 🔐 All API keys AES-256 encrypted and never stored in plain text
- 🚫 No reuse of xpub-derived addresses
- 🧾 Full audit log of all transactions (stored locally and exportable)
- 🔍 User data deletable on demand (per GDPR)
- ✉️ Email never used without opt-in

---

## Development Zones for Concurrent Work

| Domain                | Tech Stack              | Owners / Teams     |
| --------------------- | ----------------------- | ------------------ |
| UI & Auth             | React, Next.js, Magic   | Frontend / UX      |
| Automation Logic      | LangGraph + LangChain   | Workflow Engineers |
| Exchange Connectors   | Python + REST/GraphQL   | Integrations       |
| Wallet + Node Layer   | Python + RPC            | Bitcoin Devs       |
| Storage & Export      | SQLite/Postgres         | Backend Team       |
| Security & Compliance | Crypto libs + policy    | Security Officer   |
| Mobile Push + HITL    | Web Push / Expo / FCM   | Mobile Team        |
| Docker Infra & CI     | Docker, Vercel, Compose | DevOps             |

---

## LangGraph Architecture Benefits

### State Management

- **Shared State**: LangGraph provides built-in state management across nodes
- **Durable Execution**: Checkpointing allows workflows to resume from failures
- **Context Preservation**: State persists across node transitions

### Node Isolation

- **Independent Execution**: Each node runs in isolation with clear inputs/outputs
- **Message Passing**: Nodes communicate through structured state updates
- **Error Isolation**: Node failures don't cascade to other nodes

### Event-Driven Communication

- **Conditional Routing**: Edges can be conditional based on node outputs
- **Parallel Execution**: Multiple nodes can run concurrently when possible
- **Event Handling**: Built-in support for async operations and external events

---

## Notes

- MVP is scoped to single-user mode with magic link authentication
- Exchange API key permission scopes should be minimal: trade only
- Hosted version requires Vercel environment encryption keys
- Export tools to include signed message receipts for tamper resistance
- Strategy logic (e.g. Power Law 95th percentile) directly adjusts DCA intensity
- Mobile experience with push notification for human approval is part of MVP
- Docker will be used from day one to ensure parity across environments
- LangGraph provides native support for state management, node isolation, and event-driven communication
