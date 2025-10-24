# Demo People Page - Key Code Examples

## Overview

This document shows key code patterns and examples from the People dimension demo page.

**File:** `/Users/toc/Server/ONE/web/src/pages/demo/people.astro`

---

## Hero Section

```astro
<!-- Hero Section -->
<div class="mb-12 text-center">
  <h1 class="text-5xl font-bold text-slate-900 mb-4">
    👤 People: Authorization & Governance
  </h1>
  <p class="text-xl text-slate-600 mb-6 max-w-3xl mx-auto">
    The People dimension defines who can do what in the system. It implements role-based access control
    with four distinct roles: platform owners, organization owners, organization users, and customers.
  </p>
  <div class="inline-flex flex-wrap gap-2 justify-center">
    <span class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
      🔐 Authorization
    </span>
    <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
      👥 Role-Based
    </span>
    <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
      🛡️ Governance
    </span>
  </div>
</div>
```

---

## Role Hierarchy Visualization

```astro
<div class="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
  <p class="text-sm font-semibold text-slate-600 mb-4">Role Hierarchy (Top → Bottom)</p>
  <div class="space-y-3">
    <div class="flex items-center gap-3">
      <div class="w-48 bg-blue-600 text-white px-4 py-3 rounded-lg font-bold text-center">
        platform_owner
      </div>
      <span class="text-blue-600 font-bold">→</span>
      <span class="text-slate-600">Full platform control</span>
    </div>
    <div class="flex items-center justify-center text-2xl text-slate-300">↓</div>
    <div class="flex items-center gap-3">
      <div class="w-48 bg-purple-600 text-white px-4 py-3 rounded-lg font-bold text-center">
        org_owner
      </div>
      <span class="text-purple-600 font-bold">→</span>
      <span class="text-slate-600">Manages their organization</span>
    </div>
    <!-- ... more roles ... -->
  </div>
</div>
```

---

## React Hook Examples

### usePerson() Hook

```astro
<div class="border-l-4 border-purple-500 pl-6">
  <h3 class="text-lg font-bold text-slate-900 mb-3">usePerson() - Get Current User</h3>
  <p class="text-slate-600 mb-3">Retrieves the currently authenticated user with all role and permission information.</p>
  <div class="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
    <pre>{`import { usePerson } from '@/hooks/usePerson';

export function UserProfile() {
  const person = usePerson();

  if (!person) return <div>Loading...</div>;

  return (
    <div>
      <h2>{person.name}</h2>
      <p>Role: {person.role}</p>
      <p>Email: {person.email}</p>
    </div>
  );
}`}</pre>
  </div>
</div>
```

### usePermissions() Hook

```astro
<div class="border-l-4 border-blue-500 pl-6">
  <h3 class="text-lg font-bold text-slate-900 mb-3">usePermissions() - Check Permissions</h3>
  <p class="text-slate-600 mb-3">Check if the user has specific permissions. More fine-grained control than roles.</p>
  <div class="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
    <pre>{`import { usePermissions } from '@/hooks/usePermissions';

export function DeleteButton() {
  const can = usePermissions();

  const canDelete = can('delete_content');

  return (
    <button disabled={!canDelete}>
      {canDelete ? 'Delete' : 'No permission'}
    </button>
  );
}`}</pre>
  </div>
</div>
```

---

## API Examples

### GET /api/people/me

```astro
<div>
  <h3 class="font-bold text-slate-900 mb-3 flex items-center gap-2">
    <span class="bg-green-600 text-white px-3 py-1 rounded text-sm font-bold">GET</span>
    <span class="font-mono text-slate-600">/api/people/me</span>
  </h3>
  <p class="text-slate-600 mb-3">Get the current authenticated user</p>
  <div class="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
    <pre>{`curl -H "Authorization: Bearer TOKEN" \\
  https://api.example.com/api/people/me

# Response:
{
  "_id": "user_123",
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "role": "org_owner",
  "permissions": ["manage_org", "manage_users"],
  "organizationId": "org_456"
}`}</pre>
  </div>
</div>
```

### PATCH /api/people/:id

```astro
<div>
  <h3 class="font-bold text-slate-900 mb-3 flex items-center gap-2">
    <span class="bg-blue-600 text-white px-3 py-1 rounded text-sm font-bold">PATCH</span>
    <span class="font-mono text-slate-600">/api/people/:id</span>
  </h3>
  <p class="text-slate-600 mb-3">Update a user's role or permissions (admin only)</p>
  <div class="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
    <pre>{`curl -X PATCH -H "Authorization: Bearer TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "role": "org_user",
    "permissions": ["view_org", "create_content"]
  }' \\
  https://api.example.com/api/people/user_123`}</pre>
  </div>
</div>
```

---

## Live Data Table

```astro
<div class="overflow-x-auto">
  <table class="w-full text-sm">
    <thead>
      <tr class="bg-slate-100 border-b-2 border-slate-300">
        <th class="text-left px-4 py-3 font-bold text-slate-900">Name</th>
        <th class="text-left px-4 py-3 font-bold text-slate-900">Email</th>
        <th class="text-left px-4 py-3 font-bold text-slate-900">Role</th>
        <th class="text-left px-4 py-3 font-bold text-slate-900">Permissions</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-slate-200">
      {displayUsers.map((user) => (
        <tr key={user._id} class="hover:bg-slate-50">
          <td class="px-4 py-3 font-semibold text-slate-900">{user.name}</td>
          <td class="px-4 py-3 text-slate-600">{user.email}</td>
          <td class="px-4 py-3">
            <span class={`px-3 py-1 rounded-full text-sm font-bold text-white ${
              user.role === 'platform_owner' ? 'bg-blue-600' :
              user.role === 'org_owner' ? 'bg-purple-600' :
              user.role === 'org_user' ? 'bg-green-600' :
              'bg-orange-600'
            }`}>
              {user.role}
            </span>
          </td>
          <td class="px-4 py-3">
            <div class="flex flex-wrap gap-1">
              {user.permissions?.slice(0, 2).map((perm) => (
                <span key={perm} class="inline-block px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">
                  {perm}
                </span>
              ))}
              {user.permissions?.length > 2 ? (
                <span class="inline-block px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">
                  +{user.permissions.length - 2} more
                </span>
              ) : null}
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

---

## Permissions Cards

```astro
<div class="grid md:grid-cols-2 gap-6">
  <!-- Platform Owner -->
  <div class="border-2 border-blue-200 rounded-lg p-6">
    <h3 class="text-lg font-bold text-blue-600 mb-4">platform_owner</h3>
    <div class="space-y-2">
      {[
        'manage_platform',
        'manage_all_orgs',
        'manage_all_users',
        'manage_billing',
        'view_analytics',
        'create_org',
        'archive_org',
        'manage_settings',
      ].map((perm) => (
        <div key={perm} class="flex items-center gap-2">
          <span class="text-blue-600">✓</span>
          <span class="text-slate-600">{perm}</span>
        </div>
      ))}
    </div>
  </div>

  <!-- Org Owner -->
  <div class="border-2 border-purple-200 rounded-lg p-6">
    <h3 class="text-lg font-bold text-purple-600 mb-4">org_owner</h3>
    <div class="space-y-2">
      {[
        'manage_org',
        'manage_org_users',
        'manage_org_settings',
        'view_org_billing',
        'create_content',
        'manage_org_content',
        'invite_users',
        'remove_users',
      ].map((perm) => (
        <div key={perm} class="flex items-center gap-2">
          <span class="text-purple-600">✓</span>
          <span class="text-slate-600">{perm}</span>
        </div>
      ))}
    </div>
  </div>
  <!-- ... more cards ... -->
</div>
```

---

## Authorization Logic Examples

### Role-Based Authorization

```astro
<div class="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
  <pre>{`// In your service or component
async function manageOrganization(userId, orgId) {
  const user = await getUser(userId);

  // Check role
  if (!['platform_owner', 'org_owner'].includes(user.role)) {
    throw new Error('Insufficient permissions');
  }

  // For org_owner, verify they own this org
  if (user.role === 'org_owner' && user.organizationId !== orgId) {
    throw new Error('Cannot manage other organizations');
  }

  // Proceed with operation
  return updateOrganization(orgId, changes);
}`}</pre>
</div>
```

### Permission-Based Authorization

```astro
<div class="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
  <pre>{`// In your service
function canPerformAction(user, action, resource) {
  const permissions = {
    'platform_owner': ['*'],  // All permissions
    'org_owner': ['manage_org', 'manage_users', 'manage_settings'],
    'org_user': ['create_content', 'view_org', 'collaborate'],
    'customer': ['view_public', 'purchase', 'view_own']
  };

  const userPerms = permissions[user.role] || [];

  // Check wildcard or specific permission
  return userPerms.includes('*') || userPerms.includes(action);
}

// Usage
if (canPerformAction(user, 'manage_org', org)) {
  // Allow action
} else {
  throw new Error('Permission denied');
}`}</pre>
</div>
```

### Resource-Based Authorization

```astro
<div class="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
  <pre>{`// In your React component
function ResourceEditor({ resourceId }) {
  const user = usePerson();
  const can = usePermissions();

  // Check multiple authorization factors
  const canEdit =
    user &&
    can('edit_content') &&
    (
      user.role === 'platform_owner' ||
      isResourceOwner(resource, user) ||
      isSharedWithUser(resource, user)
    );

  if (!canEdit) {
    return <div>You don't have permission to edit this resource</div>;
  }

  return <ResourceEditForm resourceId={resourceId} />;
}`}</pre>
</div>
```

---

## TypeScript Types

```astro
<div class="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
  <pre class="text-sm font-mono">{`// Role types
type Role =
  | 'platform_owner'
  | 'org_owner'
  | 'org_user'
  | 'customer';

// Permission types
type Permission =
  | 'manage_platform'
  | 'manage_org'
  | 'manage_users'
  | 'create_content'
  | 'edit_content'
  | 'delete_content'
  | 'manage_settings'
  | 'view_org'
  | 'view_analytics'
  | string;

// Person/User type
interface Person {
  _id: string;
  name: string;
  email: string;
  role: Role;
  organizationId?: string;
  permissions: Permission[];
  createdAt: number;
  updatedAt: number;
}

// Authorization context
interface AuthorizationContext {
  user: Person | null;
  isAuthenticated: boolean;
  canAccess: (permission: Permission, context?: any) => boolean;
  hasRole: (role: Role) => boolean;
}

// Authorization error
interface AuthorizationError extends Error {
  code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'PERMISSION_DENIED';
  user?: Person;
  requiredRole?: Role;
  requiredPermission?: Permission;
}`}</pre>
</div>
```

---

## Navigation to Other Dimensions

```astro
<div class="bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg shadow-lg p-8 mb-12 text-white">
  <h2 class="text-2xl font-bold mb-6">Explore Other Dimensions</h2>
  <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
    <a href="/demo/groups" class="group">
      <div class="bg-slate-700 group-hover:bg-slate-600 rounded-lg p-4 text-center transition">
        <div class="text-2xl mb-2">👥</div>
        <p class="font-semibold">Groups</p>
        <p class="text-sm text-slate-300">Multi-tenant</p>
      </div>
    </a>

    <div class="bg-slate-700 rounded-lg p-4 text-center cursor-default opacity-75">
      <div class="text-2xl mb-2">👤</div>
      <p class="font-semibold">People</p>
      <p class="text-sm text-slate-300">← You are here</p>
    </div>

    <a href="/demo/things" class="group">
      <div class="bg-slate-700 group-hover:bg-slate-600 rounded-lg p-4 text-center transition">
        <div class="text-2xl mb-2">📦</div>
        <p class="font-semibold">Things</p>
        <p class="text-sm text-slate-300">Entities</p>
      </div>
    </a>
    <!-- ... more dimensions ... -->
  </div>
</div>
```

---

## Statistics Section

```astro
<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
  <div class="bg-white rounded-lg shadow p-6 text-center">
    <div class="text-3xl font-bold text-blue-600">4</div>
    <p class="text-slate-600 text-sm mt-2">Role Types</p>
  </div>
  <div class="bg-white rounded-lg shadow p-6 text-center">
    <div class="text-3xl font-bold text-purple-600">20+</div>
    <p class="text-slate-600 text-sm mt-2">Permissions</p>
  </div>
  <div class="bg-white rounded-lg shadow p-6 text-center">
    <div class="text-3xl font-bold text-green-600">∞</div>
    <p class="text-slate-600 text-sm mt-2">Users</p>
  </div>
  <div class="bg-white rounded-lg shadow p-6 text-center">
    <div class="text-3xl font-bold text-orange-600">100%</div>
    <p class="text-slate-600 text-sm mt-2">Type Safe</p>
  </div>
</div>
```

---

## Key Tailwind Patterns Used

### Gradient Background
```html
class="bg-gradient-to-r from-blue-50 to-purple-50"
class="bg-gradient-to-br from-slate-50 to-slate-100"
```

### Role-Based Color Classes
```astro
${
  user.role === 'platform_owner' ? 'bg-blue-600' :
  user.role === 'org_owner' ? 'bg-purple-600' :
  user.role === 'org_user' ? 'bg-green-600' :
  'bg-orange-600'
}
```

### Responsive Grid
```html
class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
class="grid grid-cols-2 md:grid-cols-3 gap-4"
```

### Card Container
```html
class="bg-white rounded-lg shadow-lg p-8 mb-12"
```

### Badge/Pill
```html
class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
```

### Code Block
```html
class="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm font-mono"
```

### Table Styling
```html
<table class="w-full text-sm">
  <thead>
    <tr class="bg-slate-100 border-b-2 border-slate-300">
      <th class="text-left px-4 py-3 font-bold text-slate-900">...</th>
    </tr>
  </thead>
  <tbody class="divide-y divide-slate-200">
    <tr class="hover:bg-slate-50">
      <td class="px-4 py-3">...</td>
    </tr>
  </tbody>
</table>
```

---

## Summary

This demo page demonstrates:

1. **Beautiful UI** - Professional styling with Tailwind CSS v4
2. **Responsive Design** - Mobile-first approach with proper breakpoints
3. **Educational Content** - Clear explanations with visual hierarchy
4. **Code Examples** - Working TypeScript, React, and API examples
5. **Interactive Data** - Live data tables with graceful fallbacks
6. **Navigation** - Links between dimensions and documentation
7. **Accessibility** - Semantic HTML with proper contrast

All code is production-ready and follows the ONE Platform best practices.
