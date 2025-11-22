/**
 * Grid Overlay Component
 *
 * Visual 12-column grid overlay for the funnel builder editor.
 * Shows grid lines, highlights suggested positions, and provides visual feedback
 * for element placement.
 */

import { useState } from 'react';
import type { GridPosition, ElementPosition } from '@/lib/grid-system';
import { GridSystem } from '@/lib/grid-system';

// ============================================================================
// TYPES
// ============================================================================

interface GridOverlayProps {
  show: boolean;
  suggestedPositions?: GridPosition[];
  currentElements?: ElementPosition[];
  highlightedPosition?: GridPosition;
  onGridClick?: (position: GridPosition) => void;
  className?: string;
}

// ============================================================================
// GRID OVERLAY COMPONENT
// ============================================================================

export function GridOverlay({
  show,
  suggestedPositions = [],
  currentElements = [],
  highlightedPosition,
  onGridClick,
  className = '',
}: GridOverlayProps) {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(
    null
  );

  // Don't render if not shown
  if (!show) return null;

  // Calculate grid rows based on existing elements
  const maxRow = Math.max(
    10, // minimum 10 rows
    ...currentElements.map((el) => el.row + el.height),
    ...(highlightedPosition ? [highlightedPosition.row + highlightedPosition.height] : [])
  );

  const rows = Array.from({ length: maxRow }, (_, i) => i);
  const cols = Array.from({ length: GridSystem.COLUMNS }, (_, i) => i);

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const isPositionOccupied = (row: number, col: number): boolean => {
    return currentElements.some(
      (el) =>
        row >= el.row &&
        row < el.row + el.height &&
        col >= el.col &&
        col < el.col + el.width
    );
  };

  const isSuggestedPosition = (row: number, col: number): boolean => {
    return suggestedPositions.some(
      (pos) =>
        row >= pos.row &&
        row < pos.row + pos.height &&
        col >= pos.col &&
        col < pos.col + pos.width
    );
  };

  const isHighlightedPosition = (row: number, col: number): boolean => {
    if (!highlightedPosition) return false;
    return (
      row >= highlightedPosition.row &&
      row < highlightedPosition.row + highlightedPosition.height &&
      col >= highlightedPosition.col &&
      col < highlightedPosition.col + highlightedPosition.width
    );
  };

  const handleCellClick = (row: number, col: number) => {
    if (onGridClick) {
      // Create a default 1x1 position at clicked cell
      onGridClick({ row, col, width: 1, height: 1 });
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-50 ${className}`}
      style={{
        paddingLeft: `${GridSystem.PADDING}px`,
        paddingRight: `${GridSystem.PADDING}px`,
        paddingTop: `${GridSystem.PADDING}px`,
      }}
    >
      {/* Grid Lines */}
      <div className="relative h-full w-full">
        {/* Vertical Column Lines */}
        <div className="absolute inset-0 flex justify-between">
          {cols.map((col) => (
            <div
              key={`col-${col}`}
              className="border-l border-blue-200 dark:border-blue-800"
              style={{
                width: `calc((100% - ${(GridSystem.COLUMNS - 1) * GridSystem.GAP}px) / ${GridSystem.COLUMNS})`,
                marginRight: col < GridSystem.COLUMNS - 1 ? `${GridSystem.GAP}px` : 0,
              }}
            >
              {/* Column Label */}
              <div className="text-xs text-blue-400 dark:text-blue-600 p-1">
                {col + 1}
              </div>
            </div>
          ))}
        </div>

        {/* Horizontal Row Lines & Interactive Cells */}
        <div className="absolute inset-0">
          {rows.map((row) => (
            <div
              key={`row-${row}`}
              className="flex"
              style={{
                height: `${GridSystem.ROW_HEIGHT}px`,
                marginBottom: row < rows.length - 1 ? `${GridSystem.GAP}px` : 0,
              }}
            >
              {cols.map((col) => {
                const occupied = isPositionOccupied(row, col);
                const suggested = isSuggestedPosition(row, col);
                const highlighted = isHighlightedPosition(row, col);
                const hovered =
                  hoveredCell?.row === row && hoveredCell?.col === col;

                let cellClasses = 'border border-blue-100 dark:border-blue-900 transition-all duration-150';

                if (highlighted) {
                  cellClasses =
                    'border-2 border-green-400 bg-green-100/50 dark:border-green-600 dark:bg-green-900/30';
                } else if (suggested) {
                  cellClasses =
                    'border border-yellow-300 bg-yellow-100/30 dark:border-yellow-600 dark:bg-yellow-900/20';
                } else if (occupied) {
                  cellClasses =
                    'border border-gray-200 bg-gray-100/50 dark:border-gray-700 dark:bg-gray-800/30';
                } else if (hovered) {
                  cellClasses =
                    'border border-blue-300 bg-blue-100/30 dark:border-blue-600 dark:bg-blue-900/20';
                }

                return (
                  <div
                    key={`cell-${row}-${col}`}
                    className={`pointer-events-auto ${cellClasses}`}
                    style={{
                      width: `calc((100% - ${(GridSystem.COLUMNS - 1) * GridSystem.GAP}px) / ${GridSystem.COLUMNS})`,
                      marginRight:
                        col < GridSystem.COLUMNS - 1 ? `${GridSystem.GAP}px` : 0,
                    }}
                    onMouseEnter={() => setHoveredCell({ row, col })}
                    onMouseLeave={() => setHoveredCell(null)}
                    onClick={() => handleCellClick(row, col)}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Highlighted Position Border */}
        {highlightedPosition && (
          <HighlightedPositionOutline position={highlightedPosition} />
        )}

        {/* Suggested Positions Outlines */}
        {suggestedPositions.map((position, index) => (
          <SuggestedPositionOutline
            key={`suggestion-${index}`}
            position={position}
            index={index}
          />
        ))}
      </div>

      {/* Legend */}
      <GridLegend />
    </div>
  );
}

// ============================================================================
// HIGHLIGHTED POSITION OUTLINE
// ============================================================================

function HighlightedPositionOutline({ position }: { position: GridPosition }) {
  const pixels = GridSystem.gridToPixels(position);

  return (
    <div
      className="pointer-events-none absolute border-4 border-green-500 bg-green-100/20 dark:border-green-400 dark:bg-green-900/20 rounded-md animate-pulse"
      style={{
        left: `${pixels.x}%`,
        top: `${pixels.y}px`,
        width: `${pixels.width}%`,
        height: `${pixels.height}px`,
      }}
    >
      <div className="absolute -top-6 left-0 text-xs font-medium text-green-600 dark:text-green-400 bg-white dark:bg-gray-900 px-2 py-1 rounded shadow">
        {position.width} × {position.height}
      </div>
    </div>
  );
}

// ============================================================================
// SUGGESTED POSITION OUTLINE
// ============================================================================

function SuggestedPositionOutline({
  position,
  index,
}: {
  position: GridPosition;
  index: number;
}) {
  const pixels = GridSystem.gridToPixels(position);

  return (
    <div
      className="pointer-events-none absolute border-2 border-dashed border-yellow-400 bg-yellow-100/10 dark:border-yellow-500 dark:bg-yellow-900/10 rounded-md"
      style={{
        left: `${pixels.x}%`,
        top: `${pixels.y}px`,
        width: `${pixels.width}%`,
        height: `${pixels.height}px`,
      }}
    >
      <div className="absolute -top-6 left-0 text-xs font-medium text-yellow-600 dark:text-yellow-400 bg-white dark:bg-gray-900 px-2 py-1 rounded shadow">
        Suggestion {index + 1}
      </div>
    </div>
  );
}

// ============================================================================
// GRID LEGEND
// ============================================================================

function GridLegend() {
  return (
    <div className="pointer-events-auto absolute bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 text-xs border border-gray-200 dark:border-gray-700">
      <div className="font-medium mb-2 text-gray-700 dark:text-gray-300">
        Grid Legend
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-green-400 bg-green-100/50 rounded" />
          <span className="text-gray-600 dark:text-gray-400">
            Selected Position
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border border-dashed border-yellow-400 bg-yellow-100/30 rounded" />
          <span className="text-gray-600 dark:text-gray-400">
            Suggested Position
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border border-gray-200 bg-gray-100/50 rounded" />
          <span className="text-gray-600 dark:text-gray-400">
            Occupied Space
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border border-blue-100 rounded" />
          <span className="text-gray-600 dark:text-gray-400">
            Available Space
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EXPORT
// ============================================================================

export default GridOverlay;
