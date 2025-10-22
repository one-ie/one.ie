#!/bin/bash
set -e

# Validate deployment readiness
# Usage: ./scripts/validate-deployment.sh

echo "🔍 Validating deployment readiness..."

# 1. Check environment variables
if [ -z "${PUBLIC_CONVEX_URL}" ]; then
  echo "❌ PUBLIC_CONVEX_URL not set"
  exit 1
fi

# 2. Check installation folder (if specified)
if [ ! -z "${INSTALLATION_NAME}" ]; then
  if [ ! -d "/${INSTALLATION_NAME}" ]; then
    echo "❌ Installation folder not found: /${INSTALLATION_NAME}"
    exit 1
  fi

  # Validate ontology structure
  for dir in groups people things connections events knowledge; do
    if [ ! -d "/${INSTALLATION_NAME}/${dir}" ]; then
      echo "⚠️ Missing ontology directory: /${INSTALLATION_NAME}/${dir}"
    fi
  done
fi

# 3. Run tests
echo "Running tests..."
cd web && bun test
cd ../cli && bun test

# 4. Type check
echo "Type checking..."
cd ../web && bunx astro check

# 5. Build check
echo "Test build..."
cd web && bun run build

echo "✅ Validation complete - ready to deploy!"
