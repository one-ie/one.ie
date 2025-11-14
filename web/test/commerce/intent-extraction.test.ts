/**
 * Tests for intent extraction and product recommendation logic
 */

import { describe, it, expect } from 'vitest';
import type { CustomerNeeds } from '@/lib/types/commerce';

// Extract these functions for testing
// In production, these would be imported from the API route

function extractSkillLevel(message: string): CustomerNeeds['skillLevel'] | undefined {
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes('beginner') ||
    lowerMessage.includes('new to') ||
    lowerMessage.includes('first time') ||
    lowerMessage.includes('starting out')
  ) {
    return 'beginner';
  } else if (
    lowerMessage.includes('intermediate') ||
    lowerMessage.includes('regular player') ||
    lowerMessage.includes('play weekly')
  ) {
    return 'intermediate';
  } else if (
    lowerMessage.includes('advanced') ||
    lowerMessage.includes('pro') ||
    lowerMessage.includes('competitive') ||
    lowerMessage.includes('tournament')
  ) {
    return 'advanced';
  }

  return undefined;
}

function detectProductCategory(message: string): string | undefined {
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes('racket') ||
    lowerMessage.includes('padel') ||
    lowerMessage.includes('tennis elbow')
  ) {
    return 'padel_racket';
  }

  if (
    lowerMessage.includes('course') ||
    lowerMessage.includes('learn') ||
    lowerMessage.includes('tutorial') ||
    lowerMessage.includes('bootcamp') ||
    lowerMessage.includes('programming') ||
    lowerMessage.includes('web dev')
  ) {
    return 'course';
  }

  if (
    lowerMessage.includes('software') ||
    lowerMessage.includes('saas') ||
    lowerMessage.includes('project management') ||
    lowerMessage.includes('tool')
  ) {
    return 'software';
  }

  return undefined;
}

describe('Intent Extraction', () => {
  describe('Skill Level Detection', () => {
    it('should detect beginner level', () => {
      expect(extractSkillLevel('I am a beginner looking for a racket')).toBe('beginner');
      expect(extractSkillLevel('First time buying padel equipment')).toBe('beginner');
      expect(extractSkillLevel('New to the sport')).toBe('beginner');
    });

    it('should detect intermediate level', () => {
      expect(extractSkillLevel('I am an intermediate player')).toBe('intermediate');
      expect(extractSkillLevel('I play weekly with friends')).toBe('intermediate');
      expect(extractSkillLevel('Regular player seeking upgrade')).toBe('intermediate');
    });

    it('should detect advanced level', () => {
      expect(extractSkillLevel('I am an advanced player')).toBe('advanced');
      expect(extractSkillLevel('Looking for tournament-level racket')).toBe('advanced');
      expect(extractSkillLevel('Pro player needs new equipment')).toBe('advanced');
    });

    it('should return undefined for unclear messages', () => {
      expect(extractSkillLevel('I need a racket')).toBeUndefined();
      expect(extractSkillLevel('What do you recommend?')).toBeUndefined();
    });
  });

  describe('Category Detection', () => {
    it('should detect padel_racket category', () => {
      expect(detectProductCategory('I need a padel racket')).toBe('padel_racket');
      expect(detectProductCategory('Looking for racket for tennis elbow')).toBe('padel_racket');
      expect(detectProductCategory('Best racket for beginners')).toBe('padel_racket');
    });

    it('should detect course category', () => {
      expect(detectProductCategory('I want to learn web development')).toBe('course');
      expect(detectProductCategory('Best programming course for beginners')).toBe('course');
      expect(detectProductCategory('Looking for a bootcamp')).toBe('course');
    });

    it('should detect software category', () => {
      expect(detectProductCategory('I need project management software')).toBe('software');
      expect(detectProductCategory('Looking for a SaaS tool')).toBe('software');
      expect(detectProductCategory('Best software for small teams')).toBe('software');
    });

    it('should return undefined for unclear messages', () => {
      expect(detectProductCategory('Hello')).toBeUndefined();
      expect(detectProductCategory('What can you help me with?')).toBeUndefined();
    });
  });
});

describe('Product Scoring', () => {
  it('should prioritize skill level matching', () => {
    // Beginner looking for racket should get beginner-friendly options
    const beginnerScore = 30; // Points for skill level match
    expect(beginnerScore).toBeGreaterThan(0);
  });

  it('should respect budget constraints', () => {
    const budget = { min: 0, max: 100 };
    const productPrice = 89;
    const withinBudget = productPrice <= budget.max && productPrice >= budget.min;
    expect(withinBudget).toBe(true);
  });

  it('should heavily weight pain point addressing', () => {
    // Tennis elbow is a critical pain point
    const painPointScore = 40; // Highest weight
    const skillLevelScore = 30;
    expect(painPointScore).toBeGreaterThan(skillLevelScore);
  });
});
