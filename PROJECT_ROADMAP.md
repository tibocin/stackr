# Stackr — Development Roadmap

This roadmap uses a test-driven approach, with small atomic prompts/functions and progressive integration. CI/CD is set up from day one for continuous deployment and full test coverage.

---

## 🛠️ Phase 0: Setup & CI/CD

1. Initialize repository, `package.json`, `.gitignore`, `.eslintrc`, `.prettierrc`
2. Install core dependencies (Next.js, React, LangGraph, Bitcoin RPC, TS, Jest)
3. Setup Docker-based dev environment
4. Run and configure local Bitcoin Knots node on testnet
5. Setup testing (`Jest + React Testing Library`)
6. Add lint + formatting workflows
7. GitHub CI/CD: run tests, lint, deploy on merge
8. Create `README.md` with initial content
9. Add `PROJECT_ARCHITECTURE.md`, `USER_STORIES.md`, `STRATEGIES.md`

---

## 🧍️ Phase 1: Authentication & Onboarding

### 1.1 Magic-Link Login

- **Prompt**: “Scaffold magic-link auth with email; store encrypted session token”
- **TC**: `AuthService.sendLink()` ✓ link generated, email queued; `AuthService.verifyToken()`
- **UI**: Login page, email input, token link flow

### 1.2 Password-Based Login

- **Prompt**: “Add optional password signup/authentication”
- **TC**: `AuthService.register()`, `AuthService.login()`, hashing, session encoding

---

## 🔐 Phase 2: User Config & Data Handling

### 2.1 Secure Storage Setup

- **Prompt**: “Implement encryption/decryption util for secrets”
- **TC**: Round-trip AES-256 encrypted value

### 2.2 Exchange API Key UI

- **Prompt**: “Create form and storage for API keys in DB, encrypted”
- **TC**: `ApiKeyService.save()`, `ApiKeyService.fetch()`, secure tests

### 2.3 Bitcoin Node & xpub UI

- **Prompt**: “Add UI + backend for Bitcoin RPC URL + xpub input”
- **TC**: Validate connection (`bitcoinCore.verify()`), validate xpub format

### 2.4 Settings Page

- **Prompt**: “Build settings UI for managed/local-first toggle, retention policies”
- **TC**: Update and fetch settings from storage

---

## ⏰ Phase 3: Trigger System

### 3.1 Scheduled Triggers

- **Prompt**: “LangGraph node: fire `check_schedule_trigger` on intervals”
- **TC**: Returns due/not due based on DB schedule

### 3.2 Price / Balance Triggers

- **Prompt**: “Add `check_price_trigger` that checks current price vs threshold”
- **TC**: Trigger fires when price/api thresholds met

---

## 🧠 Phase 4: Strategy Engine

### 4.1 Power Law Strategy Core

- **Prompt**: "Implement `evaluateStrategy('power-law-95', …)` logic"
- **TC**: inputs: price/data; outputs: action/multiplier; edge-case fallback

### 4.2 Calculate DCA Amount

- **Prompt**: “Add `calculateDcaAmount()` with multiplier clamping”
- **TC**: verify safe multiplier bounds and results

### 4.3 Stub Exchange Buy

- **Prompt**: “Create `ExchangeAdapter.buy()` stub that logs input”
- **TC**: Returns mock TxReceipt

---

## ⚙️ Phase 5: Buy Workflow

### 5.1 LangGraph Integration

- **Prompt**: “Wire up nodes: `check_schedule_trigger`, `evaluate_strategy`, `calculate_dca_amount`, `buy_btc`”
- **TC**: Graph invokes node chain, executes stub `buy_btc`

### 5.2 Confirm & Record Transaction

- **Prompt**: “Build `confirm_buy_success`, `record_transaction` nodes”
- **TC**: TxReceipt recorded with timestamp in DB/log

### 5.3 UI — DCA Dashboard

- **Prompt**: “Create list view of scheduled jobs and last run status”
- **TC**: UI reflects stored schedules and statuses

---

## 🔄 Phase 6: Withdrawal Workflow

### 6.1 Withdrawal Condition Node

- **Prompt**: “Add `check_withdrawal_condition` node: manual, schedule”
- **TC**: returns withdrawal needed or skip

### 6.2 Address Selection

- **Prompt**: “Add `select_unused_address` that scans xpub via RPC”
- **TC**: returns vetted unused address

### 6.3 Send BTC

- **Prompt**: “Implement `initiate_withdrawal` using Bitcoin RPC or PSBT”
- **TC**: Returns mock Txid, tests edge conditions

### 6.4 Log + Notify

- **Prompt**: “Add `record_withdrawal` and notification email stub”
- **TC**: Stored and email-queued

### 6.5 UI — Withdrawal History

- **Prompt**: “Add withdrawal list view with filters, export option”
- **TC**: Render records correctly

### 6.6 HITL Mobile Notifications

- **Prompt**: “Add mobile push notifications for withdrawal approval”
- **TC**: FCM/Expo testable notification trigger and manual confirm node

---

## 🔐 Phase 7: Security & Compliance

### 7.1 GDPR Export / Deletion

- **Prompt**: “Add utilities to export user personal data in CSV/JSON and delete on request”
- **TC**: Files generated; deletion clears stored secrets

### 7.2 2FA (Optional)

- **Prompt**: “Add TOTP-based two-factor login option”
- **TC**: QR code generator, verify code

### 7.3 Secret Rotation

- **Prompt**: “Implement `encrypt_then_rotate(secret)` with key versioning”
- **TC**: Old secrets re-encrypted or invalidated

---

## 🔌 Phase 8: Plugin & Strategy Expansion

### 8.1 Additional Strategies

- **Prompt**: “Add `evaluateStrategy('technical-ma-dip', …)` (Strategy 5)”
- **TC**: Action/multiplier matches MA differential

> Repeat for other strategies: `sentiment`, `volatility`, `ensemble`

### 8.2 Exchange Adapter Plugins

- **Prompt**: “Add Kraken adapter implementing `buy()` and `fetchPrice()`”
- **TC**: Simulate API with recorded fixtures

### 8.3 LangGraph Config UI

- **Prompt**: “Allow UI to toggle strategies per schedule (checkbox list)”
- **TC**: Strategy preferences saved and used in `evaluateStrategy`

---

## 🎉 Phase 9: Deployment & Distribution

### 9.1 Vercel Deployment

- **Prompt**: “Create Vercel production workflow with env variables and secrets”
- **TC**: Test build output, env encrypted, CI passes, deploy preview works

### 9.2 Start9 & Umbrel Packaging

- **Prompt**: “Create Docker container + install script for Start9/Umbrel”
- **TC**: Container builds and runs migrations + frontend assets

### 9.3 Pricing / Subscription Layer

- **Prompt**: “Add Stripe integration for hosted mode”
- **TC**: Subscription UI, webhook handler, user access gated

---

## ✅ Phase 10: Monitoring & Edge Cases

- **Prompts** for:

  - Retry policies for RPC/exchange errors
  - Notification system for critical alerts (failure, node offline)
  - Annual audit mode (export receipts, verify txchain)
  - Dark theme and mobile layout enhancements

---

## 🧪 Testing Strategy

- Unit tests per function
- Integration tests for LangGraph workflows
- E2E tests using Cypress: Onboard → Set DCA → Trigger buy → View dashboard
- Mock RPC and exchange APIs using local test servers
- Code coverage: aim for 100% across modules

---

This roadmap covers a full-stack path from zero to production-grade implementation, enabling small deliverables and maintaining test rigor throughout.
