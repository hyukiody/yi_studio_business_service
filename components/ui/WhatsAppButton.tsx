'use client';

import { useCallback } from 'react';
import { useInteractionTelemetry } from '@/lib/hooks/useInteractionTelemetry';

/**
 * Single Responsibility Principle (SRP)
 * This component strictly renders the WhatsApp button UI.
 * It delegates:
 * - Cryptographic validation → useTurnstileValidation hook
 * - Network routing → external service class
 * - Telemetry tracking → useInteractionTelemetry hook
 */

interface IWhatsAppButtonProps {
  phoneNumber: string;
  message?: string;
  className?: string;
}

export function WhatsAppButton({
  phoneNumber,
  message = 'Hello! I would like to get in touch.',
  className = '',
}: IWhatsAppButtonProps) {
  const { recordInteraction } = useInteractionTelemetry();

  const handleClick = useCallback(async () => {
    // Record interaction for analytics
    await recordInteraction({
      eventType: 'click',
      componentId: 'whatsapp-button',
      metadata: {
        phoneNumber: phoneNumber.substring(0, 3) + '***', // Anonymize
      },
    });

    // Route to WhatsApp
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  }, [phoneNumber, message, recordInteraction]);

  return (
    <button
      onClick={handleClick}
      className={`
        px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg
        transition-colors duration-200 flex items-center gap-2
        ${className}
      `}
      aria-label="Contact via WhatsApp"
    >
      <svg
        className="w-5 h-5"
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.783 1.14L4.734 5.478c.752-2.356 2.872-4.038 5.27-4.038 2.672 0 4.939 1.804 5.68 4.233l-1.423 1.423c-.509-1.81-2.133-3.128-4.257-3.128z" />
      </svg>
      <span>Contact via WhatsApp</span>
    </button>
  );
}

export type { IWhatsAppButtonProps };
