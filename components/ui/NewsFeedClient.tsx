'use client';

/**
 * NewsFeedClient — High-Performance Virtualized News Feed
 * 
 * Integrates O(1) virtualization hook with infinite scroll fetching.
 * Maintains SRP: Handles scrolling and data management, delegates rendering to NewsEntryCard.
 */

import { useState, useCallback } from 'react';
import { useVirtualization } from '@/lib/hooks/useVirtualization';
import { NewsEntryCard } from '@/components/ui/NewsEntryCard';
import { IFeedEntry, IPaginationResponse } from '@/lib/utils/contentIngestion';

interface NewsFeedClientProps {
  initialData: IFeedEntry[];
  initialTotal: number;
}

const ITEM_HEIGHT = 320; // Fixed height in pixels for O(1) calculation
const PAGE_SIZE = 5;

export function NewsFeedClient({ initialData, initialTotal }: NewsFeedClientProps) {
  const [entries, setEntries] = useState<IFeedEntry[]>(initialData);
  const [total, setTotal] = useState(initialTotal);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  /**
   * Fetch next page of entries
   * Time Complexity: O(limit) for payload processing
   */
  const fetchMore = useCallback(async () => {
    if (isLoadingMore || entries.length >= total) return;

    setIsLoadingMore(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
      const response = await fetch(`${baseUrl}/api/v1/feed?limit=${PAGE_SIZE}&offset=${entries.length}`);
      const result: IPaginationResponse<IFeedEntry> = await response.json();
      
      setEntries(prev => [...prev, ...result.data]);
      setTotal(result.pagination.total);
    } catch (error) {
      console.error('Failed to fetch more feed entries:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [entries.length, total, isLoadingMore]);

  /**
   * Initialize Virtualization Hook
   * Time Complexity: O(1) per scroll update
   */
  const {
    renderStart,
    renderEnd,
    offsetY,
    totalHeight,
    containerRef,
    contentRef,
  } = useVirtualization({
    itemHeight: ITEM_HEIGHT,
    totalItems: entries.length,
    bufferCount: 3,
    onScrollEnd: fetchMore,
  });

  // Calculate visible entries
  const visibleEntries = entries.slice(renderStart, renderEnd + 1);

  return (
    <div 
      ref={containerRef}
      className="w-full max-w-md h-[70vh] overflow-y-auto scrollbar-hide relative border-b-4 border-[#E87A00]/20"
      style={{ scrollBehavior: 'smooth' }}
    >
      {/* Scrollable Spacer: Maintains correct scrollbar height */}
      <div 
        ref={contentRef}
        style={{ height: `${totalHeight}px`, position: 'relative' }}
      >
        {/* Virtualized Window: Positioned via Transform */}
        <div 
          className="flex flex-col gap-6 w-full"
          style={{ 
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleEntries.map((entry) => (
            <div key={entry.id} style={{ height: `${ITEM_HEIGHT - 24}px` }}>
              <NewsEntryCard
                title={entry.title}
                subtitle={entry.subtitle}
                isoDateString={entry.isoDateString}
                content={entry.content}
                className="h-full"
              />
            </div>
          ))}
          
          {isLoadingMore && (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E87A00]"></div>
            </div>
          )}
        </div>
      </div>

      {entries.length === 0 && !isLoadingMore && (
        <div className="text-center py-20 text-gray-500">
          No news entries found.
        </div>
      )}
    </div>
  );
}
