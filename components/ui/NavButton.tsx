'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

/**
 * Open/Closed Principle (OCP): Polymorphic navigation primitive
 * Open for extension (iconNodes injection), closed for modification
 */

export interface INavButtonProps {
  label: string;
  href: string;
  iconNodes?: ReactNode[];
  variant?: 'primary' | 'secondary';
}

export function NavButton({
  label,
  href,
  iconNodes = [],
  variant = 'primary',
}: INavButtonProps) {
  const baseStyles =
    'flex items-center justify-between w-full max-w-md px-6 py-4 border-4 rounded-3xl transition-transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-offset-2';

  const variantStyles = {
    primary:
      'bg-[#FFB76B] border-[#E87A00] text-[#E87A00] focus:ring-[#E87A00]/50',
    secondary:
      'bg-white border-[#E87A00] text-[#E87A00] focus:ring-[#E87A00]/50',
  };

  return (
    <Link
      href={href}
      className={`${baseStyles} ${variantStyles[variant]}`}
      aria-label={`Navigate to ${label}`}
    >
      <span className="text-3xl font-bold tracking-wide">{label}</span>
      {iconNodes.length > 0 && (
        <div className="flex gap-3" aria-hidden="true">
          {iconNodes.map((node, index) => (
            <div
              key={index}
              className="w-12 h-12 bg-white rounded-full shadow-inner flex items-center justify-center flex-shrink-0"
            >
              {node}
            </div>
          ))}
        </div>
      )}
    </Link>
  );
}
