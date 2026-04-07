/**
 * Virtualization Engine — O(1) Rendering Window Calculation
 *
 * Dynamic list virtualization optimizes rendering by computing which items
 * are visible in the viewport and only rendering those (+ buffer).
 *
 * Time Complexity: O(1) — constant time calculation regardless of total items
 * Space Complexity: O(K) where K = visibleNodesCount + bufferCount (typically 10-20 items)
 *
 * Benefits:
 * ✅ Render 1000+ item lists with <50 DOM nodes
 * ✅ Smooth 60fps scrolling even on low-end devices
 * ✅ Reduced memory footprint and garbage collection pressure
 * ✅ No janky layout thrashing
 *
 * Security Note:
 * XSS Risk: Raw data mapped to [startIndex, endIndex] must be sanitized
 * before DOM injection. Use React's automatic escaping or DOMPurify.
 */

/**
 * Parameters for O(1) virtualization calculation
 * All measurements in pixels; indices as integers
 */
export interface VirtualizationParams {
  readonly scrollTop: number;        // Current scroll position (px)
  readonly viewportHeight: number;   // Visible area height (px)
  readonly itemHeight: number;       // Fixed height per item (px)
  readonly totalItems: number;       // Total number of items in dataset
  readonly bufferCount?: number;     // Items to render outside viewport (default: 2)
}

/**
 * Result of O(1) calculation
 * Provides rendering bounds and transform offset
 */
export interface VirtualizationResult {
  readonly startIndex: number;       // First item to render
  readonly endIndex: number;         // Last item to render (inclusive)
  readonly offsetY: number;          // CSS transform translateY (px)
  readonly totalHeight: number;      // Spacer height for scrollbar math
  readonly visibleCount: number;     // Number of items to render
}

/**
 * Calculate O(1) rendering window for virtualized scrolling
 *
 * Algorithm:
 * 1. Clamp scroll position to [0, maxScroll]
 * 2. Calculate startIndex = floor(scrollTop / itemHeight)
 * 3. Calculate visibleCount = ceil(viewportHeight / itemHeight)
 * 4. Apply buffer zone before/after visible area
 * 5. Return bounded indices and transform offset
 *
 * Time Complexity: O(1) — only arithmetic operations
 * Space Complexity: O(1) — constant output
 *
 * @param params - Virtualization configuration
 * @returns Rendering window with bounds and offset
 *
 * @example
 * ```typescript
 * const result = calculateO1RenderWindow({
 *   scrollTop: 1000,
 *   viewportHeight: 600,
 *   itemHeight: 100,
 *   totalItems: 10000,
 *   bufferCount: 3,
 * });
 * // Result:
 * // startIndex: 7 (first item to render)
 * // endIndex: 16 (last item to render)
 * // offsetY: 700 (transform translateY)
 * // Only 10 DOM nodes rendered instead of 10000
 * ```
 */
export function calculateO1RenderWindow(
  params: VirtualizationParams
): VirtualizationResult {
  const buffer = params.bufferCount ?? 2;
  const totalHeight = params.totalItems * params.itemHeight;

  // Clamp scroll position to valid range
  const maxScrollTop = Math.max(0, totalHeight - params.viewportHeight);
  const clampedScrollTop = Math.min(Math.max(0, params.scrollTop), maxScrollTop);

  // Calculate which item is at the top of the viewport
  const startIndex = Math.floor(clampedScrollTop / params.itemHeight);

  // Calculate how many items fit in the viewport
  const visibleNodesCount = Math.ceil(params.viewportHeight / params.itemHeight);

  // Apply buffer zone: render extra items above/below viewport
  const bufferedStartIndex = Math.max(0, startIndex - buffer);
  const bufferedEndIndex = Math.min(
    params.totalItems - 1,
    startIndex + visibleNodesCount + buffer
  );

  // Calculate pixel offset for positioning
  // This maintains scroll illusion while keeping active DOM nodes fixed
  const offsetY = bufferedStartIndex * params.itemHeight;

  const visibleCount = bufferedEndIndex - bufferedStartIndex + 1;

  return {
    startIndex: bufferedStartIndex,
    endIndex: bufferedEndIndex,
    offsetY,
    totalHeight,
    visibleCount,
  };
}

/**
 * Validate virtualization parameters
 * Throws on invalid configuration
 */
export function validateVirtualizationParams(
  params: VirtualizationParams
): void {
  if (params.scrollTop < 0) {
    throw new Error('scrollTop must be >= 0');
  }
  if (params.viewportHeight <= 0) {
    throw new Error('viewportHeight must be > 0');
  }
  if (params.itemHeight <= 0) {
    throw new Error('itemHeight must be > 0');
  }
  if (params.totalItems < 0) {
    throw new Error('totalItems must be >= 0');
  }
  if (params.bufferCount && params.bufferCount < 0) {
    throw new Error('bufferCount must be >= 0');
  }
}

/**
 * Calculate how many pixels to scroll before next virtualization update
 * Prevents excessive recalculations
 */
export function getScrollThreshold(itemHeight: number): number {
  // Update every half-item height (smooth scrolling)
  return itemHeight / 2;
}
