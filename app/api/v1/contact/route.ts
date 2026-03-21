import { NextRequest, NextResponse } from 'next/server';
import { inputValidator } from '@/lib/security/input-validator';
import { environmentConfig } from '@/lib/security/environment-config';

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

    // Validate email format (re-validate client-side validation)
    if (!inputValidator.validateEmail(body.email)) {
      return NextResponse.json(
        { success: false, message: '', error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Sanitize text inputs
    const sanitizedName = inputValidator.sanitizeText(body.name);
    const sanitizedMessage = inputValidator.sanitizeText(body.message);

    // Validate Turnstile token (if required in production)
    if (environmentConfig.environment === 'production' && body.turnstileToken) {
      const isValidTurnstile = await validateTurnstileToken(body.turnstileToken);
      if (!isValidTurnstile) {
        return NextResponse.json(
          { success: false, message: '', error: 'CAPTCHA validation failed' },
          { status: 403 }
        );
      }
    }

    // TODO: Send email or store in database with PII_HASH
    console.log('Contact form submitted (sanitized)', {
      email: body.email.substring(0, 3) + '***', // Log anonymized
      nameLength: sanitizedName.length,
      messageLength: sanitizedMessage.length,
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you for your message. We will get back to you shortly.',
    });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { success: false, message: '', error: 'Internal server error' },
      { status: 500 }
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
