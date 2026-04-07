'use client';

import { ReactNode } from 'react';

/**
 * Single Responsibility Principle (SRP)
 * Container layout - only handles layout structure
 */

interface IMainLayoutProps {
  children: ReactNode;
  className?: string;
}

export function MainLayout({ children, className = '' }: IMainLayoutProps) {
  return (
    <main className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </main>
  );
}

export type { IMainLayoutProps };
