/**
 * AI Element Placement - Natural Language Parser
 *
 * Converts natural language placement instructions into grid positions
 * Examples:
 * - "at the top" → { row: 0, col: 0, width: 12 }
 * - "centered" → { row: auto, col: 3, width: 6 }
 * - "on the left" → { row: auto, col: 0, width: 4 }
 */

import type { GridPosition, ElementPosition } from '../grid-system';
import {
  GridSystem,
  findOptimalPosition,
} from '../grid-system';

// ============================================================================
// TYPES
// ============================================================================

export interface PlacementIntent {
  position: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'auto';
  width: 'full' | 'half' | 'third' | 'quarter' | number;
  height?: number;
  relative?: {
    elementId: string;
    relation: 'above' | 'below' | 'beside' | 'inside';
  };
}

export interface ParsedPlacement {
  position: GridPosition;
  confidence: number; // 0-1
  alternatives: GridPosition[];
  reasoning: string;
}

// ============================================================================
// NATURAL LANGUAGE PATTERNS
// ============================================================================

const POSITION_PATTERNS = {
  top: [
    /^at the top/i,
    /^top of/i,
    /^place at top/i,
    /^add to top/i,
    /^insert at top/i,
  ],
  bottom: [
    /^at the bottom/i,
    /^bottom of/i,
    /^place at bottom/i,
    /^add to bottom/i,
    /^below everything/i,
  ],
  center: [
    /^centered?$/i,
    /^in the center/i,
    /^center of/i,
    /^middle of/i,
    /^place in center/i,
  ],
  left: [
    /^on the left/i,
    /^left side/i,
    /^align left/i,
    /^place left/i,
  ],
  right: [
    /^on the right/i,
    /^right side/i,
    /^align right/i,
    /^place right/i,
  ],
  fullWidth: [
    /^full width/i,
    /^entire width/i,
    /^across the page/i,
    /^spanning/i,
  ],
  twoColumns: [
    /^two columns?/i,
    /^split (in )?half/i,
    /^side by side/i,
    /^50\/50/i,
  ],
  threeColumns: [
    /^three columns?/i,
    /^split (in )?thirds?/i,
    /^33\/33\/33/i,
  ],
};

const RELATIVE_PATTERNS = {
  above: [/^above (the )?(.+)/i, /^over (the )?(.+)/i],
  below: [/^below (the )?(.+)/i, /^under (the )?(.+)/i, /^after (the )?(.+)/i],
  beside: [/^beside (the )?(.+)/i, /^next to (the )?(.+)/i],
  inside: [/^inside (the )?(.+)/i, /^within (the )?(.+)/i],
};

// ============================================================================
// NATURAL LANGUAGE PARSER
// ============================================================================

/**
 * Parse natural language position into grid coordinates
 */
export function parseNaturalPosition(
  input: string,
  existingElements: ElementPosition[] = [],
  defaultWidth: number = 12,
  defaultHeight: number = 2
): ParsedPlacement {
  const normalized = input.trim().toLowerCase();

  // Try to match position patterns
  for (const [position, patterns] of Object.entries(POSITION_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(normalized)) {
        return parsePositionKeyword(
          position as keyof typeof POSITION_PATTERNS,
          existingElements,
          defaultWidth,
          defaultHeight
        );
      }
    }
  }

  // Try to match relative patterns
  for (const [relation, patterns] of Object.entries(RELATIVE_PATTERNS)) {
    for (const pattern of patterns) {
      const match = normalized.match(pattern);
      if (match) {
        const targetName = match[2];
        return parseRelativePosition(
          relation as keyof typeof RELATIVE_PATTERNS,
          targetName,
          existingElements,
          defaultWidth,
          defaultHeight
        );
      }
    }
  }

  // Fallback: auto-placement
  return parseAutoPlacement(existingElements, defaultWidth, defaultHeight);
}

// ============================================================================
// POSITION KEYWORD PARSING
// ============================================================================

function parsePositionKeyword(
  keyword: keyof typeof POSITION_PATTERNS,
  existingElements: ElementPosition[],
  defaultWidth: number,
  defaultHeight: number
): ParsedPlacement {
  let position: GridPosition;
  let reasoning: string;
  const alternatives: GridPosition[] = [];

  switch (keyword) {
    case 'top':
      position = findOptimalPosition(
        defaultWidth,
        defaultHeight,
        existingElements,
        'top'
      );
      reasoning = 'Placed at the top of the page';
      break;

    case 'bottom':
      position = findOptimalPosition(
        defaultWidth,
        defaultHeight,
        existingElements,
        'bottom'
      );
      reasoning = 'Placed at the bottom after all existing elements';
      break;

    case 'center':
      position = findOptimalPosition(
        Math.min(defaultWidth, 6),
        defaultHeight,
        existingElements,
        'center'
      );
      reasoning = 'Centered horizontally with 6-column width';

      // Alternative: full-width centered
      alternatives.push(
        findOptimalPosition(12, defaultHeight, existingElements, 'center')
      );
      break;

    case 'left':
      position = findOptimalPosition(
        Math.min(defaultWidth, 4),
        defaultHeight,
        existingElements,
        'left'
      );
      reasoning = 'Aligned to the left with 4-column width';

      // Alternative: 6-column left
      alternatives.push(
        findOptimalPosition(6, defaultHeight, existingElements, 'left')
      );
      break;

    case 'right':
      position = findOptimalPosition(
        Math.min(defaultWidth, 4),
        defaultHeight,
        existingElements,
        'right'
      );
      reasoning = 'Aligned to the right with 4-column width';

      // Alternative: 6-column right
      alternatives.push(
        findOptimalPosition(6, defaultHeight, existingElements, 'right')
      );
      break;

    case 'fullWidth':
      position = findOptimalPosition(
        12,
        defaultHeight,
        existingElements,
        'auto'
      );
      reasoning = 'Full-width across all 12 columns';
      break;

    case 'twoColumns':
      // Left column
      position = findOptimalPosition(
        6,
        defaultHeight,
        existingElements,
        'left'
      );
      reasoning = 'Two-column layout: left column (6 columns wide)';

      // Right column as alternative
      alternatives.push(
        findOptimalPosition(6, defaultHeight, existingElements, 'right')
      );
      break;

    case 'threeColumns':
      // First column
      position = findOptimalPosition(
        4,
        defaultHeight,
        existingElements,
        'left'
      );
      reasoning = 'Three-column layout: first column (4 columns wide)';

      // Middle and right columns as alternatives
      alternatives.push({
        ...position,
        col: 4,
      });
      alternatives.push({
        ...position,
        col: 8,
      });
      break;

    default:
      position = findOptimalPosition(
        defaultWidth,
        defaultHeight,
        existingElements,
        'auto'
      );
      reasoning = 'Auto-placed in first available position';
  }

  return {
    position,
    confidence: 0.9,
    alternatives,
    reasoning,
  };
}

// ============================================================================
// RELATIVE POSITION PARSING
// ============================================================================

function parseRelativePosition(
  relation: keyof typeof RELATIVE_PATTERNS,
  targetName: string,
  existingElements: ElementPosition[],
  defaultWidth: number,
  defaultHeight: number
): ParsedPlacement {
  // Find target element by name or ID
  const target = findElementByName(targetName, existingElements);

  if (!target) {
    // Target not found, fallback to auto-placement
    return {
      ...parseAutoPlacement(existingElements, defaultWidth, defaultHeight),
      confidence: 0.5,
      reasoning: `Could not find "${targetName}", placed automatically`,
    };
  }

  let position: GridPosition;
  let reasoning: string;

  switch (relation) {
    case 'above':
      position = {
        row: Math.max(0, target.row - defaultHeight),
        col: target.col,
        width: Math.min(defaultWidth, target.width),
        height: defaultHeight,
      };
      reasoning = `Placed above "${targetName}"`;
      break;

    case 'below':
      position = {
        row: target.row + target.height,
        col: target.col,
        width: Math.min(defaultWidth, target.width),
        height: defaultHeight,
      };
      reasoning = `Placed below "${targetName}"`;
      break;

    case 'beside':
      // Try to place on the right
      const rightCol = target.col + target.width;
      if (rightCol + defaultWidth <= GridSystem.COLUMNS) {
        position = {
          row: target.row,
          col: rightCol,
          width: defaultWidth,
          height: defaultHeight,
        };
        reasoning = `Placed beside "${targetName}" on the right`;
      } else {
        // Place below if can't fit beside
        position = {
          row: target.row + target.height,
          col: 0,
          width: defaultWidth,
          height: defaultHeight,
        };
        reasoning = `Could not fit beside "${targetName}", placed below`;
      }
      break;

    case 'inside':
      // Place inside the target element (useful for containers)
      position = {
        row: target.row,
        col: target.col,
        width: Math.min(defaultWidth, target.width),
        height: Math.min(defaultHeight, target.height),
      };
      reasoning = `Placed inside "${targetName}"`;
      break;

    default:
      position = findOptimalPosition(
        defaultWidth,
        defaultHeight,
        existingElements,
        'auto'
      );
      reasoning = 'Auto-placed in first available position';
  }

  // Ensure position is valid
  const clampedPosition = GridSystem.clampToGrid(position);

  return {
    position: clampedPosition,
    confidence: 0.85,
    alternatives: [],
    reasoning,
  };
}

// ============================================================================
// AUTO PLACEMENT
// ============================================================================

function parseAutoPlacement(
  existingElements: ElementPosition[],
  defaultWidth: number,
  defaultHeight: number
): ParsedPlacement {
  const position = findOptimalPosition(
    defaultWidth,
    defaultHeight,
    existingElements,
    'auto'
  );

  return {
    position,
    confidence: 1.0,
    alternatives: [],
    reasoning: 'Auto-placed in first available position',
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Find element by name or ID (fuzzy match)
 */
function findElementByName(
  name: string,
  elements: ElementPosition[]
): ElementPosition | undefined {
  const normalized = name.toLowerCase().trim();

  // Exact ID match
  const exactMatch = elements.find(
    (el) => el.elementId.toLowerCase() === normalized
  );
  if (exactMatch) return exactMatch;

  // Fuzzy name match (if elements had names)
  // For now, just return undefined
  return undefined;
}

// ============================================================================
// ELEMENT TYPE DEFAULTS
// ============================================================================

/**
 * Get default dimensions for element types from Cycle 5
 */
export function getElementTypeDefaults(elementType: string): {
  width: number;
  height: number;
} {
  const defaults: Record<string, { width: number; height: number }> = {
    // TEXT ELEMENTS
    headline: { width: 12, height: 2 },
    subheadline: { width: 12, height: 1 },
    paragraph: { width: 12, height: 3 },
    bullet_list: { width: 12, height: 3 },
    testimonial_text: { width: 12, height: 3 },

    // MEDIA ELEMENTS
    image: { width: 6, height: 4 },
    video: { width: 8, height: 5 },
    audio_player: { width: 12, height: 2 },
    image_gallery: { width: 12, height: 6 },
    background_video: { width: 12, height: 8 },

    // FORM ELEMENTS
    input_field: { width: 6, height: 1 },
    textarea: { width: 12, height: 3 },
    select_dropdown: { width: 6, height: 1 },
    checkbox: { width: 12, height: 1 },
    radio_buttons: { width: 12, height: 2 },
    submit_button: { width: 4, height: 1 },
    multi_step_form: { width: 12, height: 8 },

    // COMMERCE ELEMENTS
    pricing_table: { width: 12, height: 8 },
    buy_button: { width: 4, height: 1 },
    product_card: { width: 4, height: 6 },
    cart_summary: { width: 4, height: 6 },
    order_bump_checkbox: { width: 12, height: 2 },
    coupon_code_input: { width: 6, height: 1 },

    // SOCIAL PROOF ELEMENTS
    testimonial_card: { width: 4, height: 4 },
    review_stars: { width: 6, height: 1 },
    trust_badges: { width: 12, height: 2 },
    social_media_feed: { width: 6, height: 8 },
    customer_count_ticker: { width: 6, height: 2 },

    // URGENCY ELEMENTS
    countdown_timer: { width: 6, height: 2 },
    stock_counter: { width: 6, height: 1 },
    limited_offer_banner: { width: 12, height: 2 },
    exit_intent_popup: { width: 8, height: 6 },

    // INTERACTIVE ELEMENTS
    faq_accordion: { width: 12, height: 6 },
    tabs: { width: 12, height: 5 },
    progress_bar: { width: 12, height: 1 },
    quiz_survey: { width: 12, height: 8 },
    calendar_booking: { width: 8, height: 8 },
    live_chat_widget: { width: 4, height: 6 },
  };

  return defaults[elementType] || { width: 12, height: 2 };
}

// ============================================================================
// SMART SUGGESTIONS
// ============================================================================

/**
 * Generate placement suggestions based on page layout
 */
export function generatePlacementSuggestions(
  elementType: string,
  existingElements: ElementPosition[]
): ParsedPlacement[] {
  const defaults = getElementTypeDefaults(elementType);
  const suggestions: ParsedPlacement[] = [];

  // Suggestion 1: At the top
  suggestions.push(
    parsePositionKeyword('top', existingElements, defaults.width, defaults.height)
  );

  // Suggestion 2: At the bottom
  suggestions.push(
    parsePositionKeyword('bottom', existingElements, defaults.width, defaults.height)
  );

  // Suggestion 3: Centered
  suggestions.push(
    parsePositionKeyword('center', existingElements, defaults.width, defaults.height)
  );

  return suggestions;
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export const ElementPlacement = {
  parseNaturalPosition,
  getElementTypeDefaults,
  generatePlacementSuggestions,
};
