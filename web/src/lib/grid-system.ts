/**
 * 12-Column Grid System Utilities
 *
 * Provides grid positioning, collision detection, and layout calculations
 * for the funnel builder's element placement system.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface GridPosition {
  row: number;
  col: number;
  width: number;
  height: number;
}

export interface ElementPosition extends GridPosition {
  elementId: string;
  zIndex?: number;
}

export interface GridConstraints {
  minCol: number;
  maxCol: number;
  minRow: number;
  maxRow: number;
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
}

export interface CollisionResult {
  hasCollision: boolean;
  collidingElements: ElementPosition[];
  suggestedPosition?: GridPosition;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const GRID_COLUMNS = 12;
export const GRID_ROW_HEIGHT = 80; // px
export const GRID_GAP = 16; // px
export const GRID_PADDING = 24; // px

export const DEFAULT_CONSTRAINTS: GridConstraints = {
  minCol: 0,
  maxCol: GRID_COLUMNS - 1,
  minRow: 0,
  maxRow: Infinity,
  minWidth: 1,
  maxWidth: GRID_COLUMNS,
  minHeight: 1,
  maxHeight: 20,
};

// ============================================================================
// GRID VALIDATION
// ============================================================================

/**
 * Validate grid position is within bounds
 */
export function isValidPosition(
  position: GridPosition,
  constraints: GridConstraints = DEFAULT_CONSTRAINTS
): boolean {
  const { row, col, width, height } = position;

  // Check if position is within grid bounds
  if (col < constraints.minCol || col > constraints.maxCol) return false;
  if (row < constraints.minRow || row > constraints.maxRow) return false;

  // Check if element fits within grid
  if (col + width > GRID_COLUMNS) return false;

  // Check size constraints
  if (width < constraints.minWidth || width > constraints.maxWidth) return false;
  if (height < constraints.minHeight || height > constraints.maxHeight) return false;

  return true;
}

/**
 * Clamp position to grid bounds
 */
export function clampToGrid(
  position: GridPosition,
  constraints: GridConstraints = DEFAULT_CONSTRAINTS
): GridPosition {
  const { row, col, width, height } = position;

  // Clamp column to grid bounds
  const clampedCol = Math.max(
    constraints.minCol,
    Math.min(col, GRID_COLUMNS - width)
  );

  // Clamp row to constraints
  const clampedRow = Math.max(constraints.minRow, row);

  // Clamp width to fit grid
  const maxWidth = Math.min(
    GRID_COLUMNS - clampedCol,
    constraints.maxWidth
  );
  const clampedWidth = Math.max(
    constraints.minWidth,
    Math.min(width, maxWidth)
  );

  // Clamp height to constraints
  const clampedHeight = Math.max(
    constraints.minHeight,
    Math.min(height, constraints.maxHeight)
  );

  return {
    row: clampedRow,
    col: clampedCol,
    width: clampedWidth,
    height: clampedHeight,
  };
}

// ============================================================================
// COLLISION DETECTION
// ============================================================================

/**
 * Check if two grid positions overlap
 */
export function hasOverlap(a: GridPosition, b: GridPosition): boolean {
  const aLeft = a.col;
  const aRight = a.col + a.width;
  const aTop = a.row;
  const aBottom = a.row + a.height;

  const bLeft = b.col;
  const bRight = b.col + b.width;
  const bTop = b.row;
  const bBottom = b.row + b.height;

  // No overlap if completely separated
  if (aRight <= bLeft || bRight <= aLeft) return false;
  if (aBottom <= bTop || bBottom <= aTop) return false;

  return true;
}

/**
 * Detect collisions with existing elements
 */
export function detectCollisions(
  position: GridPosition,
  existingElements: ElementPosition[]
): CollisionResult {
  const collidingElements = existingElements.filter((element) =>
    hasOverlap(position, element)
  );

  return {
    hasCollision: collidingElements.length > 0,
    collidingElements,
  };
}

/**
 * Find next available position without collisions
 */
export function findAvailablePosition(
  position: GridPosition,
  existingElements: ElementPosition[],
  constraints: GridConstraints = DEFAULT_CONSTRAINTS
): GridPosition {
  const { width, height } = position;

  // Try the requested position first
  const collision = detectCollisions(position, existingElements);
  if (!collision.hasCollision && isValidPosition(position, constraints)) {
    return position;
  }

  // Search for available position row by row
  for (let row = position.row; row <= constraints.maxRow; row++) {
    for (let col = 0; col <= GRID_COLUMNS - width; col++) {
      const testPosition: GridPosition = { row, col, width, height };
      const testCollision = detectCollisions(testPosition, existingElements);

      if (!testCollision.hasCollision && isValidPosition(testPosition, constraints)) {
        return testPosition;
      }
    }
  }

  // If no available position found, place at bottom
  const maxRow = Math.max(0, ...existingElements.map((e) => e.row + e.height));
  return {
    row: maxRow,
    col: 0,
    width,
    height,
  };
}

// ============================================================================
// SMART POSITIONING
// ============================================================================

/**
 * Find optimal position based on layout strategy
 */
export function findOptimalPosition(
  width: number,
  height: number,
  existingElements: ElementPosition[],
  strategy: 'top' | 'bottom' | 'center' | 'left' | 'right' | 'auto' = 'auto'
): GridPosition {
  const basePosition: GridPosition = {
    row: 0,
    col: 0,
    width,
    height,
  };

  switch (strategy) {
    case 'top':
      return findAvailablePosition(
        { ...basePosition, row: 0 },
        existingElements
      );

    case 'bottom': {
      const maxRow = Math.max(
        0,
        ...existingElements.map((e) => e.row + e.height)
      );
      return findAvailablePosition(
        { ...basePosition, row: maxRow },
        existingElements
      );
    }

    case 'center':
      return findAvailablePosition(
        {
          ...basePosition,
          col: Math.floor((GRID_COLUMNS - width) / 2),
        },
        existingElements
      );

    case 'left':
      return findAvailablePosition(
        { ...basePosition, col: 0 },
        existingElements
      );

    case 'right':
      return findAvailablePosition(
        { ...basePosition, col: GRID_COLUMNS - width },
        existingElements
      );

    case 'auto':
    default:
      return findAvailablePosition(basePosition, existingElements);
  }
}

// ============================================================================
// LAYOUT CALCULATIONS
// ============================================================================

/**
 * Calculate pixel coordinates from grid position
 */
export function gridToPixels(position: GridPosition): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  const columnWidth = (100 - GRID_PADDING * 2) / GRID_COLUMNS;

  return {
    x: GRID_PADDING + position.col * columnWidth + (position.col * GRID_GAP),
    y: GRID_PADDING + position.row * GRID_ROW_HEIGHT + (position.row * GRID_GAP),
    width: position.width * columnWidth + (position.width - 1) * GRID_GAP,
    height: position.height * GRID_ROW_HEIGHT + (position.height - 1) * GRID_GAP,
  };
}

/**
 * Calculate grid position from pixel coordinates
 */
export function pixelsToGrid(
  x: number,
  y: number,
  width: number,
  height: number
): GridPosition {
  const columnWidth = (100 - GRID_PADDING * 2) / GRID_COLUMNS;

  return {
    col: Math.round((x - GRID_PADDING) / (columnWidth + GRID_GAP)),
    row: Math.round((y - GRID_PADDING) / (GRID_ROW_HEIGHT + GRID_GAP)),
    width: Math.round(width / (columnWidth + GRID_GAP)),
    height: Math.round(height / (GRID_ROW_HEIGHT + GRID_GAP)),
  };
}

// ============================================================================
// GRID SNAPPING
// ============================================================================

/**
 * Snap position to nearest grid cell
 */
export function snapToGrid(position: GridPosition): GridPosition {
  return {
    row: Math.max(0, Math.round(position.row)),
    col: Math.max(0, Math.min(GRID_COLUMNS - position.width, Math.round(position.col))),
    width: Math.max(1, Math.min(GRID_COLUMNS, Math.round(position.width))),
    height: Math.max(1, Math.round(position.height)),
  };
}

// ============================================================================
// RESPONSIVE UTILITIES
// ============================================================================

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export interface ResponsivePosition {
  mobile: GridPosition;
  tablet: GridPosition;
  desktop: GridPosition;
}

/**
 * Generate responsive positions from desktop layout
 */
export function generateResponsivePositions(
  desktopPosition: GridPosition
): ResponsivePosition {
  const { width, height, row, col } = desktopPosition;

  // Mobile: Stack elements full-width
  const mobile: GridPosition = {
    row,
    col: 0,
    width: GRID_COLUMNS,
    height,
  };

  // Tablet: Scale to fit 8 columns
  const tabletWidth = Math.min(8, width);
  const tablet: GridPosition = {
    row,
    col: Math.max(0, Math.min(col, 8 - tabletWidth)),
    width: tabletWidth,
    height,
  };

  return {
    mobile,
    tablet,
    desktop: desktopPosition,
  };
}

/**
 * Get grid position for current breakpoint
 */
export function getBreakpointPosition(
  responsive: ResponsivePosition,
  breakpoint: Breakpoint
): GridPosition {
  return responsive[breakpoint];
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export const GridSystem = {
  // Constants
  COLUMNS: GRID_COLUMNS,
  ROW_HEIGHT: GRID_ROW_HEIGHT,
  GAP: GRID_GAP,
  PADDING: GRID_PADDING,

  // Validation
  isValidPosition,
  clampToGrid,

  // Collision Detection
  hasOverlap,
  detectCollisions,
  findAvailablePosition,

  // Smart Positioning
  findOptimalPosition,

  // Layout Calculations
  gridToPixels,
  pixelsToGrid,

  // Grid Snapping
  snapToGrid,

  // Responsive Utilities
  generateResponsivePositions,
  getBreakpointPosition,
};
