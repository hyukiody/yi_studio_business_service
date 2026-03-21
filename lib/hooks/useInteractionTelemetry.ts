'use client';

import { useState, useCallback } from 'react';
import { IUserInteractionTelemetry } from '@/lib/telemetry/interfaces';
import { telemetryProvider } from '@/lib/telemetry/provider';

/**
 * Single Responsibility Principle (SRP)
 * Delegated Responsibility: User interaction telemetry tracking
 * 
 * This hook encapsulates ONLY telemetry recording logic.
 */

export function useInteractionTelemetry() {
  const [isTracking, setIsTracking] = useState(true);

  const recordInteraction = useCallback(
    async (interaction: Omit<IUserInteractionTelemetry, 'sessionId' | 'timestamp' | 'eventName'>) => {
      if (!isTracking) return;

      try {
        const event: IUserInteractionTelemetry = {
          ...interaction,
          eventName: `${interaction.eventType}_${interaction.componentId}`,
          sessionId: '',
          timestamp: Date.now(),
        };

        await telemetryProvider.recordInteraction(event);
      } catch (error) {
        console.error('Failed to record interaction', error);
      }
    },
    [isTracking]
  );

  const disableTracking = useCallback(() => setIsTracking(false), []);
  const enableTracking = useCallback(() => setIsTracking(true), []);

  return {
    recordInteraction,
    isTracking,
    disableTracking,
    enableTracking,
  };
}
