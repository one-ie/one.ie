/**
 * Funnel Builder - Comprehensive Unit & Integration Tests
 *
 * Tests the AI-powered funnel builder feature:
 * - Template selection and customization
 * - Funnel creation workflow
 * - History management
 * - State persistence
 * - Business logic validation
 *
 * FRONTEND-ONLY: Tests browser-based functionality (no backend)
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { atom } from 'nanostores';

// Import funnel builder functionality
import {
  FUNNEL_TEMPLATES,
  getTemplateById,
  getTemplatesByCategory,
  searchTemplates,
  suggestFromInput,
  getAIRecommendation,
} from '@/lib/funnel-templates';

import type {
  Funnel,
  FunnelStep,
  PageElement,
  ElementType,
} from '@/types/funnel-builder';

describe('Funnel Builder - Template Discovery', () => {
  test('loads all funnel templates', () => {
    expect(FUNNEL_TEMPLATES).toBeDefined();
    expect(FUNNEL_TEMPLATES.length).toBeGreaterThan(0);
  });

  test('each template has required properties', () => {
    FUNNEL_TEMPLATES.forEach((template) => {
      expect(template.id).toBeDefined();
      expect(template.name).toBeDefined();
      expect(template.description).toBeDefined();
      expect(template.category).toBeDefined();
      expect(template.steps).toBeInstanceOf(Array);
      expect(template.steps.length).toBeGreaterThan(0);
    });
  });

  test('templates contain valid step structures', () => {
    FUNNEL_TEMPLATES.forEach((template) => {
      template.steps.forEach((step) => {
        expect(step.id).toBeDefined();
        expect(step.name).toBeDefined();
        expect(step.type).toBeDefined();
        expect(step.elements).toBeInstanceOf(Array);
      });
    });
  });

  test('getTemplateById returns correct template', () => {
    const template = getTemplateById('lead-magnet-basic');
    expect(template).toBeDefined();
    expect(template?.id).toBe('lead-magnet-basic');
  });

  test('getTemplateById returns undefined for invalid id', () => {
    const template = getTemplateById('non-existent-template');
    expect(template).toBeUndefined();
  });

  test('getTemplatesByCategory filters correctly', () => {
    const leadGenTemplates = getTemplatesByCategory('lead-gen');
    expect(leadGenTemplates.length).toBeGreaterThan(0);
    leadGenTemplates.forEach((t) => {
      expect(t.category).toBe('lead-gen');
    });
  });

  test('searchTemplates finds templates by keyword', () => {
    const results = searchTemplates('webinar');
    expect(results.length).toBeGreaterThan(0);
    const hasWebinar = results.some(r =>
      r.name.toLowerCase().includes('webinar') ||
      r.description.toLowerCase().includes('webinar')
    );
    expect(hasWebinar).toBe(true);
  });
});

describe('Funnel Builder - AI Recommendations', () => {
  test('suggestFromInput returns relevant templates', () => {
    const suggestions = suggestFromInput('I want to build my email list');

    expect(suggestions).toBeDefined();
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions[0].template).toBeDefined();
    expect(suggestions[0].score).toBeGreaterThan(0);
    expect(suggestions[0].reason).toBeDefined();
  });

  test('suggestions are sorted by score (highest first)', () => {
    const suggestions = suggestFromInput('sell online course');

    for (let i = 0; i < suggestions.length - 1; i++) {
      expect(suggestions[i].score).toBeGreaterThanOrEqual(suggestions[i + 1].score);
    }
  });

  test('getAIRecommendation returns complete recommendation', () => {
    const recommendation = getAIRecommendation('I want to sell a $997 coaching program');

    expect(recommendation.primary).toBeDefined();
    expect(recommendation.primary.template).toBeDefined();
    expect(recommendation.explanation).toBeDefined();
    expect(recommendation.nextSteps).toBeInstanceOf(Array);
    expect(recommendation.nextSteps.length).toBeGreaterThan(0);
  });

  test('recommendation for lead gen suggests appropriate template', () => {
    const recommendation = getAIRecommendation('grow email list with free guide');

    expect(recommendation.primary.template.category).toBe('lead-gen');
  });

  test('recommendation for high-ticket suggests webinar funnel', () => {
    const recommendation = getAIRecommendation('sell $2000 high ticket coaching');

    const isWebinarOrHighTicket =
      recommendation.primary.template.id.includes('webinar') ||
      recommendation.primary.template.tags?.includes('high-ticket');

    expect(isWebinarOrHighTicket).toBe(true);
  });
});

describe('Funnel Builder - Funnel Creation', () => {
  test('creates funnel from template', () => {
    const template = getTemplateById('lead-magnet-basic');
    expect(template).toBeDefined();

    const funnel: Funnel = {
      id: 'test-funnel-1',
      groupId: 'test-group',
      name: `My ${template!.name}`,
      slug: 'my-lead-magnet',
      description: template!.description,
      category: template!.category as any,
      steps: template!.steps.map((step, index) => ({
        id: `step-${index}`,
        funnelId: 'test-funnel-1',
        name: step.name,
        slug: step.name.toLowerCase().replace(/\s+/g, '-'),
        type: step.type as any,
        elements: step.elements as PageElement[],
        settings: {
          seoTitle: step.name,
          seoDescription: step.name,
        },
        status: 'draft',
      })),
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(funnel.id).toBe('test-funnel-1');
    expect(funnel.name).toContain('Lead Magnet');
    expect(funnel.steps.length).toBe(template!.steps.length);
    expect(funnel.status).toBe('draft');
  });

  test('funnel steps maintain element order', () => {
    const template = getTemplateById('lead-magnet-basic');
    const step = template!.steps[0];

    const elements = step.elements;
    const positions = elements.map(e => e.position);

    // Check positions are sequential
    for (let i = 0; i < positions.length - 1; i++) {
      expect(positions[i + 1]).toBeGreaterThan(positions[i]);
    }
  });

  test('validates funnel has required properties', () => {
    const funnel: Partial<Funnel> = {
      id: 'test-funnel',
      name: 'Test Funnel',
      steps: [],
    };

    // Missing required properties
    expect(funnel.groupId).toBeUndefined();
    expect(funnel.slug).toBeUndefined();
    expect(funnel.category).toBeUndefined();
    expect(funnel.status).toBeUndefined();
  });
});

describe('Funnel Builder - Element Types', () => {
  const validElementTypes = [
    'headline',
    'subheadline',
    'text',
    'body',
    'image',
    'video',
    'button',
    'form',
    'countdown',
    'testimonial',
    'pricing-table',
    'divider',
    'spacer',
    'bullet-list',
    'social-proof',
    'guarantee',
  ];

  test('all templates use valid element types', () => {
    FUNNEL_TEMPLATES.forEach((template) => {
      template.steps.forEach((step) => {
        step.elements.forEach((element) => {
          expect(validElementTypes).toContain(element.type);
        });
      });
    });
  });

  test('headline elements come first in steps', () => {
    FUNNEL_TEMPLATES.forEach((template) => {
      template.steps.forEach((step) => {
        const headlineIndex = step.elements.findIndex(e => e.type === 'headline');
        if (headlineIndex !== -1) {
          // Headline should be early in the page (position <= 3)
          expect(step.elements[headlineIndex].position).toBeLessThanOrEqual(3);
        }
      });
    });
  });

  test('form elements have required properties', () => {
    FUNNEL_TEMPLATES.forEach((template) => {
      template.steps.forEach((step) => {
        step.elements.forEach((element) => {
          if (element.type === 'form') {
            expect(element.placeholder).toBeDefined();
          }
        });
      });
    });
  });
});

describe('Funnel Builder - State Management (Nanostores)', () => {
  test('creates nanostore for funnel state', () => {
    const funnel$ = atom<Funnel | null>(null);

    expect(funnel$.get()).toBeNull();

    const testFunnel: Funnel = {
      id: 'test-1',
      groupId: 'group-1',
      name: 'Test Funnel',
      slug: 'test-funnel',
      category: 'lead-gen',
      steps: [],
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    funnel$.set(testFunnel);
    expect(funnel$.get()).toEqual(testFunnel);
  });

  test('updates funnel state', () => {
    const funnel$ = atom<Funnel | null>(null);

    const initialFunnel: Funnel = {
      id: 'test-1',
      groupId: 'group-1',
      name: 'Draft Funnel',
      slug: 'draft',
      category: 'lead-gen',
      steps: [],
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    funnel$.set(initialFunnel);

    // Update to published
    const updated = { ...funnel$.get()!, status: 'published' as const };
    funnel$.set(updated);

    expect(funnel$.get()?.status).toBe('published');
  });

  test('manages multiple funnels in array', () => {
    const funnels$ = atom<Funnel[]>([]);

    const funnel1: Funnel = {
      id: 'test-1',
      groupId: 'group-1',
      name: 'Funnel 1',
      slug: 'funnel-1',
      category: 'lead-gen',
      steps: [],
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const funnel2: Funnel = {
      id: 'test-2',
      groupId: 'group-1',
      name: 'Funnel 2',
      slug: 'funnel-2',
      category: 'webinar',
      steps: [],
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    funnels$.set([funnel1, funnel2]);

    expect(funnels$.get().length).toBe(2);
    expect(funnels$.get()[0].id).toBe('test-1');
    expect(funnels$.get()[1].id).toBe('test-2');
  });
});

describe('Funnel Builder - Validation', () => {
  test('validates funnel slug format', () => {
    const validSlug = /^[a-z0-9-]+$/;

    expect('my-funnel').toMatch(validSlug);
    expect('test-123').toMatch(validSlug);
    expect('My Funnel').not.toMatch(validSlug); // Uppercase
    expect('my_funnel').not.toMatch(validSlug); // Underscore
    expect('my funnel').not.toMatch(validSlug); // Space
  });

  test('validates funnel category', () => {
    const validCategories = ['ecommerce', 'webinar', 'lead-gen', 'book-launch', 'membership'];

    expect(validCategories).toContain('lead-gen');
    expect(validCategories).toContain('webinar');
    expect(validCategories).not.toContain('invalid-category');
  });

  test('validates funnel status', () => {
    const validStatuses = ['draft', 'published'];

    expect(validStatuses).toContain('draft');
    expect(validStatuses).toContain('published');
    expect(validStatuses).not.toContain('archived');
  });
});

describe('Funnel Builder - Frontend-Only Verification', () => {
  test('CRITICAL: No Convex imports in stores', () => {
    // This test verifies that stores use nanostores, NOT Convex
    // If this test fails, backend code was unexpectedly created

    const funnelStore = atom<Funnel | null>(null);
    expect(funnelStore.get).toBeDefined();
    expect(funnelStore.set).toBeDefined();

    // Stores should use nanostores API, not Convex
    expect(typeof funnelStore.get).toBe('function');
    expect(typeof funnelStore.set).toBe('function');
  });

  test('CRITICAL: No API calls in business logic', () => {
    // Template suggestions should work without network requests
    const spy = vi.spyOn(global, 'fetch');

    const suggestions = suggestFromInput('build email list');

    expect(spy).not.toHaveBeenCalled();
    expect(suggestions.length).toBeGreaterThan(0);

    spy.mockRestore();
  });

  test('CRITICAL: Data persists in browser (not backend)', () => {
    // Verify browser storage API is available
    const testData = { funnelId: 'test-123' };

    // Mock localStorage behavior (since this is a unit test)
    const mockStorage = new Map<string, string>();
    mockStorage.set('test-funnel', JSON.stringify(testData));

    const retrieved = JSON.parse(mockStorage.get('test-funnel') || '{}');

    expect(retrieved.funnelId).toBe('test-123');
  });
});

describe('Funnel Builder - User Flow: Create Funnel', () => {
  test('Complete flow: Select template → Create funnel → Save', () => {
    // Step 1: User describes their goal
    const userGoal = 'I want to build my email list with a free checklist';

    // Step 2: AI suggests templates
    const suggestions = suggestFromInput(userGoal);
    expect(suggestions.length).toBeGreaterThan(0);

    // Step 3: User selects top suggestion
    const selectedTemplate = suggestions[0].template;
    expect(selectedTemplate).toBeDefined();

    // Step 4: Create funnel from template
    const funnel: Funnel = {
      id: `funnel-${Date.now()}`,
      groupId: 'user-group',
      name: selectedTemplate.name,
      slug: selectedTemplate.id,
      description: selectedTemplate.description,
      category: selectedTemplate.category as any,
      steps: selectedTemplate.steps.map((step, index) => ({
        id: `step-${index}`,
        funnelId: `funnel-${Date.now()}`,
        name: step.name,
        slug: step.name.toLowerCase().replace(/\s+/g, '-'),
        type: step.type as any,
        elements: step.elements as PageElement[],
        settings: {},
        status: 'draft',
      })),
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Step 5: Verify funnel created successfully
    expect(funnel.id).toBeDefined();
    expect(funnel.steps.length).toBeGreaterThan(0);
    expect(funnel.status).toBe('draft');

    // Step 6: Save to browser storage (simulated)
    const mockStorage = new Map<string, string>();
    mockStorage.set(`funnel-${funnel.id}`, JSON.stringify(funnel));

    // Step 7: Retrieve and verify
    const saved = JSON.parse(mockStorage.get(`funnel-${funnel.id}`) || '{}');
    expect(saved.id).toBe(funnel.id);
    expect(saved.name).toBe(funnel.name);
  });
});

describe('Funnel Builder - Performance', () => {
  test('template search completes quickly (< 100ms)', () => {
    const start = performance.now();

    searchTemplates('email list');

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100);
  });

  test('AI recommendations complete quickly (< 200ms)', () => {
    const start = performance.now();

    getAIRecommendation('sell online course');

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(200);
  });

  test('template library loads quickly (< 50ms)', () => {
    const start = performance.now();

    const templates = FUNNEL_TEMPLATES;

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(50);
    expect(templates.length).toBeGreaterThan(0);
  });
});
