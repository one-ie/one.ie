import { Context, Effect, Layer } from "effect";
import type {
  CreateGroupInput,
  DataProviderError,
  Group,
  GroupCreateError,
  GroupNotFoundError,
  GroupStatus,
  GroupType,
  ListGroupsOptions,
  QueryError,
  UpdateGroupInput,
} from "@/providers/DataProvider";
import { DataProviderService } from "@/providers/DataProvider";

export class GroupService extends Context.Tag("GroupService")<
  GroupService,
  {
    readonly get: (id: string) => Effect.Effect<Group, GroupNotFoundError>;
    readonly getBySlug: (slug: string) => Effect.Effect<Group, GroupNotFoundError>;
    readonly list: (options?: ListGroupsOptions) => Effect.Effect<Group[], QueryError>;
    readonly create: (input: CreateGroupInput) => Effect.Effect<string, GroupCreateError>;
    readonly update: (
      id: string,
      input: UpdateGroupInput
    ) => Effect.Effect<void, DataProviderError>;
    readonly delete: (id: string) => Effect.Effect<void, GroupNotFoundError>;
  }
>() {
  // ============================================================================
  // BASIC OPERATIONS
  // ============================================================================

  static get(id: string): Effect.Effect<Group, GroupNotFoundError, GroupService> {
    return Effect.flatMap(GroupService, (service) => service.get(id));
  }

  static getBySlug(slug: string): Effect.Effect<Group, GroupNotFoundError, GroupService> {
    return Effect.flatMap(GroupService, (service) => service.getBySlug(slug));
  }

  static list(options?: ListGroupsOptions): Effect.Effect<Group[], QueryError, GroupService> {
    return Effect.flatMap(GroupService, (service) => service.list(options));
  }

  static create(input: CreateGroupInput): Effect.Effect<string, GroupCreateError, GroupService> {
    return Effect.flatMap(GroupService, (service) => service.create(input));
  }

  static update(
    id: string,
    input: UpdateGroupInput
  ): Effect.Effect<void, DataProviderError, GroupService> {
    return Effect.flatMap(GroupService, (service) => service.update(id, input));
  }

  static delete(id: string): Effect.Effect<void, GroupNotFoundError, GroupService> {
    return Effect.flatMap(GroupService, (service) => service.delete(id));
  }

  // ============================================================================
  // HIERARCHICAL OPERATIONS
  // ============================================================================

  static getChildren(parentGroupId: string): Effect.Effect<Group[], QueryError, GroupService> {
    return GroupService.list({ parentGroupId });
  }

  static getHierarchy(
    parentGroupId: string
  ): Effect.Effect<(Group & { children: Group[] })[], QueryError, GroupService> {
    // Note: This is a client-side operation. In production, this should be
    // implemented as a server-side query for efficiency
    return Effect.gen(function* () {
      const children = yield* GroupService.getChildren(parentGroupId);
      const hierarchy: (Group & { children: Group[] })[] = [];

      for (const child of children) {
        const subChildren = yield* GroupService.getChildren(child._id);
        hierarchy.push({ ...child, children: subChildren });
      }

      return hierarchy;
    });
  }

  // ============================================================================
  // FILTERING & SEARCH OPERATIONS
  // ============================================================================

  static filterByType(type: GroupType): Effect.Effect<Group[], QueryError, GroupService> {
    return GroupService.list({ type });
  }

  static filterByStatus(status: GroupStatus): Effect.Effect<Group[], QueryError, GroupService> {
    return GroupService.list({ status });
  }

  static listWithPagination(
    limit: number,
    offset: number,
    options?: Omit<ListGroupsOptions, "limit" | "offset">
  ): Effect.Effect<Group[], QueryError, GroupService> {
    return GroupService.list({ ...options, limit, offset });
  }

  // ============================================================================
  // UTILITY OPERATIONS
  // ============================================================================

  static countGroups(): Effect.Effect<number, QueryError, GroupService> {
    return Effect.map(GroupService.list(), (groups) => groups.length);
  }

  static countByType(type: GroupType): Effect.Effect<number, QueryError, GroupService> {
    return Effect.map(GroupService.filterByType(type), (groups) => groups.length);
  }

  static findByName(name: string): Effect.Effect<Group | null, QueryError, GroupService> {
    return Effect.map(
      GroupService.list(),
      (groups) => groups.find((g) => g.name.toLowerCase().includes(name.toLowerCase())) || null
    );
  }
}

export const GroupServiceLive = Layer.effect(
  GroupService,
  Effect.gen(function* () {
    const provider = yield* DataProviderService;
    return {
      get: (id) => provider.groups.get(id),
      getBySlug: (slug) => provider.groups.getBySlug(slug),
      list: (options) => provider.groups.list(options),
      create: (input) => provider.groups.create(input),
      update: (id, input) => provider.groups.update(id, input),
      delete: (id) => provider.groups.delete(id),
    };
  })
);
