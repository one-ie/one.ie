# Commerce System Tests

## Overview

Test suite for the conversational commerce system, covering intent extraction, product recommendations, and complete user flows.

## Test Categories

### Unit Tests

**`intent-extraction.test.ts`**
- Skill level detection (beginner, intermediate, advanced)
- Category detection (padel_racket, course, software)
- Product scoring logic
- Pain point extraction

### Integration Tests (TODO - Backend Phase)

When Convex backend is implemented:
- Session creation and persistence
- Full conversation flow
- Product recommendation API
- Purchase completion flow
- Analytics tracking

### End-to-End Tests (TODO - Backend Phase)

Full user journeys:
1. **Discovery → Consultation → Purchase**
   - User starts conversation
   - System extracts needs
   - Products recommended
   - User completes checkout

2. **ChatGPT Integration**
   - ChatGPT calls API
   - Conversation state maintained
   - Recommendations formatted correctly
   - Attribution tracked

3. **Multi-Category Flow**
   - User switches between categories
   - Context maintained
   - Recommendations adapt

## Running Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test test/commerce/intent-extraction.test.ts

# Watch mode
bun test --watch

# Coverage
bun test --coverage
```

## Test Data

**Mock Products:**
- Located in `/web/src/lib/data/products-multi-category.ts`
- Covers 3 categories: padel_racket, course, software
- Each category has 2-3 example products

## Manual Testing Checklist

### Standalone Chat Page (`/commerce-chat`)

- [ ] Session initializes with welcome message
- [ ] User can send messages
- [ ] Intent extraction works (skill level, budget, pain points)
- [ ] Product recommendations appear inline
- [ ] Suggested prompts clickable
- [ ] "Buy Now" redirects to checkout
- [ ] "View Details" opens product page
- [ ] Mobile responsive

### Embedded Mode (`/commerce-chat?embed=true`)

- [ ] Minimal layout (no header/footer)
- [ ] Can be embedded via iframe
- [ ] PostMessage communication works
- [ ] Parent page can receive events

### Commerce Widget (`CommerceWidget`)

- [ ] Widget appears in correct position
- [ ] Minimizes/maximizes smoothly
- [ ] Chat functionality works when expanded
- [ ] Badge shows unread messages
- [ ] Custom colors apply

### Multi-Category Support

**Padel Rackets:**
- [ ] "I need a racket for aggressive play" → power rackets
- [ ] "I have tennis elbow" → soft-core rackets prioritized
- [ ] "Beginner under €100" → budget beginner rackets

**Courses:**
- [ ] "I want to learn web development" → web dev courses
- [ ] "Complete beginner" → beginner courses
- [ ] "Advanced React" → advanced courses

**Software:**
- [ ] "Project management for small team" → Starter plan
- [ ] "Growing company needs tools" → Business plan
- [ ] Budget queries work correctly

### Error Handling

- [ ] Network errors show friendly message
- [ ] Invalid input handled gracefully
- [ ] Error boundary catches React errors
- [ ] Retry mechanism works

### Performance

- [ ] Initial load < 2 seconds
- [ ] Message response < 1 second
- [ ] Smooth scrolling on mobile
- [ ] No layout shifts
- [ ] Images load progressively

## Known Limitations (Pre-Backend)

- No real session persistence (uses mock API)
- No actual payment processing
- No analytics tracking to database
- Product data is static (not from Convex)
- No user authentication

These will be addressed in the backend implementation phase.

## ChatGPT Integration Testing

### Custom GPT Action Setup

1. Create Custom GPT in ChatGPT
2. Configure action with your API endpoint
3. Test conversation flow:
   - "I need a padel racket for beginners"
   - "I have tennis elbow, what do you recommend?"
   - "Show me courses for web development"

### Expected ChatGPT Behavior

- Natural conversation flow
- Recommendations formatted in markdown
- Buy Now links work
- Attribution tracked in session
- Follow-up questions maintain context

## Future Tests

When backend is implemented:
- [ ] Convex mutations/queries
- [ ] Real-time updates
- [ ] Multi-user sessions
- [ ] Analytics aggregation
- [ ] Payment webhook handling
- [ ] Email notification system
