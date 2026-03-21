'use client';

import { ReactNode } from 'react';

/**
 * Open/Closed Principle (OCP)
 * Navigation header: Open for extension via composition, closed for modification
 */

interface IHeaderProps {
  title: string;
  children?: ReactNode;
  className?: string;
}

export function Header({ title, children, className = '' }: IHeaderProps) {
  return (
    <header
      className={`
        sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm
        ${className}
      `}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <div className="flex items-center gap-4">{children}</div>
        </div>
      </nav>
    </header>
  );
}

export type { IHeaderProps };
