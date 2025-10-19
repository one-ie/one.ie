# hilltribe life

**Slug:** `hilltribe-life`
**Domain:** hilltribe.life
**Owner:** sho (100%)
**Status:** Active
**Plan:** Enterprise

---

## Identity

- **Name:** hilltribe life
- **Slug:** `hilltribe-life`
- **Domain:** hilltribe.life
- **Owner:** sho
- **Status:** Active
- **Plan:** Enterprise

---

## The Organization Entity

```typescript
{
  type: "organization",
  name: "hilltribe life",
  properties: {
    // Identity
    slug: "hilltribe-life",
    domain: "hilltribe.life",
    description: "Organization created via ONE CLI",

    // Status & Plan
    status: "active",
    plan: "enterprise",

    // Limits & Usage
    limits: {
      users: 1000,
      storage: 100000,
      apiCalls: -1,        // Unlimited
      inferences: -1,      // Unlimited
    },
    usage: {
      users: 0,
      storage: 0,
      apiCalls: 0,
      inferences: 0,
    },

    // Settings
    settings: {
      allowSignups: true,
      requireEmailVerification: true,
      enableTwoFactor: true,
      inferenceEnabled: true,
    },

    // Public info
    website: "https://hilltribe.life",
    createdAt: Date.now(),
  },
  status: "active",
  createdAt: Date.now(),
  updatedAt: Date.now(),
}
```

---

## Ownership Connections

### sho Owns hilltribe life
`sho` → `hilltribe-life` via `owns`

```typescript
{
  fromThingId: shoId,
  toThingId: hilltribe-lifeId,
  relationshipType: "owns",
  metadata: {
    ownershipPercentage: 100,
    since: "2025-10-17",
  },
  createdAt: Date.now(),
}
```

### sho is Member of hilltribe life
`sho` → `hilltribe-life` via `member_of`

```typescript
{
  fromThingId: shoId,
  toThingId: hilltribe-lifeId,
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

- **Multi-Tenant Isolation** - Organization partitions the data space
- **Owner Control** - sho has full control (100% ownership)
- **Enterprise Plan** - Unlimited resources for growth
- **Ontology Mapping** - Dimension 1 (Organizations) in the 6-dimension model

---

## See Also

- [Owner Profile](../people/sho.md)
- [Organization Structure](./organisation.md)
- [Multi-Tenancy](../connections/multitenant.md)
