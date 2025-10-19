# sho

**Role:** Organization Owner (`org_owner`)
**Email:** sho@one.ie
**Username:** sho
**Website:** hilltribe.life

---

## Identity

- **Name:** sho
- **Email:** sho@one.ie
- **Username:** sho
- **Role:** `org_owner`
- **Website:** hilltribe.life

---

## The Person Entity

```typescript
{
  type: "creator",
  name: "sho",
  properties: {
    role: "org_owner",
    email: "sho@one.ie",
    username: "sho",
    displayName: "sho",
    bio: "Organization owner",
    website: "hilltribe.life",

    // Permissions
    permissions: ["*"],  // All permissions as org owner

    // Organization context
    organizationId: null,  // Set when linked to organization
  },
  status: "active",
  createdAt: Date.now(),
  updatedAt: Date.now(),
}
```

---

## Ownership Connections

### Owns Organization
`sho` → `org` via `owns`

```typescript
{
  fromThingId: shoId,
  toThingId: orgId,
  relationshipType: "owns",
  metadata: {
    ownershipPercentage: 100,
    since: "2025-10-17",
  },
  createdAt: Date.now(),
}
```

### Member of Organization
`sho` → `org` via `member_of`

```typescript
{
  fromThingId: shoId,
  toThingId: orgId,
  relationshipType: "member_of",
  metadata: {
    role: "org_owner",
    permissions: ["*"],  // All permissions
    joinedAt: Date.now(),
  },
  createdAt: Date.now(),
}
```

---

## Key Principles

- **Organization Owner** - Has full control over the organization
- **All Permissions** - `permissions: ["*"]` grants access to everything
- **Ontology Mapping** - Represented as a `creator` thing with role metadata
- **Connection-Based Access** - Access granted via `member_of` connection

---

## See Also

- [Organization Profile](../organisation/sho.md)
- [People Roles](./people.md)
- [Organizations](../organisation/organisation.md)
