import { NextRequest, NextResponse } from 'next/server';
import { telemetryLimiter } from '@/lib/security/rate-limiter';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ALLOWED_ORIGIN = process.env.CORS_ALLOWED_ORIGIN || '*';

function setCORSHeaders<T>(response: NextResponse<T>): NextResponse<T> {
  response.headers.set('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export async function OPTIONS(): Promise<NextResponse> {
  return setCORSHeaders(new NextResponse(null, { status: 204 }));
}

/**
 * Telemetry API Route - Interaction Ingestion
 * 
 * Segregated interaction tracking (ISP)
 * Rate limited by sessionId to prevent analytics spam.
 */

interface ITelemetryEventRequest {
  eventName: string;
  eventType: 'click' | 'submit' | 'input' | 'navigation';
  componentId: string;
  sessionId: string;
  metadata?: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    const body: ITelemetryEventRequest = await request.json();

    // 1. Apply Rate Limiting (Constraint: 100 per minute per session)
    // Robust session calculation could include IP as well, but following current spec
    const { success: limitReached } = await telemetryLimiter.limit(body.sessionId);

    if (!limitReached) {
      return setCORSHeaders(
        NextResponse.json(
          { success: false, error: 'Rate limit exceeded' },
          { status: 429 }
        )
      );
    }

    // 2. Persist to Database via Prisma (Anonymized)
    await prisma.telemetryEvent.create({
      data: {
        eventName: body.eventName,
        eventType: body.eventType,
        componentId: body.componentId,
        sessionId: body.sessionId,
        metadata: (body.metadata || {}) as any,
      },
    });

    return setCORSHeaders(NextResponse.json({ success: true }));
  } catch (error) {
    console.error('Telemetry ingestion error:', error);
    return setCORSHeaders(
      NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      )
    );
  }
}
