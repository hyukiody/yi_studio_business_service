import { NextRequest, NextResponse } from 'next/server';
import { getPaginatedFeed } from '@/lib/utils/contentIngestion';

const ALLOWED_ORIGIN = process.env.CORS_ALLOWED_ORIGIN || '*';

function setCORSHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export async function OPTIONS(): Promise<NextResponse> {
  return setCORSHeaders(new NextResponse(null, { status: 204 }));
}

export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour at build time

export async function GET(req: NextRequest) {
  try {
    // Extract query parameters with validation
    const searchParams = req.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);

    // Validate parameters
    if (limit < 1 || limit > 100) {
      return setCORSHeaders(
        NextResponse.json(
          { error: 'Invalid limit. Must be between 1 and 100.' },
          { status: 400 }
        )
      );
    }

    if (offset < 0) {
      return setCORSHeaders(
        NextResponse.json({ error: 'Invalid offset. Must be >= 0.' }, { status: 400 })
      );
    }

    // Fetch paginated data
    const result = await getPaginatedFeed(limit, offset);

    // Set cache headers for CDN and browsers
    const response = NextResponse.json(result);
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    response.headers.set('Content-Type', 'application/json');

    return setCORSHeaders(response);
  } catch (error) {
    console.error('Feed API error:', error);
    return setCORSHeaders(
      NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 })
    );
  }
}

