---
title: Plugin Marketplace Integration Tests
dimension: events
category: testing
tags: elizaos, plugins, marketplace, e2e, testing
related_dimensions: things, events
scope: feature
created: 2025-11-22
version: 1.0.0
status: active
ai_context: |
  This document defines E2E integration tests for the elizaOS Plugin Marketplace.
  Location: one/events/elizaos/marketplace-integration-tests.md
  Purpose: Test complete user journeys through the marketplace
---

# Plugin Marketplace Integration Tests

## Test Suite Overview

**Purpose:** Validate complete user journeys through the plugin marketplace

**Test Framework:** Playwright (E2E testing)

**Coverage Areas:**
- Plugin discovery and search
- Plugin installation and configuration
- Plugin rating and reviews
- Plugin updates and rollbacks
- Analytics and monitoring
- Collections and comparisons

---

## Test Journey 1: Search and Install Plugin

**User Story:** As an org owner, I want to search for and install a plugin

### Test Steps

```typescript
test('should search for and install a plugin', async ({ page }) => {
  // 1. Navigate to marketplace
  await page.goto('/plugins');
  await expect(page).toHaveTitle(/Plugin Marketplace/);

  // 2. Search for plugin
  const searchInput = page.locator('input[placeholder*="Search plugins"]');
  await searchInput.fill('solana');
  await searchInput.press('Enter');

  // 3. Verify search results appear
  await expect(page.locator('[data-testid="plugin-card"]')).toBeVisible();
  await expect(page.locator('text=plugin-solana')).toBeVisible();

  // 4. Click on plugin card
  await page.locator('text=plugin-solana').first().click();

  // 5. Verify detail page loads
  await expect(page).toHaveURL(/\/plugins\/.+/);
  await expect(page.locator('h1:has-text("plugin-solana")')).toBeVisible();

  // 6. Click "Install" button
  await page.locator('button:has-text("Install")').click();

  // 7. Verify installation modal appears
  await expect(page.locator('[role="dialog"]')).toBeVisible();
  await expect(page.locator('text=Install plugin-solana')).toBeVisible();

  // 8. Fill configuration (API key)
  await page.locator('input[name="apiKey"]').fill('test-api-key-123');

  // 9. Confirm installation
  await page.locator('button:has-text("Confirm Installation")').click();

  // 10. Verify installation progress
  await expect(page.locator('text=Installing...')).toBeVisible();

  // 11. Wait for success notification
  await expect(page.locator('text=Plugin installed successfully')).toBeVisible({
    timeout: 30000,
  });

  // 12. Verify button changes to "Configure"
  await expect(page.locator('button:has-text("Configure")')).toBeVisible();
});
```

**Expected Results:**
- ✅ Search results appear in < 500ms
- ✅ Plugin detail page loads in < 1s
- ✅ Installation completes in < 30s
- ✅ Success notification appears
- ✅ Button state updates correctly

---

## Test Journey 2: Configure and Activate Plugin

**User Story:** As an org owner, I want to configure a plugin after installation

### Test Steps

```typescript
test('should configure and activate an installed plugin', async ({ page }) => {
  // Prerequisite: Plugin is installed
  await page.goto('/plugins/installed');

  // 1. Find installed plugin
  await expect(page.locator('text=plugin-solana')).toBeVisible();

  // 2. Click "Configure" button
  await page.locator('button:has-text("Configure")').first().click();

  // 3. Verify configuration modal opens
  await expect(page.locator('[role="dialog"]')).toBeVisible();
  await expect(page.locator('text=Configure plugin-solana')).toBeVisible();

  // 4. Update configuration
  await page.locator('input[name="rpcUrl"]').fill('https://api.mainnet-beta.solana.com');
  await page.locator('input[name="commitment"]').fill('confirmed');

  // 5. Save configuration
  await page.locator('button:has-text("Save")').click();

  // 6. Verify success message
  await expect(page.locator('text=Configuration saved')).toBeVisible();

  // 7. Enable plugin toggle
  await page.locator('input[type="checkbox"][aria-label="Enable plugin"]').check();

  // 8. Verify plugin is active
  await expect(page.locator('text=Active')).toBeVisible();

  // 9. Navigate to agent settings
  await page.goto('/agents/my-agent/settings');

  // 10. Verify plugin appears in agent's available plugins
  await expect(page.locator('text=plugin-solana')).toBeVisible();
});
```

**Expected Results:**
- ✅ Configuration form loads with current values
- ✅ Configuration saves successfully
- ✅ Plugin activates immediately
- ✅ Plugin appears in agent settings

---

## Test Journey 3: Execute Plugin Action

**User Story:** As an org user, I want to use a plugin action in an agent

### Test Steps

```typescript
test('should execute a plugin action', async ({ page }) => {
  // Prerequisite: Plugin is installed and activated
  await page.goto('/agents/my-agent/chat');

  // 1. Send message that triggers plugin
  await page.locator('textarea[placeholder*="Type a message"]').fill(
    'Check my SOL balance'
  );
  await page.keyboard.press('Enter');

  // 2. Verify message appears in chat
  await expect(page.locator('text=Check my SOL balance')).toBeVisible();

  // 3. Verify plugin action executes
  await expect(page.locator('text=Executing plugin-solana...')).toBeVisible();

  // 4. Wait for result
  await expect(page.locator('text=Your SOL balance:')).toBeVisible({
    timeout: 10000,
  });

  // 5. Verify result contains data
  await expect(page.locator('[data-testid="plugin-result"]')).toContainText(/\d+\.\d+ SOL/);

  // 6. Navigate to analytics
  await page.goto('/plugins/analytics');

  // 7. Verify execution is logged
  await expect(page.locator('text=plugin-solana')).toBeVisible();
  await expect(page.locator('text=1 execution')).toBeVisible();
});
```

**Expected Results:**
- ✅ Plugin action executes in < 10s
- ✅ Result displays in chat
- ✅ Execution appears in analytics
- ✅ No errors in console

---

## Test Journey 4: Rate and Review Plugin

**User Story:** As an org owner, I want to rate a plugin I've used

### Test Steps

```typescript
test('should submit a plugin review', async ({ page }) => {
  // Prerequisite: Plugin is installed and used
  await page.goto('/plugins/plugin-solana');

  // 1. Scroll to reviews section
  await page.locator('text=Reviews').scrollIntoViewIfNeeded();

  // 2. Click "Write Review" button
  await page.locator('button:has-text("Write Review")').click();

  // 3. Verify review modal opens
  await expect(page.locator('[role="dialog"]')).toBeVisible();
  await expect(page.locator('text=Write a Review')).toBeVisible();

  // 4. Select 5-star rating
  await page.locator('[data-testid="star-5"]').click();

  // 5. Write review text
  await page.locator('textarea[placeholder*="Share your experience"]').fill(
    'Excellent plugin! Works perfectly with Solana mainnet. Fast and reliable.'
  );

  // 6. Submit review
  await page.locator('button:has-text("Submit Review")').click();

  // 7. Verify success message
  await expect(page.locator('text=Review submitted')).toBeVisible();

  // 8. Verify review appears (pending moderation)
  await expect(page.locator('text=Your review is pending moderation')).toBeVisible();

  // 9. Reload page
  await page.reload();

  // 10. Verify review count increased
  const reviewCount = await page.locator('text=/\\d+ reviews/').textContent();
  expect(reviewCount).toContain('review');
});
```

**Expected Results:**
- ✅ Review form validates required fields
- ✅ Review submits successfully
- ✅ Review appears (pending or published)
- ✅ Average rating updates

---

## Test Journey 5: Update Plugin

**User Story:** As an org owner, I want to update a plugin when a new version is available

### Test Steps

```typescript
test('should update a plugin to new version', async ({ page }) => {
  // Prerequisite: Plugin update is available
  await page.goto('/plugins/installed');

  // 1. Verify update notification badge
  await expect(page.locator('[data-testid="update-badge"]')).toBeVisible();

  // 2. Click notification
  await page.locator('[data-testid="update-badge"]').click();

  // 3. Verify update modal opens
  await expect(page.locator('text=Update Available')).toBeVisible();
  await expect(page.locator('text=plugin-solana')).toBeVisible();

  // 4. Review changelog
  await expect(page.locator('text=What\'s New')).toBeVisible();
  await expect(page.locator('text=/v\\d+\\.\\d+\\.\\d+/')).toBeVisible();

  // 5. Check for breaking changes warning
  const hasBreaking = await page.locator('text=breaking changes').isVisible();
  if (hasBreaking) {
    await expect(page.locator('[data-icon="alert-triangle"]')).toBeVisible();
  }

  // 6. Click "Update Now"
  await page.locator('button:has-text("Update Now")').click();

  // 7. Verify update progress
  await expect(page.locator('text=Updating...')).toBeVisible();
  await expect(page.locator('[role="progressbar"]')).toBeVisible();

  // 8. Wait for completion
  await expect(page.locator('text=Update complete')).toBeVisible({
    timeout: 60000,
  });

  // 9. Verify new version displayed
  await expect(page.locator('text=/v\\d+\\.\\d+\\.\\d+/')).toBeVisible();

  // 10. Verify plugin still works
  await page.goto('/agents/my-agent/chat');
  await page.locator('textarea').fill('Test plugin after update');
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-testid="plugin-result"]')).toBeVisible({
    timeout: 10000,
  });
});
```

**Expected Results:**
- ✅ Update notification appears
- ✅ Changelog displays correctly
- ✅ Update completes in < 60s
- ✅ Plugin works after update

---

## Test Journey 6: Uninstall Plugin

**User Story:** As an org owner, I want to uninstall a plugin I no longer need

### Test Steps

```typescript
test('should uninstall a plugin', async ({ page }) => {
  await page.goto('/plugins/installed');

  // 1. Find plugin to uninstall
  await expect(page.locator('text=plugin-discord')).toBeVisible();

  // 2. Click "Uninstall" button
  await page.locator('button:has-text("Uninstall")').click();

  // 3. Verify confirmation modal
  await expect(page.locator('text=Are you sure?')).toBeVisible();
  await expect(page.locator('text=This action cannot be undone')).toBeVisible();

  // 4. Confirm uninstall
  await page.locator('button:has-text("Yes, Uninstall")').click();

  // 5. Verify uninstall progress
  await expect(page.locator('text=Uninstalling...')).toBeVisible();

  // 6. Wait for completion
  await expect(page.locator('text=Plugin uninstalled')).toBeVisible();

  // 7. Verify plugin removed from list
  await expect(page.locator('text=plugin-discord')).not.toBeVisible();

  // 8. Navigate to marketplace
  await page.goto('/plugins');

  // 9. Verify plugin shows as "Not Installed"
  await page.locator('input[placeholder*="Search"]').fill('discord');
  await page.keyboard.press('Enter');
  await expect(page.locator('button:has-text("Install")')).toBeVisible();
});
```

**Expected Results:**
- ✅ Confirmation required before uninstall
- ✅ Uninstall completes successfully
- ✅ Plugin removed from installed list
- ✅ Plugin available to reinstall

---

## Test Journey 7: Install Plugin Collection

**User Story:** As an org owner, I want to install a curated collection of plugins

### Test Steps

```typescript
test('should install a plugin collection', async ({ page }) => {
  await page.goto('/plugins/collections');

  // 1. View collections
  await expect(page.locator('text=Essential AI Tools')).toBeVisible();
  await expect(page.locator('text=Blockchain Starter Pack')).toBeVisible();

  // 2. Click on collection
  await page.locator('text=Essential AI Tools').click();

  // 3. Verify collection details
  await expect(page.locator('h1:has-text("Essential AI Tools")')).toBeVisible();
  await expect(page.locator('text=/\\d+ plugins/')).toBeVisible();

  // 4. Click "Install Collection"
  await page.locator('button:has-text("Install Collection")').click();

  // 5. Verify plugin selection modal
  await expect(page.locator('[role="dialog"]')).toBeVisible();
  await expect(page.locator('text=/\\d+ plugins selected/')).toBeVisible();

  // 6. Deselect one plugin
  const firstCheckbox = page.locator('input[type="checkbox"]').first();
  await firstCheckbox.uncheck();

  // 7. Verify count updated
  await expect(page.locator('text=/\\d+ plugins selected/')).toBeVisible();

  // 8. Click "Install"
  await page.locator('button:has-text("Install")').click();

  // 9. Verify batch installation progress
  await expect(page.locator('text=Installing plugins...')).toBeVisible();
  await expect(page.locator('[role="progressbar"]')).toBeVisible();

  // 10. Wait for all plugins to install
  await expect(page.locator('text=All plugins installed')).toBeVisible({
    timeout: 120000, // 2 minutes for collection
  });

  // 11. Navigate to installed plugins
  await page.goto('/plugins/installed');

  // 12. Verify plugins from collection are installed
  await expect(page.locator('text=plugin-knowledge')).toBeVisible();
  await expect(page.locator('text=plugin-memory')).toBeVisible();
});
```

**Expected Results:**
- ✅ Collection displays all included plugins
- ✅ User can select/deselect plugins
- ✅ Batch installation succeeds
- ✅ All selected plugins appear in installed list

---

## Test Journey 8: Compare Plugins

**User Story:** As an org owner, I want to compare multiple plugins before choosing

### Test Steps

```typescript
test('should compare multiple plugins', async ({ page }) => {
  await page.goto('/plugins');

  // 1. Select first plugin for comparison
  await page.locator('[data-testid="compare-checkbox"]').first().check();

  // 2. Select second plugin
  await page.locator('[data-testid="compare-checkbox"]').nth(1).check();

  // 3. Select third plugin
  await page.locator('[data-testid="compare-checkbox"]').nth(2).check();

  // 4. Verify "Compare" button appears
  await expect(page.locator('button:has-text("Compare Selected")')).toBeVisible();

  // 5. Click compare
  await page.locator('button:has-text("Compare Selected")').click();

  // 6. Verify comparison page loads
  await expect(page).toHaveURL(/\/plugins\/compare/);
  await expect(page.locator('h1:has-text("Plugin Comparison")')).toBeVisible();

  // 7. Verify comparison table
  await expect(page.locator('table')).toBeVisible();
  await expect(page.locator('text=Overall Rating')).toBeVisible();
  await expect(page.locator('text=Performance Metrics')).toBeVisible();
  await expect(page.locator('text=Features')).toBeVisible();

  // 8. Verify all 3 plugins displayed
  const pluginColumns = page.locator('thead th').nth(1);
  await expect(pluginColumns).toBeVisible();

  // 9. Click "Install" on best-rated plugin
  const bestPlugin = page.locator('button:has-text("Install")').first();
  await bestPlugin.click();

  // 10. Verify installation starts
  await expect(page.locator('[role="dialog"]')).toBeVisible();
});
```

**Expected Results:**
- ✅ Can select up to 3 plugins
- ✅ Comparison table displays all metrics
- ✅ Can install directly from comparison
- ✅ URL is shareable

---

## Test Journey 9: View Analytics Dashboard

**User Story:** As an org owner, I want to monitor plugin usage and performance

### Test Steps

```typescript
test('should view plugin analytics', async ({ page }) => {
  await page.goto('/plugins/analytics');

  // 1. Verify dashboard loads
  await expect(page.locator('h1:has-text("Plugin Analytics")')).toBeVisible();

  // 2. Verify summary cards
  await expect(page.locator('text=Total Executions')).toBeVisible();
  await expect(page.locator('text=Success Rate')).toBeVisible();
  await expect(page.locator('text=Error Rate')).toBeVisible();

  // 3. Verify chart displays
  await expect(page.locator('text=Daily Executions')).toBeVisible();
  await expect(page.locator('[data-testid="line-chart"]')).toBeVisible();

  // 4. Change time range
  await page.locator('select[name="timeRange"]').selectOption('7d');

  // 5. Verify chart updates
  await expect(page.locator('text=Last 7 days')).toBeVisible();

  // 6. Filter by specific plugin
  await page.locator('select[name="plugin"]').selectOption('plugin-solana');

  // 7. Verify data filtered
  await expect(page.locator('text=plugin-solana')).toBeVisible();

  // 8. Export data
  await page.locator('button:has-text("Export CSV")').click();

  // 9. Verify download starts
  const downloadPromise = page.waitForEvent('download');
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain('.csv');

  // 10. View plugin leaderboard
  await page.locator('text=Plugin Leaderboard').scrollIntoViewIfNeeded();
  await expect(page.locator('table')).toBeVisible();
  await expect(page.locator('text=#1')).toBeVisible();
});
```

**Expected Results:**
- ✅ Dashboard loads in < 3s
- ✅ Charts render correctly
- ✅ Filters update data immediately
- ✅ Export generates CSV file

---

## Test Journey 10: Error Handling and Recovery

**User Story:** As an org owner, I want to see helpful errors when things go wrong

### Test Steps

```typescript
test('should handle errors gracefully', async ({ page }) => {
  // Test 1: Invalid API key during installation
  await page.goto('/plugins/plugin-solana');
  await page.locator('button:has-text("Install")').click();
  await page.locator('input[name="apiKey"]').fill('invalid-key');
  await page.locator('button:has-text("Confirm")').click();

  // Verify error message
  await expect(page.locator('text=Invalid API key')).toBeVisible();
  await expect(page.locator('[data-icon="alert-circle"]')).toBeVisible();

  // Test 2: Network error during update
  await page.route('**/api/plugins/update', (route) => route.abort());
  await page.goto('/plugins/installed');
  await page.locator('button:has-text("Update")').click();

  // Verify error handling
  await expect(page.locator('text=Update failed')).toBeVisible();
  await expect(page.locator('button:has-text("Retry")')).toBeVisible();

  // Test 3: Plugin execution error
  await page.goto('/agents/my-agent/chat');
  await page.locator('textarea').fill('Trigger error');
  await page.keyboard.press('Enter');

  // Verify error display
  await expect(page.locator('text=Plugin error')).toBeVisible();
  await expect(page.locator('text=View logs')).toBeVisible();

  // Click "View logs"
  await page.locator('text=View logs').click();

  // Verify error details
  await expect(page).toHaveURL(/\/plugins\/analytics/);
  await expect(page.locator('text=Error log')).toBeVisible();
});
```

**Expected Results:**
- ✅ Clear error messages displayed
- ✅ Retry options provided
- ✅ Error logs accessible
- ✅ No unhandled exceptions

---

## Performance Benchmarks

All tests must meet these performance criteria:

| Action | Target | Measurement |
|--------|--------|-------------|
| Page load | < 2s | 95th percentile |
| Search results | < 500ms | 95th percentile |
| Plugin install | < 30s | 95th percentile |
| Plugin update | < 60s | 95th percentile |
| Action execution | < 10s | 95th percentile |
| Chart render | < 1s | 95th percentile |

---

## Accessibility Tests

All marketplace pages must pass:

- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Screen reader compatibility (ARIA labels)
- [ ] Color contrast ratio (4.5:1 minimum)
- [ ] Focus indicators visible
- [ ] Form labels present
- [ ] Error messages announced

---

## Test Execution

### Local Testing

```bash
# Install dependencies
npm install

# Run all tests
npm run test:e2e

# Run specific test
npm run test:e2e -- marketplace-search

# Run in headed mode (see browser)
npm run test:e2e -- --headed

# Generate report
npm run test:e2e -- --reporter=html
```

### CI/CD Integration

```yaml
# .github/workflows/marketplace-tests.yml
name: Marketplace Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Success Criteria

**All 10 test journeys must:**
- ✅ Pass consistently (95%+ success rate)
- ✅ Complete within performance targets
- ✅ Handle errors gracefully
- ✅ Meet accessibility standards
- ✅ Work across browsers (Chrome, Firefox, Safari)
- ✅ Work on mobile viewports

**Continuous monitoring:**
- Run on every commit
- Report failures immediately
- Track performance trends
- Alert on regressions

---

**Testing ensures the marketplace is production-ready and user-friendly. Every user journey must work flawlessly.**
