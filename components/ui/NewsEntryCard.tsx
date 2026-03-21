'use client';

/**
 * Interface Segregation Principle (ISP)
 * Minimal interface prevents prop-drilling; only required fields
 */

export interface INewsEntryCardProps {
  title: string;
  subtitle: string;
  isoDateString: string;
  content: string;
  className?: string;
}

/**
 * Time Complexity: O(1) date formatting
 * Space Complexity: O(1) for component instance
 * Semantic HTML: Uses <article> instead of invalid <body> tags
 */
export function NewsEntryCard({
  title,
  subtitle,
  isoDateString,
  content,
  className = '',
}: INewsEntryCardProps) {
  const formattedDate = new Date(isoDateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article
      className={`w-full max-w-md p-6 bg-white border-4 border-[#E87A00] rounded-lg shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      <header className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{title}</h2>
        <h3 className="text-lg font-medium text-gray-700 mb-2">{subtitle}</h3>
        <time
          dateTime={isoDateString}
          className="text-sm text-gray-500 block"
        >
          {formattedDate}
        </time>
      </header>

      <div className="prose prose-orange prose-sm max-w-none">
        <p className="text-gray-800 leading-relaxed">{content}</p>
      </div>
    </article>
  );
}
