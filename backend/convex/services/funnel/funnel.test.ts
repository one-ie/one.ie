/**
 * FunnelService Unit Tests (Cycle 020)
 *
 * Comprehensive tests for funnel business logic:
 * - Create funnel with validation
 * - Publish/unpublish flows
 * - Duplicate funnels
 * - Rate limiting
 * - Group access validation
 *
 * @see /one/things/plans/clickfunnels-builder-100-cycles.md (Cycle 020)
 */

import { describe, it, expect, beforeEach } from "vitest";
import { Effect } from "effect";
import { FunnelService } from "./funnel";
import {
  FunnelNotFoundError,
  FunnelAlreadyPublishedError,
  UnauthorizedFunnelAccessError,
  FunnelLimitExceededError,
  FunnelInvalidStatusError,
  ValidationError,
} from "./errors";
import { RateLimitError } from "./rate-limiter";

// ============================================================================
// MOCK DATA
// ============================================================================

const mockGroup = {
  _id: "group_123" as any,
  slug: "test-org",
  name: "Test Organization",
  type: "organization" as const,
  status: "active" as const,
  _creationTime: Date.now(),
};

const mockPerson = {
  _id: "person_456" as any,
  type: "creator" as const,
  name: "Test User",
  groupId: "group_123" as any,
  properties: {
    email: "test@example.com",
    role: "org_owner",
  },
  status: "active" as const,
  _creationTime: Date.now(),
};

const mockDraftFunnel = {
  _id: "funnel_789" as any,
  type: "funnel" as const,
  name: "Test Funnel",
  groupId: "group_123" as any,
  properties: {
    description: "Test description",
    slug: "test-funnel",
    stepCount: 3,
    domain: null,
  },
  status: "draft" as const,
  _creationTime: Date.now(),
};

const mockPublishedFunnel = {
  ...mockDraftFunnel,
  _id: "funnel_published" as any,
  status: "published" as const,
};

const mockArchivedFunnel = {
  ...mockDraftFunnel,
  _id: "funnel_archived" as any,
  status: "archived" as const,
};

// ============================================================================
// MOCK DATABASE LAYER
// ============================================================================

interface MockDatabase {
  things: Map<string, any>;
  connections: Map<string, any>;
  events: any[];
  groups: Map<string, any>;
}

const createMockDB = (): MockDatabase => ({
  things: new Map([
    [mockGroup._id, mockGroup],
    [mockPerson._id, mockPerson],
    [mockDraftFunnel._id, mockDraftFunnel],
    [mockPublishedFunnel._id, mockPublishedFunnel],
    [mockArchivedFunnel._id, mockArchivedFunnel],
  ]),
  connections: new Map(),
  events: [],
  groups: new Map([[mockGroup._id, mockGroup]]),
});

// ============================================================================
// FUNNEL SERVICE TESTS - CREATE
// ============================================================================

describe("FunnelService.create", () => {
  let mockDB: MockDatabase;

  beforeEach(() => {
    mockDB = createMockDB();
  });

  it("should create funnel successfully with valid data", async () => {
    const result = await Effect.runPromise(
      FunnelService.create({
        name: "New Funnel",
        description: "A test funnel",
        groupId: mockGroup._id,
        userId: mockPerson._id,
        currentFunnelCount: 5,
      })
    );

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      name: "New Funnel",
      type: "funnel",
      status: "draft",
      groupId: mockGroup._id,
    });
    expect(result.data.properties).toMatchObject({
      description: "A test funnel",
      slug: "new-funnel",
      stepCount: 0,
    });
  });

  it("should generate unique slug from name", async () => {
    const result = await Effect.runPromise(
      FunnelService.create({
        name: "My Amazing Funnel!!!",
        groupId: mockGroup._id,
        userId: mockPerson._id,
        currentFunnelCount: 0,
      })
    );

    expect(result.data.properties.slug).toBe("my-amazing-funnel");
  });

  it("should fail when group doesn't exist", async () => {
    const effect = FunnelService.create({
      name: "Test",
      groupId: "nonexistent_group" as any,
      userId: mockPerson._id,
      currentFunnelCount: 0,
    });

    await expect(Effect.runPromise(effect)).rejects.toThrow();
  });

  it("should fail when funnel name is empty", async () => {
    const effect = FunnelService.create({
      name: "",
      groupId: mockGroup._id,
      userId: mockPerson._id,
      currentFunnelCount: 0,
    });

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      _tag: "ValidationError",
      field: "name",
    });
  });

  it("should fail when funnel name is too long", async () => {
    const longName = "x".repeat(256);
    const effect = FunnelService.create({
      name: longName,
      groupId: mockGroup._id,
      userId: mockPerson._id,
      currentFunnelCount: 0,
    });

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      _tag: "ValidationError",
      field: "name",
      constraint: "max_length",
    });
  });

  it("should enforce rate limit (max 100 funnels per group)", async () => {
    const effect = FunnelService.create({
      name: "Test Funnel",
      groupId: mockGroup._id,
      userId: mockPerson._id,
      currentFunnelCount: 100, // At limit
    });

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      _tag: "RateLimitError",
      resourceType: "funnel",
      limit: 100,
    });
  });

  it("should initialize with default properties", async () => {
    const result = await Effect.runPromise(
      FunnelService.create({
        name: "Minimal Funnel",
        groupId: mockGroup._id,
        userId: mockPerson._id,
        currentFunnelCount: 0,
      })
    );

    expect(result.data.properties).toMatchObject({
      stepCount: 0,
      domain: null,
      seoTitle: "",
      seoDescription: "",
      customCode: null,
    });
  });
});

// ============================================================================
// FUNNEL SERVICE TESTS - PUBLISH
// ============================================================================

describe("FunnelService.publish", () => {
  it("should publish draft funnel successfully", async () => {
    const result = await Effect.runPromise(
      FunnelService.publish({
        funnel: mockDraftFunnel,
        userId: mockPerson._id,
      })
    );

    expect(result.success).toBe(true);
    expect(result.data.status).toBe("published");
    expect(result.data.properties.publishedAt).toBeDefined();
  });

  it("should fail when funnel is already published", async () => {
    const effect = FunnelService.publish({
      funnel: mockPublishedFunnel,
      userId: mockPerson._id,
    });

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      _tag: "FunnelAlreadyPublishedError",
      funnelId: mockPublishedFunnel._id,
    });
  });

  it("should fail when funnel has no steps", async () => {
    const funnelWithNoSteps = {
      ...mockDraftFunnel,
      properties: {
        ...mockDraftFunnel.properties,
        stepCount: 0,
      },
    };

    const effect = FunnelService.publish({
      funnel: funnelWithNoSteps,
      userId: mockPerson._id,
    });

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      _tag: "ValidationError",
      message: expect.stringContaining("at least one step"),
    });
  });

  it("should fail when funnel is archived", async () => {
    const effect = FunnelService.publish({
      funnel: mockArchivedFunnel,
      userId: mockPerson._id,
    });

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      _tag: "FunnelInvalidStatusError",
      currentStatus: "archived",
      requestedStatus: "published",
    });
  });

  it("should validate required fields before publishing", async () => {
    const incompleteFunnel = {
      ...mockDraftFunnel,
      name: "", // Invalid name
    };

    const effect = FunnelService.publish({
      funnel: incompleteFunnel,
      userId: mockPerson._id,
    });

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      _tag: "ValidationError",
      field: "name",
    });
  });

  it("should set publishedAt timestamp", async () => {
    const beforePublish = Date.now();

    const result = await Effect.runPromise(
      FunnelService.publish({
        funnel: mockDraftFunnel,
        userId: mockPerson._id,
      })
    );

    const afterPublish = Date.now();

    expect(result.data.properties.publishedAt).toBeGreaterThanOrEqual(beforePublish);
    expect(result.data.properties.publishedAt).toBeLessThanOrEqual(afterPublish);
  });
});

// ============================================================================
// FUNNEL SERVICE TESTS - UNPUBLISH
// ============================================================================

describe("FunnelService.unpublish", () => {
  it("should unpublish published funnel successfully", async () => {
    const result = await Effect.runPromise(
      FunnelService.unpublish({
        funnel: mockPublishedFunnel,
        userId: mockPerson._id,
      })
    );

    expect(result.success).toBe(true);
    expect(result.data.status).toBe("draft");
    expect(result.data.properties.unpublishedAt).toBeDefined();
  });

  it("should fail when funnel is not published", async () => {
    const effect = FunnelService.unpublish({
      funnel: mockDraftFunnel,
      userId: mockPerson._id,
    });

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      _tag: "FunnelInvalidStatusError",
      currentStatus: "draft",
      requestedStatus: "draft",
    });
  });

  it("should preserve publishedAt timestamp", async () => {
    const publishedFunnel = {
      ...mockPublishedFunnel,
      properties: {
        ...mockPublishedFunnel.properties,
        publishedAt: Date.now() - 86400000, // Published 1 day ago
      },
    };

    const result = await Effect.runPromise(
      FunnelService.unpublish({
        funnel: publishedFunnel,
        userId: mockPerson._id,
      })
    );

    expect(result.data.properties.publishedAt).toBe(
      publishedFunnel.properties.publishedAt
    );
    expect(result.data.properties.unpublishedAt).toBeDefined();
  });
});

// ============================================================================
// FUNNEL SERVICE TESTS - DUPLICATE
// ============================================================================

describe("FunnelService.duplicate", () => {
  it("should duplicate funnel with new name", async () => {
    const result = await Effect.runPromise(
      FunnelService.duplicate({
        sourceFunnel: mockDraftFunnel,
        newName: "Duplicated Funnel",
        userId: mockPerson._id,
        groupId: mockGroup._id,
        currentFunnelCount: 5,
      })
    );

    expect(result.success).toBe(true);
    expect(result.data.name).toBe("Duplicated Funnel");
    expect(result.data.properties.slug).toBe("duplicated-funnel");
    expect(result.data.type).toBe("funnel");
    expect(result.data.groupId).toBe(mockGroup._id);
  });

  it("should copy all properties from source funnel", async () => {
    const sourceFunnel = {
      ...mockDraftFunnel,
      properties: {
        description: "Original description",
        slug: "original",
        stepCount: 5,
        seoTitle: "SEO Title",
        customCode: { header: "console.log('test')" },
      },
    };

    const result = await Effect.runPromise(
      FunnelService.duplicate({
        sourceFunnel,
        newName: "Copy",
        userId: mockPerson._id,
        groupId: mockGroup._id,
        currentFunnelCount: 0,
      })
    );

    expect(result.data.properties.description).toBe("Original description");
    expect(result.data.properties.stepCount).toBe(5);
    expect(result.data.properties.seoTitle).toBe("SEO Title");
    expect(result.data.properties.customCode).toEqual({ header: "console.log('test')" });
    expect(result.data.properties.slug).toBe("copy"); // Slug regenerated
  });

  it("should always set status to draft", async () => {
    const result = await Effect.runPromise(
      FunnelService.duplicate({
        sourceFunnel: mockPublishedFunnel, // Source is published
        newName: "Copy of Published",
        userId: mockPerson._id,
        groupId: mockGroup._id,
        currentFunnelCount: 0,
      })
    );

    expect(result.data.status).toBe("draft");
  });

  it("should enforce rate limit when duplicating", async () => {
    const effect = FunnelService.duplicate({
      sourceFunnel: mockDraftFunnel,
      newName: "Copy",
      userId: mockPerson._id,
      groupId: mockGroup._id,
      currentFunnelCount: 100, // At limit
    });

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      _tag: "RateLimitError",
      resourceType: "funnel",
      limit: 100,
    });
  });

  it("should fail when source funnel doesn't exist", async () => {
    const effect = FunnelService.duplicate({
      sourceFunnel: null as any,
      newName: "Copy",
      userId: mockPerson._id,
      groupId: mockGroup._id,
      currentFunnelCount: 0,
    });

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      _tag: "FunnelNotFoundError",
    });
  });

  it("should validate new name", async () => {
    const effect = FunnelService.duplicate({
      sourceFunnel: mockDraftFunnel,
      newName: "", // Empty name
      userId: mockPerson._id,
      groupId: mockGroup._id,
      currentFunnelCount: 0,
    });

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      _tag: "ValidationError",
      field: "name",
    });
  });

  it("should generate unique slug for duplicate", async () => {
    const result = await Effect.runPromise(
      FunnelService.duplicate({
        sourceFunnel: mockDraftFunnel,
        newName: "My Funnel Copy",
        userId: mockPerson._id,
        groupId: mockGroup._id,
        currentFunnelCount: 0,
      })
    );

    expect(result.data.properties.slug).toBe("my-funnel-copy");
    expect(result.data.properties.slug).not.toBe(mockDraftFunnel.properties.slug);
  });
});

// ============================================================================
// FUNNEL SERVICE TESTS - VALIDATION
// ============================================================================

describe("FunnelService.validate", () => {
  it("should validate funnel name", async () => {
    const validFunnel = {
      ...mockDraftFunnel,
      name: "Valid Name",
    };

    const result = await Effect.runPromise(
      FunnelService.validate(validFunnel)
    );

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should reject empty funnel name", async () => {
    const invalidFunnel = {
      ...mockDraftFunnel,
      name: "",
    };

    const result = await Effect.runPromise(
      FunnelService.validate(invalidFunnel)
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        field: "name",
        message: expect.stringContaining("required"),
      })
    );
  });

  it("should reject excessively long names", async () => {
    const invalidFunnel = {
      ...mockDraftFunnel,
      name: "x".repeat(256),
    };

    const result = await Effect.runPromise(
      FunnelService.validate(invalidFunnel)
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        field: "name",
        constraint: "max_length",
      })
    );
  });

  it("should validate slug format", async () => {
    const validFunnel = {
      ...mockDraftFunnel,
      properties: {
        ...mockDraftFunnel.properties,
        slug: "valid-slug-123",
      },
    };

    const result = await Effect.runPromise(
      FunnelService.validate(validFunnel)
    );

    expect(result.valid).toBe(true);
  });

  it("should reject invalid slug characters", async () => {
    const invalidFunnel = {
      ...mockDraftFunnel,
      properties: {
        ...mockDraftFunnel.properties,
        slug: "invalid slug!",
      },
    };

    const result = await Effect.runPromise(
      FunnelService.validate(invalidFunnel)
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        field: "slug",
        message: expect.stringContaining("alphanumeric"),
      })
    );
  });
});

// ============================================================================
// FUNNEL SERVICE TESTS - GROUP ACCESS
// ============================================================================

describe("FunnelService.validateGroupAccess", () => {
  it("should allow access when user belongs to funnel's group", async () => {
    const result = await Effect.runPromise(
      FunnelService.validateGroupAccess({
        funnel: mockDraftFunnel,
        userId: mockPerson._id,
        userGroupId: mockGroup._id,
      })
    );

    expect(result.authorized).toBe(true);
  });

  it("should deny access when user belongs to different group", async () => {
    const effect = FunnelService.validateGroupAccess({
      funnel: mockDraftFunnel,
      userId: mockPerson._id,
      userGroupId: "different_group" as any,
    });

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      _tag: "UnauthorizedFunnelAccessError",
      userId: mockPerson._id,
      funnelId: mockDraftFunnel._id,
    });
  });

  it("should allow platform_owner to access any funnel", async () => {
    const platformOwner = {
      ...mockPerson,
      properties: {
        ...mockPerson.properties,
        role: "platform_owner",
      },
    };

    const result = await Effect.runPromise(
      FunnelService.validateGroupAccess({
        funnel: mockDraftFunnel,
        userId: platformOwner._id,
        userGroupId: "different_group" as any,
        userRole: "platform_owner",
      })
    );

    expect(result.authorized).toBe(true);
  });
});

// ============================================================================
// FUNNEL SERVICE TESTS - CALCULATE METRICS
// ============================================================================

describe("FunnelService.calculateMetrics", () => {
  it("should calculate basic funnel metrics", async () => {
    const events = [
      { type: "visitor_entered_funnel", actorId: "visitor_1" },
      { type: "visitor_entered_funnel", actorId: "visitor_2" },
      { type: "visitor_entered_funnel", actorId: "visitor_3" },
      {
        type: "purchase_completed",
        actorId: "visitor_1",
        metadata: { amount: 99.99 },
      },
    ];

    const result = await Effect.runPromise(
      FunnelService.calculateMetrics({ events, funnelId: mockDraftFunnel._id })
    );

    expect(result.visitors).toBe(3);
    expect(result.conversions).toBe(1);
    expect(result.conversionRate).toBeCloseTo(0.333, 2);
    expect(result.revenue).toBeCloseTo(99.99, 2);
  });

  it("should handle zero visitors", async () => {
    const events: any[] = [];

    const result = await Effect.runPromise(
      FunnelService.calculateMetrics({ events, funnelId: mockDraftFunnel._id })
    );

    expect(result.visitors).toBe(0);
    expect(result.conversions).toBe(0);
    expect(result.conversionRate).toBe(0);
    expect(result.revenue).toBe(0);
  });

  it("should calculate total revenue from multiple purchases", async () => {
    const events = [
      {
        type: "purchase_completed",
        actorId: "visitor_1",
        metadata: { amount: 50.0 },
      },
      {
        type: "purchase_completed",
        actorId: "visitor_2",
        metadata: { amount: 75.5 },
      },
      {
        type: "purchase_completed",
        actorId: "visitor_3",
        metadata: { amount: 100.0 },
      },
    ];

    const result = await Effect.runPromise(
      FunnelService.calculateMetrics({ events, funnelId: mockDraftFunnel._id })
    );

    expect(result.revenue).toBeCloseTo(225.5, 2);
    expect(result.conversions).toBe(3);
  });

  it("should deduplicate visitor counts", async () => {
    const events = [
      { type: "visitor_entered_funnel", actorId: "visitor_1" },
      { type: "visitor_viewed_step", actorId: "visitor_1" },
      { type: "visitor_viewed_step", actorId: "visitor_1" },
      { type: "visitor_entered_funnel", actorId: "visitor_2" },
    ];

    const result = await Effect.runPromise(
      FunnelService.calculateMetrics({ events, funnelId: mockDraftFunnel._id })
    );

    expect(result.visitors).toBe(2); // Should deduplicate visitor_1
  });
});

// ============================================================================
// FUNNEL SERVICE TESTS - GENERATE SLUG
// ============================================================================

describe("FunnelService.generateSlug", () => {
  it("should convert name to lowercase kebab-case", async () => {
    const result = await Effect.runPromise(
      FunnelService.generateSlug("My Amazing Funnel")
    );

    expect(result).toBe("my-amazing-funnel");
  });

  it("should remove special characters", async () => {
    const result = await Effect.runPromise(
      FunnelService.generateSlug("My Funnel!!! (2024)")
    );

    expect(result).toBe("my-funnel-2024");
  });

  it("should collapse multiple spaces/dashes", async () => {
    const result = await Effect.runPromise(
      FunnelService.generateSlug("My    Funnel---Name")
    );

    expect(result).toBe("my-funnel-name");
  });

  it("should trim leading/trailing dashes", async () => {
    const result = await Effect.runPromise(
      FunnelService.generateSlug("---My Funnel---")
    );

    expect(result).toBe("my-funnel");
  });

  it("should handle empty string", async () => {
    const result = await Effect.runPromise(
      FunnelService.generateSlug("")
    );

    expect(result).toBe("");
  });

  it("should handle unicode characters", async () => {
    const result = await Effect.runPromise(
      FunnelService.generateSlug("Café Münchën 東京")
    );

    expect(result).toBe("cafe-munchen");
  });
});
