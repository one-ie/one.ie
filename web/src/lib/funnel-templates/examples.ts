/**
 * Funnel Template Usage Examples
 *
 * Practical examples showing how to use the funnel template library.
 */

import {
  suggestFromInput,
  getTemplateById,
  getAIRecommendation,
  compareTemplates,
  searchTemplates,
  type FunnelTemplate,
  type TemplateSuggestion,
} from './index';

// ============================================================================
// EXAMPLE 1: Basic AI Suggestion
// ============================================================================

export function example1_basicSuggestion() {
  console.log('=== Example 1: Basic AI Suggestion ===\n');

  // User input
  const userGoal = "I want to build my email list with a free PDF guide";

  // Get AI suggestions
  const suggestions = suggestFromInput(userGoal);

  // Display top suggestion
  const top = suggestions[0];
  console.log(`🎯 Top Recommendation: ${top.template.name}`);
  console.log(`📊 Match Score: ${top.score}%`);
  console.log(`💡 Why: ${top.reason}`);
  console.log(`⏱️  Setup Time: ${top.template.estimatedSetupTime}`);
  console.log(`📈 Conversion Rate: ${top.template.conversionRate}%`);
  console.log(`📄 Pages: ${top.template.steps.length}`);

  // Show alternatives
  console.log('\n🔄 Alternatives:');
  suggestions.slice(1, 3).forEach((alt, i) => {
    console.log(`  ${i + 1}. ${alt.template.name} (${alt.score}% match)`);
  });

  return top.template;
}

// ============================================================================
// EXAMPLE 2: Get Complete AI Recommendation with Next Steps
// ============================================================================

export function example2_aiRecommendation() {
  console.log('\n=== Example 2: Complete AI Recommendation ===\n');

  const userGoal = "I want to launch a webinar to sell my online course";

  const recommendation = getAIRecommendation(userGoal);

  console.log('📋 RECOMMENDATION REPORT\n');
  console.log(`Template: ${recommendation.primary.template.name}`);
  console.log(`Match Score: ${recommendation.primary.score}%\n`);

  console.log('📝 Explanation:');
  console.log(recommendation.explanation);

  console.log('\n✅ Next Steps:');
  recommendation.nextSteps.forEach((step, i) => {
    console.log(`  ${i + 1}. ${step}`);
  });

  if (recommendation.alternatives.length > 0) {
    console.log('\n🔄 Alternative Options:');
    recommendation.alternatives.forEach((alt) => {
      console.log(`  • ${alt.template.name} (${alt.score}% match)`);
      console.log(`    ${alt.reason}`);
    });
  }

  return recommendation;
}

// ============================================================================
// EXAMPLE 3: Building a Funnel from Template
// ============================================================================

export function example3_buildFromTemplate() {
  console.log('\n=== Example 3: Building Funnel from Template ===\n');

  // Get the lead magnet template
  const template = getTemplateById('lead-magnet-basic');

  if (!template) {
    console.log('Template not found');
    return;
  }

  console.log(`🏗️  Building: ${template.name}\n`);

  // Iterate through each step/page
  template.steps.forEach((step, index) => {
    console.log(`\n📄 Page ${index + 1}: ${step.name}`);
    console.log(`   Type: ${step.type}`);
    console.log(`   Purpose: ${step.description}`);

    // Show elements to add
    console.log(`\n   Elements to add:`);
    step.elements.forEach((element) => {
      const content = element.content || element.placeholder || '';
      console.log(`   • ${element.type.toUpperCase()} (position ${element.position})`);
      if (content) {
        console.log(`     Content: "${content.slice(0, 60)}${content.length > 60 ? '...' : ''}"`);
      }
      if (element.notes) {
        console.log(`     💡 Tip: ${element.notes}`);
      }
    });

    // Show color scheme
    if (step.colorScheme) {
      console.log(`\n   🎨 Color Scheme:`);
      console.log(`      Primary: ${step.colorScheme.primary}`);
      console.log(`      Secondary: ${step.colorScheme.secondary}`);
      console.log(`      Accent: ${step.colorScheme.accent}`);
      console.log(`      Background: ${step.colorScheme.background}`);
    }

    // Show best practices
    console.log(`\n   ✅ Best Practices:`);
    step.bestPractices.slice(0, 3).forEach((practice) => {
      console.log(`      • ${practice}`);
    });
  });

  return template;
}

// ============================================================================
// EXAMPLE 4: Comparing Templates
// ============================================================================

export function example4_compareTemplates() {
  console.log('\n=== Example 4: Template Comparison ===\n');

  const comparison = compareTemplates('lead-magnet-basic', 'lead-magnet-quiz');

  if (!comparison) {
    console.log('Templates not found');
    return;
  }

  console.log('📊 TEMPLATE COMPARISON\n');
  console.log(`Template A: ${comparison.template1.name}`);
  console.log(`Template B: ${comparison.template2.name}\n`);

  console.log('🔍 Key Differences:');
  comparison.differences.forEach((diff) => {
    console.log(`  • ${diff}`);
  });

  console.log(`\n✅ ${comparison.template1.name} is best for:`);
  comparison.bestFor.template1.forEach((use) => {
    console.log(`  • ${use}`);
  });

  console.log(`\n✅ ${comparison.template2.name} is best for:`);
  comparison.bestFor.template2.forEach((use) => {
    console.log(`  • ${use}`);
  });

  return comparison;
}

// ============================================================================
// EXAMPLE 5: Search and Filter
// ============================================================================

export function example5_searchAndFilter() {
  console.log('\n=== Example 5: Search and Filter Templates ===\n');

  // Search by keyword
  console.log('🔍 Searching for "webinar"...\n');
  const webinarResults = searchTemplates('webinar');
  webinarResults.forEach((template) => {
    console.log(`  • ${template.name}`);
    console.log(`    ${template.description}`);
    console.log(`    Tags: ${template.tags.join(', ')}\n`);
  });

  // Search by use case
  console.log('🔍 Searching for "high ticket"...\n');
  const highTicketResults = searchTemplates('high ticket');
  highTicketResults.forEach((template) => {
    console.log(`  • ${template.name}`);
    console.log(`    Suggested for: ${template.suggestedFor.slice(0, 2).join(', ')}\n`);
  });

  return { webinarResults, highTicketResults };
}

// ============================================================================
// EXAMPLE 6: Extract Template Copy for AI
// ============================================================================

export function example6_extractCopyForAI() {
  console.log('\n=== Example 6: Extract Copy Patterns for AI ===\n');

  const template = getTemplateById('ecommerce-tripwire');

  if (!template) {
    console.log('Template not found');
    return;
  }

  console.log(`📝 Copy Patterns from: ${template.name}\n`);

  template.steps.forEach((step) => {
    console.log(`\n📄 ${step.name}:`);

    // Extract headlines
    const headlines = step.elements.filter((e) => e.type === 'headline');
    if (headlines.length > 0) {
      console.log('\n  Headlines:');
      headlines.forEach((h) => {
        if (h.content) {
          console.log(`    • "${h.content}"`);
        }
      });
    }

    // Extract CTAs
    const ctas = step.elements.filter((e) => e.type === 'button');
    if (ctas.length > 0) {
      console.log('\n  Call-to-Actions:');
      ctas.forEach((cta) => {
        if (cta.content) {
          console.log(`    • "${cta.content}"`);
        }
      });
    }

    // Extract body copy patterns
    const body = step.elements.filter((e) => e.type === 'body');
    if (body.length > 0) {
      console.log('\n  Body Copy Patterns:');
      body.forEach((b) => {
        if (b.content) {
          const preview = b.content.split('\n')[0];
          console.log(`    • "${preview}..."`);
        }
      });
    }
  });

  return template;
}

// ============================================================================
// EXAMPLE 7: Generate Funnel Structure JSON
// ============================================================================

export function example7_generateFunnelJSON() {
  console.log('\n=== Example 7: Generate Funnel JSON ===\n');

  const template = getTemplateById('webinar-basic');

  if (!template) {
    console.log('Template not found');
    return;
  }

  // Create a simplified funnel structure
  const funnelStructure = {
    name: `My ${template.name}`,
    templateId: template.id,
    estimatedConversion: template.conversionRate,
    pages: template.steps.map((step, index) => ({
      pageNumber: index + 1,
      name: step.name,
      type: step.type,
      slug: step.id,
      elements: step.elements.map((element) => ({
        type: element.type,
        position: element.position,
        content: element.content || element.placeholder || '',
        notes: element.notes || '',
      })),
      styling: step.colorScheme || null,
      bestPractices: step.bestPractices,
    })),
  };

  console.log('📦 Funnel Structure JSON:\n');
  console.log(JSON.stringify(funnelStructure, null, 2));

  return funnelStructure;
}

// ============================================================================
// EXAMPLE 8: Intent Detection Analysis
// ============================================================================

export function example8_intentDetection() {
  console.log('\n=== Example 8: Intent Detection Analysis ===\n');

  const testInputs = [
    "I want to build my email list",
    "I'm launching a new product next month",
    "I need to sell my $997 coaching program",
    "I want to host a virtual summit with 20 speakers",
    "Quick funnel to collect leads for my PDF guide",
  ];

  testInputs.forEach((input) => {
    console.log(`\n📝 Input: "${input}"`);

    const suggestions = suggestFromInput(input);
    const top = suggestions[0];

    console.log(`   → Suggested: ${top.template.name}`);
    console.log(`   → Match: ${top.score}%`);
    console.log(`   → Reason: ${top.reason}`);
  });
}

// ============================================================================
// EXAMPLE 9: Template Selection Wizard
// ============================================================================

export function example9_selectionWizard() {
  console.log('\n=== Example 9: Template Selection Wizard ===\n');

  // Simulate wizard questions and answers
  const answers = {
    goal: "Build an email list",
    experience: "beginner",
    timeline: "quick",
    budget: "low",
  };

  console.log('📋 Wizard Answers:');
  console.log(`   Goal: ${answers.goal}`);
  console.log(`   Experience: ${answers.experience}`);
  console.log(`   Timeline: ${answers.timeline}`);
  console.log(`   Budget: ${answers.budget}\n`);

  // Create natural language query from answers
  const query = `${answers.goal} ${answers.experience} ${answers.timeline}`;

  const suggestions = suggestFromInput(query);
  const recommendation = suggestions[0];

  console.log('🎯 Recommended Template:');
  console.log(`   ${recommendation.template.name}`);
  console.log(`   Complexity: ${recommendation.template.complexity}`);
  console.log(`   Setup Time: ${recommendation.template.estimatedSetupTime}`);
  console.log(`   Conversion: ${recommendation.template.conversionRate}%`);

  console.log('\n✅ Why this matches your needs:');
  console.log(`   ${recommendation.reason}`);

  console.log('\n📊 Quick Stats:');
  console.log(`   Pages: ${recommendation.template.steps.length}`);
  console.log(`   Categories: ${recommendation.template.category}`);
  console.log(`   Tags: ${recommendation.template.tags.slice(0, 3).join(', ')}`);

  return recommendation;
}

// ============================================================================
// EXAMPLE 10: Batch Analysis
// ============================================================================

export function example10_batchAnalysis() {
  console.log('\n=== Example 10: Analyze All Templates ===\n');

  const { FUNNEL_TEMPLATES } = require('./templates');

  // Calculate statistics
  const totalPages = FUNNEL_TEMPLATES.reduce((sum, t) => sum + t.steps.length, 0);
  const avgPages = totalPages / FUNNEL_TEMPLATES.length;
  const avgConversion = FUNNEL_TEMPLATES.reduce((sum, t) => sum + t.conversionRate, 0) / FUNNEL_TEMPLATES.length;

  console.log('📊 Template Library Statistics:\n');
  console.log(`   Total Templates: ${FUNNEL_TEMPLATES.length}`);
  console.log(`   Total Pages: ${totalPages}`);
  console.log(`   Avg Pages per Template: ${avgPages.toFixed(1)}`);
  console.log(`   Avg Conversion Rate: ${avgConversion.toFixed(1)}%`);

  console.log('\n📈 Templates by Conversion Rate:\n');
  const sorted = [...FUNNEL_TEMPLATES].sort((a, b) => b.conversionRate - a.conversionRate);
  sorted.forEach((template, index) => {
    console.log(`   ${index + 1}. ${template.name}: ${template.conversionRate}%`);
  });

  console.log('\n⏱️  Templates by Setup Time:\n');
  const sortedByTime = [...FUNNEL_TEMPLATES].sort((a, b) => {
    const timeA = parseInt(a.estimatedSetupTime);
    const timeB = parseInt(b.estimatedSetupTime);
    return timeA - timeB;
  });
  sortedByTime.forEach((template, index) => {
    console.log(`   ${index + 1}. ${template.name}: ${template.estimatedSetupTime}`);
  });

  return {
    totalTemplates: FUNNEL_TEMPLATES.length,
    totalPages,
    avgPages,
    avgConversion,
  };
}

// ============================================================================
// RUN ALL EXAMPLES
// ============================================================================

export function runAllExamples() {
  console.log('\n' + '='.repeat(60));
  console.log('FUNNEL TEMPLATE LIBRARY - EXAMPLES');
  console.log('='.repeat(60));

  example1_basicSuggestion();
  example2_aiRecommendation();
  example3_buildFromTemplate();
  example4_compareTemplates();
  example5_searchAndFilter();
  example6_extractCopyForAI();
  example7_generateFunnelJSON();
  example8_intentDetection();
  example9_selectionWizard();
  example10_batchAnalysis();

  console.log('\n' + '='.repeat(60));
  console.log('Examples completed! 🎉');
  console.log('='.repeat(60) + '\n');
}

// Uncomment to run examples:
// runAllExamples();
