# Stackr: Accumulation Strategy Ideas

This document outlines 10 future-ready accumulation strategies. These are **concept-focused** and can be implemented as modular `strategyId` modules within Stackr. Effectiveness insights are based on backtesting where available.

---

## 1. Power Law 95th Percentile (Baseline)

- **Method**: Compare current price to theoretical power-law model (`modelPrice = A × daysSinceGenesis^B`) and the 95th percentile band of historical prices.
- **Logic**:
  - If price < model → **buy**, with higher multiplier for deeper undervaluation.
  - If price > 95th percentile → **sell** or **hold**.
- **Effectiveness**: Bitbo’s Power Law Rainbow chart shows the long-term model aligns with Bitcoin’s growth and measurable bounds :contentReference[oaicite:1]{index=1}.

---

## 2. Power Law Regression Channel Oscillator

- **Method**: Log-linear regression with upper and lower bands around the power-law center.
- **Logic**:
  - Buy near lower band, hold near center, consider selling near upper band.

---

## 3. On‑Chain Metrics Accumulation

- **Metrics**: MVRV, SOPR, NUPL, net exchange flows :contentReference[oaicite:2]{index=2}.
- **Logic**:
  - Buy when metrics indicate undervaluation (e.g., MVRV < 1); multiplier scales with deviation depth.

---

## 4. HODL Wave Long-Term Accumulation

- **Method**: Analyze the UTXO age distribution ("HODL Waves").
- **Logic**:
  - Buy when long-term holder proportions shrink, indicating accumulation exhaustion.

---

## 5. Technical — 50‑Day MA Dip

- **Method**: Measure gap between current price and 50‑day moving average.
- **Logic**:
  - Buy when price falls X% below MA; multiplier scales with depth of dip.

---

## 6. Volatility‑Adjusted DCA

- **Method**: Use rolling volatility (standard deviation of returns).
- **Logic**:
  - Increase DCA amount proportionally during high volatility periods.

---

## 7. Sentiment & Fear & Greed Index

- **Method**: Use indices like Alternative.me’s Fear & Greed.
- **Logic**:
  - Buy more during extreme fear, reduce or hold during greed.
- **Effectiveness**: A Reddit-sourced Fear & Greed strategy achieved 184% ROI vs. 125% for plain DCA :contentReference[oaicite:3]{index=3}.

---

## 8. Multi‑Model Ensemble Score

- **Method**: Aggregate sub-strategy scores (e.g., on-chain, technical, sentiment).
- **Logic**:
  - Buy when consensus surpasses threshold; multiplier reflects consensus strength.

---

## 9. Cycle Phase (Four‑Year Halving)

- **Method**: Determine position in BTC cycle (pre-/post-halving).
- **Logic**:
  - Heavier accumulation during cycle troughs.

---

## 10. Adaptive AI Strategy

- **Method**: Train ML (e.g., tree-based model) using historic triggers + performance.
- **Logic**:
  - Predict optimal buy actions and multipliers; retrain periodically.
- **Note**: Not Turing-full, but lightweight, privacy-respecting model.

---

## 📈 Comparative Effectiveness Insights

| Strategy                       | Backtest vs DCA                                                                      | Notes               |
| ------------------------------ | ------------------------------------------------------------------------------------ | ------------------- |
| Power Law                      | Long-term aligned with BTC growth :contentReference[oaicite:4]{index=4}              |                     |
| Sentiment (Fear & Greed)       | 184% ROI vs 124.8% benchmark :contentReference[oaicite:5]{index=5}                   |                     |
| Plain DCA                      | ~200% return 2019–2024; underperforms lump sum :contentReference[oaicite:6]{index=6} |                     |
| Ensemble, Volatility, On‑Chain | No specific public backtests yet                                                     | Worth prototyping   |
| Technical/Momentum-Based       | Momentum strategies often beat buy & hold :contentReference[oaicite:7]{index=7}      | Yet carry drawdowns |

---

## 🧩 Implementation Notes for Stackr

- Each of the strategies above can be added as a new `strategyId` in `strategies/` folder.
- Module interface: `evaluateStrategy(strategyId, …) → { action, multiplier }`.
- Backtest pipeline can later be developed using historical price + indicator feeds.
- The modular design allows combining or weighting strategies in an ensemble mode.

---

These ideas provide a roadmap for extending Stackr’s intelligence layer beyond baseline DCA — adopting rich, data-driven, and repeatable accumulation strategies.

Let me know if you’d like full specs or test prompts for any specific strategy!
