# CI/CD Strategy for Stackr

## Overview

Our CI/CD pipeline is designed to support Test-Driven Development (TDD) while ensuring code quality and preventing broken code from being merged.

## Pipeline Components

### 1. Pre-commit Hook (`scripts/pre-commit.sh`)

- **Purpose**: Smart local validation based on commit type
- **What it does**:
  - `test:` commits → Build check only (allows failing tests)
  - `feat:` commits → Build + tests (must pass)
  - Other commits → Build check only
- **Why this approach**: Supports TDD workflow while ensuring quality
- **Benefits**: Fast for test commits, thorough for feature commits

### 2. GitHub Actions CI (`.github/workflows/ci.yml`)

- **Purpose**: Comprehensive testing and validation
- **Triggers**: Every push and pull request to `main` and `develop`
- **What it does**:
  - Runs tests on Node.js 18.x and 20.x
  - Builds the project
  - Uploads coverage reports
  - Tests Docker container startup
- **Benefits**: Ensures all tests pass before merge

## TDD Workflow Support

### How it works with TDD:

1. **Write failing test** → Commit with `test:` prefix

   - Pre-commit: Build check only (allows failing tests)
   - CI: Tests will fail (expected in TDD)

2. **Implement function** → Commit with `feat:` prefix

   - Pre-commit: Build + tests (must pass)
   - CI: Tests should pass

3. **Merge feature** → CI ensures all tests pass

### Commit Message Conventions:

- `test:` - Adding or updating tests (TDD step 1)
- `feat:` - Adding new functionality (TDD step 2)
- `fix:` - Fixing bugs
- `docs:` - Documentation changes
- `chore:` - Maintenance tasks

## Benefits

1. **TDD Friendly**: Doesn't block the write-test-first workflow
2. **Fast Local Development**: Pre-commit only runs build (seconds)
3. **Comprehensive CI**: Full test suite runs in pipeline
4. **Multi-Node Testing**: Tests on Node.js 18.x and 20.x
5. **Docker Validation**: Ensures container builds and starts correctly
6. **Coverage Tracking**: Monitors test coverage over time

## Usage

### Local Development:

```bash
# Normal workflow - pre-commit runs automatically
git add .
git commit -m "feat: implement new function"

# TDD workflow - tests can fail
git add .
git commit -m "test: add failing test for new function"
```

### CI/CD Pipeline:

- Automatically runs on every push/PR
- Must pass before merge to main/develop
- Provides detailed feedback and coverage reports
