/**
 * useVirtualization Hook — O(1) Virtualized Scroll Management
 *
 * Custom React hook managing virtualization state and scroll event handling
 * Type-safe with memoization to prevent unnecessary recalculations
 *
 * Time Complexity: O(1) per scroll event
 * Space Complexity: O(1) hook state
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  calculateO1RenderWindow,
  getScrollThreshold,
  VirtualizationParams,
  VirtualizationResult,
} from '@/lib/utils/virtualization';

/**
 * Hook configuration
 */
export interface UseVirtualizationOptions {
  itemHeight: number;
  totalItems: number;
  viewport?: HTMLElement | null;
  bufferCount?: number;
  onScrollEnd?: () => void; // Called when user scrolls near bottom
  scrollEndThreshold?: number; // How close to bottom (default: 500px)
}

/**
 * Hook return value with rendering metadata
 */
export interface UseVirtualizationResult {
  renderStart: number;
  renderEnd: number;
  offsetY: number;
  totalHeight: number;
  visibleCount: number;
  scrollTop: number;
  isBusy: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
  contentRef: React.RefObject<HTMLDivElement>;
}

export function useVirtualization({
  itemHeight,
  totalItems,
  viewport,
  bufferCount = 2,
  onScrollEnd,
  scrollEndThreshold = 500,
}: UseVirtualizationOptions): UseVirtualizationResult {
  // Track scroll position
  const [scrollTop, setScrollTop] = useState(0);

  // Loading state for infinite scroll
  const [isBusy, setIsBusy] = useState(false);

  // Container references for DOM access
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Memoized calculation result
  const [result, setResult] = useState<VirtualizationResult>({
    startIndex: 0,
    endIndex: 0,
    offsetY: 0,
    totalHeight: itemHeight * totalItems,
    visibleCount: 0,
  });

  // Track last scroll threshold to avoid excessive updates
  const lastScrollUpdateRef = useRef(0);

  /**
   * Handle scroll events with throttling
   * Time Complexity: O(1)
   */
  const handleScroll = useCallback(
    (e: Event) => {
      const target = e.target as HTMLElement;
      const newScrollTop = target.scrollTop;

      // Throttle: only update if threshold passed
      const threshold = getScrollThreshold(itemHeight);
      if (Math.abs(newScrollTop - lastScrollUpdateRef.current) < threshold) {
        return;
      }

      lastScrollUpdateRef.current = newScrollTop;
      setScrollTop(newScrollTop);

      // Calculate virtualization window
      const viewportHeight = target.clientHeight;
      const params: VirtualizationParams = {
        scrollTop: newScrollTop,
        viewportHeight,
        itemHeight,
        totalItems,
        bufferCount,
      };

      const newResult = calculateO1RenderWindow(params);
      setResult(newResult);

      // Trigger infinite scroll callback when near bottom
      if (onScrollEnd) {
        const scrolledPercentage =
          (newScrollTop + viewportHeight) / newResult.totalHeight;
        if (scrolledPercentage > 0.8 && !isBusy) {
          // User is 80% down the list
          setIsBusy(true);
          onScrollEnd();
        }
      }
    },
    [itemHeight, totalItems, bufferCount, onScrollEnd, isBusy]
  );

  /**
   * Attach scroll listener to container
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  /**
   * Initial calculation on mount
   */
  useEffect(() => {
    if (!containerRef.current) return;

    const params: VirtualizationParams = {
      scrollTop: 0,
      viewportHeight: containerRef.current.clientHeight,
      itemHeight,
      totalItems,
      bufferCount,
    };

    setResult(calculateO1RenderWindow(params));
  }, [itemHeight, totalItems, bufferCount]);

  return {
    renderStart: result.startIndex,
    renderEnd: result.endIndex,
    offsetY: result.offsetY,
    totalHeight: result.totalHeight,
    visibleCount: result.visibleCount,
    scrollTop,
    isBusy,
    containerRef,
    contentRef,
  };
}

/**
 * Utility hook to reset busy state after async operation
 */
export function useBusyReset(
  isBusy: boolean,
  onBusyChange?: (busy: boolean) => void
) {
  useEffect(() => {
    if (!isBusy) return;

    // Reset busy flag after async operation completes
    const timer = setTimeout(() => {
      onBusyChange?.(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [isBusy, onBusyChange]);
}
