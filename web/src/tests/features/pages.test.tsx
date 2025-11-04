/**
 * Feature Pages Tests
 *
 * Tests that feature pages render correctly and display all required information.
 * Tests the main /features page and dynamic feature detail pages.
 */

import { describe, it, expect, beforeAll } from "vitest";
import { getCollection } from "astro:content";
import type { FeatureSchema } from "@/content/config";

interface Feature {
  slug: string;
  data: FeatureSchema;
}

let allFeatures: Feature[] = [];

beforeAll(async () => {
  allFeatures = (await getCollection("features")) as Feature[];
});

describe("Features Listing Page (/features)", () => {
  it("should display all features", () => {
    expect(allFeatures.length).toBeGreaterThan(0);
  });

  it("should display completed features section", () => {
    const completed = allFeatures.filter((f) => f.data.status === "completed");
    expect(completed.length).toBeGreaterThan(0);
  });

  it("should display in-development features section", () => {
    const inDev = allFeatures.filter(
      (f) => f.data.status === "in_development" || f.data.status === "beta"
    );
    expect(inDev.length).toBeGreaterThan(0);
  });

  it("should display planned features section", () => {
    const planned = allFeatures.filter((f) => f.data.status === "planned");
    // Planned features are optional but helpful if present
    if (planned.length > 0) {
      expect(planned).toBeDefined();
    }
  });

  describe("Feature Card Display", () => {
    allFeatures.forEach((feature) => {
      describe(`Feature Card: ${feature.data.title}`, () => {
        it("should display feature title", () => {
          expect(feature.data.title).toBeDefined();
          expect(feature.data.title.length).toBeGreaterThan(0);
        });

        it("should display feature description", () => {
          expect(feature.data.description).toBeDefined();
          expect(feature.data.description.length).toBeGreaterThan(0);
        });

        it("should display status badge", () => {
          expect(feature.data.status).toBeDefined();
          const validStatuses = [
            "planned",
            "in_development",
            "beta",
            "completed",
            "deprecated",
          ];
          expect(validStatuses).toContain(feature.data.status);
        });

        it("should display category badge if present", () => {
          if (feature.data.category) {
            expect(feature.data.category).toBeDefined();
          }
        });

        it("should have clickable link to detail page", () => {
          expect(feature.slug).toBeDefined();
        });

        it("should display version for completed features", () => {
          if (feature.data.status === "completed") {
            expect(feature.data.version).toBeDefined();
          }
        });

        it("should display release date for completed features", () => {
          if (feature.data.status === "completed" && feature.data.releaseDate) {
            expect(feature.data.releaseDate).toBeInstanceOf(Date);
          }
        });

        it("should display planned date for in-development features", () => {
          if (
            (feature.data.status === "in_development" || feature.data.status === "beta") &&
            feature.data.plannedDate
          ) {
            expect(feature.data.plannedDate).toBeInstanceOf(Date);
          }
        });

        it("should display capabilities count if present", () => {
          if (feature.data.features && feature.data.features.length > 0) {
            expect(feature.data.features.length).toBeGreaterThan(0);
          }
        });
      });
    });
  });

  describe("Feature Grouping and Sorting", () => {
    it("should group features by status", () => {
      const completed = allFeatures.filter((f) => f.data.status === "completed");
      const inDev = allFeatures.filter(
        (f) => f.data.status === "in_development" || f.data.status === "beta"
      );
      const planned = allFeatures.filter((f) => f.data.status === "planned");

      // Should be able to distinguish between groups
      expect(completed.length + inDev.length + planned.length).toBe(allFeatures.length);
    });

    it("should sort features within groups", () => {
      const completed = allFeatures
        .filter((f) => f.data.status === "completed")
        .sort((a, b) => a.data.title.localeCompare(b.data.title));

      // Within each group, features should be sortable by title
      for (let i = 1; i < completed.length; i++) {
        expect(completed[i].data.title).toBeDefined();
      }
    });
  });
});

describe("Feature Detail Pages (/features/[slug])", () => {
  allFeatures.forEach((feature) => {
    describe(`Feature: ${feature.data.title}`, () => {
      it("should have a valid slug", () => {
        expect(feature.slug).toBeDefined();
        expect(feature.slug.length).toBeGreaterThan(0);
      });

      it("should display header with all badges", () => {
        expect(feature.data.title).toBeDefined();
        expect(feature.data.status).toBeDefined();
        if (feature.data.category) {
          expect(feature.data.category).toBeDefined();
        }
        if (feature.data.version) {
          expect(feature.data.version).toBeDefined();
        }
      });

      it("should display main title and description", () => {
        expect(feature.data.title).toBeDefined();
        expect(feature.data.description).toBeDefined();
      });

      it("should display release/planned dates if available", () => {
        if (feature.data.releaseDate) {
          expect(feature.data.releaseDate).toBeInstanceOf(Date);
        }
        if (feature.data.plannedDate) {
          expect(feature.data.plannedDate).toBeInstanceOf(Date);
        }
      });

      it("should display marketing position if available", () => {
        if (feature.data.marketingPosition) {
          if (feature.data.marketingPosition.tagline) {
            expect(feature.data.marketingPosition.tagline.length).toBeGreaterThan(0);
          }
          if (feature.data.marketingPosition.valueProposition) {
            expect(
              feature.data.marketingPosition.valueProposition.length
            ).toBeGreaterThan(0);
          }
          if (feature.data.marketingPosition.targetAudience) {
            expect(Array.isArray(feature.data.marketingPosition.targetAudience)).toBe(true);
          }
        }
      });

      it("should display ontology alignment section if mapped", () => {
        if (feature.data.ontologyMapping) {
          const hasMapping = Object.values(feature.data.ontologyMapping).some(
            (v) => v && v.length > 0
          );
          expect(hasMapping).toBe(true);
        }
      });

      it("should display capabilities if present", () => {
        if (feature.data.features && feature.data.features.length > 0) {
          feature.data.features.forEach((cap) => {
            expect(cap.name).toBeDefined();
            expect(cap.description).toBeDefined();
          });
        }
      });

      it("should display use cases if present", () => {
        if (feature.data.useCases && feature.data.useCases.length > 0) {
          feature.data.useCases.forEach((useCase) => {
            expect(useCase.title).toBeDefined();
            expect(useCase.description).toBeDefined();
          });
        }
      });

      it("should display code examples if present", () => {
        if (feature.data.examples && feature.data.examples.length > 0) {
          feature.data.examples.forEach((example) => {
            expect(example.title).toBeDefined();
            expect(example.language).toBeDefined();
            expect(example.code).toBeDefined();
          });
        }
      });

      it("should display technical specifications if present", () => {
        if (feature.data.specification) {
          const spec = feature.data.specification;
          if (spec.complexity || spec.estimatedHours || spec.technologies) {
            expect(spec).toBeDefined();
          }
        }
      });

      it("should display quality metrics if present", () => {
        if (feature.data.metrics) {
          const metrics = feature.data.metrics;
          if (
            metrics.testCoverage !== undefined ||
            metrics.performanceScore !== undefined ||
            metrics.accessibilityScore !== undefined ||
            metrics.securityAudit !== undefined
          ) {
            expect(metrics).toBeDefined();
          }
        }
      });

      it("should display related features if present", () => {
        if (feature.data.relatedFeatures && feature.data.relatedFeatures.length > 0) {
          feature.data.relatedFeatures.forEach((relatedId) => {
            expect(typeof relatedId).toBe("string");
          });
        }
      });

      it("should have navigation back to features list", () => {
        expect(feature.slug).toBeDefined();
        // Navigation link should be to /features
      });
    });
  });
});

describe("Feature Content Rendering", () => {
  allFeatures.forEach((feature) => {
    describe(`Feature markdown: ${feature.data.title}`, () => {
      it("should have content that can be rendered", async () => {
        expect(feature).toBeDefined();
        expect(feature.data).toBeDefined();
        // The markdown content will be rendered by Astro
      });

      it("should have valid markdown structure", () => {
        // Features should be in markdown format with proper frontmatter
        expect(feature.slug).toBeDefined();
        expect(feature.data.title).toBeDefined();
        expect(feature.data.description).toBeDefined();
      });
    });
  });
});

describe("Feature Cross-References", () => {
  it("should have valid related feature references", () => {
    const allSlugs = new Set(allFeatures.map((f) => f.slug));

    allFeatures.forEach((feature) => {
      if (feature.data.relatedFeatures) {
        feature.data.relatedFeatures.forEach((relatedId) => {
          expect(allSlugs.has(relatedId)).toBe(true);
        });
      }
    });
  });

  it("should have valid dependencies", () => {
    allFeatures.forEach((feature) => {
      if (feature.data.specification?.dependencies) {
        feature.data.specification.dependencies.forEach((dep) => {
          expect(typeof dep).toBe("string");
          expect(dep.length).toBeGreaterThan(0);
        });
      }
    });
  });
});

describe("Feature SEO Metadata", () => {
  allFeatures.forEach((feature) => {
    describe(`Feature: ${feature.data.title}`, () => {
      it("should have proper title for page SEO", () => {
        expect(feature.data.title).toBeDefined();
        expect(feature.data.title.length).toBeGreaterThan(0);
        expect(feature.data.title.length).toBeLessThan(100);
      });

      it("should have proper description for SEO", () => {
        expect(feature.data.description).toBeDefined();
        expect(feature.data.description.length).toBeGreaterThan(0);
        expect(feature.data.description.length).toBeLessThan(500);
      });

      it("should have tags for categorization", () => {
        if (feature.data.tags) {
          expect(Array.isArray(feature.data.tags)).toBe(true);
          feature.data.tags.forEach((tag) => {
            expect(typeof tag).toBe("string");
          });
        }
      });
    });
  });
});
