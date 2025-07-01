#!/bin/bash

# Conventional Commit Helper Script
# Usage: ./scripts/commit.sh

echo "🚀 Conventional Commit Helper"
echo ""

# Get the list of changed packages
CHANGED_PROJECTS=$(pnpm exec nx show projects --affected --type=lib)

if [ -z "$CHANGED_PROJECTS" ]; then
    echo "ℹ️  No affected projects found. Using 'workspace' scope."
    SCOPE="workspace"
else
    echo "📦 Affected projects:"
    echo "$CHANGED_PROJECTS" | sed 's/^/  - /'
    echo ""
    echo "Which project is this commit for?"
    select SCOPE in $CHANGED_PROJECTS "workspace" "other"; do
        if [ "$SCOPE" = "other" ]; then
            echo -n "Enter custom scope: "
            read SCOPE
        fi
        break
    done
fi

echo ""
echo "📝 Commit type:"
select TYPE in "feat" "fix" "docs" "style" "refactor" "test" "chore"; do
    break
done

echo ""
echo -n "📄 Brief description: "
read DESCRIPTION

echo ""
echo -n "🔧 Longer description (optional): "
read BODY

echo ""
echo -n "💥 Is this a breaking change? (y/N): "
read BREAKING

# Build commit message
COMMIT_MSG="${TYPE}"

if [ -n "$SCOPE" ]; then
    COMMIT_MSG="${COMMIT_MSG}(${SCOPE})"
fi

if [ "$BREAKING" = "y" ] || [ "$BREAKING" = "Y" ]; then
    COMMIT_MSG="${COMMIT_MSG}!: ${DESCRIPTION}"
else
    COMMIT_MSG="${COMMIT_MSG}: ${DESCRIPTION}"
fi

if [ -n "$BODY" ]; then
    COMMIT_MSG="${COMMIT_MSG}

${BODY}"
fi

if [ "$BREAKING" = "y" ] || [ "$BREAKING" = "Y" ]; then
    echo ""
    echo -n "💥 Breaking change description: "
    read BREAKING_DESC
    COMMIT_MSG="${COMMIT_MSG}

BREAKING CHANGE: ${BREAKING_DESC}"
fi

echo ""
echo "📋 Commit message:"
echo "---"
echo "$COMMIT_MSG"
echo "---"
echo ""
echo -n "🤔 Commit this? (Y/n): "
read CONFIRM

if [ "$CONFIRM" != "n" ] && [ "$CONFIRM" != "N" ]; then
    git add .
    git commit -m "$COMMIT_MSG"
    echo "✅ Committed!"
else
    echo "❌ Aborted"
fi
