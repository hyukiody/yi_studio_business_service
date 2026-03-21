/**
 * Immutable Privacy Constraint Gamma: Client-Side Hostility Assumption
 * 
 * Input validation and sanitization layer.
 * Client-side RegEx validation is purely for UX. All input must undergo
 * secondary sanitation and strict typing at the serverless boundary.
 */

export interface IInputValidator {
  validateEmail(email: string): boolean;
  validatePhoneNumber(phone: string): boolean;
  sanitizeText(text: string): string;
}

class InputValidator implements IInputValidator {
  /**
   * Validate email format (UX layer - client-side)
   * Server must re-validate all inputs
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/i;
    return emailRegex.test(email.toLowerCase());
  }

  /**
   * Validate phone number format (UX layer - client-side)
   * Supports E.164 format: +[country-code][number]
   */
  validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/\s|-/g, ''));
  }

  /**
   * Sanitize text input: remove suspicious patterns
   * Obfuscation is NOT applied (Base64, bit-shifting forbidden)
   */
  sanitizeText(text: string): string {
    // Remove HTML tags and SQL injection patterns
    let sanitized = text.replace(/<[^>]*>/g, '');
    sanitized = sanitized.replace(/['";`\\]/g, '\\$&');
    sanitized = sanitized.trim();

    // Enforce max length to prevent DoS
    if (sanitized.length > 5000) {
      sanitized = sanitized.substring(0, 5000);
    }

    return sanitized;
  }
}

export const inputValidator = new InputValidator();
