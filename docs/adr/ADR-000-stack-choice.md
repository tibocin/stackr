# ADR-000: Stack Choice

We’ll implement the MVP in **TypeScript + Express + SQLite** for fast iteration.

- Python/LangGraph reserved for strategy orchestration later (separate service).
- ORM avoided initially to keep diffs small; raw SQL with typed helpers.
- SQLite keeps dev friction low; Postgres migration pending.
