/**
 * Funnel View Store
 *
 * Manages view preference (grid/list) for funnel dashboard with localStorage persistence.
 */

import { persistentAtom } from '@nanostores/persistent';

export type ViewMode = 'grid' | 'list';

/**
 * Persistent view mode preference (stored in localStorage)
 */
export const viewMode$ = persistentAtom<ViewMode>('funnel-view-mode', 'grid', {
  encode: (value) => value,
  decode: (value) => (value === 'list' ? 'list' : 'grid'),
});

/**
 * Toggle between grid and list view
 */
export function toggleViewMode() {
  const current = viewMode$.get();
  viewMode$.set(current === 'grid' ? 'list' : 'grid');
}

/**
 * Set view mode explicitly
 */
export function setViewMode(mode: ViewMode) {
  viewMode$.set(mode);
}
