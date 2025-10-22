#!/bin/bash

###############################################################################
# Landing Page Deployment Helper - Infer 1-10
#
# Builds and deploys landing page to Cloudflare Pages with performance testing
#
# Usage:
#   ./scripts/deploy-landing-page.sh [preview|production]
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="web"
WEB_DIR="web"

echo ""
echo -e "${BLUE}🚀 Landing Page Deployment - Infer 1-10${NC}"
echo ""

# Check for deployment type
DEPLOY_TYPE="${1:-preview}"

if [[ "$DEPLOY_TYPE" != "preview" && "$DEPLOY_TYPE" != "production" ]]; then
  echo -e "${RED}❌ Invalid deployment type. Use 'preview' or 'production'${NC}"
  exit 1
fi

echo -e "${YELLOW}📋 Deployment Type: ${DEPLOY_TYPE}${NC}"
echo ""

# Step 1: Change to web directory
echo -e "${BLUE}📂 Changing to web directory...${NC}"
cd "$WEB_DIR" || exit 1

# Step 2: Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
bun install

# Step 3: Type checking
echo -e "${BLUE}🔍 Running TypeScript checks...${NC}"
bunx astro check || {
  echo -e "${RED}❌ Type checking failed${NC}"
  exit 1
}
echo -e "${GREEN}✅ Type checking passed${NC}"

# Step 4: Build
echo -e "${BLUE}🔨 Building for production...${NC}"
bunx astro build || {
  echo -e "${RED}❌ Build failed${NC}"
  exit 1
}
echo -e "${GREEN}✅ Build successful${NC}"

# Step 5: Deploy to Cloudflare Pages
echo -e "${BLUE}🌐 Deploying to Cloudflare Pages...${NC}"

if [[ "$DEPLOY_TYPE" == "production" ]]; then
  echo -e "${YELLOW}⚠️  Deploying to PRODUCTION...${NC}"
  wrangler pages deploy dist --project-name="$PROJECT_NAME" --branch=main --commit-dirty=true
else
  echo -e "${YELLOW}📦 Deploying to PREVIEW...${NC}"
  wrangler pages deploy dist --project-name="$PROJECT_NAME" --branch=preview --commit-dirty=true
fi

DEPLOY_URL=$(wrangler pages deployment list --project-name="$PROJECT_NAME" --format json | head -n 1 | grep -o '"url":"[^"]*' | cut -d'"' -f4)

if [[ -z "$DEPLOY_URL" ]]; then
  echo -e "${YELLOW}⚠️  Could not extract deployment URL${NC}"
  echo -e "${GREEN}✅ Deployment completed, check Cloudflare dashboard for URL${NC}"
else
  echo ""
  echo -e "${GREEN}✅ Deployment successful!${NC}"
  echo ""
  echo -e "${BLUE}🔗 URL: ${DEPLOY_URL}${NC}"
  echo ""

  # Step 6: Run Lighthouse (optional)
  echo -e "${YELLOW}💡 Want to run Lighthouse tests? (y/n)${NC}"
  read -r RUN_LIGHTHOUSE

  if [[ "$RUN_LIGHTHOUSE" == "y" ]]; then
    echo -e "${BLUE}🔦 Running Lighthouse tests...${NC}"

    if command -v lighthouse &> /dev/null; then
      lighthouse "$DEPLOY_URL" \
        --only-categories=performance,accessibility,best-practices,seo \
        --output=html \
        --output-path=./lighthouse-report.html \
        --chrome-flags="--headless"

      echo -e "${GREEN}✅ Lighthouse report saved to: ./lighthouse-report.html${NC}"

      # Extract scores
      PERF_SCORE=$(grep -o '"performance":[0-9.]*' ./lighthouse-report.html | cut -d':' -f2 || echo "N/A")
      ACC_SCORE=$(grep -o '"accessibility":[0-9.]*' ./lighthouse-report.html | cut -d':' -f2 || echo "N/A")

      echo ""
      echo -e "${BLUE}📊 Lighthouse Scores:${NC}"
      echo -e "   Performance: ${PERF_SCORE}"
      echo -e "   Accessibility: ${ACC_SCORE}"
      echo ""

      if (( $(echo "$PERF_SCORE >= 90" | bc -l) )); then
        echo -e "${GREEN}🎉 Excellent performance score!${NC}"
      else
        echo -e "${YELLOW}⚠️  Performance could be improved${NC}"
      fi
    else
      echo -e "${YELLOW}⚠️  Lighthouse not installed. Install with: npm install -g lighthouse${NC}"
    fi
  fi
fi

echo ""
echo -e "${GREEN}✨ Deployment complete!${NC}"
echo ""
echo -e "${BLUE}📝 Next steps:${NC}"
echo "   1. Visit your deployment URL"
echo "   2. Test all interactive elements"
echo "   3. Check mobile responsiveness"
echo "   4. Verify Core Web Vitals in Chrome DevTools"
echo ""

cd ..
