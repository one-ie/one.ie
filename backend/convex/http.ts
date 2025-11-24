import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { HonoWithConvex, HttpRouterWithHono } from "convex-helpers/server/hono";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import {
  formatErrorResponse,
  validateCreateGroup,
  validateCreatePerson,
  validateCreateThing,
  validateCreateConnection,
} from "./lib/validation";

// ============================================================================
// HONO + CONVEX HTTP ROUTER
// Following: https://stack.convex.dev/hono-with-convex
// ============================================================================

// Use HonoWithConvex without type parameter to avoid generic constraint issues
const app: HonoWithConvex<any> = new Hono();

// ============================================================================
// MIDDLEWARE
// ============================================================================

// CORS - Allow all origins (restrict in production)
app.use("*", cors());

// Request logging
app.use("*", async (c, next) => {
  console.log(`${c.req.method} ${c.req.url}`);
  await next();
});

// Error handling middleware
app.onError((err, c) => {
  console.error("HTTP Error:", err);

  if (err instanceof HTTPException) {
    return c.json(
      {
        error: err.message,
        status: err.status,
      },
      err.status as any
    );
  }

  return c.json(formatErrorResponse(err), 500);
});

// ============================================================================
// DIMENSION 1: GROUPS (Multi-tenant isolation)
// ============================================================================

// GET /groups - List all groups
app.get("/groups", async (c) => {
  const type = c.req.query("type");
  const status = c.req.query("status");
  const limit = c.req.query("limit") ? parseInt(c.req.query("limit") as string) : undefined;

  const groups = await c.env.runQuery(api.queries.groups.list, {
    type: type as any,
    status: status as any,
    limit
  });

  return c.json({ data: groups });
});

// GET /groups/:id - Get single group
app.get("/groups/:id", async (c) => {
  const id = c.req.param("id");

  const group = await c.env.runQuery(api.queries.groups.getById, {
    groupId: id as Id<"groups">
  });

  if (!group) {
    throw new HTTPException(404, { message: "Group not found" });
  }

  return c.json({ data: group });
});

// POST /groups - Create new group
app.post("/groups", async (c) => {
  const body = await c.req.json();

  // Validate input
  try {
    validateCreateGroup(body);
  } catch (error) {
    return c.json(formatErrorResponse(error), 400);
  }

  const { slug, name, type, parentGroupId, description, metadata, settings } = body;

  const groupId = await c.env.runMutation(api.mutations.groups.create, {
    slug,
    name,
    type,
    parentGroupId: parentGroupId as Id<"groups"> | undefined,
    description,
    metadata,
    settings,
  });

  return c.json({ data: { _id: groupId } }, 201);
});

// PATCH /groups/:id - Update group
app.patch("/groups/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const { name, description, metadata, settings } = body;

  await c.env.runMutation(api.mutations.groups.update, {
    groupId: id as Id<"groups">,
    name,
    description,
    metadata,
    settings,
  });

  return c.json({ data: { success: true } });
});

// DELETE /groups/:id - Archive group
app.delete("/groups/:id", async (c) => {
  const id = c.req.param("id");

  await c.env.runMutation(api.mutations.groups.archive, {
    groupId: id as Id<"groups">
  });

  return c.json({ data: { success: true } });
});

// ============================================================================
// DIMENSION 2: PEOPLE (Authorization & governance)
// ============================================================================

// POST /people - Create person
app.post("/people", async (c) => {
  const body = await c.req.json();

  // Validate input
  try {
    validateCreatePerson(body);
  } catch (error) {
    return c.json(formatErrorResponse(error), 400);
  }

  const { groupId, name, email, role, userId, properties } = body;

  const personId = await c.env.runMutation(api.mutations.people.create, {
    groupId: groupId as Id<"groups">,
    name,
    email,
    role,
    userId,
    properties,
  });

  return c.json({ data: { _id: personId } }, 201);
});

// GET /people - List people in group
app.get("/people", async (c) => {
  const groupId = c.req.query("groupId");

  if (!groupId) {
    throw new HTTPException(400, { message: "groupId is required" });
  }

  const people = await c.env.runQuery(api.queries.things.list, {
    groupId: groupId as Id<"groups">,
    type: "user",
  });

  return c.json({ data: people });
});

// PATCH /people/:id/role - Update person role
app.patch("/people/:id/role", async (c) => {
  const personId = c.req.param("id");
  const body = await c.req.json();
  const { newRole, actorId } = body;

  await c.env.runMutation(api.mutations.people.updateRole, {
    personId: personId as Id<"entities">,
    newRole,
    actorId: actorId as Id<"entities">,
  });

  return c.json({ data: { success: true } });
});

// PATCH /people/:id - Update person profile
app.patch("/people/:id", async (c) => {
  const personId = c.req.param("id");
  const body = await c.req.json();
  const { name, properties } = body;

  await c.env.runMutation(api.mutations.people.updateProfile, {
    personId: personId as Id<"entities">,
    name,
    properties,
  });

  return c.json({ data: { success: true } });
});

// DELETE /people/:id - Remove person from group
app.delete("/people/:id", async (c) => {
  const personId = c.req.param("id");
  const actorId = c.req.query("actorId");

  await c.env.runMutation(api.mutations.people.removeFromGroup, {
    personId: personId as Id<"entities">,
    actorId: actorId as Id<"entities">,
  });

  return c.json({ data: { success: true } });
});

// ============================================================================
// DIMENSION 3: THINGS (All entities - 66+ types)
// ============================================================================

// GET /things - List things with filters
app.get("/things", async (c) => {
  const groupId = c.req.query("groupId");
  const type = c.req.query("type");
  const status = c.req.query("status");
  const limit = parseInt(c.req.query("limit") || "100");

  if (!groupId) {
    throw new HTTPException(400, { message: "groupId is required" });
  }

  const things = await c.env.runQuery(api.queries.things.list, {
    groupId: groupId as Id<"groups">,
    type,
    status,
    limit,
  });

  return c.json({ data: things });
});

// GET /things/:id - Get single thing
app.get("/things/:id", async (c) => {
  const id = c.req.param("id");

  const thing = await c.env.runQuery(api.queries.things.getById, {
    entityId: id as Id<"entities">
  });

  if (!thing) {
    throw new HTTPException(404, { message: "Thing not found" });
  }

  return c.json({ data: thing });
});

// POST /things - Create thing
app.post("/things", async (c) => {
  const body = await c.req.json();

  // Validate input
  try {
    validateCreateThing(body);
  } catch (error) {
    return c.json(formatErrorResponse(error), 400);
  }

  const { groupId, type, name, properties, status } = body;

  const thingId = await c.env.runMutation(api.mutations.things.create, {
    groupId: groupId as Id<"groups">,
    type,
    name,
    properties,
    status,
  });

  return c.json({ data: { _id: thingId } }, 201);
});

// PATCH /things/:id - Update thing
app.patch("/things/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const { name, properties, status } = body;

  await c.env.runMutation(api.mutations.things.update, {
    entityId: id as Id<"entities">,
    name,
    properties,
    status,
  });

  return c.json({ data: { success: true } });
});

// DELETE /things/:id - Delete thing (archive)
app.delete("/things/:id", async (c) => {
  const id = c.req.param("id");

  await c.env.runMutation(api.mutations.things.archive, {
    entityId: id as Id<"entities">
  });

  return c.json({ data: { success: true } });
});

// ============================================================================
// DIMENSION 4: CONNECTIONS (Relationships - 25+ types)
// ============================================================================

// GET /connections - List connections
app.get("/connections", async (c) => {
  const groupId = c.req.query("groupId");
  const fromId = c.req.query("from");
  const toId = c.req.query("to");
  const type = c.req.query("type");

  if (!groupId) {
    throw new HTTPException(400, { message: "groupId is required" });
  }

  let connections;
  if (fromId) {
    connections = await c.env.runQuery(api.queries.connections.listFrom, {
      groupId: groupId as Id<"groups">,
      fromEntityId: fromId as Id<"entities">,
    });
  } else if (toId) {
    connections = await c.env.runQuery(api.queries.connections.listTo, {
      groupId: groupId as Id<"groups">,
      toEntityId: toId as Id<"entities">,
    });
  } else if (type) {
    connections = await c.env.runQuery(api.queries.connections.listByType, {
      groupId: groupId as Id<"groups">,
      relationshipType: type as any,
    });
  } else {
    // TODO: Add a list all query to connections
    throw new HTTPException(400, {
      message: "Must provide either fromId, toId, or type parameter"
    });
  }

  return c.json({ data: connections });
});

// POST /connections - Create connection
app.post("/connections", async (c) => {
  const body = await c.req.json();

  // Validate input
  try {
    validateCreateConnection(body);
  } catch (error) {
    return c.json(formatErrorResponse(error), 400);
  }

  const { groupId, relationshipType, fromEntityId, toEntityId, metadata, strength, validFrom, validTo } = body;

  const connectionId = await c.env.runMutation(api.mutations.connections.create, {
    groupId: groupId as Id<"groups">,
    relationshipType,
    fromEntityId: fromEntityId as Id<"entities">,
    toEntityId: toEntityId as Id<"entities">,
    metadata,
    strength,
    validFrom,
    validTo,
  });

  return c.json({ data: { _id: connectionId } }, 201);
});

// DELETE /connections/:id - Delete connection
app.delete("/connections/:id", async (c) => {
  const id = c.req.param("id");
  await c.env.runMutation(api.mutations.connections.remove, {
    connectionId: id as Id<"connections">
  });
  return c.json({ data: { success: true } });
});

// ============================================================================
// DIMENSION 5: EVENTS (Audit trail - 67+ types)
// ============================================================================

// GET /events - List events with filters
app.get("/events", async (c) => {
  const groupId = c.req.query("groupId");
  const actorId = c.req.query("actor");
  const targetId = c.req.query("target");
  const limit = c.req.query("limit") ? parseInt(c.req.query("limit") as string) : undefined;

  if (!groupId) {
    throw new HTTPException(400, { message: "groupId is required" });
  }

  let events;
  if (actorId) {
    events = await c.env.runQuery(api.queries.events.byActor, {
      groupId: groupId as Id<"groups">,
      actorId: actorId as Id<"entities">,
      limit,
    });
  } else if (targetId) {
    events = await c.env.runQuery(api.queries.events.byTarget, {
      groupId: groupId as Id<"groups">,
      targetId: targetId as Id<"entities">,
      limit,
    });
  } else {
    events = await c.env.runQuery(api.queries.events.list, {
      groupId: groupId as Id<"groups">,
      limit,
    });
  }

  return c.json({ data: events });
});

// GET /events/timeline - Timeline view
app.get("/events/timeline", async (c) => {
  const groupId = c.req.query("groupId");
  const startTime = parseInt(c.req.query("start") || "0");
  const endTime = parseInt(c.req.query("end") || Date.now().toString());
  const limit = c.req.query("limit") ? parseInt(c.req.query("limit") as string) : undefined;

  if (!groupId) {
    throw new HTTPException(400, { message: "groupId is required" });
  }

  const events = await c.env.runQuery(api.queries.events.byTimeRange, {
    groupId: groupId as Id<"groups">,
    startTime,
    endTime,
    limit,
  });

  return c.json({ data: events });
});

// ============================================================================
// DIMENSION 6: KNOWLEDGE (Semantic search, RAG)
// ============================================================================

// GET /knowledge - List knowledge items
app.get("/knowledge", async (c) => {
  const groupId = c.req.query("groupId");
  const limit = c.req.query("limit") ? parseInt(c.req.query("limit") as string) : undefined;

  if (!groupId) {
    throw new HTTPException(400, { message: "groupId is required" });
  }

  const knowledge = await c.env.runQuery(api.queries.knowledge.list, {
    groupId: groupId as Id<"groups">,
    limit,
  });

  return c.json({ data: knowledge });
});

// POST /knowledge/search - Semantic search
app.post("/knowledge/search", async (c) => {
  const body = await c.req.json();
  const { groupId, query, limit } = body;

  if (!groupId || !query) {
    throw new HTTPException(400, {
      message: "groupId and query are required",
    });
  }

  const results = await c.env.runQuery(api.queries.knowledge.search, {
    groupId: groupId as Id<"groups">,
    query,
    limit: limit || 10,
  });

  return c.json({ data: results });
});

// POST /knowledge - Create knowledge item
app.post("/knowledge", async (c) => {
  const body = await c.req.json();
  const { groupId, sourceThingId, content, labels, metadata } = body;

  if (!groupId || !content) {
    throw new HTTPException(400, {
      message: "groupId and content are required",
    });
  }

  const knowledgeId = await c.env.runMutation(api.mutations.knowledge.create, {
    groupId: groupId as Id<"groups">,
    sourceThingId: sourceThingId as Id<"entities"> | undefined,
    content,
    labels,
    metadata,
  });

  return c.json({ data: { _id: knowledgeId } }, 201);
});

// POST /knowledge/bulk - Bulk create knowledge items
app.post("/knowledge/bulk", async (c) => {
  const body = await c.req.json();
  const { groupId, items } = body;

  if (!groupId || !items) {
    throw new HTTPException(400, {
      message: "groupId and items are required",
    });
  }

  const result = await c.env.runMutation(api.mutations.knowledge.bulkCreate, {
    groupId: groupId as Id<"groups">,
    items,
  });

  return c.json({ data: result }, 201);
});

// ============================================================================
// LEGACY: Contact form (ontology-aligned)
// ============================================================================

app.post("/contact", async (c) => {
  const body = await c.req.json();
  const { name, email, subject, message, groupId } = body;

  if (!name || !email || !message) {
    throw new HTTPException(400, {
      message: "name, email, and message are required",
    });
  }

  // If no groupId provided, get default group
  let targetGroupId: Id<"groups">;
  if (groupId) {
    targetGroupId = groupId as Id<"groups">;
  } else {
    const defaultGroup = await c.env.runQuery(api.queries.init.getDefaultGroup, {});
    targetGroupId = defaultGroup._id;
  }

  const result = await c.env.runMutation(api.mutations.contact.submit, {
    groupId: targetGroupId,
    name,
    email,
    subject: subject || "",
    message,
  });

  return c.json({ data: result });
});

app.get("/contact", async (c) => {
  const groupId = c.req.query("groupId");
  const status = c.req.query("status");

  let targetGroupId: Id<"groups">;
  if (groupId) {
    targetGroupId = groupId as Id<"groups">;
  } else {
    const defaultGroup = await c.env.runQuery(api.queries.init.getDefaultGroup, {});
    targetGroupId = defaultGroup._id;
  }

  const contacts = await c.env.runQuery(api.queries.contact.list, {
    groupId: targetGroupId,
    status,
  });

  return c.json({ data: contacts });
});

// ============================================================================
// UTILITY: Health check
// ============================================================================

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: Date.now(),
    ontology: "6-dimensions",
    framework: "Hono + Convex",
  });
});

// ============================================================================
// EXPORT HONO APP WITH CONVEX
// ============================================================================

export default new HttpRouterWithHono(app);
