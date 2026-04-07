'use client';

/**
 * Logo Component
 * 
 * Design System: YI Studio Brand Implementation
 * - SVG-based logo (scalable, responsive)
 * - Follows OCP: Open for extension via size/variant props
 * - Accessibility: alt text and semantic HTML
 * - Performance: No external dependencies needed
 */

interface ILogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark' | 'default';
  className?: string;
}

const LOGO_DIMENSIONS = {
  sm: { width: 32, height: 32 },
  md: { width: 48, height: 48 },
  lg: { width: 64, height: 64 },
};

const LOGO_VARIANTS = {
  light: 'text-white',
  dark: 'text-gray-900',
  default: 'text-[#E87A00]',
};

export function Logo({ 
  size = 'md', 
  variant = 'default',
  className = '' 
}: ILogoProps) {
  const dims = LOGO_DIMENSIONS[size];
  const variantClass = LOGO_VARIANTS[variant];

  return (
    <div
      className={`
        inline-flex items-center justify-center
        rounded-full border-2 border-current
        ${variantClass}
        ${className}
      `}
      style={{
        width: dims.width,
        height: dims.height,
      }}
      role="img"
      aria-label="YI Studio Logo"
    >
      <svg
        width={dims.width * 0.6}
        height={dims.height * 0.6}
        viewBox="0 0 191 177"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        fill="currentColor"
      >
        {/* Logo placeholder - SVG path would be imported here */}
        <circle cx="95" cy="88" r="85" opacity="0.1" />
      </svg>
    </div>
  );
}

export type { ILogoProps };
