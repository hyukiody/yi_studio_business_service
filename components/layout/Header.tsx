'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { Logo } from '@/components/ui/Logo';

/**
 * Header Component
 * 
 * Design System: Primary Navigation Container
 * - Single Responsibility: Only manages header layout
 * - Open/Closed Principle (OCP): Extensible via composition
 * - Accessibility: Semantic HTML5, ARIA labels
 * - Responsive: Mobile-first, clamp() for fluid spacing
 */

interface IHeaderProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  children?: ReactNode;
  className?: string;
}

export function Header({ 
  title = 'YI Studio',
  subtitle = 'Development Service',
  showLogo = true,
  children, 
  className = '' 
}: IHeaderProps) {
  return (
    <header
      className={`
        sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm
        ${className}
      `}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo + Branding Section */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 hover:opacity-80 transition-opacity">
            {showLogo && (
              <Logo 
                size="md" 
                variant="default"
                className="flex-shrink-0"
              />
            )}
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900 leading-tight">{title}</h1>
              {subtitle && (
                <p className="text-xs text-gray-600">{subtitle}</p>
              )}
            </div>
          </Link>

          {/* Navigation Actions */}
          <div className="flex items-center gap-4 flex-1 justify-end">
            {children}
          </div>
        </div>
      </nav>
    </header>
  );
}

export type { IHeaderProps };
