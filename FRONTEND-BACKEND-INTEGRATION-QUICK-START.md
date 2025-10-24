# Quick Start: Frontend-Backend Integration

**Get started in 5 minutes!**

---

## 1. Run the Development Server

```bash
cd /Users/toc/Server/ONE/web
bun run dev
```

Server runs at `http://localhost:4321`

---

## 2. Test the API (Pick One)

### Option A: Groups API

```bash
# List all groups
curl http://localhost:4321/api/groups

# Create a group
curl -X POST http://localhost:4321/api/groups \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "My Organization",
    "type": "organization",
    "description": "Test group"
  }'

# Get a specific group
curl http://localhost:4321/api/groups/GROUP_ID_HERE
```

### Option B: Things API (Entities)

```bash
# List courses
curl "http://localhost:4321/api/things?type=course"

# Create a course
curl -X POST http://localhost:4321/api/things \
  -H 'Content-Type: application/json' \
  -d '{
    "groupId": "GROUP_ID",
    "type": "course",
    "name": "Python 101",
    "description": "Learn Python basics",
    "properties": {"duration": "8 weeks"}
  }'

# Get a thing
curl http://localhost:4321/api/things/THING_ID
```

### Option C: Events API (Activity Log)

```bash
# Record an event
curl -X POST http://localhost:4321/api/events \
  -H 'Content-Type: application/json' \
  -d '{
    "groupId": "GROUP_ID",
    "type": "course_enrolled",
    "actorId": "USER_ID",
    "targetId": "COURSE_ID"
  }'

# List events
curl "http://localhost:4321/api/events?groupId=GROUP_ID"
```

### Option D: Search/Knowledge API

```bash
# Search knowledge base
curl "http://localhost:4321/api/knowledge/search?q=python+tutorial"
```

---

## 3. Use in React Components

```typescript
// src/components/CourseList.tsx
import { useThings } from '@/hooks/ontology/useThing';

export function CourseList() {
  const { things, isLoading, error } = useThings({
    type: 'course',
    limit: 10
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {things.map((course) => (
        <div key={course._id}>
          <h3>{course.name}</h3>
          <p>{course.description}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 4. Use in Astro Pages

```astro
---
// src/pages/courses/[slug].astro
import { getProvider } from '@/lib/ontology/factory';

// Get provider (works with any backend)
const provider = await getProvider();

// Get course by slug
const course = await provider.things.get(Astro.params.slug);

if (!course) {
  return Astro.redirect('/courses');
}
---

<Layout title={course.name}>
  <h1>{course.name}</h1>
  <p>{course.description}</p>

  {course.properties?.duration && (
    <p>Duration: {course.properties.duration}</p>
  )}
</Layout>
```

---

## 5. Switch Backends

Change **one line** in `.env.local`:

### To Use Convex (Production)
```env
VITE_PROVIDER=convex
PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

### To Use Markdown (Standalone)
```env
VITE_PROVIDER=markdown
VITE_FEATURES='{"auth":false,"groups":false}'
```

### To Use Custom HTTP API
```env
VITE_PROVIDER=http
VITE_HTTP_API_URL=https://api.example.com
```

### To Use Multiple Providers (Fallback)
```env
VITE_PROVIDER=composite
VITE_COMPOSITE_PROVIDERS='["convex","markdown"]'
```

---

## 6. Common Operations

### Get Current User

```typescript
import { usePerson } from '@/hooks/ontology/usePerson';

export function Profile() {
  const { person, isLoading } = usePerson();

  if (isLoading) return <div>Loading...</div>;

  return <div>Welcome, {person?.displayName}</div>;
}
```

### Search Knowledge

```typescript
import { useSearch } from '@/hooks/ontology/useSearch';

export function SearchBox() {
  const { search, results, isLoading } = useSearch();

  const handleSearch = async (query: string) => {
    const items = await search(query);
    console.log('Found:', items);
  };

  return (
    <input
      placeholder="Search..."
      onChange={(e) => handleSearch(e.target.value)}
    />
  );
}
```

### Create a Connection (Relationship)

```typescript
import { useConnection } from '@/hooks/ontology/useConnection';

export function EnrollButton({ userId, courseId }: Props) {
  const { create, isLoading } = useConnection();

  const handleEnroll = async () => {
    await create({
      groupId: 'your-group-id',
      fromThingId: userId,
      toThingId: courseId,
      relationshipType: 'enrolled_in'
    });
  };

  return (
    <button onClick={handleEnroll} disabled={isLoading}>
      {isLoading ? 'Enrolling...' : 'Enroll Now'}
    </button>
  );
}
```

---

## 7. API Endpoints Reference

### 6-Dimension Endpoints

| Dimension | Methods | Endpoints |
|-----------|---------|-----------|
| **Groups** | CRUD | `/api/groups`, `/api/groups/[id]` |
| **People** | Read | `/api/people/me`, `/api/people/[id]` |
| **Things** | CRUD | `/api/things`, `/api/things/[id]` |
| **Connections** | CRUD | `/api/connections`, `/api/connections/[id]` |
| **Events** | Create, List | `/api/events` |
| **Knowledge** | Search | `/api/knowledge/search?q=...` |

### Query Parameters

```bash
# Pagination
/api/things?limit=10&offset=0

# Filtering
/api/things?type=course&groupId=group_123

# Search
/api/things?search=python

# Sorting
/api/things?sort=name&order=asc

# Status
/api/things?status=active
```

---

## 8. Feature Flags

Enable/disable features in `.env.local`:

```env
# Enable everything
VITE_FEATURES='{"auth":true,"groups":true,"permissions":true,"realtime":true,"search":true}'

# Minimal (standalone mode)
VITE_FEATURES='{"auth":false,"groups":false,"permissions":false,"realtime":false,"search":false}'

# SaaS mode
VITE_FEATURES='{"auth":true,"groups":true,"permissions":true,"realtime":true,"search":true}'
```

Then use in code:

```typescript
import { isFeatureEnabled } from '@/lib/ontology/features';

if (isFeatureEnabled('auth')) {
  // Show login form
}

if (isFeatureEnabled('search')) {
  // Show search box
}
```

---

## 9. Error Handling

All operations return typed results:

```typescript
import { useThings } from '@/hooks/ontology/useThing';

const { things, error, isLoading } = useThings({ type: 'course' });

if (error) {
  // Error is typed:
  // EntityNotFoundError | ValidationError | UnauthorizedError | etc.

  if (error._tag === 'EntityNotFoundError') {
    console.log('Not found:', error.message);
  } else if (error._tag === 'UnauthorizedError') {
    console.log('Access denied');
  }
}
```

---

## 10. Complete Workflow Example

### 1. Create a Group

```bash
curl -X POST http://localhost:4321/api/groups \
  -H 'Content-Type: application/json' \
  -d '{"name":"Acme Corp","type":"organization"}'
# Returns: { "success": true, "data": { "_id": "group_abc123", ... } }
```

### 2. Create Courses in That Group

```bash
curl -X POST http://localhost:4321/api/things \
  -H 'Content-Type: application/json' \
  -d '{
    "groupId": "group_abc123",
    "type": "course",
    "name": "Python 101",
    "description": "Learn Python"
  }'
# Returns: { "success": true, "data": { "_id": "thing_xyz789", ... } }
```

### 3. Enroll Users (Create Connection)

```bash
curl -X POST http://localhost:4321/api/connections \
  -H 'Content-Type: application/json' \
  -d '{
    "groupId": "group_abc123",
    "fromThingId": "user_123",
    "toThingId": "thing_xyz789",
    "relationshipType": "enrolled_in"
  }'
# Returns: { "success": true, "data": { "_id": "conn_abc", ... } }
```

### 4. Record Event (Audit Trail)

```bash
curl -X POST http://localhost:4321/api/events \
  -H 'Content-Type: application/json' \
  -d '{
    "groupId": "group_abc123",
    "type": "course_enrolled",
    "actorId": "user_123",
    "targetId": "thing_xyz789"
  }'
```

### 5. Query Data in Astro

```astro
---
const provider = await getProvider();
const courses = await provider.things.list({
  groupId: 'group_abc123',
  type: 'course'
});
---

<h1>Available Courses</h1>
{courses.map(c => <div>{c.name}</div>)}
```

---

## 📚 Documentation

- **Full Architecture:** `/one/things/plans/integrate-frontend-and-backend.md`
- **Services Reference:** `web/src/lib/ontology/services/README.md`
- **Hooks Reference:** `web/src/hooks/ontology/README.md`
- **API Reference:** `web/src/pages/api/README.md`
- **API Examples:** `web/src/pages/api/EXAMPLES.md` (40+ curl examples)

---

## 🚀 Next Steps

1. **Try the examples above** - Get familiar with the API
2. **Read the documentation** - Understand the 6-dimension model
3. **Build a component** - Create a React component using hooks
4. **Deploy** - Push to Cloudflare Pages when ready

---

## ❓ Troubleshooting

### "Provider not found" error
- Check `.env.local` has `VITE_PROVIDER` set
- Verify provider configuration (Convex URL, API key, etc.)

### API returns 404
- Check entity ID exists
- Verify correct endpoint structure (`/api/things/[id]`, not `/api/thing/[id]`)

### Type errors in React
- Ensure you imported from correct hook: `useThings` not `useThingService`
- Check that hook is in `src/hooks/ontology/`, not elsewhere

### Styles not loading
- This is a Convex+Astro setup - CSS loads from `src/styles/`
- Ensure Tailwind is configured in Astro config

---

## 💡 Pro Tips

1. **Use React Query** - Hooks already include SWR/Query patterns
2. **Cache aggressively** - API responses are cached by default
3. **Feature flag locally** - Test different backends in development
4. **Monitor performance** - Use browser DevTools to track API calls
5. **Check docs first** - Most questions answered in README files

---

**Happy coding! 🎉**

For more details, see the full documentation listed above.
