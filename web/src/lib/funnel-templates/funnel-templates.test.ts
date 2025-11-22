/**
 * Funnel Templates Library Tests
 */

import { describe, test, expect } from 'bun:test';
import {
  // Templates
  FUNNEL_TEMPLATES,
  TEMPLATES_BY_CATEGORY,
  TEMPLATES_BY_COMPLEXITY,

  // Suggestions
  detectIntent,
  suggestTemplates,
  suggestFromInput,
  getAIRecommendation,

  // Queries
  getTemplateById,
  getTemplatesByCategory,
  getTemplatesByComplexity,
  searchTemplates,
  getBeginnerTemplates,
  getQuickTemplates,
  getHighConvertingTemplates,

  // Comparisons
  compareTemplates,
} from './index';

describe('Funnel Templates', () => {
  test('FUNNEL_TEMPLATES contains 7 templates', () => {
    expect(FUNNEL_TEMPLATES).toHaveLength(7);
  });

  test('all templates have required fields', () => {
    FUNNEL_TEMPLATES.forEach((template) => {
      expect(template.id).toBeDefined();
      expect(template.name).toBeDefined();
      expect(template.description).toBeDefined();
      expect(template.category).toBeDefined();
      expect(template.steps).toBeInstanceOf(Array);
      expect(template.steps.length).toBeGreaterThan(0);
      expect(template.conversionRate).toBeGreaterThan(0);
      expect(template.complexity).toBeDefined();
    });
  });

  test('all templates have valid steps', () => {
    FUNNEL_TEMPLATES.forEach((template) => {
      template.steps.forEach((step) => {
        expect(step.id).toBeDefined();
        expect(step.name).toBeDefined();
        expect(step.type).toBeDefined();
        expect(step.elements).toBeInstanceOf(Array);
        expect(step.bestPractices).toBeInstanceOf(Array);
      });
    });
  });

  test('all steps have valid elements', () => {
    FUNNEL_TEMPLATES.forEach((template) => {
      template.steps.forEach((step) => {
        step.elements.forEach((element) => {
          expect(element.type).toBeDefined();
          expect(element.position).toBeGreaterThan(0);
          // Either content or placeholder should be present for most elements
        });
      });
    });
  });
});

describe('Template Queries', () => {
  test('getTemplateById returns correct template', () => {
    const template = getTemplateById('lead-magnet-basic');
    expect(template).toBeDefined();
    expect(template?.id).toBe('lead-magnet-basic');
    expect(template?.name).toBe('Simple Lead Magnet Funnel');
  });

  test('getTemplateById returns undefined for invalid id', () => {
    const template = getTemplateById('non-existent-template');
    expect(template).toBeUndefined();
  });

  test('getTemplatesByCategory returns correct templates', () => {
    const leadGenTemplates = getTemplatesByCategory('lead-gen');
    expect(leadGenTemplates.length).toBeGreaterThan(0);
    leadGenTemplates.forEach((t) => {
      expect(t.category).toBe('lead-gen');
    });
  });

  test('getTemplatesByComplexity returns correct templates', () => {
    const simpleTemplates = getTemplatesByComplexity('simple');
    simpleTemplates.forEach((t) => {
      expect(t.complexity).toBe('simple');
    });

    const mediumTemplates = getTemplatesByComplexity('medium');
    expect(mediumTemplates.length).toBeGreaterThan(0);
  });

  test('searchTemplates finds templates by name', () => {
    const results = searchTemplates('webinar');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toContain('Webinar');
  });

  test('searchTemplates finds templates by tag', () => {
    const results = searchTemplates('high-ticket');
    expect(results.length).toBeGreaterThan(0);
  });

  test('getBeginnerTemplates returns appropriate templates', () => {
    const templates = getBeginnerTemplates();
    expect(templates.length).toBeGreaterThan(0);
    templates.forEach((t) => {
      expect(['simple', 'medium']).toContain(t.complexity);
    });
  });

  test('getQuickTemplates returns templates under 45 minutes', () => {
    const templates = getQuickTemplates();
    templates.forEach((t) => {
      const minutes = parseInt(t.estimatedSetupTime);
      expect(minutes).toBeLessThanOrEqual(45);
    });
  });

  test('getHighConvertingTemplates returns templates with > 35% conversion', () => {
    const templates = getHighConvertingTemplates();
    templates.forEach((t) => {
      expect(t.conversionRate).toBeGreaterThanOrEqual(35);
    });
  });
});

describe('Intent Detection', () => {
  test('detects email list building intent', () => {
    const intent = detectIntent('I want to build my email list');
    expect(intent.goal).toBe('build-email-list');
    expect(intent.keywords).toContain('email-list');
  });

  test('detects quiz intent', () => {
    const intent = detectIntent('I want to create a quiz for my audience');
    expect(intent.goal).toBe('interactive-lead-gen');
    expect(intent.keywords).toContain('quiz');
  });

  test('detects webinar intent', () => {
    const intent = detectIntent('I am hosting a webinar to sell my course');
    expect(intent.goal).toBe('webinar');
    expect(intent.keywords).toContain('webinar');
  });

  test('detects product launch intent', () => {
    const intent = detectIntent('I am launching a new product next month');
    expect(intent.goal).toBe('product-launch');
    expect(intent.keywords).toContain('launch');
  });

  test('detects price point - high ticket', () => {
    const intent = detectIntent('I want to sell my $997 high ticket course');
    expect(intent.pricePoint).toBe('high');
  });

  test('detects price point - low price', () => {
    const intent = detectIntent('I need a cheap tripwire funnel');
    expect(intent.pricePoint).toBe('low');
  });

  test('detects experience level - beginner', () => {
    const intent = detectIntent('I am a beginner and need something simple');
    expect(intent.experience).toBe('beginner');
  });

  test('detects timeline - quick', () => {
    const intent = detectIntent('I need to set this up fast today');
    expect(intent.timeline).toBe('quick');
  });
});

describe('Template Suggestions', () => {
  test('suggests lead magnet for email list building', () => {
    const suggestions = suggestFromInput('I want to build my email list');
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions[0].template.id).toBe('lead-magnet-basic');
  });

  test('suggests quiz funnel for quiz intent', () => {
    const suggestions = suggestFromInput('I want to create a quiz');
    expect(suggestions[0].template.id).toBe('lead-magnet-quiz');
  });

  test('suggests webinar for high-ticket sales', () => {
    const suggestions = suggestFromInput('I want to sell my $997 course');
    expect(suggestions[0].template.id).toBe('webinar-basic');
  });

  test('suggests product launch for launch intent', () => {
    const suggestions = suggestFromInput('I am launching a new product');
    expect(suggestions[0].template.id).toBe('product-launch-seed');
  });

  test('suggests ecommerce for product sales', () => {
    const suggestions = suggestFromInput('I want to sell my product online');
    expect(suggestions[0].template.id).toBe('ecommerce-tripwire');
  });

  test('suggestions include score and reason', () => {
    const suggestions = suggestFromInput('build email list');
    expect(suggestions[0].score).toBeGreaterThan(0);
    expect(suggestions[0].score).toBeLessThanOrEqual(100);
    expect(suggestions[0].reason).toBeDefined();
    expect(suggestions[0].reason.length).toBeGreaterThan(0);
  });

  test('suggestions are sorted by score', () => {
    const suggestions = suggestFromInput('sell online course');
    for (let i = 0; i < suggestions.length - 1; i++) {
      expect(suggestions[i].score).toBeGreaterThanOrEqual(suggestions[i + 1].score);
    }
  });

  test('top suggestion includes alternatives', () => {
    const suggestions = suggestFromInput('build email list');
    expect(suggestions[0].alternatives).toBeDefined();
    if (suggestions[0].alternatives && suggestions[0].alternatives.length > 0) {
      expect(suggestions[0].alternatives[0].id).toBeDefined();
    }
  });
});

describe('AI Recommendations', () => {
  test('getAIRecommendation returns complete recommendation', () => {
    const recommendation = getAIRecommendation('build my email list');

    expect(recommendation.primary).toBeDefined();
    expect(recommendation.primary.template).toBeDefined();
    expect(recommendation.explanation).toBeDefined();
    expect(recommendation.nextSteps).toBeInstanceOf(Array);
    expect(recommendation.nextSteps.length).toBeGreaterThan(0);
  });

  test('recommendation includes explanation', () => {
    const recommendation = getAIRecommendation('sell my course');
    expect(recommendation.explanation.length).toBeGreaterThan(50);
    expect(recommendation.explanation).toContain(recommendation.primary.template.name);
  });

  test('recommendation includes actionable next steps', () => {
    const recommendation = getAIRecommendation('build email list');
    recommendation.nextSteps.forEach((step) => {
      expect(step.length).toBeGreaterThan(0);
    });
  });
});

describe('Template Comparisons', () => {
  test('compareTemplates returns valid comparison', () => {
    const comparison = compareTemplates('lead-magnet-basic', 'lead-magnet-quiz');

    expect(comparison).toBeDefined();
    expect(comparison?.template1.id).toBe('lead-magnet-basic');
    expect(comparison?.template2.id).toBe('lead-magnet-quiz');
    expect(comparison?.differences).toBeInstanceOf(Array);
    expect(comparison?.bestFor).toBeDefined();
  });

  test('comparison identifies differences', () => {
    const comparison = compareTemplates('lead-magnet-basic', 'webinar-basic');

    expect(comparison?.differences.length).toBeGreaterThan(0);
  });

  test('comparison returns null for invalid templates', () => {
    const comparison = compareTemplates('invalid-1', 'invalid-2');
    expect(comparison).toBeNull();
  });

  test('comparison includes bestFor recommendations', () => {
    const comparison = compareTemplates('lead-magnet-basic', 'lead-magnet-quiz');

    expect(comparison?.bestFor.template1).toBeInstanceOf(Array);
    expect(comparison?.bestFor.template2).toBeInstanceOf(Array);
    expect(comparison?.bestFor.template1.length).toBeGreaterThan(0);
    expect(comparison?.bestFor.template2.length).toBeGreaterThan(0);
  });
});

describe('Template Categories', () => {
  test('TEMPLATES_BY_CATEGORY contains all categories', () => {
    const categories = Object.keys(TEMPLATES_BY_CATEGORY);
    expect(categories).toContain('lead-gen');
    expect(categories).toContain('webinar');
    expect(categories).toContain('ecommerce');
    expect(categories).toContain('membership');
    expect(categories).toContain('summit');
  });

  test('each category contains valid templates', () => {
    Object.values(TEMPLATES_BY_CATEGORY).forEach((templates) => {
      expect(templates.length).toBeGreaterThan(0);
      templates.forEach((template) => {
        expect(template.id).toBeDefined();
        expect(template.steps.length).toBeGreaterThan(0);
      });
    });
  });
});

describe('Template Complexity', () => {
  test('TEMPLATES_BY_COMPLEXITY contains all levels', () => {
    expect(TEMPLATES_BY_COMPLEXITY.simple).toBeDefined();
    expect(TEMPLATES_BY_COMPLEXITY.medium).toBeDefined();
    expect(TEMPLATES_BY_COMPLEXITY.advanced).toBeDefined();
  });

  test('complexity levels are correctly assigned', () => {
    TEMPLATES_BY_COMPLEXITY.simple.forEach((t) => {
      expect(t.complexity).toBe('simple');
    });
    TEMPLATES_BY_COMPLEXITY.medium.forEach((t) => {
      expect(t.complexity).toBe('medium');
    });
    TEMPLATES_BY_COMPLEXITY.advanced.forEach((t) => {
      expect(t.complexity).toBe('advanced');
    });
  });
});

describe('Template Content Quality', () => {
  test('all templates have meaningful descriptions', () => {
    FUNNEL_TEMPLATES.forEach((template) => {
      expect(template.description.length).toBeGreaterThan(20);
    });
  });

  test('all templates have use cases', () => {
    FUNNEL_TEMPLATES.forEach((template) => {
      expect(template.suggestedFor.length).toBeGreaterThan(0);
    });
  });

  test('all templates have tags', () => {
    FUNNEL_TEMPLATES.forEach((template) => {
      expect(template.tags.length).toBeGreaterThan(0);
    });
  });

  test('all steps have best practices', () => {
    FUNNEL_TEMPLATES.forEach((template) => {
      template.steps.forEach((step) => {
        expect(step.bestPractices.length).toBeGreaterThan(0);
      });
    });
  });

  test('conversion rates are realistic (10-60%)', () => {
    FUNNEL_TEMPLATES.forEach((template) => {
      expect(template.conversionRate).toBeGreaterThanOrEqual(10);
      expect(template.conversionRate).toBeLessThanOrEqual(60);
    });
  });

  test('setup times are specified', () => {
    FUNNEL_TEMPLATES.forEach((template) => {
      expect(template.estimatedSetupTime).toBeDefined();
      // Setup time should contain either "minute" or "hour"
      const hasTimeUnit = template.estimatedSetupTime.includes('minute') ||
                         template.estimatedSetupTime.includes('hour');
      expect(hasTimeUnit).toBe(true);
    });
  });
});

describe('Element Suggestions', () => {
  test('all elements have valid types', () => {
    const validTypes = [
      'headline',
      'subheadline',
      'body',
      'form',
      'button',
      'image',
      'video',
      'testimonial',
      'bullet-list',
      'countdown',
      'social-proof',
      'guarantee',
    ];

    FUNNEL_TEMPLATES.forEach((template) => {
      template.steps.forEach((step) => {
        step.elements.forEach((element) => {
          expect(validTypes).toContain(element.type);
        });
      });
    });
  });

  test('elements are positioned sequentially', () => {
    FUNNEL_TEMPLATES.forEach((template) => {
      template.steps.forEach((step) => {
        const positions = step.elements.map((e) => e.position).sort((a, b) => a - b);
        expect(positions[0]).toBe(1); // First element should be position 1
        // Positions should be sequential or at least ordered
        for (let i = 0; i < positions.length - 1; i++) {
          expect(positions[i + 1]).toBeGreaterThan(positions[i]);
        }
      });
    });
  });

  test('headlines come before other elements', () => {
    FUNNEL_TEMPLATES.forEach((template) => {
      template.steps.forEach((step) => {
        const headlineIndex = step.elements.findIndex((e) => e.type === 'headline');
        if (headlineIndex !== -1) {
          // If there's a headline, it should be early in the page
          expect(step.elements[headlineIndex].position).toBeLessThanOrEqual(3);
        }
      });
    });
  });
});

describe('Color Schemes', () => {
  test('color schemes use valid hex codes', () => {
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

    FUNNEL_TEMPLATES.forEach((template) => {
      template.steps.forEach((step) => {
        if (step.colorScheme) {
          expect(step.colorScheme.primary).toMatch(hexColorRegex);
          expect(step.colorScheme.secondary).toMatch(hexColorRegex);
          expect(step.colorScheme.accent).toMatch(hexColorRegex);
          expect(step.colorScheme.background).toMatch(hexColorRegex);
        }
      });
    });
  });

  test('most steps have color schemes', () => {
    let totalSteps = 0;
    let stepsWithColors = 0;

    FUNNEL_TEMPLATES.forEach((template) => {
      template.steps.forEach((step) => {
        totalSteps++;
        if (step.colorScheme) {
          stepsWithColors++;
        }
      });
    });

    // At least 80% of steps should have color schemes
    expect(stepsWithColors / totalSteps).toBeGreaterThan(0.8);
  });
});

describe('Integration Tests', () => {
  test('end-to-end: user goal to template selection', () => {
    // User input
    const userGoal = "I want to build my email list with a free guide";

    // Get suggestions
    const suggestions = suggestFromInput(userGoal);

    // Should get suggestions
    expect(suggestions.length).toBeGreaterThan(0);

    // Top suggestion should be relevant
    const top = suggestions[0];
    expect(top.template.category).toBe('lead-gen');
    expect(top.score).toBeGreaterThan(30);

    // Get full recommendation
    const recommendation = getAIRecommendation(userGoal);
    expect(recommendation.primary.template.id).toBe(top.template.id);
    expect(recommendation.nextSteps.length).toBeGreaterThan(0);
  });

  test('end-to-end: template to funnel structure', () => {
    const template = getTemplateById('lead-magnet-basic');
    expect(template).toBeDefined();

    // Build funnel structure
    const funnelStructure = {
      name: `My ${template!.name}`,
      pages: template!.steps.map((step) => ({
        name: step.name,
        type: step.type,
        elementCount: step.elements.length,
      })),
    };

    expect(funnelStructure.pages.length).toBe(2);
    expect(funnelStructure.pages[0].name).toBe('Opt-in Page');
    expect(funnelStructure.pages[0].elementCount).toBeGreaterThan(0);
  });
});
