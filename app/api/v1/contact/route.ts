import { NextRequest, NextResponse } from 'next/server';
import { inputValidator } from '@/lib/security/input-validator';
import { environmentConfig } from '@/lib/security/environment-config';
import { contactFormLimiter } from '@/lib/security/rate-limiter';
import { piiHasher } from '@/lib/security/pii-hasher';
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
 * Contact API Route - Serverless Boundary
 * 
 * Immutable Privacy Constraint Gamma: Client-Side Hostility Assumption
 * All input must undergo secondary sanitation and strict typing.
 * No Base64 encoding or bit-shifting (obfuscation forbidden).
 */

interface IContactRequest {
  email: string;
  name: string;
  message: string;
  turnstileToken?: string;
}

interface IContactResponse {
  success: boolean;
  message: string;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<IContactResponse>> {
  try {
    const body: IContactRequest = await request.json();

    // 1. Apply Rate Limiting (Constraint: 5 per hour per IP)
    // Robust IP detection using provider-specific headers
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
               request.headers.get('x-real-ip') || 
               'anonymous';

    const { success: limitReached } = await contactFormLimiter.limit(ip);

    if (!limitReached) {
      return setCORSHeaders(
        NextResponse.json(
          { success: false, message: '', error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        )
      );
    }

    // 2. Validate email format
    if (!inputValidator.validateEmail(body.email)) {
      return setCORSHeaders(
        NextResponse.json(
          { success: false, message: '', error: 'Invalid email address' },
          { status: 400 }
        )
      );
    }

    // 3. Sanitize text inputs
    const sanitizedName = inputValidator.sanitizeText(body.name);
    const sanitizedMessage = inputValidator.sanitizeText(body.message);

    // 4. Validate Turnstile token
    if (environmentConfig.environment === 'production' && body.turnstileToken) {
      const isValidTurnstile = await validateTurnstileToken(body.turnstileToken);
      if (!isValidTurnstile) {
        return setCORSHeaders(
          NextResponse.json(
            { success: false, message: '', error: 'CAPTCHA validation failed' },
            { status: 403 }
          )
        );
      }
    }

    // 5. Anonymize PII (Constraint Alpha: Zero-State Persistence)
    const emailHash = piiHasher.hashPII(body.email);

    // 6. Persist to Database via Prisma
    await prisma.contactSubmission.create({
      data: {
        emailHash,
        name: sanitizedName,
        message: sanitizedMessage,
        captchaValidated: !!body.turnstileToken,
        ipAddress: ip,
        userAgent: request.headers.get('user-agent'),
      },
    });

    return setCORSHeaders(
      NextResponse.json({
        success: true,
        message: 'Thank you for your message. We will get back to you shortly.',
      })
    );
  } catch (error) {
    console.error('Contact API error:', error);
    return setCORSHeaders(
      NextResponse.json(
        { success: false, message: '', error: 'Internal server error' },
        { status: 500 }
      )
    );
  }
}

/**
 * Validate Turnstile token with Cloudflare
 * @param token - Token from client's Turnstile widget
 * @returns Boolean indicating validity
 */
async function validateTurnstileToken(token: string): Promise<boolean> {
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: environmentConfig.turnstileSecretKey,
        response: token,
      }),
    });

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Turnstile validation error:', error);
    return false;
  }
}
