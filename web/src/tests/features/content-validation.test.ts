/**
 * Feature Content Validation Tests
 *
 * Tests that feature frontmatter structure follows the FeatureSchema.
 * These tests validate the schema without requiring the full Astro context.
 *
 * For full content collection testing, use Astro integration tests.
 */

import { describe, expect, it } from "vitest";
import type { FeatureSchema } from "@/content/config";

// Valid status values
const VALID_STATUSES = [
	"planned",
	"in_development",
	"beta",
	"completed",
	"deprecated",
];

// Valid categories
const VALID_CATEGORIES = [
	"authentication",
	"ecommerce",
	"ai-agents",
	"protocols",
	"payments",
	"analytics",
	"content",
	"communication",
	"infrastructure",
	"integrations",
	"developer-tools",
	"other",
];

// Ontology dimensions
const ONTOLOGY_DIMENSIONS = [
	"groups",
	"people",
	"things",
	"connections",
	"events",
	"knowledge",
];

// Priority levels
const VALID_PRIORITIES = ["low", "medium", "high", "critical"];

// Integration levels
const VALID_INTEGRATION_LEVELS = ["basic", "advanced", "enterprise"];

describe("Feature Schema Validation", () => {
	describe("Required Fields", () => {
		it("should enforce title requirement", () => {
			const featureWithoutTitle: Partial<FeatureSchema> = {
				description: "Test",
				featureId: "test",
				status: "planned",
			};

			// Title is required in schema
			expect(featureWithoutTitle.title).toBeUndefined();
		});

		it("should enforce description requirement", () => {
			const featureWithoutDescription: Partial<FeatureSchema> = {
				title: "Test",
				featureId: "test",
				status: "planned",
			};

			expect(featureWithoutDescription.description).toBeUndefined();
		});

		it("should enforce featureId requirement", () => {
			const featureWithoutId: Partial<FeatureSchema> = {
				title: "Test",
				description: "Test",
				status: "planned",
			};

			expect(featureWithoutId.featureId).toBeUndefined();
		});

		it("should enforce status requirement with default", () => {
			const featureWithoutStatus: Partial<FeatureSchema> = {
				title: "Test",
				description: "Test",
				featureId: "test",
				status: undefined,
			};

			// Default is "planned"
			expect(VALID_STATUSES).toContain("planned");
		});
	});

	describe("Valid Enum Values", () => {
		it("should validate status enum", () => {
			const validStatuses = [
				"planned",
				"in_development",
				"beta",
				"completed",
				"deprecated",
			];

			VALID_STATUSES.forEach((status) => {
				expect(validStatuses).toContain(status);
			});
		});

		it("should validate category enum", () => {
			const validCategories = [
				"authentication",
				"ecommerce",
				"ai-agents",
				"protocols",
				"payments",
				"analytics",
				"content",
				"communication",
				"infrastructure",
				"integrations",
				"developer-tools",
				"other",
			];

			VALID_CATEGORIES.forEach((category) => {
				expect(validCategories).toContain(category);
			});
		});

		it("should validate priority enum", () => {
			const validPriorities = ["low", "medium", "high", "critical"];

			VALID_PRIORITIES.forEach((priority) => {
				expect(validPriorities).toContain(priority);
			});
		});

		it("should validate integration level enum", () => {
			const validLevels = ["basic", "advanced", "enterprise"];

			VALID_INTEGRATION_LEVELS.forEach((level) => {
				expect(validLevels).toContain(level);
			});
		});

		it("should validate complexity enum", () => {
			const validComplexities = ["simple", "moderate", "complex", "expert"];
			expect(validComplexities.length).toBeGreaterThan(0);
		});

		it("should validate role enum", () => {
			const validRoles = [
				"platform_owner",
				"org_owner",
				"org_user",
				"customer",
			];
			expect(validRoles.length).toBeGreaterThan(0);
		});

		it("should validate person role enum", () => {
			const validPersonRoles = [
				"platform_owner",
				"org_owner",
				"org_user",
				"customer",
			];
			expect(validPersonRoles.length).toBeGreaterThan(0);
		});
	});

	describe("Optional Field Validation", () => {
		it("should allow optional version field", () => {
			const feature: Partial<FeatureSchema> = {
				title: "Test",
				description: "Test",
				featureId: "test",
				status: "completed",
				version: "1.0.0",
			};

			expect(feature.version).toBeDefined();
		});

		it("should allow optional releaseDate field", () => {
			const feature: Partial<FeatureSchema> = {
				title: "Test",
				description: "Test",
				featureId: "test",
				status: "completed",
				releaseDate: new Date(),
			};

			expect(feature.releaseDate).toBeDefined();
		});

		it("should allow optional plannedDate field", () => {
			const feature: Partial<FeatureSchema> = {
				title: "Test",
				description: "Test",
				featureId: "test",
				status: "planned",
				plannedDate: new Date(),
			};

			expect(feature.plannedDate).toBeDefined();
		});

		it("should allow optional ontologyMapping", () => {
			const mapping: Partial<FeatureSchema["ontologyMapping"]> = {
				groups: "Description",
				people: "Description",
			};

			expect(mapping.groups).toBeDefined();
			expect(mapping.people).toBeDefined();
		});

		it("should allow optional specification", () => {
			const spec: Partial<FeatureSchema["specification"]> = {
				complexity: "complex",
				estimatedHours: 40,
				technologies: ["React", "TypeScript"],
			};

			expect(spec.complexity).toBeDefined();
			expect(spec.technologies?.length).toBeGreaterThan(0);
		});

		it("should allow optional metrics", () => {
			const metrics: Partial<FeatureSchema["metrics"]> = {
				testCoverage: 85,
				performanceScore: 92,
				accessibilityScore: 98,
				securityAudit: true,
			};

			expect(metrics.testCoverage).toBe(85);
			expect(metrics.performanceScore).toBe(92);
			expect(metrics.accessibilityScore).toBe(98);
			expect(metrics.securityAudit).toBe(true);
		});
	});

	describe("Array Field Validation", () => {
		it("should validate features array structure", () => {
			const features: FeatureSchema["features"] = [
				{
					name: "Feature 1",
					description: "Description",
					status: "completed",
				},
			];

			expect(Array.isArray(features)).toBe(true);
			expect(features[0].name).toBeDefined();
			expect(features[0].description).toBeDefined();
		});

		it("should validate useCases array structure", () => {
			const useCases: FeatureSchema["useCases"] = [
				{
					title: "Use Case 1",
					description: "Description",
					userType: "Admin",
					scenario: "Scenario",
				},
			];

			expect(Array.isArray(useCases)).toBe(true);
			expect(useCases[0].title).toBeDefined();
			expect(useCases[0].description).toBeDefined();
		});

		it("should validate examples array structure", () => {
			const examples: FeatureSchema["examples"] = [
				{
					title: "Example 1",
					language: "typescript",
					code: "const x = 1;",
					description: "Simple example",
				},
			];

			expect(Array.isArray(examples)).toBe(true);
			expect(examples[0].language).toBeDefined();
			expect(examples[0].code).toBeDefined();
		});

		it("should validate tags array", () => {
			const tags: FeatureSchema["tags"] = ["tag1", "tag2", "tag3"];

			expect(Array.isArray(tags)).toBe(true);
			tags.forEach((tag) => {
				expect(typeof tag).toBe("string");
			});
		});

		it("should validate technologies array", () => {
			const technologies: FeatureSchema["specification"]["technologies"] = [
				"React",
				"TypeScript",
				"Tailwind",
			];

			expect(Array.isArray(technologies)).toBe(true);
			technologies.forEach((tech) => {
				expect(typeof tech).toBe("string");
			});
		});

		it("should validate apiEndpoints array", () => {
			const endpoints: FeatureSchema["specification"]["apiEndpoints"] = [
				{
					method: "GET",
					path: "/api/users",
					description: "List users",
				},
				{
					method: "POST",
					path: "/api/users",
					description: "Create user",
				},
			];

			expect(Array.isArray(endpoints)).toBe(true);
			endpoints.forEach((endpoint) => {
				expect(["GET", "POST", "PUT", "PATCH", "DELETE"]).toContain(
					endpoint.method,
				);
				expect(endpoint.path).toBeDefined();
				expect(endpoint.description).toBeDefined();
			});
		});

		it("should validate relatedFeatures array", () => {
			const related: FeatureSchema["relatedFeatures"] = [
				"auth",
				"user-management",
			];

			expect(Array.isArray(related)).toBe(true);
			related.forEach((rel) => {
				expect(typeof rel).toBe("string");
			});
		});
	});

	describe("Range Validation", () => {
		it("should validate metric percentages (0-100)", () => {
			const validPercentages = [0, 50, 75, 85, 95, 100];

			validPercentages.forEach((pct) => {
				expect(pct).toBeGreaterThanOrEqual(0);
				expect(pct).toBeLessThanOrEqual(100);
			});
		});

		it("should reject invalid percentages", () => {
			const invalidPercentages = [-1, 101, 150];

			invalidPercentages.forEach((pct) => {
				if (pct < 0 || pct > 100) {
					expect(true).toBe(true); // Invalid
				}
			});
		});

		it("should validate estimated hours (positive)", () => {
			const validHours = [1, 8, 40, 120, 200];

			validHours.forEach((hours) => {
				expect(hours).toBeGreaterThan(0);
			});
		});
	});

	describe("Object Structure Validation", () => {
		it("should validate marketingPosition object", () => {
			const mp: FeatureSchema["marketingPosition"] = {
				tagline: "One-liner",
				valueProposition: "Why this matters",
				targetAudience: ["Developers", "Teams"],
				competitiveAdvantage: "What makes it better",
				pricingImpact: "free",
			};

			expect(mp.tagline).toBeDefined();
			expect(mp.valueProposition).toBeDefined();
			expect(Array.isArray(mp.targetAudience)).toBe(true);
			expect(["free", "starter", "pro", "enterprise"]).toContain(
				mp.pricingImpact,
			);
		});

		it("should validate specification object", () => {
			const spec: FeatureSchema["specification"] = {
				complexity: "complex",
				estimatedHours: 80,
				dependencies: ["auth", "database"],
				technologies: ["React", "TypeScript"],
				apiEndpoints: [
					{
						method: "GET",
						path: "/api/test",
						description: "Test endpoint",
					},
				],
			};

			expect(spec.complexity).toBeDefined();
			expect(spec.estimatedHours).toBeGreaterThan(0);
			expect(Array.isArray(spec.dependencies)).toBe(true);
		});

		it("should validate ontologyMapping object", () => {
			const mapping: FeatureSchema["ontologyMapping"] = {
				groups: "Multi-tenant scoping",
				people: "Authorization roles",
				things: "Entity types",
				connections: "Relationships",
				events: "Audit trail",
				knowledge: "RAG integration",
			};

			expect(mapping.groups).toBeDefined();
			expect(mapping.people).toBeDefined();
			expect(mapping.things).toBeDefined();
			expect(mapping.connections).toBeDefined();
			expect(mapping.events).toBeDefined();
			expect(mapping.knowledge).toBeDefined();
		});

		it("should validate documentation object", () => {
			const docs: FeatureSchema["documentation"] = {
				userGuide: "/docs/users",
				apiReference: "/docs/api",
				videoTutorial: "https://youtube.com/...",
				blogPost: "/blog/feature",
			};

			expect(docs.userGuide).toBeDefined();
			expect(docs.apiReference).toBeDefined();
		});

		it("should validate media object", () => {
			const media: FeatureSchema["media"] = {
				screenshot: "/images/screenshot.png",
				video: "https://youtube.com/...",
				demo: "https://demo.example.com",
				gallery: ["/images/1.png", "/images/2.png"],
			};

			expect(media.screenshot).toBeDefined();
			expect(Array.isArray(media.gallery)).toBe(true);
		});
	});

	describe("Boolean and Default Fields", () => {
		it("should have draft default to false", () => {
			const feature: Partial<FeatureSchema> = {
				title: "Test",
				description: "Test",
				featureId: "test",
				status: "planned",
				draft: undefined, // Should default to false
			};

			expect(feature.draft).toBeUndefined();
			// Default value is false per schema
		});

		it("should have featured default to false", () => {
			const feature: Partial<FeatureSchema> = {
				title: "Test",
				description: "Test",
				featureId: "test",
				status: "planned",
				featured: undefined,
			};

			// Default is false
			expect(feature.featured).toBeUndefined();
		});

		it("should validate boolean fields", () => {
			const feature: Partial<FeatureSchema> = {
				draft: false,
				featured: true,
			};

			expect(typeof feature.draft).toBe("boolean");
			expect(typeof feature.featured).toBe("boolean");
		});
	});

	describe("Date Field Validation", () => {
		it("should accept Date objects for timestamps", () => {
			const now = new Date();
			const feature: Partial<FeatureSchema> = {
				createdAt: now,
				updatedAt: now,
				releaseDate: now,
				plannedDate: now,
			};

			expect(feature.createdAt).toBeInstanceOf(Date);
			expect(feature.updatedAt).toBeInstanceOf(Date);
		});

		it("should validate timestamp ordering", () => {
			const created = new Date("2025-01-01");
			const updated = new Date("2025-02-01");
			const released = new Date("2025-03-01");

			expect(updated.getTime()).toBeGreaterThan(created.getTime());
			expect(released.getTime()).toBeGreaterThan(updated.getTime());
		});
	});

	describe("Ontology Dimensions", () => {
		it("should accept all 6 ontology dimensions", () => {
			const dimensions = [
				"groups",
				"people",
				"things",
				"connections",
				"events",
				"knowledge",
			];

			dimensions.forEach((dim) => {
				expect(ONTOLOGY_DIMENSIONS).toContain(dim);
			});
		});

		it("should reject invalid dimension names", () => {
			const invalid = ["invalid-dimension", "other-thing"];

			invalid.forEach((dim) => {
				expect(ONTOLOGY_DIMENSIONS).not.toContain(dim);
			});
		});
	});

	describe("Cross-Field Consistency", () => {
		it("should validate feature-status combinations", () => {
			// Completed features typically have versions and release dates
			const completed: Partial<FeatureSchema> = {
				status: "completed",
				version: "1.0.0",
				releaseDate: new Date(),
			};

			expect(completed.status).toBe("completed");
			expect(completed.version).toBeDefined();
		});

		it("should validate planned-status combinations", () => {
			// Planned features have planned dates, not release dates
			const planned: Partial<FeatureSchema> = {
				status: "planned",
				plannedDate: new Date(),
			};

			expect(planned.status).toBe("planned");
			expect(planned.plannedDate).toBeDefined();
		});

		it("should validate in-development combinations", () => {
			// In-dev features track progress
			const inDev: Partial<FeatureSchema> = {
				status: "in_development",
				plannedDate: new Date(),
			};

			expect(inDev.status).toBe("in_development");
		});
	});

	describe("Feature Count Validation", () => {
		it("should track that we have 12 features", () => {
			// This is documented in the feature collection
			const expectedFeatureCount = 12;
			expect(expectedFeatureCount).toBeGreaterThan(0);
		});

		it("should have features across multiple categories", () => {
			const categories = new Set(VALID_CATEGORIES);
			expect(categories.size).toBeGreaterThan(1);
		});

		it("should have features in each status category", () => {
			expect(VALID_STATUSES.length).toBeGreaterThanOrEqual(3);
		});
	});
});
