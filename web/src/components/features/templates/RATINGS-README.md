# Template Rating System

**Cycle 57 Implementation** - Complete 5-star rating and review system for templates.

## Features

- **5-Star Rating System** - Interactive star input with hover states
- **Written Reviews** - Optional detailed feedback (up to 2000 characters)
- **Rating Breakdown** - Visual display of rating distribution (5-stars: 80%, etc.)
- **Helpful Voting** - Users can vote reviews as helpful
- **Sort Options** - Sort by recent, helpful, or rating
- **User Management** - Edit and delete your own reviews
- **Real-Time Updates** - Powered by Convex for instant updates
- **Template Discovery** - Sort templates by average rating

## 6-Dimension Ontology Mapping

### Connection (Dimension 4)
- **Type**: `rated`
- **From**: User (creator thing)
- **To**: Template (funnel_template, page_template, template thing)
- **Metadata**:
  - `rating`: number (1-5 stars)
  - `reviewText`: string (optional, max 2000 chars)
  - `helpfulVotes`: string[] (user IDs who voted helpful)

### Events (Dimension 5)
- `rated` - User submitted a rating/review
- `review_updated` - User updated their rating/review
- `review_helpful_voted` - User voted a review as helpful
- `review_deleted` - User deleted their review

### Things (Dimensions 2 & 3)
- Templates: `funnel_template`, `page_template`, `template`
- Users: `creator` (reviewers)

## Backend API

### Queries

#### `getTemplateRatings`
Get rating statistics for a template.

```typescript
const stats = useQuery(api.queries.ratings.getTemplateRatings, {
  templateId,
});

// Returns:
{
  averageRating: 4.5,
  totalRatings: 127,
  breakdown: {
    5: 80,
    4: 30,
    3: 10,
    2: 5,
    1: 2,
  },
}
```

#### `getTemplateReviews`
Get all reviews for a template with sorting.

```typescript
const reviews = useQuery(api.queries.ratings.getTemplateReviews, {
  templateId,
  sortBy: "helpful", // "recent" | "helpful" | "rating"
  limit: 50,
});

// Returns array of:
{
  id: "connection-id",
  rating: 5,
  reviewText: "Amazing template!",
  helpfulVotes: ["user1", "user2"],
  helpfulCount: 2,
  createdAt: 1234567890,
  reviewer: {
    id: "user-id",
    name: "John Doe",
    avatarUrl: "...",
  },
}
```

#### `getUserRating`
Get the current user's rating for a template.

```typescript
const userRating = useQuery(api.queries.ratings.getUserRating, {
  templateId,
});

// Returns null or:
{
  id: "connection-id",
  rating: 5,
  reviewText: "Great template",
  helpfulVotes: [],
  createdAt: 1234567890,
}
```

#### `listTemplatesByRating`
List templates sorted by average rating.

```typescript
const topTemplates = useQuery(api.queries.ratings.listTemplatesByRating, {
  groupId,
  type: "funnel_template",
  minRating: 4.0,
  limit: 20,
});

// Returns templates with:
{
  ...template,
  averageRating: 4.7,
  totalRatings: 89,
}
```

### Mutations

#### `rateTemplate`
Submit or update a rating/review.

```typescript
const rateTemplate = useMutation(api.mutations.ratings.rateTemplate);

await rateTemplate({
  templateId,
  rating: 5, // 1-5 stars
  reviewText: "Excellent template!", // Optional
});
```

#### `voteReviewHelpful`
Vote a review as helpful (toggles on/off).

```typescript
const voteHelpful = useMutation(api.mutations.ratings.voteReviewHelpful);

await voteHelpful({
  connectionId, // Review connection ID
});
```

#### `deleteRating`
Delete your own rating/review.

```typescript
const deleteRating = useMutation(api.mutations.ratings.deleteRating);

await deleteRating({
  connectionId, // Your rating connection ID
});
```

## Frontend Components

### `<TemplateRatings>`
Complete rating system with submission, display, and reviews.

```tsx
import { TemplateRatings } from "@/components/features/templates/TemplateRatings";

<TemplateRatings
  client:load
  templateId={template._id}
  showSubmitForm={true} // Optional, default true
/>
```

**Features:**
- Rating statistics with breakdown
- Submit/edit rating form
- Reviews list with sorting
- Helpful voting
- Delete own reviews

### `<TemplateCardWithRating>`
Template card with rating display.

```tsx
import { TemplateCardWithRating } from "@/components/features/templates/TemplateCardWithRating";

<TemplateCardWithRating
  client:load
  template={template}
  onSelect={(id) => navigate(`/templates/${id}`)}
  onPreview={(id) => openPreviewModal(id)}
/>
```

**Features:**
- Template preview
- Compact rating display
- Usage count
- Action buttons

### `<RatingDisplay>`
Rating statistics visualization.

```tsx
import { RatingDisplay } from "@/components/features/templates/RatingDisplay";

<RatingDisplay
  averageRating={4.5}
  totalRatings={127}
  breakdown={{
    5: 80,
    4: 30,
    3: 10,
    2: 5,
    1: 2,
  }}
  compact={false} // Optional, shows full breakdown
/>
```

### `<RatingInput>`
Interactive star rating input.

```tsx
import { RatingInput } from "@/components/features/templates/RatingInput";

const [rating, setRating] = useState(0);

<RatingInput
  rating={rating}
  onRatingChange={setRating}
  size="lg" // "sm" | "md" | "lg"
  disabled={false}
/>
```

### `<ReviewCard>`
Individual review display.

```tsx
import { ReviewCard } from "@/components/features/templates/ReviewCard";

<ReviewCard
  review={review}
  currentUserId={user?.id}
  onVoteHelpful={(id) => voteHelpful({ connectionId: id })}
  onDelete={(id) => deleteRating({ connectionId: id })}
/>
```

### `<ReviewList>`
List of reviews with sorting.

```tsx
import { ReviewList } from "@/components/features/templates/ReviewList";

<ReviewList
  reviews={reviews}
  currentUserId={user?.id}
  onVoteHelpful={handleVoteHelpful}
  onDelete={handleDeleteReview}
  onSortChange={(sortBy) => setSortBy(sortBy)}
/>
```

## Usage Examples

### Template Detail Page

```astro
---
// src/pages/templates/[id].astro
import Layout from "@/layouts/Layout.astro";
import { TemplateRatings } from "@/components/features/templates/TemplateRatings";

const { id } = Astro.params;
const template = await getTemplate(id);
---

<Layout title={template.name}>
  <!-- Template details -->
  <div class="template-content">
    {/* ... */}
  </div>

  <!-- Ratings & Reviews -->
  <TemplateRatings client:load templateId={template._id} />
</Layout>
```

### Template Gallery

```tsx
// src/components/features/templates/TemplateGallery.tsx
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TemplateCardWithRating } from "./TemplateCardWithRating";

export function TemplateGallery({ groupId }: { groupId: string }) {
  const templates = useQuery(api.queries.ratings.listTemplatesByRating, {
    groupId,
    minRating: 4.0,
    limit: 20,
  });

  return (
    <div className="grid grid-cols-3 gap-4">
      {templates?.map((template) => (
        <TemplateCardWithRating
          key={template._id}
          template={template}
          onSelect={(id) => navigate(`/templates/${id}`)}
        />
      ))}
    </div>
  );
}
```

### Filter by Rating

```tsx
// src/components/features/templates/TemplateFilter.tsx
import { useState } from "react";
import { Select } from "@/components/ui/select";

export function TemplateFilter({ onFilterChange }) {
  const [minRating, setMinRating] = useState(0);

  return (
    <Select
      value={minRating.toString()}
      onValueChange={(val) => {
        const rating = parseFloat(val);
        setMinRating(rating);
        onFilterChange(rating);
      }}
    >
      <SelectItem value="0">All Ratings</SelectItem>
      <SelectItem value="4.0">4+ Stars</SelectItem>
      <SelectItem value="4.5">4.5+ Stars</SelectItem>
      <SelectItem value="4.8">Top Rated (4.8+)</SelectItem>
    </Select>
  );
}
```

## Database Schema

### Connections Table
```typescript
{
  fromThingId: Id<"things">, // User
  toThingId: Id<"things">,   // Template
  relationshipType: "rated",
  metadata: {
    rating: number,          // 1-5 stars
    reviewText: string,      // Optional review
    helpfulVotes: string[],  // User IDs
  },
  validFrom: number,
  validTo?: number,          // Soft delete
  createdAt: number,
}
```

### Events Table
```typescript
{
  type: "rated" | "review_updated" | "review_helpful_voted" | "review_deleted",
  actorId: Id<"things">,     // User who performed action
  targetId: Id<"things">,    // Template being rated
  timestamp: number,
  metadata: {
    rating?: number,
    hasReview?: boolean,
    connectionId?: Id<"connections">,
  },
}
```

## Performance Considerations

1. **Indexes Used**:
   - `connections.to_type` - Get all ratings for a template
   - `connections.from_type` - Get user's ratings

2. **Caching**:
   - Convex automatically caches query results
   - Rating stats update in real-time

3. **Pagination**:
   - Default limit of 50 reviews
   - Use `limit` parameter for custom pagination

4. **Soft Deletes**:
   - Ratings are soft-deleted (validTo timestamp)
   - Maintains audit trail

## Testing

```typescript
// Test rating submission
await rateTemplate({
  templateId,
  rating: 5,
  reviewText: "Great template!",
});

// Verify rating appears
const stats = await getTemplateRatings({ templateId });
expect(stats.totalRatings).toBe(1);
expect(stats.averageRating).toBe(5);

// Test helpful voting
await voteReviewHelpful({ connectionId });

// Verify vote counted
const reviews = await getTemplateReviews({ templateId });
expect(reviews[0].helpfulCount).toBe(1);
```

## Future Enhancements

- [ ] Verified purchase badges
- [ ] Response from template authors
- [ ] Image/video attachments in reviews
- [ ] Report inappropriate reviews
- [ ] Template recommendation engine based on ratings
- [ ] Email notifications for new reviews (to authors)
- [ ] Rating trends over time analytics

## Demo

See `/templates/ratings-demo` for a live demonstration.

## Files

**Backend:**
- `/backend/convex/queries/ratings.ts` - Rating queries
- `/backend/convex/mutations/ratings.ts` - Rating mutations

**Frontend:**
- `/web/src/components/features/templates/RatingInput.tsx` - Star input
- `/web/src/components/features/templates/RatingDisplay.tsx` - Stats display
- `/web/src/components/features/templates/ReviewCard.tsx` - Individual review
- `/web/src/components/features/templates/ReviewList.tsx` - Review list
- `/web/src/components/features/templates/TemplateRatings.tsx` - Complete system
- `/web/src/components/features/templates/TemplateCardWithRating.tsx` - Template card

**Demo:**
- `/web/src/pages/templates/ratings-demo.astro` - Live demo page

---

**Cycle 57 Complete** - Template rating system with social proof, quality indicators, and discovery optimization.
