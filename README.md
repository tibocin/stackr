# stackr

# Intelligent Accumulation + Decumulation

A privacy-first Bitcoin DCA engine with programmable withdrawals and native self-custody.

---

## 🌱 What is This?

This tool helps individuals accumulate Bitcoin over time through scheduled or event-driven purchases, and then securely withdraw their BTC to a self-custodied wallet. It integrates directly with centralized exchanges (Coinbase, Kraken, etc.) via their APIs, and is designed with sovereignty, simplicity, and transparency in mind.

Withdrawals are handled by your own Bitcoin node using an xpub for fresh addresses. Everything is automated using real-time logic via LangGraph, and can run locally or be hosted in the cloud.

---

## 🔐 Core Principles

- **Sovereignty-first**: Control your own keys, coins, and infrastructure
- **GDPR-compliant**: Local-first data with optional managed DB for hosted setups
- **Exchange minimalism**: Buy BTC, then withdraw — no custodial accumulation
- **Transparent logic**: All logic is programmable, visible, auditable
- **Node native**: Uses your own Bitcoin Knots node for address generation and verification

---

## 🛠 Supported Deployment Targets

| Platform      | Description                              |
| ------------- | ---------------------------------------- |
| **Start9 OS** | Self-hosted local-first setup            |
| **Umbrel**    | Home node platform with 1-click install  |
| **Vercel**    | Web-hosted version with managed fallback |

---

## ✨ Features

- **DCA Scheduling**: Buy on a fixed interval (daily/weekly/monthly)
- **Trigger-Based Buying**: Buy when price, volatility, or fiat balance threshold is reached
- **Multi-Exchange Support**: Works with any connected exchange that supports API trading
- **Secure Withdrawals**: Withdraw to unused addresses from your xpub
- **Node Integration**: Connect your own Bitcoin Knots node
- **LangGraph Engine**: All triggers and flows handled via open graph logic
- **Export Logs**: All purchases, withdrawals, and settings exportable as CSV or JSON
- **Authentication**: Magic link or password login

---

## 🔧 System Requirements

- Bitcoin Knots node (RPC accessible)
- Exchange API keys with trading and withdrawal permissions
- xpub (Zpub/Ypub/Bip84 compatible preferred)
- Internet connection

---

## 🚀 Getting Started

### Local Deployment (Start9 or Umbrel)

1. Download or clone the project
2. Run `npm install && npm run dev`
3. Configure:

   - Your exchange API keys
   - Your Bitcoin Knots RPC endpoint
   - Your xpub

4. Set up your first DCA schedule or trigger

### Hosted Deployment (Vercel)

1. Click "Deploy to Vercel"
2. Provide environment variables (see `.env.template`)
3. Use the web UI to link your accounts and configure

---

## 🧠 How It Works

1. User sets up exchange API and Bitcoin node + xpub
2. LangGraph nodes monitor conditions: time, price, balance
3. When trigger hits, BTC is purchased via exchange
4. Withdrawals are scheduled or triggered
5. Bitcoin is sent to an unused address from xpub
6. All data is stored locally, with optional backup

---

## 🧪 Security & Privacy

- API keys are encrypted and stored locally
- xpubs never leave the local machine by default
- Transaction and address data is not reused
- Full GDPR-grade data export and deletion tools included

---

## 📤 Data Stored

| Data Type            | Purpose                         |
| -------------------- | ------------------------------- |
| API keys (encrypted) | Access to exchanges             |
| xpub                 | For unused address generation   |
| Transaction history  | Audit log of DCA buys           |
| Withdrawal history   | Audit log of outbound BTC sends |
| User email           | Login + notification system     |
| Trigger settings     | Logic for when to buy/send      |
| Export logs          | User-requested data bundles     |

---

## 🛣 What’s Next?

- ✅ MVP: Scheduled and threshold DCA + withdrawal triggers
- ⏳ Exchange plugin system
- ⏳ Native Lightning support
- ⏳ Silent payments (Taproot send support)
- ⏳ iOS/Android wrappers
- ⏳ Nostr relay integration for status alerts

See `PROJECT_ARCHITECTURE.md` and `ROADMAP.md` for full breakdowns.
