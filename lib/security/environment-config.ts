/**
 * Immutable Privacy Constraint Beta: Environment Variable Isolation
 * 
 * Type-safe retrieval of secrets from environment.
 * The public Git index remains sterile. All secrets are resolved strictly
 * at runtime by the Edge provider's secure execution context.
 */

export interface IEnvironmentConfig {
  turnstileSiteKey: string;
  turnstileSecretKey: string;
  whatsappNumber: string;
  whatsappApiToken: string;
  appUrl: string;
  environment: 'development' | 'production' | 'staging';
}

class EnvironmentConfig implements IEnvironmentConfig {
  readonly turnstileSiteKey: string;
  readonly turnstileSecretKey: string;
  readonly whatsappNumber: string;
  readonly whatsappApiToken: string;
  readonly appUrl: string;
  readonly environment: 'development' | 'production' | 'staging';

  constructor() {
    // Client-safe secrets (NEXT_PUBLIC_* prefix)
    this.turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
    this.appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    this.environment = (process.env.NODE_ENV as any) || 'development';

    // Server-only secrets (never exposed to client)
    this.turnstileSecretKey = process.env.TURNSTILE_SECRET_KEY || '';
    this.whatsappNumber = process.env.SECURE_WHATSAPP_NUMBER || '';
    this.whatsappApiToken = process.env.WHATSAPP_API_TOKEN || '';

    this.validateConfig();
  }

  private validateConfig(): void {
    if (!this.turnstileSiteKey && this.environment !== 'development') {
      console.warn('NEXT_PUBLIC_TURNSTILE_SITE_KEY is not configured');
    }
    if (!this.turnstileSecretKey && this.environment !== 'development') {
      console.warn('TURNSTILE_SECRET_KEY is not configured');
    }
  }

  /**
   * Returns only client-safe environment variables
   * Server-only secrets are never included
   */
  getClientConfig(): Omit<IEnvironmentConfig, 'turnstileSecretKey' | 'whatsappApiToken'> {
    return {
      turnstileSiteKey: this.turnstileSiteKey,
      appUrl: this.appUrl,
      environment: this.environment,
      whatsappNumber: '', // Never expose to client
    };
  }
}

export const environmentConfig = new EnvironmentConfig();
export type { EnvironmentConfig };
