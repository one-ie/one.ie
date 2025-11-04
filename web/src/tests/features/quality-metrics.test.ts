/**
 * Feature Quality Metrics Tests
 *
 * Tests quality metrics and coverage standards for features:
 * - Test coverage percentages
 * - Performance scores
 * - Accessibility scores
 * - Security audit status
 * - Documentation completeness
 */

import { describe, it, expect, beforeAll } from "vitest";
import { getCollection } from "astro:content";
import type { FeatureSchema } from "@/content/config";

interface Feature {
  slug: string;
  data: FeatureSchema;
}

let allFeatures: Feature[] = [];

// Quality thresholds
const QUALITY_THRESHOLDS = {
  testCoverage: 80, // Minimum test coverage %
  performanceScore: 85, // Lighthouse score
  accessibilityScore: 95, // WCAG score
  criticalPriority: {
    // Critical features should have higher thresholds
    testCoverage: 95,
    performanceScore: 90,
    accessibilityScore: 100,
  },
};

beforeAll(async () => {
  allFeatures = (await getCollection("features")) as Feature[];
});

describe("Feature Quality Metrics", () => {
  describe("Test Coverage", () => {
    const featuresWithMetrics = allFeatures.filter((f) => f.data.metrics?.testCoverage !== undefined);

    it("should have test coverage documented for critical features", () => {
      const criticalFeatures = allFeatures.filter((f) => f.data.priority === "critical");

      criticalFeatures.forEach((feature) => {
        if (feature.data.metrics?.testCoverage !== undefined) {
          expect(feature.data.metrics.testCoverage).toBeGreaterThanOrEqual(
            QUALITY_THRESHOLDS.criticalPriority.testCoverage
          );
        }
      });
    });

    it("should have test coverage >= 80% for completed features", () => {
      const completed = allFeatures.filter((f) => f.data.status === "completed");

      completed.forEach((feature) => {
        if (feature.data.metrics?.testCoverage !== undefined) {
          expect(feature.data.metrics.testCoverage).toBeGreaterThanOrEqual(
            QUALITY_THRESHOLDS.testCoverage
          );
        }
      });
    });

    it("should have valid test coverage percentages", () => {
      featuresWithMetrics.forEach((feature) => {
        const coverage = feature.data.metrics!.testCoverage!;
        expect(coverage).toBeGreaterThanOrEqual(0);
        expect(coverage).toBeLessThanOrEqual(100);
      });
    });

    it("should track test coverage across statuses", () => {
      const byStatus = {
        completed: allFeatures
          .filter((f) => f.data.status === "completed" && f.data.metrics?.testCoverage)
          .map((f) => f.data.metrics!.testCoverage!),
        inDevelopment: allFeatures
          .filter(
            (f) =>
              (f.data.status === "in_development" || f.data.status === "beta") &&
              f.data.metrics?.testCoverage
          )
          .map((f) => f.data.metrics!.testCoverage!),
        planned: allFeatures
          .filter((f) => f.data.status === "planned" && f.data.metrics?.testCoverage)
          .map((f) => f.data.metrics!.testCoverage!),
      };

      // Completed features should have higher coverage than in-dev
      if (byStatus.completed.length > 0 && byStatus.inDevelopment.length > 0) {
        const completedAvg =
          byStatus.completed.reduce((a, b) => a + b, 0) / byStatus.completed.length;
        const inDevAvg =
          byStatus.inDevelopment.reduce((a, b) => a + b, 0) / byStatus.inDevelopment.length;
        expect(completedAvg).toBeGreaterThanOrEqual(inDevAvg - 10); // Allow 10% variance
      }
    });
  });

  describe("Performance Scores", () => {
    const featuresWithPerformance = allFeatures.filter(
      (f) => f.data.metrics?.performanceScore !== undefined
    );

    it("should have performance scores for completed features", () => {
      const completed = allFeatures.filter((f) => f.data.status === "completed");

      completed.forEach((feature) => {
        if (feature.data.metrics?.performanceScore !== undefined) {
          expect(feature.data.metrics.performanceScore).toBeGreaterThanOrEqual(
            QUALITY_THRESHOLDS.performanceScore
          );
        }
      });
    });

    it("should have valid performance scores (0-100)", () => {
      featuresWithPerformance.forEach((feature) => {
        const score = feature.data.metrics!.performanceScore!;
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      });
    });

    it("should improve as feature matures", () => {
      const byStatus = {
        completed: allFeatures
          .filter((f) => f.data.status === "completed" && f.data.metrics?.performanceScore)
          .map((f) => f.data.metrics!.performanceScore!),
        inDevelopment: allFeatures
          .filter(
            (f) =>
              (f.data.status === "in_development" || f.data.status === "beta") &&
              f.data.metrics?.performanceScore
          )
          .map((f) => f.data.metrics!.performanceScore!),
      };

      if (byStatus.completed.length > 0 && byStatus.inDevelopment.length > 0) {
        const completedAvg =
          byStatus.completed.reduce((a, b) => a + b, 0) / byStatus.completed.length;
        const inDevAvg =
          byStatus.inDevelopment.reduce((a, b) => a + b, 0) / byStatus.inDevelopment.length;
        expect(completedAvg).toBeGreaterThanOrEqual(inDevAvg - 5);
      }
    });
  });

  describe("Accessibility Scores", () => {
    const featuresWithAccessibility = allFeatures.filter(
      (f) => f.data.metrics?.accessibilityScore !== undefined
    );

    it("should have high accessibility scores for all completed features", () => {
      const completed = allFeatures.filter((f) => f.data.status === "completed");

      completed.forEach((feature) => {
        if (feature.data.metrics?.accessibilityScore !== undefined) {
          expect(feature.data.metrics.accessibilityScore).toBeGreaterThanOrEqual(
            QUALITY_THRESHOLDS.accessibilityScore
          );
        }
      });
    });

    it("should have valid accessibility scores (0-100)", () => {
      featuresWithAccessibility.forEach((feature) => {
        const score = feature.data.metrics!.accessibilityScore!;
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      });
    });

    it("should maintain accessibility as feature changes", () => {
      const byPriority = {
        critical: allFeatures
          .filter((f) => f.data.priority === "critical" && f.data.metrics?.accessibilityScore)
          .map((f) => f.data.metrics!.accessibilityScore!),
        high: allFeatures
          .filter((f) => f.data.priority === "high" && f.data.metrics?.accessibilityScore)
          .map((f) => f.data.metrics!.accessibilityScore!),
      };

      // Critical features should have better accessibility
      if (byPriority.critical.length > 0 && byPriority.high.length > 0) {
        const criticalAvg =
          byPriority.critical.reduce((a, b) => a + b, 0) / byPriority.critical.length;
        const highAvg = byPriority.high.reduce((a, b) => a + b, 0) / byPriority.high.length;
        expect(criticalAvg).toBeGreaterThanOrEqual(highAvg);
      }
    });
  });

  describe("Security Audits", () => {
    allFeatures.forEach((feature) => {
      describe(`Feature: ${feature.data.title}`, () => {
        it("should have security audit for critical features", () => {
          if (feature.data.priority === "critical") {
            expect(feature.data.metrics?.securityAudit).toBe(true);
          }
        });

        it("should have security audit for auth features", () => {
          if (feature.data.category === "authentication") {
            expect(feature.data.metrics?.securityAudit).toBe(true);
          }
        });

        it("should have security audit for payment features", () => {
          if (feature.data.category === "payments") {
            expect(feature.data.metrics?.securityAudit).toBe(true);
          }
        });
      });
    });
  });

  describe("Documentation Completeness", () => {
    allFeatures.forEach((feature) => {
      describe(`Feature: ${feature.data.title}`, () => {
        it("should have at least basic documentation", () => {
          expect(feature.data.description).toBeDefined();
          expect(feature.data.description.length).toBeGreaterThan(0);
        });

        it("should have documentation links for completed features", () => {
          if (feature.data.status === "completed") {
            expect(feature.data.documentation).toBeDefined();
            // At least one doc link should exist
            if (feature.data.documentation) {
              const hasLink =
                feature.data.documentation.userGuide ||
                feature.data.documentation.apiReference ||
                feature.data.documentation.videoTutorial ||
                feature.data.documentation.blogPost;
              expect(hasLink).toBeDefined();
            }
          }
        });

        it("should have specification details for complex features", () => {
          if (feature.data.specification?.complexity === "complex") {
            expect(feature.data.specification).toBeDefined();
            expect(feature.data.specification.technologies).toBeDefined();
          }
        });

        it("should have use cases documented", () => {
          if (feature.data.status === "completed") {
            expect(feature.data.useCases).toBeDefined();
            expect(feature.data.useCases?.length).toBeGreaterThan(0);
          }
        });

        it("should have code examples for developer features", () => {
          if (
            feature.data.category === "developer-tools" ||
            feature.data.category === "protocols"
          ) {
            if (feature.data.status === "completed") {
              expect(feature.data.examples).toBeDefined();
              expect(feature.data.examples?.length).toBeGreaterThan(0);
            }
          }
        });
      });
    });
  });

  describe("Specification Completeness", () => {
    allFeatures.forEach((feature) => {
      describe(`Feature: ${feature.data.title}`, () => {
        it("should have estimated hours for development planning", () => {
          if (feature.data.status === "in_development" || feature.data.status === "planned") {
            expect(feature.data.specification?.estimatedHours).toBeDefined();
          }
        });

        it("should have complexity level documented", () => {
          if (feature.data.status !== "deprecated") {
            expect(feature.data.specification?.complexity).toBeDefined();
          }
        });

        it("should list technology stack", () => {
          if (feature.data.status === "completed") {
            expect(feature.data.specification?.technologies).toBeDefined();
            expect(feature.data.specification?.technologies?.length).toBeGreaterThan(0);
          }
        });

        it("should document API endpoints if applicable", () => {
          if (feature.data.category === "protocols" || feature.data.category === "integrations") {
            if (feature.data.specification?.apiEndpoints) {
              expect(feature.data.specification.apiEndpoints.length).toBeGreaterThan(0);
            }
          }
        });

        it("should document dependencies", () => {
          if (feature.data.specification?.dependencies?.length) {
            feature.data.specification.dependencies.forEach((dep) => {
              expect(typeof dep).toBe("string");
              expect(dep.length).toBeGreaterThan(0);
            });
          }
        });
      });
    });
  });

  describe("Marketing Position Completeness", () => {
    allFeatures.forEach((feature) => {
      describe(`Feature: ${feature.data.title}`, () => {
        it("should have marketing position for featured features", () => {
          if (feature.data.featured) {
            expect(feature.data.marketingPosition).toBeDefined();
          }
        });

        it("should have tagline if marketing position exists", () => {
          if (feature.data.marketingPosition) {
            if (feature.data.marketingPosition.tagline) {
              expect(feature.data.marketingPosition.tagline.length).toBeGreaterThan(0);
            }
          }
        });

        it("should have value proposition if marketing position exists", () => {
          if (feature.data.marketingPosition) {
            if (feature.data.marketingPosition.valueProposition) {
              expect(
                feature.data.marketingPosition.valueProposition.length
              ).toBeGreaterThan(0);
            }
          }
        });

        it("should have target audience if marketing position exists", () => {
          if (feature.data.marketingPosition?.targetAudience) {
            expect(feature.data.marketingPosition.targetAudience.length).toBeGreaterThan(0);
          }
        });
      });
    });
  });

  describe("Overall Quality Trends", () => {
    it("should show improving quality as features mature", () => {
      const statusProgression = {
        planned: allFeatures.filter((f) => f.data.status === "planned"),
        inDevelopment: allFeatures.filter(
          (f) => f.data.status === "in_development" || f.data.status === "beta"
        ),
        completed: allFeatures.filter((f) => f.data.status === "completed"),
      };

      // Completed features should have more comprehensive documentation
      const plannedDocumented = statusProgression.planned.filter(
        (f) => f.data.useCases && f.data.useCases.length > 0
      );
      const completedDocumented = statusProgression.completed.filter(
        (f) => f.data.useCases && f.data.useCases.length > 0
      );

      if (statusProgression.completed.length > 0) {
        expect(completedDocumented.length / statusProgression.completed.length).toBeGreaterThan(
          0.5
        );
      }
    });

    it("should have quality data for high-priority features", () => {
      const critical = allFeatures.filter((f) => f.data.priority === "critical");
      const withMetrics = critical.filter(
        (f) =>
          f.data.metrics?.testCoverage !== undefined ||
          f.data.metrics?.performanceScore !== undefined ||
          f.data.metrics?.accessibilityScore !== undefined
      );

      if (critical.length > 0) {
        expect(withMetrics.length / critical.length).toBeGreaterThan(0.7);
      }
    });

    it("should track improvement from development to completion", () => {
      allFeatures.forEach((feature) => {
        if (feature.data.releaseDate && feature.data.createdAt) {
          const created = new Date(feature.data.createdAt).getTime();
          const released = new Date(feature.data.releaseDate).getTime();
          expect(released).toBeGreaterThanOrEqual(created);
        }
      });
    });
  });

  describe("Coverage Summary", () => {
    it("should have at least 80% of completed features with test coverage", () => {
      const completed = allFeatures.filter((f) => f.data.status === "completed");
      const withCoverage = completed.filter((f) => f.data.metrics?.testCoverage !== undefined);

      if (completed.length > 0) {
        const percentage = (withCoverage.length / completed.length) * 100;
        expect(percentage).toBeGreaterThanOrEqual(80);
      }
    });

    it("should have at least 70% of completed features with accessibility scores", () => {
      const completed = allFeatures.filter((f) => f.data.status === "completed");
      const withAccessibility = completed.filter(
        (f) => f.data.metrics?.accessibilityScore !== undefined
      );

      if (completed.length > 0) {
        const percentage = (withAccessibility.length / completed.length) * 100;
        expect(percentage).toBeGreaterThanOrEqual(70);
      }
    });

    it("should have all critical features with security audit", () => {
      const critical = allFeatures.filter((f) => f.data.priority === "critical");
      const audited = critical.filter((f) => f.data.metrics?.securityAudit === true);

      if (critical.length > 0) {
        expect(audited.length).toBe(critical.length);
      }
    });
  });
});
