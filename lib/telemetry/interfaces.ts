/**
 * Interface Segregation Principle (ISP)
 * 
 * Segregate telemetry into minimal, focused interfaces.
 * Components receive only the data they require, preventing prop-drilling bloat.
 */

/**
 * Core telemetry event shape - minimal ISP compliance
 */
export interface ITelemetryEvent {
  eventName: string;
  timestamp: number;
  sessionId: string;
}

/**
 * User interaction telemetry - segregated for UI events
 */
export interface IUserInteractionTelemetry extends ITelemetryEvent {
  eventType: 'click' | 'submit' | 'input' | 'navigation';
  componentId: string;
  metadata?: Record<string, unknown>;
}

/**
 * Provider abstraction for dependency inversion
 */
export interface ITelemetryProvider {
  recordEvent(event: ITelemetryEvent): Promise<void>;
  recordInteraction(interaction: IUserInteractionTelemetry): Promise<void>;
  flush(): Promise<void>;
}

/**
 * Portfolio item summary - segregated ISP interface
 * Used instead of entire GitHub API response
 */
export interface IProjectSummary {
  id: string;
  name: string;
  description: string;
  url: string;
  stars: number;
  language: string;
  lastUpdated: string;
}

/**
 * News content parser abstraction
 */
export interface IContentParser {
  parse(content: string): Promise<IParsedContent>;
}

export interface IParsedContent {
  title: string;
  description: string;
  html: string;
  frontmatter: Record<string, unknown>;
}

/**
 * Turnstile validation service abstraction (LSP: Liskov Substitution)
 */
export interface ICaptchaValidator {
  validateToken(token: string): Promise<boolean>;
  getError(): string | null;
}
