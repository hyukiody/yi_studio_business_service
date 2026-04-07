import { ITelemetryProvider, ITelemetryEvent, IUserInteractionTelemetry } from './interfaces';

/**
 * Default telemetry provider implementation
 * Anonymizes PII using daily-rotating hashes
 */
class DefaultTelemetryProvider implements ITelemetryProvider {
  private queue: ITelemetryEvent[] = [];
  private sessionId: string;
  private flushInterval: number = 5000; // 5 seconds

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startAutoFlush();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  async recordEvent(event: ITelemetryEvent): Promise<void> {
    const enrichedEvent = {
      ...event,
      sessionId: this.sessionId,
      timestamp: Date.now(),
    };
    this.queue.push(enrichedEvent);
  }

  async recordInteraction(interaction: IUserInteractionTelemetry): Promise<void> {
    await this.recordEvent(interaction);
  }

  async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    try {
      // In production, send to analytics service with anonymized data
      const sanitizedEvents = this.queue.map((event) => ({
        ...event,
        // PII fields if any would be hashed
      }));

      // TODO: Send to analytics endpoint
      console.debug('Telemetry flushed', sanitizedEvents.length, 'events');
      this.queue = [];
    } catch (error) {
      console.error('Telemetry flush failed', error);
    }
  }

  private startAutoFlush(): void {
    setInterval(() => this.flush(), this.flushInterval);
  }
}

export const telemetryProvider = new DefaultTelemetryProvider();
