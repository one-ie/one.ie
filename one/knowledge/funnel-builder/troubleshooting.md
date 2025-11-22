# AI Chat Funnel Builder - Troubleshooting

**Common issues and solutions.**

Version: 1.0.0
Last Updated: 2025-11-22

---

## Quick Diagnostic Checklist

**Before troubleshooting, verify:**

- [ ] Funnel is published (status shows "published")
- [ ] You're logged into the correct account
- [ ] Browser cache cleared (Ctrl+Shift+R)
- [ ] No ad blockers interfering
- [ ] JavaScript enabled
- [ ] Stable internet connection

---

## Publishing Issues

### Funnel Won't Publish

**Symptom:** Clicking "Publish" does nothing or shows error.

**Causes:**
1. Funnel has no steps
2. Steps have no content
3. Stripe not configured (if using payments)
4. Custom domain not verified

**Solutions:**

**Add at least one step:**
```bash
1. Click "Add Step"
2. Choose step type (landing, sales, etc.)
3. Add at least one element (headline, image, etc.)
4. Try publishing again
```

**Configure Stripe (if selling):**
```bash
1. Navigate to Settings → Payments
2. Click "Connect Stripe"
3. Authorize Stripe account
4. Return to funnel and publish
```

**Verify custom domain:**
```bash
1. Settings → Domain
2. Check DNS records:
   - CNAME: www → one.ie
   - A: @ → 76.76.21.21
3. Click "Verify Domain"
4. Wait 5-60 minutes for propagation
```

### Funnel Published But Not Loading

**Symptom:** Funnel URL shows 404 or blank page.

**Causes:**
1. DNS not propagated
2. SSL certificate provisioning
3. Cache issues
4. Funnel unpublished

**Solutions:**

**Check DNS propagation:**
```bash
# Visit dnschecker.org
# Enter your custom domain
# Verify CNAME and A records show correct values
# Wait 60 minutes if not propagated
```

**Force SSL certificate renewal:**
```bash
1. Navigate to Settings → Domain
2. Click "Renew SSL Certificate"
3. Wait 5 minutes
4. Try loading funnel again
```

**Clear browser cache:**
```bash
# Chrome/Edge
Ctrl+Shift+Delete → Clear browsing data → Cached images and files

# Firefox
Ctrl+Shift+Delete → Cache → Clear Now

# Safari
Cmd+Option+E → Empty Caches
```

### Custom Domain Not Working

**Symptom:** Custom domain shows error or redirects incorrectly.

**Causes:**
1. Incorrect DNS records
2. DNS not propagated
3. SSL certificate not issued
4. Domain not verified in settings

**Solutions:**

**Verify DNS records:**

```bash
# Required records:
CNAME: www.yourdomain.com → one.ie
A:     yourdomain.com     → 76.76.21.21

# Check with:
dig www.yourdomain.com
dig yourdomain.com

# Or online tool:
https://dnschecker.org
```

**Wait for propagation:**
```bash
# DNS propagation takes:
- Minimum: 5 minutes
- Average: 30 minutes
- Maximum: 48 hours (rare)

# Check status:
https://dnschecker.org/all-dns-records-of-domain.php?query=yourdomain.com
```

**Verify domain in dashboard:**
```bash
1. Navigate to Settings → Domain
2. Enter custom domain: yourdomain.com
3. Click "Verify"
4. Wait for green checkmark
5. If fails, check DNS records again
```

---

## Form Submission Issues

### Forms Not Submitting

**Symptom:** Clicking submit button does nothing or shows error.

**Causes:**
1. Form element not added
2. Submit button not connected to form
3. Email service not configured
4. JavaScript blocked

**Solutions:**

**Check form configuration:**
```bash
1. Edit page with form
2. Verify form element exists
3. Click submit button
4. Check "Form ID" property matches form element ID
5. Save and test
```

**Connect email service:**
```bash
1. Navigate to Settings → Integrations
2. Choose email provider (ConvertKit, Mailchimp, etc.)
3. Enter API key
4. Click "Connect"
5. Map form fields to email service fields
```

**Test with browser console:**
```javascript
// Open browser console (F12)
// Submit form and check for errors
// Common errors:
// - "Form not found" → Form ID mismatch
// - "Network error" → Email service not connected
// - "Validation error" → Required fields empty
```

### Form Submissions Not Appearing in Dashboard

**Symptom:** Forms submit successfully but don't show in analytics.

**Causes:**
1. Email service connected (submissions go there instead)
2. Funnel unpublished
3. Cache not refreshed
4. Time zone mismatch

**Solutions:**

**Check email service:**
```bash
1. Navigate to Settings → Integrations
2. If email service connected, submissions go there
3. Check email service dashboard (ConvertKit, etc.)
4. To store in ONE: Disconnect email service
```

**Refresh analytics:**
```bash
1. Navigate to Analytics
2. Click "Refresh" (top right)
3. Change date range to "All Time"
4. Check again
```

**Check time zone:**
```bash
1. Navigate to Settings → General
2. Verify time zone matches your location
3. Analytics show in selected time zone
```

---

## Payment Issues

### Stripe Payments Failing

**Symptom:** Checkout shows error or payment doesn't process.

**Causes:**
1. Stripe in test mode
2. Stripe API keys incorrect
3. Buy button not configured
4. Customer's card declined

**Solutions:**

**Switch Stripe to live mode:**
```bash
1. Navigate to Settings → Payments
2. Check "Stripe Mode": Test or Live
3. If Test, click "Switch to Live"
4. Confirm switch
5. Test payment with real card
```

**Verify Stripe keys:**
```bash
1. Go to https://dashboard.stripe.com/apikeys
2. Copy "Publishable key" (starts with pk_live_)
3. Copy "Secret key" (starts with sk_live_)
4. Navigate to Settings → Payments
5. Paste keys
6. Click "Save"
```

**Check buy button configuration:**
```bash
1. Edit page with buy button
2. Click buy button element
3. Verify "Price" is set correctly
4. Verify "Product ID" matches Stripe product
5. Save and test
```

**Test with different card:**
```bash
# Stripe test cards:
4242 4242 4242 4242 → Success
4000 0000 0000 0002 → Declined
4000 0000 0000 9995 → Insufficient funds

# Use in test mode only
```

### Refunds Not Processing

**Symptom:** Clicking "Refund" shows error or doesn't complete.

**Causes:**
1. Payment already refunded
2. Payment older than 90 days (Stripe limit)
3. Stripe API error
4. Insufficient permissions

**Solutions:**

**Check refund status:**
```bash
1. Navigate to Payments → Transactions
2. Find payment
3. Check "Status" column
4. If "Refunded", already processed
5. Check customer's Stripe account
```

**Refund via Stripe dashboard:**
```bash
1. Go to https://dashboard.stripe.com/payments
2. Find payment
3. Click "Refund"
4. Process refund
5. Refund syncs to ONE automatically
```

---

## Analytics Issues

### Analytics Not Tracking

**Symptom:** Analytics show zero visitors despite traffic.

**Causes:**
1. Funnel not published
2. Tracking code not installed
3. Ad blocker blocking analytics
4. Testing with same device/IP

**Solutions:**

**Verify tracking installation:**
```bash
1. Visit your funnel URL
2. Right-click → View Page Source
3. Search for "one-analytics" (Ctrl+F)
4. If not found, tracking not installed
5. Republish funnel to install
```

**Test in incognito mode:**
```bash
1. Open incognito/private window
2. Visit funnel URL
3. Wait 5 minutes
4. Check analytics dashboard
5. If showing traffic, ad blocker was the issue
```

**Test from different device:**
```bash
# Analytics may filter repeated visits from same IP
# Test from:
- Mobile device (different IP)
- Friend's computer
- Public WiFi

# Should show as new visitor
```

### Conversion Tracking Not Working

**Symptom:** Analytics show visitors but no conversions.

**Causes:**
1. Stripe webhook not configured
2. Form submissions not tracking
3. Conversion event not firing
4. Ad blocker blocking tracking

**Solutions:**

**Configure Stripe webhook:**
```bash
1. Navigate to Settings → Webhooks
2. Copy webhook URL
3. Go to https://dashboard.stripe.com/webhooks
4. Click "Add endpoint"
5. Paste URL
6. Select events: payment_intent.succeeded
7. Save
```

**Test conversion manually:**
```bash
1. Navigate to funnel URL
2. Open browser console (F12)
3. Complete checkout
4. Look for "Conversion tracked" message
5. If missing, tracking code issue
```

### Analytics Data Incorrect

**Symptom:** Analytics show wrong numbers or metrics don't add up.

**Causes:**
1. Bot traffic not filtered
2. Time zone mismatch
3. Multiple tracking codes
4. Cache showing old data

**Solutions:**

**Enable bot filtering:**
```bash
1. Navigate to Settings → Analytics
2. Check "Filter bot traffic"
3. Save
4. Wait 24 hours for re-processing
```

**Verify time zone:**
```bash
1. Navigate to Settings → General
2. Check "Time zone" setting
3. Change to your local time zone
4. Analytics recalculate automatically
```

**Remove duplicate tracking:**
```bash
1. View page source
2. Search for "one-analytics"
3. If appears multiple times, duplicate tracking
4. Edit page
5. Remove extra tracking codes
```

---

## Element/Page Builder Issues

### Elements Won't Save

**Symptom:** Editing element but changes don't persist.

**Causes:**
1. Auto-save disabled
2. Network connection lost
3. Browser storage full
4. Concurrent editing session

**Solutions:**

**Check auto-save:**
```bash
1. Edit page
2. Look for "Auto-save" indicator (top right)
3. If "Off", click to enable
4. Make change and wait 5 seconds
5. Should show "Saved" confirmation
```

**Force manual save:**
```bash
1. Edit page
2. Press Ctrl+S (or Cmd+S on Mac)
3. Wait for "Saved" message
4. Refresh page to verify changes
```

**Clear browser storage:**
```bash
# Chrome/Edge
F12 → Application → Storage → Clear site data

# Firefox
F12 → Storage → Clear all

# Then refresh and try again
```

### Drag-and-Drop Not Working

**Symptom:** Can't drag elements on page.

**Causes:**
1. Page locked
2. Element locked
3. Browser compatibility
4. Touch screen interference

**Solutions:**

**Unlock page:**
```bash
1. Check top-left corner for lock icon
2. If locked, click to unlock
3. Try dragging again
```

**Unlock element:**
```bash
1. Click element
2. Check properties panel
3. Look for "Locked" checkbox
4. Uncheck to unlock
```

**Use keyboard shortcuts:**
```bash
# Alternative to dragging:
Arrow keys: Move element 1px
Shift+Arrow: Move element 10px
Ctrl+Arrow: Move element 100px
```

### Elements Overlapping Incorrectly

**Symptom:** Elements appear in wrong order (z-index issues).

**Causes:**
1. Z-index not set
2. Position conflicts
3. Responsive settings override

**Solutions:**

**Adjust z-index:**
```bash
1. Click element that should be on top
2. Properties panel → Position
3. Set "Z-index" to higher number (e.g., 10)
4. Background elements: Z-index = 1
5. Foreground elements: Z-index = 10+
```

**Use layer panel:**
```bash
1. Open Layers panel (right sidebar)
2. Drag elements to reorder
3. Top of list = front
4. Bottom of list = back
```

---

## Performance Issues

### Funnel Loading Slowly

**Symptom:** Pages take 5+ seconds to load.

**Causes:**
1. Large images not optimized
2. Too many elements on page
3. Slow custom code
4. CDN not caching

**Solutions:**

**Optimize images:**
```bash
1. Images should be < 500KB
2. Use WebP format for modern browsers
3. Compress with tinypng.com or similar
4. Upload optimized images
```

**Reduce elements:**
```bash
# Best practices:
- < 20 elements per page
- Combine similar elements
- Remove unused elements
- Use lazy loading for below-fold content
```

**Test performance:**
```bash
1. Open https://pagespeed.web.dev
2. Enter funnel URL
3. Check score (aim for 90+)
4. Follow recommendations
```

### Mobile Page Slow

**Symptom:** Desktop fast but mobile slow.

**Causes:**
1. Mobile-specific large images
2. Unoptimized responsive settings
3. Too many animations
4. Third-party scripts

**Solutions:**

**Optimize for mobile:**
```bash
1. Edit page
2. Switch to mobile view (icon in top bar)
3. Check image sizes (should be < 200KB)
4. Disable heavy animations
5. Test on real device
```

**Use mobile-specific images:**
```bash
1. Click image element
2. Properties → Responsive
3. Add mobile-specific image (smaller)
4. Save and test
```

---

## Integration Issues

### Zapier Not Triggering

**Symptom:** Form submissions not triggering Zapier workflows.

**Causes:**
1. Zapier webhook not connected
2. Form field mapping incorrect
3. Zapier

 account paused
4. Trigger filter blocking

**Solutions:**

**Verify webhook:**
```bash
1. Navigate to Settings → Integrations → Zapier
2. Copy webhook URL
3. Go to Zapier.com → Zaps
4. Check webhook URL matches
5. Test trigger manually
```

**Check Zapier logs:**
```bash
1. Go to Zapier.com → Zap History
2. Find recent form submission
3. Check for errors
4. Common: Field mapping issues
```

### Calendar Booking Not Working

**Symptom:** Calendly/calendar integration not loading.

**Causes:**
1. Calendar element not added
2. Calendly URL incorrect
3. Embed settings blocking iframe
4. Ad blocker blocking embed

**Solutions:**

**Check calendar element:**
```bash
1. Edit page
2. Verify calendar element exists
3. Click element → Properties
4. Check "Calendar URL" is correct Calendly link
5. Format: https://calendly.com/yourname/meeting
```

**Test embed:**
```bash
1. View page source
2. Search for "calendly" or "calendar"
3. Verify iframe code present
4. If missing, re-add element
```

---

## Getting Help

### Still Having Issues?

**Before contacting support, collect:**

1. **Funnel URL:** https://one.ie/f/your-funnel
2. **Browser:** Chrome 108, Firefox 107, etc.
3. **Error message:** Screenshot or copy exact text
4. **Steps to reproduce:** What you clicked, what happened
5. **Expected behavior:** What should have happened

**Contact support:**

- **Live chat:** Click chat icon (fastest, < 5 min response)
- **Email:** support@one.ie (< 24 hour response)
- **Discord:** #support channel (community help)

**Include this info:**
```
Funnel ID: fun_1a2b3c
Issue: [Brief description]
Browser: Chrome 108
Device: Desktop / Mobile
Steps: [What you did]
Expected: [What should happen]
Actual: [What happened]
Screenshot: [Attach if possible]
```

---

**Related documentation:**
- [User Guide](/one/knowledge/funnel-builder/user-guide.md)
- [FAQ](/one/knowledge/funnel-builder/faq.md)
- [API Reference](/one/knowledge/funnel-builder/api-reference.md)
