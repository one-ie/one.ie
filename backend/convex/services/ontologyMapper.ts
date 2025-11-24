/**
 * Ontology Mapper Service
 *
 * Maps detected features to the universal 6-dimension ontology
 * Does NOT generate custom ontologies - identifies which parts of the universal ontology apply
 */

import { Effect } from "effect";
import type { WebsiteAnalysis } from "./websiteAnalyzer";

export interface OntologyMapping {
  groups: {
    applicable: boolean;
    types: string[];
    note: string;
  };

  people: {
    applicable: boolean;
    roles: string[];
    note: string;
  };

  things: {
    applicable: boolean;
    types: string[];
    note: string;
  };

  connections: {
    applicable: boolean;
    types: string[];
    note: string;
  };

  events: {
    applicable: boolean;
    types: string[];
    note: string;
  };

  knowledge: {
    applicable: boolean;
    types: string[];
    note: string;
  };
}

export interface OntologyMappingDocument {
  organizationName: string;
  version: string;
  generatedAt: number;
  sourceUrl: string;
  overview: string;
  mapping: OntologyMapping;
}

/**
 * Map content types to thing types from universal ontology
 */
const mapContentToThings = (contentTypes: string[]): string[] => {
  const thingMapping: Record<string, string[]> = {
    blog: ['blog_post', 'article'],
    video: ['video', 'media_asset'],
    podcast: ['podcast', 'recording'],
    courses: ['course', 'lesson', 'certificate'],
    products: ['digital_product', 'product'],
    services: ['consultation', 'service']
  };

  const things = new Set<string>();
  contentTypes.forEach(type => {
    thingMapping[type]?.forEach(thing => things.add(thing));
  });

  return Array.from(things);
};

/**
 * Map monetization to thing types from universal ontology
 */
const mapMonetizationToThings = (monetization: string[]): string[] => {
  const thingMapping: Record<string, string[]> = {
    subscriptions: ['subscription', 'membership'],
    'one-time-sales': ['payment', 'invoice'],
    consulting: ['consultation', 'booking'],
    ads: ['campaign', 'ad_placement'],
    sponsorships: ['sponsorship', 'partnership'],
    donations: ['donation', 'payment']
  };

  const things = new Set<string>();
  monetization.forEach(type => {
    thingMapping[type]?.forEach(thing => things.add(thing));
  });

  return Array.from(things);
};

/**
 * Map features to connection types from universal ontology
 */
const mapFeaturesToConnections = (analysis: WebsiteAnalysis): string[] => {
  const connections = new Set([
    'owns',
    'created_by',
    'authored',
    'member_of'
  ]);

  if (analysis.features.contentTypes.includes('courses')) {
    connections.add('enrolled_in');
    connections.add('completed');
    connections.add('teaching');
  }

  if (analysis.features.monetization.includes('subscriptions')) {
    connections.add('transacted');
  }

  if (analysis.features.community.length > 0) {
    connections.add('following');
    connections.add('participated_in');
  }

  return Array.from(connections);
};

/**
 * Map features to event types from universal ontology
 */
const mapFeaturesToEvents = (analysis: WebsiteAnalysis): string[] => {
  const events = new Set([
    'entity_created',
    'entity_updated',
    'user_registered',
    'user_login'
  ]);

  if (analysis.features.contentTypes.includes('blog')) {
    events.add('content_event');
  }

  if (analysis.features.contentTypes.includes('courses')) {
    events.add('course_enrolled');
    events.add('lesson_completed');
    events.add('course_completed');
  }

  if (analysis.features.monetization.length > 0) {
    events.add('payment_event');
  }

  if (analysis.features.community.length > 0) {
    events.add('user_joined_group');
  }

  return Array.from(events);
};

/**
 * Generate business description from analysis
 */
const generateBusinessDescription = (analysis: WebsiteAnalysis): string => {
  const { contentTypes, monetization } = analysis.features;

  if (contentTypes.includes('courses')) {
    return 'Educational platform providing courses and learning experiences';
  }

  if (contentTypes.includes('blog') && contentTypes.includes('products')) {
    return 'Creator platform combining content creation with product sales';
  }

  if (monetization.includes('consulting')) {
    return 'Professional services platform offering consultations';
  }

  return 'Business platform supporting digital operations';
};

/**
 * Map website analysis to universal ontology dimensions
 */
export const mapToUniversalOntology = (
  analysis: WebsiteAnalysis,
  organizationName: string
): Effect.Effect<OntologyMappingDocument, never> =>
  Effect.sync(() => {
    // Determine which group types from universal ontology apply
    const groupTypes = ['organization'];
    if (analysis.features.community.length > 0) {
      groupTypes.push('community');
    }

    // Determine which roles from universal ontology apply
    const roles = ['platform_owner', 'org_owner', 'org_user'];
    if (analysis.features.monetization.length > 0) {
      roles.push('customer');
    }

    // Combine all thing types from universal ontology that apply
    const baseThings = ['creator', 'organization', 'website'];
    const contentThings = mapContentToThings(analysis.features.contentTypes);
    const monetizationThings = mapMonetizationToThings(analysis.features.monetization);

    const thingsSet = new Set([...baseThings, ...contentThings, ...monetizationThings]);
    const allThings = Array.from(thingsSet);

    // Identify which connections from universal ontology apply
    const connections = mapFeaturesToConnections(analysis);

    // Identify which events from universal ontology apply
    const events = mapFeaturesToEvents(analysis);

    // Identify which knowledge types from universal ontology apply
    const knowledgeTypes = ['documentation', 'label'];
    if (analysis.features.contentTypes.includes('blog')) {
      knowledgeTypes.push('article_chunk');
    }

    return {
      organizationName,
      version: "1.0.0",
      generatedAt: Date.now(),
      sourceUrl: analysis.url,
      overview: generateBusinessDescription(analysis),
      mapping: {
        groups: {
          applicable: true,
          types: groupTypes,
          note: groupTypes.includes('community')
            ? 'Uses organization and community types from universal ontology'
            : 'Uses organization type from universal ontology'
        },
        people: {
          applicable: true,
          roles,
          note: 'Uses standard roles from universal ontology for access control'
        },
        things: {
          applicable: true,
          types: allThings,
          note: 'Uses content and business entity types from universal ontology'
        },
        connections: {
          applicable: true,
          types: connections,
          note: 'Uses standard relationship types from universal ontology'
        },
        events: {
          applicable: true,
          types: events,
          note: 'Tracks standard event types from universal ontology'
        },
        knowledge: {
          applicable: true,
          types: knowledgeTypes,
          note: 'Uses knowledge types from universal ontology for categorization'
        }
      }
    };
  });

/**
 * Generate markdown documentation from ontology mapping
 */
export const generateOntologyMappingMarkdown = (doc: OntologyMappingDocument): string => {
  return `# ${doc.organizationName} - Ontology Usage Guide

**Version:** ${doc.version}
**Generated:** ${new Date(doc.generatedAt).toISOString()}
**Source:** ${doc.sourceUrl}
**Based On:** Universal 6-Dimension Ontology

## Overview

Based on analysis of ${doc.sourceUrl}, your ${doc.overview} uses these parts of the universal ontology:

## GROUPS: ${doc.mapping.groups.note}

${doc.mapping.groups.types.map(type => `- **${type}**`).join('\n')}

## PEOPLE: ${doc.mapping.people.note}

${doc.mapping.people.roles.map(role => `- **${role}**`).join('\n')}

## THINGS: ${doc.mapping.things.note}

${doc.mapping.things.types.map(type => `- **${type}**`).join('\n')}

## CONNECTIONS: ${doc.mapping.connections.note}

${doc.mapping.connections.types.map(type => `- **${type}**`).join('\n')}

## EVENTS: ${doc.mapping.events.note}

${doc.mapping.events.types.map(type => `- **${type}**`).join('\n')}

## KNOWLEDGE: ${doc.mapping.knowledge.note}

${doc.mapping.knowledge.types.map(type => `- **${type}**`).join('\n')}

---

**Important:** This is NOT a custom ontology. This is a guide to which parts of the universal 6-dimension ontology your business uses. All data is stored in the same universal ontology structure, enabling cross-organization compatibility and seamless data portability.

**Reference:** See \`/one/knowledge/ontology.md\` for the complete universal ontology specification.
`;
};

/**
 * Run ontology mapping pipeline
 */
export const runOntologyMapping = async (
  analysis: WebsiteAnalysis,
  organizationName: string
): Promise<{ document: OntologyMappingDocument; markdown: string }> => {
  const document = await Effect.runPromise(
    mapToUniversalOntology(analysis, organizationName)
  );

  const markdown = generateOntologyMappingMarkdown(document);

  return { document, markdown };
};
