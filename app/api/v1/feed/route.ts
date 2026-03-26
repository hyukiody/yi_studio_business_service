/**
 * GET /api/v1/feed
 *
 * Offset-based pagination endpoint for news feed
 *
 * Query Parameters:
 * - limit: Number of entries (default: 10, max: 100)
 * - offset: Number of entries to skip (default: 0)
 *
 * Response:
 * ```json
 * {
 *   "data": [...entries],
 *   "pagination": {
 *     "limit": 10,
 *     "offset": 0,
 *     "total": 50,
 *     "hasMore": true
 *   }
 * }
 * ```
 *
 * Time Complexity: O(MlogM) for first request (ingestion + sort)
 * Subsequent requests: O(M) if cache invalidated or O(1) with in-memory cache
 *
 * Space Complexity: O(limit) for response payload
 * The full ingestion O(M) is server-side only, never shipped to client
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPaginatedFeed } from '@/lib/utils/contentIngestion';

export async function GET(req: NextRequest) {
  try {
    // Extract query parameters with validation
    const searchParams = req.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);

    // Validate parameters
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        {
          error: 'Invalid limit. Must be between 1 and 100.',
        },
        { status: 400 }
      );
    }

    if (offset < 0) {
      return NextResponse.json(
        {
          error: 'Invalid offset. Must be >= 0.',
        },
        { status: 400 }
      );
    }

    // Fetch paginated data
    const result = await getPaginatedFeed(limit, offset);

    // Set cache headers for CDN and browsers
    const response = NextResponse.json(result);
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    response.headers.set('Content-Type', 'application/json');

    return response;
  } catch (error) {
    console.error('Feed API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch feed',
      },
      { status: 500 }
    );
  }
}
