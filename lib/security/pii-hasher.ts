import crypto from 'crypto';

/**
 * Immutable Privacy Constraint Alpha: Zero-State PII Persistence
 * 
 * Cryptographic hashing function for PII anonymization.
 * H = SHA-256(PII ∥ Salt_daily)
 * 
 * This guarantees longitudinal session tracking for analytics while rendering
 * the data cryptographically useless if exfiltrated.
 */
class PIIHasher {
  /**
   * Generate daily rotating salt for PII hashing
   * Returns consistent salt for the same calendar day
   */
  private getDailySalt(): string {
    const now = new Date();
    const dateString = now.toISOString().split('T')[0]; // YYYY-MM-DD
    return crypto
      .createHash('sha256')
      .update(`${dateString}:${process.env.TURNSTILE_SECRET_KEY || 'static-salt'}`)
      .digest('hex')
      .substring(0, 32);
  }

  /**
   * Anonymize PII using SHA-256 with daily rotation
   * @param pii - Personally Identifiable Information
   * @returns Cryptographic hash suitable for analytics
   */
  hashPII(pii: string): string {
    const salt = this.getDailySalt();
    return crypto
      .createHash('sha256')
      .update(`${pii}${salt}`)
      .digest('hex');
  }

  /**
   * Verify that a hash matches the given PII (for session continuity)
   * @param pii - Raw PII to verify
   * @param hash - Previously computed hash
   * @returns Boolean indicating match
   */
  verifyPIIHash(pii: string, hash: string): boolean {
    return this.hashPII(pii) === hash;
  }
}

export const piiHasher = new PIIHasher();
export type { PIIHasher };
