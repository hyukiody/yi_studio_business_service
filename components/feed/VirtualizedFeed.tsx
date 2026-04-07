/**
 * VirtualizedFeed Component — O(1) + O(limit) Complexity
 *
 * Combines:
 * - Offset pagination (server: O(MlogM) ingestion, response: O(limit))
 * - Virtualization (client: O(1) rendering window)
 * - Infinite scroll (automatic pagination on scroll)
 *
 * Total Complexity:
 * - Server: O(MlogM) once, then O(1) per page request
 * - Client: O(1) rendering calculation + O(K) DOM nodes where K ≈ 20
 * - Network: O(1) per page fetch (fixed limit)
 *
 * Benefits:
 * ✅ Render infinite feed with <50 DOM nodes
 * ✅ 60fps scrolling on all devices
 * ✅ Zero layout thrashing
 * ✅ Progressive loading (fetch as user scrolls)
 */

'use client';

import { useState } from 'react';
import { NewsEntryCard } from '@/components/ui/NewsEntryCard';
import { useVirtualization } from '@/lib/hooks/useVirtualization';
import type { IFeedEntry, IPaginationResponse } from '@/lib/utils/contentIngestion';

interface VirtualizedFeedProps {
  initialEntries?: IFeedEntry[];
  itemHeight?: number;
  pageSize?: number;
}

export function VirtualizedFeed({
  initialEntries = [],
  itemHeight = 300, // NewsEntryCard approximate height with spacing
  pageSize = 10,
}: VirtualizedFeedProps) {
  // All loaded entries (accumulates with each page load)
  const [allEntries, setAllEntries] = useState<IFeedEntry[]>(initialEntries);

  // Pagination state
  const [offset, setOffset] = useState(initialEntries.length);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Virtualization integration
  const {
    renderStart,
    renderEnd,
    offsetY,
    totalHeight,
    visibleCount,
    containerRef,
    contentRef,
  } = useVirtualization({
    itemHeight,
    totalItems: allEntries.length,
    bufferCount: 3,
    onScrollEnd: loadMoreEntries,
  });

  /**
   * Fetch next page of entries from API
   * Time Complexity: O(limit) for response size (not O(M))
   * Network: O(1) constant payload
   */
  async function loadMoreEntries() {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/v1/feed?limit=${pageSize}&offset=${offset}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch feed');
      }

      const data: IPaginationResponse<IFeedEntry> = await response.json();

      // Accumulate entries (don't replace)
      setAllEntries((prev) => [...prev, ...data.data]);
      setOffset(offset + pageSize);
      setHasMore(data.pagination.hasMore);
    } catch (error) {
      console.error('Virtualized feed load error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Render visible items using virtualization bounds
   * Time Complexity: O(K) where K = visibleCount ≈ 5-10
   */
  const visibleEntries = allEntries.slice(renderStart, renderEnd + 1);

  return (
    <section
      ref={containerRef}
      className="w-full max-w-md h-96 overflow-y-auto border-2 border-gray-300 rounded-lg bg-white"
      aria-label="Virtualized news feed"
      role="feed"
    >
      {/* Spacer for scrollbar math: maintains correct scroll height */}
      <div
        style={{
          height: `${totalHeight}px`,
          position: 'relative',
        }}
      >
        {/* Content container with transform for smooth scrolling */}
        <div
          ref={contentRef}
          style={{
            transform: `translateY(${offsetY}px)`,
            willChange: 'transform',
          }}
        >
          {/* Render only visible items (O(K) complexity) */}
          <div className="flex flex-col gap-4">
            {visibleEntries.length === 0 && !isLoading && (
              <p className="text-center text-gray-500 py-8">
                No articles to display
              </p>
            )}

            {visibleEntries.map((entry, idx) => (
              <article
                key={`${renderStart + idx}-${entry.id}`}
                style={{ height: `${itemHeight}px` }}
              >
                <NewsEntryCard
                  title={entry.title}
                  subtitle={entry.subtitle}
                  isoDateString={entry.isoDateString}
                  content={entry.content}
                />
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="fixed bottom-4 right-4 bg-orange-600 text-white px-4 py-2 rounded-lg shadow-lg">
          Loading more articles...
        </div>
      )}

      {/* End of feed indicator */}
      {!hasMore && (
        <div className="fixed bottom-4 right-4 bg-gray-600 text-white px-4 py-2 rounded-lg shadow-lg">
          No more articles
        </div>
      )}

      {/* Debug info (remove in production) */}
      <div className="fixed bottom-0 left-0 text-xs text-gray-500 bg-gray-100 p-2 hidden lg:block">
        <div>Rendering: {visibleCount} items</div>
        <div>View: [{renderStart}, {renderEnd}]</div>
        <div>Total: {allEntries.length}</div>
      </div>
    </section>
  );
}
