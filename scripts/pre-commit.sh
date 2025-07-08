#!/bin/bash

# Pre-commit hook for Stackr
# Supports TDD workflow: test commits build only, feat commits require passing tests

echo "🧪 Running pre-commit checks..."

# Get the commit message from the first argument
COMMIT_MSG="$1"

# Check if this is a test commit (TDD step 1)
if [[ "$COMMIT_MSG" == test:* ]]; then
    echo "📝 Test commit detected - running build check only"
    echo "🔨 Running build check..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "❌ Build failed. Commit aborted."
        exit 1
    fi
    echo "✅ Pre-commit checks passed for test commit!"
    echo "💡 Tests can fail in CI (expected in TDD workflow)"
    exit 0
fi

# Check if this is a feature commit (TDD step 2)
if [[ "$COMMIT_MSG" == feat:* ]]; then
    echo "🔧 Feature commit detected - running full checks"
    
    # Run tests first
    echo "🧪 Running tests..."
    npm test
    if [ $? -ne 0 ]; then
        echo "❌ Tests failed. Commit aborted."
        echo "💡 Ensure all tests pass before committing feature implementation"
        exit 1
    fi
    
    # Run build
    echo "🔨 Running build check..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "❌ Build failed. Commit aborted."
        exit 1
    fi
    
    echo "✅ Pre-commit checks passed for feature commit!"
    exit 0
fi

# For all other commits, run build only
echo "🔨 Running build check for other commit types..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Commit aborted."
    exit 1
fi

echo "✅ Pre-commit checks passed!"
exit 0 