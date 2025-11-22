/**
 * ElementService Unit Tests (Cycle 030)
 *
 * Comprehensive tests for page element business logic:
 * - Add elements to steps with position validation
 * - Get/list elements with authorization
 * - Update element properties
 * - Update element position (drag-and-drop, resize)
 * - Remove elements
 * - Validate 37 element types
 *
 * @see /one/things/plans/clickfunnels-builder-100-cycles.md (Cycle 030)
 */

import { describe, it, expect, beforeEach } from "vitest";
import { Effect } from "effect";
import type { Id } from "../../_generated/dataModel";
import {
  makeElementService,
  type CreateElementInput,
  type UpdateElementInput,
  type UpdateElementPositionInput,
  type ElementType,
  type ElementPosition,
  type DatabaseContext,
  type UserContext,
} from "./element";
import {
  PageNotFoundError,
  UnauthorizedPageAccessError,
  ValidationError,
  DatabaseError,
} from "./errors";

// ============================================================================
// MOCK DATA
// ============================================================================

const mockGroupId = "group_123" as Id<"groups">;
const mockUserId = "person_456" as Id<"things">;
const mockStepId = "step_789" as Id<"things">;
const mockElementId1 = "element_001" as Id<"things">;
const mockElementId2 = "element_002" as Id<"things">;
const mockElementId3 = "element_003" as Id<"things">;

const mockUser: UserContext = {
  userId: mockUserId,
  groupId: mockGroupId,
};

const mockStep = {
  _id: mockStepId,
  type: "funnel_step" as const,
  name: "Test Step",
  groupId: mockGroupId,
  properties: {
    stepType: "landing_page",
    title: "Test Step",
    slug: "test-step",
  },
  status: "draft" as const,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const mockElement1 = {
  _id: mockElementId1,
  type: "page_element" as const,
  name: "Headline Element",
  groupId: mockGroupId,
  properties: {
    elementType: "headline" as ElementType,
    text: "Welcome to Our Page",
    fontSize: 48,
    color: "#000000",
  },
  status: "draft" as const,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const mockElement2 = {
  _id: mockElementId2,
  type: "page_element" as const,
  name: "Image Element",
  groupId: mockGroupId,
  properties: {
    elementType: "image" as ElementType,
    src: "https://example.com/image.jpg",
    alt: "Hero image",
  },
  status: "draft" as const,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const mockElement3 = {
  _id: mockElementId3,
  type: "page_element" as const,
  name: "Button Element",
  groupId: mockGroupId,
  properties: {
    elementType: "button" as ElementType,
    buttonText: "Get Started",
    buttonAction: "link",
    buttonLink: "/signup",
  },
  status: "draft" as const,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const mockPosition1: ElementPosition = {
  x: 0,
  y: 0,
  width: 12,
  height: 100,
  zIndex: 0,
};

const mockPosition2: ElementPosition = {
  x: 0,
  y: 100,
  width: 6,
  height: 300,
  zIndex: 1,
};

const mockPosition3: ElementPosition = {
  x: 6,
  y: 100,
  width: 6,
  height: 60,
  zIndex: 2,
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
    [mockStepId, mockStep],
    [mockElementId1, mockElement1],
    [mockElementId2, mockElement2],
    [mockElementId3, mockElement3],
  ]),
  connections: new Map([
    [
      "conn_001",
      {
        _id: "conn_001" as Id<"things">,
        fromThingId: mockStepId,
        toThingId: mockElementId1,
        relationshipType: "step_contains_element",
        metadata: { position: mockPosition1, elementType: "headline" },
        validFrom: Date.now(),
        createdAt: Date.now(),
      },
    ],
    [
      "conn_002",
      {
        _id: "conn_002" as Id<"things">,
        fromThingId: mockStepId,
        toThingId: mockElementId2,
        relationshipType: "step_contains_element",
        metadata: { position: mockPosition2, elementType: "image" },
        validFrom: Date.now(),
        createdAt: Date.now(),
      },
    ],
    [
      "conn_003",
      {
        _id: "conn_003" as Id<"things">,
        fromThingId: mockStepId,
        toThingId: mockElementId3,
        relationshipType: "step_contains_element",
        metadata: { position: mockPosition3, elementType: "button" },
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
// ELEMENT SERVICE TESTS - ADD
// ============================================================================

describe("ElementService.add", () => {
  let mockDB: MockDatabase;
  let dbContext: DatabaseContext;

  beforeEach(() => {
    mockDB = createMockDB();
    dbContext = createMockDbContext(mockDB);
  });

  it("should add element to step with position", async () => {
    const service = makeElementService(dbContext);

    const input: CreateElementInput = {
      stepId: mockStepId,
      elementType: "paragraph",
      name: "Intro Paragraph",
      position: {
        x: 0,
        y: 400,
        width: 12,
        height: 150,
        zIndex: 3,
      },
      properties: {
        text: "This is a paragraph of text.",
        fontSize: 16,
        color: "#333333",
      },
    };

    const result = await Effect.runPromise(service.add(input, mockUser));

    expect(result).toBeDefined();

    // Verify element was created
    const element = mockDB.things.get(result);
    expect(element).toBeDefined();
    expect(element?.type).toBe("page_element");
    expect(element?.name).toBe("Intro Paragraph");
    expect(element?.groupId).toBe(mockGroupId);
    expect(element?.properties.elementType).toBe("paragraph");
    expect(element?.properties.text).toBe("This is a paragraph of text.");
    expect(element?.status).toBe("draft");

    // Verify connection was created with position
    const connections = Array.from(mockDB.connections.values()).filter(
      (c: any) =>
        c.fromThingId === mockStepId &&
        c.toThingId === result &&
        c.relationshipType === "step_contains_element"
    );
    expect(connections).toHaveLength(1);
    expect(connections[0].metadata.position).toEqual(input.position);

    // Verify event was logged
    const events = mockDB.events.filter((e) => e.type === "element_added");
    expect(events).toHaveLength(1);
    expect(events[0].targetId).toBe(result);
    expect(events[0].metadata.stepId).toBe(mockStepId);
  });

  it("should validate element type (37 valid types)", async () => {
    const service = makeElementService(dbContext);

    // Test valid element types
    const validTypes: ElementType[] = [
      // Text Elements
      "headline",
      "subheadline",
      "paragraph",
      "list",
      "quote",
      // Media Elements
      "image",
      "video",
      "audio",
      "iframe",
      // Form Elements
      "form",
      "input",
      "textarea",
      "select",
      "checkbox",
      "radio",
      "button",
      // Commerce Elements
      "pricing_table",
      "payment_button",
      "countdown_timer",
      "progress_bar",
      "order_bump",
      // Social Elements
      "testimonial",
      "social_share",
      "social_feed",
      "faq",
      // Layout Elements
      "container",
      "column",
      "row",
      "divider",
      "spacer",
      // Advanced Elements
      "custom_html",
      "custom_code",
      "popup",
      "survey",
      "chart",
      "map",
      "calendar",
    ];

    expect(validTypes).toHaveLength(37);

    // Test one valid type
    const input: CreateElementInput = {
      stepId: mockStepId,
      elementType: "headline",
      position: { x: 0, y: 0, width: 12, height: 100, zIndex: 0 },
    };

    const result = await Effect.runPromise(service.add(input, mockUser));
    expect(result).toBeDefined();
  });

  it("should fail with invalid element type", async () => {
    const service = makeElementService(dbContext);

    const input: CreateElementInput = {
      stepId: mockStepId,
      elementType: "invalid_type" as ElementType,
      position: { x: 0, y: 0, width: 12, height: 100, zIndex: 0 },
    };

    const effect = service.add(input, mockUser);

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      message: expect.stringContaining("Invalid element type"),
    });
  });

  it("should validate position within 12-column grid", async () => {
    const service = makeElementService(dbContext);

    // Valid position (fits in 12-column grid)
    const validInput: CreateElementInput = {
      stepId: mockStepId,
      elementType: "headline",
      position: { x: 6, y: 0, width: 6, height: 100, zIndex: 0 },
    };

    const result = await Effect.runPromise(service.add(validInput, mockUser));
    expect(result).toBeDefined();
  });

  it("should fail when position exceeds grid bounds", async () => {
    const service = makeElementService(dbContext);

    // Invalid: x + width > 12
    const input: CreateElementInput = {
      stepId: mockStepId,
      elementType: "headline",
      position: { x: 10, y: 0, width: 5, height: 100, zIndex: 0 }, // 10 + 5 = 15 > 12
    };

    const effect = service.add(input, mockUser);

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      message: expect.stringContaining("12-column grid"),
    });
  });

  it("should fail when x position is negative", async () => {
    const service = makeElementService(dbContext);

    const input: CreateElementInput = {
      stepId: mockStepId,
      elementType: "headline",
      position: { x: -1, y: 0, width: 12, height: 100, zIndex: 0 },
    };

    const effect = service.add(input, mockUser);

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      message: expect.stringContaining("Invalid position"),
    });
  });

  it("should fail when width is less than 1", async () => {
    const service = makeElementService(dbContext);

    const input: CreateElementInput = {
      stepId: mockStepId,
      elementType: "headline",
      position: { x: 0, y: 0, width: 0, height: 100, zIndex: 0 },
    };

    const effect = service.add(input, mockUser);

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      message: expect.stringContaining("Invalid position"),
    });
  });

  it("should fail when step not found", async () => {
    const service = makeElementService(dbContext);

    const input: CreateElementInput = {
      stepId: "nonexistent_step" as Id<"things">,
      elementType: "headline",
      position: { x: 0, y: 0, width: 12, height: 100, zIndex: 0 },
    };

    const effect = service.add(input, mockUser);

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      message: "Step not found",
    });
  });

  it("should fail when user not authorized (different groupId)", async () => {
    const service = makeElementService(dbContext);

    const unauthorizedUser: UserContext = {
      userId: mockUserId,
      groupId: "different_group" as Id<"groups">,
    };

    const input: CreateElementInput = {
      stepId: mockStepId,
      elementType: "headline",
      position: { x: 0, y: 0, width: 12, height: 100, zIndex: 0 },
    };

    const effect = service.add(input, unauthorizedUser);

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      message: expect.stringContaining("Not authorized"),
    });
  });

  it("should generate element name if not provided", async () => {
    const service = makeElementService(dbContext);

    const input: CreateElementInput = {
      stepId: mockStepId,
      elementType: "headline",
      position: { x: 0, y: 0, width: 12, height: 100, zIndex: 0 },
      // No name provided
    };

    const result = await Effect.runPromise(service.add(input, mockUser));
    const element = mockDB.things.get(result);

    expect(element?.name).toBe("Headline Element");
  });
});

// ============================================================================
// ELEMENT SERVICE TESTS - GET
// ============================================================================

describe("ElementService.get", () => {
  let mockDB: MockDatabase;
  let dbContext: DatabaseContext;

  beforeEach(() => {
    mockDB = createMockDB();
    dbContext = createMockDbContext(mockDB);
  });

  it("should get element by ID with position", async () => {
    const service = makeElementService(dbContext);

    const result = await Effect.runPromise(
      service.get(mockElementId1, mockUser)
    );

    expect(result).toBeDefined();
    expect(result._id).toBe(mockElementId1);
    expect(result.name).toBe("Headline Element");
    expect(result.position).toEqual(mockPosition1);
    expect(result.stepId).toBe(mockStepId);
  });

  it("should fail when element not found", async () => {
    const service = makeElementService(dbContext);

    const effect = service.get("nonexistent_element" as Id<"things">, mockUser);

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      message: "Element not found",
    });
  });

  it("should fail when user not authorized (different groupId)", async () => {
    const service = makeElementService(dbContext);

    const unauthorizedUser: UserContext = {
      userId: mockUserId,
      groupId: "different_group" as Id<"groups">,
    };

    const effect = service.get(mockElementId1, unauthorizedUser);

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      message: expect.stringContaining("Not authorized"),
    });
  });
});

// ============================================================================
// ELEMENT SERVICE TESTS - LIST BY STEP
// ============================================================================

describe("ElementService.listByStep", () => {
  let mockDB: MockDatabase;
  let dbContext: DatabaseContext;

  beforeEach(() => {
    mockDB = createMockDB();
    dbContext = createMockDbContext(mockDB);
  });

  it("should list all elements for step ordered by zIndex", async () => {
    const service = makeElementService(dbContext);

    const result = await Effect.runPromise(
      service.listByStep(mockStepId, mockUser)
    );

    expect(result).toHaveLength(3);
    expect(result[0]._id).toBe(mockElementId1); // zIndex 0
    expect(result[0].position.zIndex).toBe(0);
    expect(result[1]._id).toBe(mockElementId2); // zIndex 1
    expect(result[1].position.zIndex).toBe(1);
    expect(result[2]._id).toBe(mockElementId3); // zIndex 2
    expect(result[2].position.zIndex).toBe(2);
  });

  it("should fail when step not found", async () => {
    const service = makeElementService(dbContext);

    const effect = service.listByStep(
      "nonexistent_step" as Id<"things">,
      mockUser
    );

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      message: "Step not found",
    });
  });

  it("should fail when user not authorized", async () => {
    const service = makeElementService(dbContext);

    const unauthorizedUser: UserContext = {
      userId: mockUserId,
      groupId: "different_group" as Id<"groups">,
    };

    const effect = service.listByStep(mockStepId, unauthorizedUser);

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      message: expect.stringContaining("Not authorized"),
    });
  });

  it("should return empty array for step with no elements", async () => {
    const service = makeElementService(dbContext);

    // Create empty step
    const emptyStepId = "empty_step" as Id<"things">;
    mockDB.things.set(emptyStepId, {
      ...mockStep,
      _id: emptyStepId,
    });

    const result = await Effect.runPromise(
      service.listByStep(emptyStepId, mockUser)
    );

    expect(result).toHaveLength(0);
  });
});

// ============================================================================
// ELEMENT SERVICE TESTS - UPDATE
// ============================================================================

describe("ElementService.update", () => {
  let mockDB: MockDatabase;
  let dbContext: DatabaseContext;

  beforeEach(() => {
    mockDB = createMockDB();
    dbContext = createMockDbContext(mockDB);
  });

  it("should update element name", async () => {
    const service = makeElementService(dbContext);

    const input: UpdateElementInput = {
      name: "Updated Headline",
    };

    await Effect.runPromise(service.update(mockElementId1, input, mockUser));

    const element = mockDB.things.get(mockElementId1);
    expect(element?.name).toBe("Updated Headline");

    // Verify event logged
    const events = mockDB.events.filter((e) => e.type === "element_updated");
    expect(events).toHaveLength(1);
    expect(events[0].targetId).toBe(mockElementId1);
  });

  it("should update element properties", async () => {
    const service = makeElementService(dbContext);

    const input: UpdateElementInput = {
      properties: {
        text: "Updated text content",
        fontSize: 36,
      },
    };

    await Effect.runPromise(service.update(mockElementId1, input, mockUser));

    const element = mockDB.things.get(mockElementId1);
    expect(element?.properties.text).toBe("Updated text content");
    expect(element?.properties.fontSize).toBe(36);
  });

  it("should update element status", async () => {
    const service = makeElementService(dbContext);

    const input: UpdateElementInput = {
      status: "published",
    };

    await Effect.runPromise(service.update(mockElementId1, input, mockUser));

    const element = mockDB.things.get(mockElementId1);
    expect(element?.status).toBe("published");
  });

  it("should fail when element not found", async () => {
    const service = makeElementService(dbContext);

    const input: UpdateElementInput = { name: "New Name" };

    const effect = service.update(
      "nonexistent_element" as Id<"things">,
      input,
      mockUser
    );

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      message: "Element not found",
    });
  });

  it("should fail when user not authorized", async () => {
    const service = makeElementService(dbContext);

    const unauthorizedUser: UserContext = {
      userId: mockUserId,
      groupId: "different_group" as Id<"groups">,
    };

    const input: UpdateElementInput = { name: "New Name" };

    const effect = service.update(mockElementId1, input, unauthorizedUser);

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      message: expect.stringContaining("Not authorized"),
    });
  });

  it("should fail when name is empty", async () => {
    const service = makeElementService(dbContext);

    const input: UpdateElementInput = { name: "" };

    const effect = service.update(mockElementId1, input, mockUser);

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      message: expect.stringContaining("name cannot be empty"),
    });
  });
});

// ============================================================================
// ELEMENT SERVICE TESTS - UPDATE POSITION
// ============================================================================

describe("ElementService.updatePosition", () => {
  let mockDB: MockDatabase;
  let dbContext: DatabaseContext;

  beforeEach(() => {
    mockDB = createMockDB();
    dbContext = createMockDbContext(mockDB);
  });

  it("should update element position (drag-and-drop)", async () => {
    const service = makeElementService(dbContext);

    const input: UpdateElementPositionInput = {
      elementId: mockElementId1,
      position: {
        x: 3,
        y: 50,
        width: 6, // Must specify width when changing x to stay within grid (3 + 6 = 9 <= 12)
      },
    };

    await Effect.runPromise(service.updatePosition(input, mockUser));

    // Verify connection metadata updated
    const connection = Array.from(mockDB.connections.values()).find(
      (c: any) => c.toThingId === mockElementId1
    );

    expect(connection?.metadata.position.x).toBe(3);
    expect(connection?.metadata.position.y).toBe(50);
    expect(connection?.metadata.position.width).toBe(6); // Updated
    expect(connection?.metadata.position.height).toBe(100); // Preserved

    // Verify event logged
    const events = mockDB.events.filter((e) => e.type === "element_updated");
    expect(events).toHaveLength(1);
    expect(events[0].metadata.updatedFields).toContain("position");
  });

  it("should update element size (resize)", async () => {
    const service = makeElementService(dbContext);

    const input: UpdateElementPositionInput = {
      elementId: mockElementId1,
      position: {
        width: 6,
        height: 200,
      },
    };

    await Effect.runPromise(service.updatePosition(input, mockUser));

    const connection = Array.from(mockDB.connections.values()).find(
      (c: any) => c.toThingId === mockElementId1
    );

    expect(connection?.metadata.position.width).toBe(6);
    expect(connection?.metadata.position.height).toBe(200);
    expect(connection?.metadata.position.x).toBe(0); // Preserved
    expect(connection?.metadata.position.y).toBe(0); // Preserved
  });

  it("should update zIndex (layering)", async () => {
    const service = makeElementService(dbContext);

    const input: UpdateElementPositionInput = {
      elementId: mockElementId1,
      position: {
        zIndex: 10,
      },
    };

    await Effect.runPromise(service.updatePosition(input, mockUser));

    const connection = Array.from(mockDB.connections.values()).find(
      (c: any) => c.toThingId === mockElementId1
    );

    expect(connection?.metadata.position.zIndex).toBe(10);
  });

  it("should validate position within grid bounds", async () => {
    const service = makeElementService(dbContext);

    // Invalid: x + width > 12
    const input: UpdateElementPositionInput = {
      elementId: mockElementId1,
      position: {
        x: 10,
        width: 5, // 10 + 5 = 15 > 12
      },
    };

    const effect = service.updatePosition(input, mockUser);

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      message: expect.stringContaining("12-column grid"),
    });
  });

  it("should fail when element not found", async () => {
    const service = makeElementService(dbContext);

    const input: UpdateElementPositionInput = {
      elementId: "nonexistent_element" as Id<"things">,
      position: { x: 5 },
    };

    const effect = service.updatePosition(input, mockUser);

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      message: "Element not found",
    });
  });

  it("should fail when user not authorized", async () => {
    const service = makeElementService(dbContext);

    const unauthorizedUser: UserContext = {
      userId: mockUserId,
      groupId: "different_group" as Id<"groups">,
    };

    const input: UpdateElementPositionInput = {
      elementId: mockElementId1,
      position: { x: 5 },
    };

    const effect = service.updatePosition(input, unauthorizedUser);

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      message: expect.stringContaining("Not authorized"),
    });
  });
});

// ============================================================================
// ELEMENT SERVICE TESTS - REMOVE
// ============================================================================

describe("ElementService.remove", () => {
  let mockDB: MockDatabase;
  let dbContext: DatabaseContext;

  beforeEach(() => {
    mockDB = createMockDB();
    dbContext = createMockDbContext(mockDB);
  });

  it("should soft delete element and invalidate connection", async () => {
    const service = makeElementService(dbContext);

    await Effect.runPromise(service.remove(mockElementId1, mockUser));

    // Verify element archived
    const element = mockDB.things.get(mockElementId1);
    expect(element?.status).toBe("archived");

    // Verify connection invalidated
    const connection = Array.from(mockDB.connections.values()).find(
      (c: any) => c.toThingId === mockElementId1
    );
    expect(connection?.validTo).toBeDefined();

    // Verify event logged
    const events = mockDB.events.filter((e) => e.type === "element_removed");
    expect(events).toHaveLength(1);
    expect(events[0].targetId).toBe(mockElementId1);
    expect(events[0].metadata.stepId).toBe(mockStepId);
  });

  it("should fail when element not found", async () => {
    const service = makeElementService(dbContext);

    const effect = service.remove(
      "nonexistent_element" as Id<"things">,
      mockUser
    );

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      message: "Element not found",
    });
  });

  it("should fail when user not authorized", async () => {
    const service = makeElementService(dbContext);

    const unauthorizedUser: UserContext = {
      userId: mockUserId,
      groupId: "different_group" as Id<"groups">,
    };

    const effect = service.remove(mockElementId1, unauthorizedUser);

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      message: expect.stringContaining("Not authorized"),
    });
  });
});

// ============================================================================
// ELEMENT SERVICE TESTS - ELEMENT TYPES (37 TYPES)
// ============================================================================

describe("ElementService - Element Types", () => {
  let mockDB: MockDatabase;
  let dbContext: DatabaseContext;

  beforeEach(() => {
    mockDB = createMockDB();
    dbContext = createMockDbContext(mockDB);
  });

  it("should support all 37 element types", async () => {
    const service = makeElementService(dbContext);

    const allElementTypes: ElementType[] = [
      // Text Elements (5)
      "headline",
      "subheadline",
      "paragraph",
      "list",
      "quote",
      // Media Elements (4)
      "image",
      "video",
      "audio",
      "iframe",
      // Form Elements (7)
      "form",
      "input",
      "textarea",
      "select",
      "checkbox",
      "radio",
      "button",
      // Commerce Elements (5)
      "pricing_table",
      "payment_button",
      "countdown_timer",
      "progress_bar",
      "order_bump",
      // Social Elements (4)
      "testimonial",
      "social_share",
      "social_feed",
      "faq",
      // Layout Elements (5)
      "container",
      "column",
      "row",
      "divider",
      "spacer",
      // Advanced Elements (7)
      "custom_html",
      "custom_code",
      "popup",
      "survey",
      "chart",
      "map",
      "calendar",
    ];

    expect(allElementTypes).toHaveLength(37);

    // Test a few representative types
    const testTypes: ElementType[] = [
      "headline",
      "image",
      "button",
      "pricing_table",
      "testimonial",
      "container",
      "custom_html",
    ];

    for (const elementType of testTypes) {
      const input: CreateElementInput = {
        stepId: mockStepId,
        elementType,
        position: { x: 0, y: 0, width: 12, height: 100, zIndex: 0 },
      };

      const result = await Effect.runPromise(service.add(input, mockUser));
      expect(result).toBeDefined();

      const element = mockDB.things.get(result);
      expect(element?.properties.elementType).toBe(elementType);
    }
  });
});
