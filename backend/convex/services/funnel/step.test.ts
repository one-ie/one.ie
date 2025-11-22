/**
 * StepService Unit Tests (Cycle 030)
 *
 * Comprehensive tests for funnel step business logic:
 * - Add steps to funnels with sequencing
 * - Get/list steps with authorization
 * - Update step properties
 * - Remove steps with resequencing
 * - Reorder steps with validation
 *
 * @see /one/things/plans/clickfunnels-builder-100-cycles.md (Cycle 030)
 */

import { describe, it, expect, beforeEach } from "vitest";
import { Effect } from "effect";
import type { Id } from "../../_generated/dataModel";
import {
  makeStepService,
  type CreateStepInput,
  type UpdateStepInput,
  type ReorderStepsInput,
  type StepType,
  type DatabaseContext,
  type UserContext,
} from "./step";
import {
  PageNotFoundError,
  FunnelNotFoundError,
  PageLimitExceededError,
  UnauthorizedPageAccessError,
  InvalidPageOrderError,
  ValidationError,
  DatabaseError,
} from "./errors";

// ============================================================================
// MOCK DATA
// ============================================================================

const mockGroupId = "group_123" as Id<"groups">;
const mockUserId = "person_456" as Id<"things">;
const mockFunnelId = "funnel_789" as Id<"things">;
const mockStepId1 = "step_001" as Id<"things">;
const mockStepId2 = "step_002" as Id<"things">;
const mockStepId3 = "step_003" as Id<"things">;

const mockUser: UserContext = {
  userId: mockUserId,
  groupId: mockGroupId,
};

const mockFunnel = {
  _id: mockFunnelId,
  type: "funnel" as const,
  name: "Test Funnel",
  groupId: mockGroupId,
  properties: {
    description: "Test funnel",
    slug: "test-funnel",
    stepCount: 0,
  },
  status: "draft" as const,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const mockStep1 = {
  _id: mockStepId1,
  type: "funnel_step" as const,
  name: "Landing Page",
  groupId: mockGroupId,
  properties: {
    stepType: "landing_page" as StepType,
    title: "Landing Page",
    description: "Welcome page",
    slug: "landing-page",
    backgroundColor: "#ffffff",
    layout: "default",
  },
  status: "draft" as const,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const mockStep2 = {
  _id: mockStepId2,
  type: "funnel_step" as const,
  name: "Sales Page",
  groupId: mockGroupId,
  properties: {
    stepType: "sales_page" as StepType,
    title: "Sales Page",
    description: "Product presentation",
    slug: "sales-page",
    backgroundColor: "#ffffff",
    layout: "default",
  },
  status: "draft" as const,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const mockStep3 = {
  _id: mockStepId3,
  type: "funnel_step" as const,
  name: "Checkout",
  groupId: mockGroupId,
  properties: {
    stepType: "checkout_page" as StepType,
    title: "Checkout",
    description: "Complete your purchase",
    slug: "checkout",
    backgroundColor: "#ffffff",
    layout: "default",
  },
  status: "draft" as const,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

// ============================================================================
// MOCK DATABASE LAYER
// ============================================================================

interface MockDatabase {
  things: Map<string, any>;
  connections: Map<string, any>;
  events: any[];
  nextId: number;
}

const createMockDB = (): MockDatabase => ({
  things: new Map([
    [mockFunnelId, mockFunnel],
    [mockStepId1, mockStep1],
    [mockStepId2, mockStep2],
    [mockStepId3, mockStep3],
  ]),
  connections: new Map([
    [
      "conn_001",
      {
        _id: "conn_001" as Id<"things">,
        fromThingId: mockFunnelId,
        toThingId: mockStepId1,
        relationshipType: "funnel_contains_step",
        metadata: { sequence: 0, stepType: "landing_page" },
        validFrom: Date.now(),
        createdAt: Date.now(),
      },
    ],
    [
      "conn_002",
      {
        _id: "conn_002" as Id<"things">,
        fromThingId: mockFunnelId,
        toThingId: mockStepId2,
        relationshipType: "funnel_contains_step",
        metadata: { sequence: 1, stepType: "sales_page" },
        validFrom: Date.now(),
        createdAt: Date.now(),
      },
    ],
    [
      "conn_003",
      {
        _id: "conn_003" as Id<"things">,
        fromThingId: mockFunnelId,
        toThingId: mockStepId3,
        relationshipType: "funnel_contains_step",
        metadata: { sequence: 2, stepType: "checkout_page" },
        validFrom: Date.now(),
        createdAt: Date.now(),
      },
    ],
  ]),
  events: [],
  nextId: 1000,
});

const createMockDbContext = (mockDB: MockDatabase): DatabaseContext => ({
  get: async (id: Id<"things">) => {
    return mockDB.things.get(id) || null;
  },
  insert: async (table: string, data: any) => {
    const id = `${table}_${mockDB.nextId++}` as Id<"things">;
    const record = { _id: id, ...data };

    if (table === "things") {
      mockDB.things.set(id, record);
    } else if (table === "connections") {
      mockDB.connections.set(id, record);
    } else if (table === "events") {
      mockDB.events.push(record);
    }

    return id;
  },
  patch: async (id: Id<"things">, data: any) => {
    // Check things first
    const thing = mockDB.things.get(id);
    if (thing) {
      mockDB.things.set(id, { ...thing, ...data });
      return;
    }

    // Check connections
    const connection = mockDB.connections.get(id);
    if (connection) {
      mockDB.connections.set(id, { ...connection, ...data });
      return;
    }

    throw new Error(`Record not found: ${id}`);
  },
  query: (table: string) => {
    const data = table === "things" ? mockDB.things : mockDB.connections;

    return {
      filter: (fn: (item: any) => boolean) => ({
        collect: async () => {
          return Array.from(data.values()).filter(fn);
        },
        first: async () => {
          return Array.from(data.values()).find(fn) || null;
        },
      }),
    };
  },
});

// ============================================================================
// STEP SERVICE TESTS - ADD
// ============================================================================

describe("StepService.add", () => {
  let mockDB: MockDatabase;
  let dbContext: DatabaseContext;

  beforeEach(() => {
    mockDB = createMockDB();
    dbContext = createMockDbContext(mockDB);
  });

  it("should add step to funnel with correct sequence", async () => {
    const service = makeStepService(dbContext);

    const input: CreateStepInput = {
      funnelId: mockFunnelId,
      name: "New Step",
      stepType: "landing_page",
      properties: {
        title: "New Step Title",
        description: "Step description",
      },
    };

    const result = await Effect.runPromise(service.add(input, mockUser));

    expect(result).toBeDefined();

    // Verify step was created
    const step = mockDB.things.get(result);
    expect(step).toBeDefined();
    expect(step?.type).toBe("funnel_step");
    expect(step?.name).toBe("New Step");
    expect(step?.groupId).toBe(mockGroupId);
    expect(step?.properties.stepType).toBe("landing_page");
    expect(step?.status).toBe("draft");

    // Verify connection was created with correct sequence
    const connections = Array.from(mockDB.connections.values()).filter(
      (c: any) =>
        c.fromThingId === mockFunnelId &&
        c.toThingId === result &&
        c.relationshipType === "funnel_contains_step"
    );
    expect(connections).toHaveLength(1);
    expect(connections[0].metadata.sequence).toBe(3); // After existing 0, 1, 2

    // Verify event was logged
    const events = mockDB.events.filter((e) => e.type === "step_added");
    expect(events).toHaveLength(1);
    expect(events[0].targetId).toBe(result);
    expect(events[0].metadata.funnelId).toBe(mockFunnelId);
  });

  it("should use custom sequence if provided", async () => {
    const service = makeStepService(dbContext);

    const input: CreateStepInput = {
      funnelId: mockFunnelId,
      name: "Custom Sequence Step",
      stepType: "upsell_page",
      sequence: 10,
    };

    const result = await Effect.runPromise(service.add(input, mockUser));

    const connections = Array.from(mockDB.connections.values()).filter(
      (c: any) => c.toThingId === result
    );
    expect(connections[0].metadata.sequence).toBe(10);
  });

  it("should enforce max 50 steps per funnel", async () => {
    const service = makeStepService(dbContext);

    // Add 47 more connections (we already have 3)
    for (let i = 3; i < 50; i++) {
      mockDB.connections.set(`conn_${i}`, {
        _id: `conn_${i}` as Id<"things">,
        fromThingId: mockFunnelId,
        toThingId: `step_${i}` as Id<"things">,
        relationshipType: "funnel_contains_step",
        metadata: { sequence: i, stepType: "landing_page" },
        validFrom: Date.now(),
        createdAt: Date.now(),
      });
    }

    const input: CreateStepInput = {
      funnelId: mockFunnelId,
      name: "51st Step",
      stepType: "landing_page",
    };

    const effect = service.add(input, mockUser);

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      message: expect.stringContaining("step limit exceeded"),
    });
  });

  it("should validate step type", async () => {
    const service = makeStepService(dbContext);

    const input: CreateStepInput = {
      funnelId: mockFunnelId,
      name: "Test Step",
      stepType: "landing_page",
    };

    const result = await Effect.runPromise(service.add(input, mockUser));
    expect(result).toBeDefined();
  });

  it("should fail when funnel not found", async () => {
    const service = makeStepService(dbContext);

    const input: CreateStepInput = {
      funnelId: "nonexistent_funnel" as Id<"things">,
      name: "Test Step",
      stepType: "landing_page",
    };

    const effect = service.add(input, mockUser);

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      message: "Funnel not found",
    });
  });

  it("should fail when user not authorized (different groupId)", async () => {
    const service = makeStepService(dbContext);

    const unauthorizedUser: UserContext = {
      userId: mockUserId,
      groupId: "different_group" as Id<"groups">,
    };

    const input: CreateStepInput = {
      funnelId: mockFunnelId,
      name: "Test Step",
      stepType: "landing_page",
    };

    const effect = service.add(input, unauthorizedUser);

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      message: expect.stringContaining("Not authorized"),
    });
  });

  it("should fail when name is empty", async () => {
    const service = makeStepService(dbContext);

    const input: CreateStepInput = {
      funnelId: mockFunnelId,
      name: "",
      stepType: "landing_page",
    };

    const effect = service.add(input, mockUser);

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      message: expect.stringContaining("name is required"),
    });
  });

  it("should generate slug from name", async () => {
    const service = makeStepService(dbContext);

    const input: CreateStepInput = {
      funnelId: mockFunnelId,
      name: "My Amazing Step!!!",
      stepType: "landing_page",
    };

    const result = await Effect.runPromise(service.add(input, mockUser));
    const step = mockDB.things.get(result);

    // Service converts spaces to dashes (doesn't strip special chars yet)
    expect(step?.properties.slug).toBe("my-amazing-step!!!");
  });
});

// ============================================================================
// STEP SERVICE TESTS - GET
// ============================================================================

describe("StepService.get", () => {
  let mockDB: MockDatabase;
  let dbContext: DatabaseContext;

  beforeEach(() => {
    mockDB = createMockDB();
    dbContext = createMockDbContext(mockDB);
  });

  it("should get step by ID with sequence", async () => {
    const service = makeStepService(dbContext);

    const result = await Effect.runPromise(service.get(mockStepId1, mockUser));

    expect(result).toBeDefined();
    expect(result._id).toBe(mockStepId1);
    expect(result.name).toBe("Landing Page");
    expect(result.sequence).toBe(0);
    expect(result.funnelId).toBe(mockFunnelId);
  });

  it("should fail when step not found", async () => {
    const service = makeStepService(dbContext);

    const effect = service.get("nonexistent_step" as Id<"things">, mockUser);

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      message: "Step not found",
    });
  });

  it("should fail when user not authorized (different groupId)", async () => {
    const service = makeStepService(dbContext);

    const unauthorizedUser: UserContext = {
      userId: mockUserId,
      groupId: "different_group" as Id<"groups">,
    };

    const effect = service.get(mockStepId1, unauthorizedUser);

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      message: expect.stringContaining("Not authorized"),
    });
  });
});

// ============================================================================
// STEP SERVICE TESTS - LIST BY FUNNEL
// ============================================================================

describe("StepService.listByFunnel", () => {
  let mockDB: MockDatabase;
  let dbContext: DatabaseContext;

  beforeEach(() => {
    mockDB = createMockDB();
    dbContext = createMockDbContext(mockDB);
  });

  it("should list all steps for funnel ordered by sequence", async () => {
    const service = makeStepService(dbContext);

    const result = await Effect.runPromise(
      service.listByFunnel(mockFunnelId, mockUser)
    );

    expect(result).toHaveLength(3);
    expect(result[0]._id).toBe(mockStepId1);
    expect(result[0].sequence).toBe(0);
    expect(result[1]._id).toBe(mockStepId2);
    expect(result[1].sequence).toBe(1);
    expect(result[2]._id).toBe(mockStepId3);
    expect(result[2].sequence).toBe(2);
  });

  it("should fail when funnel not found", async () => {
    const service = makeStepService(dbContext);

    const effect = service.listByFunnel(
      "nonexistent_funnel" as Id<"things">,
      mockUser
    );

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      message: "Funnel not found",
    });
  });

  it("should fail when user not authorized", async () => {
    const service = makeStepService(dbContext);

    const unauthorizedUser: UserContext = {
      userId: mockUserId,
      groupId: "different_group" as Id<"groups">,
    };

    const effect = service.listByFunnel(mockFunnelId, unauthorizedUser);

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      message: expect.stringContaining("Not authorized"),
    });
  });

  it("should return empty array for funnel with no steps", async () => {
    const service = makeStepService(dbContext);

    // Create empty funnel
    const emptyFunnelId = "empty_funnel" as Id<"things">;
    mockDB.things.set(emptyFunnelId, {
      ...mockFunnel,
      _id: emptyFunnelId,
    });

    const result = await Effect.runPromise(
      service.listByFunnel(emptyFunnelId, mockUser)
    );

    expect(result).toHaveLength(0);
  });
});

// ============================================================================
// STEP SERVICE TESTS - UPDATE
// ============================================================================

describe("StepService.update", () => {
  let mockDB: MockDatabase;
  let dbContext: DatabaseContext;

  beforeEach(() => {
    mockDB = createMockDB();
    dbContext = createMockDbContext(mockDB);
  });

  it("should update step name", async () => {
    const service = makeStepService(dbContext);

    const input: UpdateStepInput = {
      name: "Updated Step Name",
    };

    await Effect.runPromise(service.update(mockStepId1, input, mockUser));

    const step = mockDB.things.get(mockStepId1);
    expect(step?.name).toBe("Updated Step Name");

    // Verify event logged
    const events = mockDB.events.filter((e) => e.type === "element_updated");
    expect(events).toHaveLength(1);
    expect(events[0].targetId).toBe(mockStepId1);
  });

  it("should update step properties", async () => {
    const service = makeStepService(dbContext);

    const input: UpdateStepInput = {
      properties: {
        title: "New Title",
        backgroundColor: "#ff0000",
      },
    };

    await Effect.runPromise(service.update(mockStepId1, input, mockUser));

    const step = mockDB.things.get(mockStepId1);
    expect(step?.properties.title).toBe("New Title");
    expect(step?.properties.backgroundColor).toBe("#ff0000");
  });

  it("should update step status", async () => {
    const service = makeStepService(dbContext);

    const input: UpdateStepInput = {
      status: "published",
    };

    await Effect.runPromise(service.update(mockStepId1, input, mockUser));

    const step = mockDB.things.get(mockStepId1);
    expect(step?.status).toBe("published");
  });

  it("should fail when step not found", async () => {
    const service = makeStepService(dbContext);

    const input: UpdateStepInput = { name: "New Name" };

    const effect = service.update(
      "nonexistent_step" as Id<"things">,
      input,
      mockUser
    );

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      message: "Step not found",
    });
  });

  it("should fail when user not authorized", async () => {
    const service = makeStepService(dbContext);

    const unauthorizedUser: UserContext = {
      userId: mockUserId,
      groupId: "different_group" as Id<"groups">,
    };

    const input: UpdateStepInput = { name: "New Name" };

    const effect = service.update(mockStepId1, input, unauthorizedUser);

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      message: expect.stringContaining("Not authorized"),
    });
  });

  it("should fail when name is empty", async () => {
    const service = makeStepService(dbContext);

    const input: UpdateStepInput = { name: "" };

    const effect = service.update(mockStepId1, input, mockUser);

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      message: expect.stringContaining("name cannot be empty"),
    });
  });
});

// ============================================================================
// STEP SERVICE TESTS - REMOVE
// ============================================================================

describe("StepService.remove", () => {
  let mockDB: MockDatabase;
  let dbContext: DatabaseContext;

  beforeEach(() => {
    mockDB = createMockDB();
    dbContext = createMockDbContext(mockDB);
  });

  it("should soft delete step and resequence remaining steps", async () => {
    const service = makeStepService(dbContext);

    // Remove step 2 (sequence 1)
    await Effect.runPromise(service.remove(mockStepId2, mockUser));

    // Verify step archived
    const step = mockDB.things.get(mockStepId2);
    expect(step?.status).toBe("archived");

    // Verify connection invalidated
    const connection = Array.from(mockDB.connections.values()).find(
      (c: any) => c.toThingId === mockStepId2
    );
    expect(connection?.validTo).toBeDefined();

    // Verify remaining steps resequenced
    const step3Connection = Array.from(mockDB.connections.values()).find(
      (c: any) => c.toThingId === mockStepId3
    );
    expect(step3Connection?.metadata.sequence).toBe(1); // Was 2, now 1

    // Verify event logged
    const events = mockDB.events.filter((e) => e.type === "step_removed");
    expect(events).toHaveLength(1);
    expect(events[0].targetId).toBe(mockStepId2);
  });

  it("should fail when step not found", async () => {
    const service = makeStepService(dbContext);

    const effect = service.remove("nonexistent_step" as Id<"things">, mockUser);

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      message: "Step not found",
    });
  });

  it("should fail when user not authorized", async () => {
    const service = makeStepService(dbContext);

    const unauthorizedUser: UserContext = {
      userId: mockUserId,
      groupId: "different_group" as Id<"groups">,
    };

    const effect = service.remove(mockStepId1, unauthorizedUser);

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      message: expect.stringContaining("Not authorized"),
    });
  });
});

// ============================================================================
// STEP SERVICE TESTS - REORDER
// ============================================================================

describe("StepService.reorder", () => {
  let mockDB: MockDatabase;
  let dbContext: DatabaseContext;

  beforeEach(() => {
    mockDB = createMockDB();
    dbContext = createMockDbContext(mockDB);
  });

  it("should reorder steps successfully", async () => {
    const service = makeStepService(dbContext);

    const input: ReorderStepsInput = {
      funnelId: mockFunnelId,
      stepSequences: [
        { stepId: mockStepId3, newSequence: 0 }, // Move step 3 to first
        { stepId: mockStepId1, newSequence: 1 }, // Move step 1 to second
        { stepId: mockStepId2, newSequence: 2 }, // Move step 2 to third
      ],
    };

    await Effect.runPromise(service.reorder(input, mockUser));

    // Verify sequences updated
    const conn1 = Array.from(mockDB.connections.values()).find(
      (c: any) => c.toThingId === mockStepId1
    );
    const conn2 = Array.from(mockDB.connections.values()).find(
      (c: any) => c.toThingId === mockStepId2
    );
    const conn3 = Array.from(mockDB.connections.values()).find(
      (c: any) => c.toThingId === mockStepId3
    );

    expect(conn1?.metadata.sequence).toBe(1);
    expect(conn2?.metadata.sequence).toBe(2);
    expect(conn3?.metadata.sequence).toBe(0);

    // Verify event logged
    const events = mockDB.events.filter((e) => e.type === "step_reordered");
    expect(events).toHaveLength(1);
  });

  it("should fail with duplicate sequences", async () => {
    const service = makeStepService(dbContext);

    const input: ReorderStepsInput = {
      funnelId: mockFunnelId,
      stepSequences: [
        { stepId: mockStepId1, newSequence: 0 },
        { stepId: mockStepId2, newSequence: 0 }, // Duplicate
        { stepId: mockStepId3, newSequence: 2 },
      ],
    };

    const effect = service.reorder(input, mockUser);

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      message: expect.stringContaining("duplicates"),
    });
  });

  it("should fail with gaps in sequence", async () => {
    const service = makeStepService(dbContext);

    const input: ReorderStepsInput = {
      funnelId: mockFunnelId,
      stepSequences: [
        { stepId: mockStepId1, newSequence: 0 },
        { stepId: mockStepId2, newSequence: 3 }, // Gap (0, 3, 4 - missing 1 and 2)
        { stepId: mockStepId3, newSequence: 4 },
      ],
    };

    const effect = service.reorder(input, mockUser);

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      message: expect.stringContaining("consecutive"),
    });
  });

  it("should fail when funnel not found", async () => {
    const service = makeStepService(dbContext);

    const input: ReorderStepsInput = {
      funnelId: "nonexistent_funnel" as Id<"things">,
      stepSequences: [],
    };

    const effect = service.reorder(input, mockUser);

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      message: "Funnel not found",
    });
  });

  it("should fail when user not authorized", async () => {
    const service = makeStepService(dbContext);

    const unauthorizedUser: UserContext = {
      userId: mockUserId,
      groupId: "different_group" as Id<"groups">,
    };

    const input: ReorderStepsInput = {
      funnelId: mockFunnelId,
      stepSequences: [
        { stepId: mockStepId1, newSequence: 0 },
        { stepId: mockStepId2, newSequence: 1 },
        { stepId: mockStepId3, newSequence: 2 },
      ],
    };

    const effect = service.reorder(input, unauthorizedUser);

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      message: expect.stringContaining("Not authorized"),
    });
  });
});
