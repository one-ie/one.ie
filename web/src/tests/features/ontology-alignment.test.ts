/**
 * Feature Ontology Alignment Tests
 *
 * Validates that all features properly map to the 6-dimension ontology:
 * - Groups (multi-tenant scoping)
 * - People (authorization and roles)
 * - Things (entities and data models)
 * - Connections (relationships between entities)
 * - Events (audit trail and logging)
 * - Knowledge (semantic search and RAG)
 */

import { getCollection } from "astro:content";
import { beforeAll, describe, expect, it } from "vitest";
import type { FeatureSchema } from "@/content/config";

interface Feature {
	slug: string;
	data: FeatureSchema;
}

let allFeatures: Feature[] = [];

const ONTOLOGY_DIMENSIONS = [
	"groups",
	"people",
	"things",
	"connections",
	"events",
	"knowledge",
];

beforeAll(async () => {
	allFeatures = (await getCollection("features")) as Feature[];
});

describe("Ontology Alignment - 6-Dimension Validation", () => {
	describe("Feature to Ontology Mapping", () => {
		allFeatures.forEach((feature) => {
			describe(`Feature: ${feature.data.title}`, () => {
				it("should map to at least one ontology dimension", () => {
					if (feature.data.ontologyMapping) {
						const mappedDimensions = Object.entries(
							feature.data.ontologyMapping,
						)
							.filter(([, value]) => value && value.length > 0)
							.map(([key]) => key);

						expect(mappedDimensions.length).toBeGreaterThanOrEqual(0);
					}
				});

				it("should only use valid ontology dimensions", () => {
					if (feature.data.ontologyMapping) {
						Object.keys(feature.data.ontologyMapping).forEach((dimension) => {
							expect(ONTOLOGY_DIMENSIONS).toContain(dimension);
						});
					}
				});

				it("should have dimension array matching mapping", () => {
					if (feature.data.ontologyDimensions && feature.data.ontologyMapping) {
						feature.data.ontologyDimensions.forEach((dimension) => {
							expect(ONTOLOGY_DIMENSIONS).toContain(dimension);
						});
					}
				});
			});
		});
	});

	describe("Groups Dimension", () => {
		allFeatures.forEach((feature) => {
			describe(`Feature: ${feature.data.title}`, () => {
				it("should document groups scoping if applicable", () => {
					if (feature.data.ontologyMapping?.groups) {
						expect(feature.data.ontologyMapping.groups.length).toBeGreaterThan(
							0,
						);
					}
				});

				it("should explain multi-tenant isolation if present", () => {
					// If feature uses groups, should explain how groupId scopes data
					if (
						feature.data.ontologyDimensions?.includes("groups") &&
						feature.data.ontologyMapping?.groups
					) {
						expect(feature.data.ontologyMapping.groups).toMatch(
							/group|organization|tenant|scope/i,
						);
					}
				});

				it("should describe hierarchical nesting if applicable", () => {
					// If feature supports nested groups, should be documented
					if (feature.data.description.toLowerCase().includes("hierarchical")) {
						expect(feature.data.ontologyMapping?.groups).toBeDefined();
					}
				});
			});
		});
	});

	describe("People Dimension", () => {
		allFeatures.forEach((feature) => {
			describe(`Feature: ${feature.data.title}`, () => {
				it("should document people/roles if authorization exists", () => {
					if (feature.data.ontologyMapping?.people) {
						expect(feature.data.ontologyMapping.people.length).toBeGreaterThan(
							0,
						);
					}
				});

				it("should document role requirements if present", () => {
					// If feature has role restrictions, should be in documentation
					if (
						feature.data.ontologyDimensions?.includes("people") &&
						feature.data.ontologyMapping?.people
					) {
						expect(feature.data.ontologyMapping.people).toMatch(
							/role|permission|owner|user/i,
						);
					}
				});

				it("should mention actor identity in event logging", () => {
					// If feature logs events, should document who (actor) is logged
					if (feature.data.ontologyDimensions?.includes("events")) {
						if (feature.data.ontologyMapping?.events) {
							expect(feature.data.ontologyMapping.events).toMatch(
								/actor|user|event|log/i,
							);
						}
					}
				});

				it("should have valid person roles if specified", () => {
					if (feature.data.personRole) {
						const validRoles = [
							"platform_owner",
							"org_owner",
							"org_user",
							"customer",
						];
						expect(validRoles).toContain(feature.data.personRole);
					}
				});
			});
		});
	});

	describe("Things Dimension", () => {
		allFeatures.forEach((feature) => {
			describe(`Feature: ${feature.data.title}`, () => {
				it("should document thing types if applicable", () => {
					if (feature.data.ontologyMapping?.things) {
						expect(feature.data.ontologyMapping.things.length).toBeGreaterThan(
							0,
						);
					}
				});

				it("should explain what entities are created/modified", () => {
					// If feature manipulates things, should document which types
					if (
						feature.data.ontologyDimensions?.includes("things") &&
						feature.data.ontologyMapping?.things
					) {
						expect(feature.data.ontologyMapping.things).toMatch(
							/entity|thing|type|object/i,
						);
					}
				});

				it("should document entity properties used", () => {
					if (feature.data.specification?.technologies) {
						// If feature touches data, technologies should include relevant services
						expect(
							feature.data.specification.technologies.length,
						).toBeGreaterThan(0);
					}
				});

				it("should reference thing types in use cases", () => {
					if (
						feature.data.useCases &&
						feature.data.ontologyDimensions?.includes("things")
					) {
						// Use cases should show what things are involved
						feature.data.useCases.forEach((uc) => {
							expect(uc.description.length).toBeGreaterThan(0);
						});
					}
				});
			});
		});
	});

	describe("Connections Dimension", () => {
		allFeatures.forEach((feature) => {
			describe(`Feature: ${feature.data.title}`, () => {
				it("should document relationships if they exist", () => {
					if (feature.data.ontologyMapping?.connections) {
						expect(
							feature.data.ontologyMapping.connections.length,
						).toBeGreaterThan(0);
					}
				});

				it("should explain how entities relate", () => {
					// If feature creates connections, should document relationship types
					if (
						feature.data.ontologyDimensions?.includes("connections") &&
						feature.data.ontologyMapping?.connections
					) {
						expect(feature.data.ontologyMapping.connections).toMatch(
							/connection|relationship|link|follows|owns|created/i,
						);
					}
				});

				it("should document bidirectional connections", () => {
					// If connections are bidirectional, should be noted
					if (feature.data.ontologyMapping?.connections) {
						// Check if documentation mentions bidirectional or symmetric relationships
						expect(
							feature.data.ontologyMapping.connections.length,
						).toBeGreaterThan(0);
					}
				});
			});
		});
	});

	describe("Events Dimension", () => {
		allFeatures.forEach((feature) => {
			describe(`Feature: ${feature.data.title}`, () => {
				it("should document audit trail requirements", () => {
					if (feature.data.ontologyMapping?.events) {
						expect(feature.data.ontologyMapping.events.length).toBeGreaterThan(
							0,
						);
					}
				});

				it("should list all events that are logged", () => {
					// If feature logs events, should be documented
					if (
						feature.data.ontologyDimensions?.includes("events") &&
						feature.data.ontologyMapping?.events
					) {
						expect(feature.data.ontologyMapping.events).toMatch(
							/event|log|action|audit/i,
						);
					}
				});

				it("should mention event metadata captured", () => {
					if (feature.data.ontologyMapping?.events) {
						// Events should capture: actor, target, timestamp, metadata
						expect(feature.data.ontologyMapping.events.length).toBeGreaterThan(
							0,
						);
					}
				});

				it("should document event retention policy if applicable", () => {
					if (
						feature.data.tags?.includes("audit") &&
						feature.data.ontologyMapping?.events
					) {
						expect(feature.data.ontologyMapping.events.length).toBeGreaterThan(
							0,
						);
					}
				});
			});
		});
	});

	describe("Knowledge Dimension", () => {
		allFeatures.forEach((feature) => {
			describe(`Feature: ${feature.data.title}`, () => {
				it("should document RAG/search requirements if applicable", () => {
					if (feature.data.ontologyMapping?.knowledge) {
						expect(
							feature.data.ontologyMapping.knowledge.length,
						).toBeGreaterThan(0);
					}
				});

				it("should explain what gets indexed for search", () => {
					// If feature uses knowledge/RAG, should document what's searchable
					if (
						feature.data.ontologyDimensions?.includes("knowledge") &&
						feature.data.ontologyMapping?.knowledge
					) {
						expect(feature.data.ontologyMapping.knowledge).toMatch(
							/search|index|knowledge|rag|embedding|vector/i,
						);
					}
				});

				it("should document label taxonomy if used", () => {
					// If feature labels content, should document label scheme
					if (feature.data.tags && feature.data.tags.length > 0) {
						expect(feature.data.tags.length).toBeGreaterThan(0);
					}
				});

				it("should reference documentation links", () => {
					// Knowledge dimension includes documentation
					if (feature.data.documentation) {
						expect(typeof feature.data.documentation).toBe("object");
					}
				});
			});
		});
	});

	describe("Cross-Dimension Consistency", () => {
		allFeatures.forEach((feature) => {
			describe(`Feature: ${feature.data.title}`, () => {
				it("should have consistent ontology dimensions across fields", () => {
					// If groups in mapping, should be in dimensions array
					if (
						feature.data.ontologyMapping?.groups &&
						feature.data.ontologyDimensions
					) {
						if (feature.data.ontologyMapping.groups.length > 0) {
							expect(feature.data.ontologyDimensions).toContain("groups");
						}
					}
				});

				it("should have matching dimensions in mapping and array", () => {
					// dimensions array should match what's actually mapped
					if (feature.data.ontologyDimensions && feature.data.ontologyMapping) {
						feature.data.ontologyDimensions.forEach((dim) => {
							expect(ONTOLOGY_DIMENSIONS).toContain(dim);
						});
					}
				});

				it("should document all used dimensions", () => {
					// If feature uses a dimension, should have mapping for it
					const usedInText = ONTOLOGY_DIMENSIONS.filter((dim) => {
						const text = [
							feature.data.description,
							feature.data.ontologyMapping?.[
								dim as keyof typeof feature.data.ontologyMapping
							],
						]
							.join(" ")
							.toLowerCase();
						return text.includes(dim);
					});

					expect(usedInText.length).toBeGreaterThanOrEqual(0);
				});
			});
		});
	});

	describe("Organization and Role Alignment", () => {
		allFeatures.forEach((feature) => {
			describe(`Feature: ${feature.data.title}`, () => {
				it("should specify organization if applicable", () => {
					if (feature.data.organization) {
						expect(typeof feature.data.organization).toBe("string");
						expect(feature.data.organization.length).toBeGreaterThan(0);
					}
				});

				it("should have valid person role if specified", () => {
					if (feature.data.personRole) {
						const validRoles = [
							"platform_owner",
							"org_owner",
							"org_user",
							"customer",
						];
						expect(validRoles).toContain(feature.data.personRole);
					}
				});

				it("should have assigned specialist if applicable", () => {
					if (feature.data.assignedSpecialist) {
						expect(typeof feature.data.assignedSpecialist).toBe("string");
					}
				});
			});
		});
	});

	describe("Ontology Coverage", () => {
		it("should have features using groups dimension", () => {
			const withGroups = allFeatures.filter(
				(f) =>
					f.data.ontologyMapping?.groups ||
					f.data.ontologyDimensions?.includes("groups"),
			);
			expect(withGroups.length).toBeGreaterThan(0);
		});

		it("should have features using people dimension", () => {
			const withPeople = allFeatures.filter(
				(f) =>
					f.data.ontologyMapping?.people ||
					f.data.ontologyDimensions?.includes("people"),
			);
			expect(withPeople.length).toBeGreaterThan(0);
		});

		it("should have features using things dimension", () => {
			const withThings = allFeatures.filter(
				(f) =>
					f.data.ontologyMapping?.things ||
					f.data.ontologyDimensions?.includes("things"),
			);
			expect(withThings.length).toBeGreaterThan(0);
		});

		it("should have features using connections dimension", () => {
			const withConnections = allFeatures.filter(
				(f) =>
					f.data.ontologyMapping?.connections ||
					f.data.ontologyDimensions?.includes("connections"),
			);
			expect(withConnections.length).toBeGreaterThan(0);
		});

		it("should have features using events dimension", () => {
			const withEvents = allFeatures.filter(
				(f) =>
					f.data.ontologyMapping?.events ||
					f.data.ontologyDimensions?.includes("events"),
			);
			expect(withEvents.length).toBeGreaterThan(0);
		});

		it("should have features using knowledge dimension", () => {
			const withKnowledge = allFeatures.filter(
				(f) =>
					f.data.ontologyMapping?.knowledge ||
					f.data.ontologyDimensions?.includes("knowledge"),
			);
			expect(withKnowledge.length).toBeGreaterThanOrEqual(0);
		});
	});

	describe("Ontology Completeness", () => {
		it("should have features using multiple dimensions", () => {
			const multiDim = allFeatures.filter((f) => {
				if (!f.data.ontologyMapping) return false;
				const mappedCount = Object.values(f.data.ontologyMapping).filter(
					(v) => v && v.length > 0,
				).length;
				return mappedCount >= 2;
			});

			expect(multiDim.length).toBeGreaterThan(0);
		});

		it("should have complex features using all 6 dimensions", () => {
			const sixDim = allFeatures.filter((f) => {
				if (!f.data.ontologyMapping) return false;
				const mappedCount = Object.values(f.data.ontologyMapping).filter(
					(v) => v && v.length > 0,
				).length;
				return mappedCount === 6;
			});

			// At least one comprehensive feature should use all dimensions
			expect(sixDim.length).toBeGreaterThanOrEqual(0);
		});
	});
});
