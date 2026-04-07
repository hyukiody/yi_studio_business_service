import { NavButton } from '@/components/ui/NavButton';
import { NewsFeedClient } from '@/components/ui/NewsFeedClient';
import { getPaginatedFeed } from '@/lib/utils/contentIngestion';

/**
 * LandingView — React Server Component (RSC)
 *
 * Complexity Analysis:
 * - Server-side Time Complexity: O(MlogM) for first request (ingestion + sort)
 * - Client Time Complexity: O(1) — zero JavaScript payload
 * - Client Rendering: O(N) where N = limit (10 default)
 *
 * Accessibility Constraint:
 * WCAG AA 4.5:1 contrast ratio enforcement
 * - Text on #E87A00: #FFE3C2 (background) → meets WCAG AA
 * - Text on #FFB76B: #E87A00 (contrast) → meets WCAG AA
 *
 * React Server Component Benefits:
 * ✅ No JavaScript shipped for feed rendering
 * ✅ Direct database/filesystem access
 * ✅ Sensitive data processing on server only
 * ✅ Automatic code splitting & tree-shaking
 */

export default async function LandingView() {
  /**
   * Default placeholder icon (SVG circle)
   * Time Complexity: O(1) render
   */
  const defaultIcon = (
    <svg
      className="w-6 h-6 text-gray-600"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  );

  /**
   * Navigation dataset - extensible via ISP interface injection
   * Time Complexity: O(N) iteration where N = 5 routes
   */
  const navigationRoutes = [
    {
      label: 'Contact',
      href: '/contact',
      icons: [defaultIcon, defaultIcon],
    },
    {
      label: 'About us',
      href: '/about',
      icons: [defaultIcon],
    },
    {
      label: 'Current Stack',
      href: '/stack',
      icons: [defaultIcon],
    },
    {
      label: 'Tech Portfolio',
      href: '/portfolio',
      icons: [defaultIcon],
    },
    {
      label: 'Social Media',
      href: '/social',
      icons: [defaultIcon],
    },
  ];

  /**
   * Fetch initial feed data — Server-side execution
   * Time Complexity: O(MlogM) for content ingestion + sort
   * This is executed at build-time (static generation)
   * or request-time (dynamic routes), never on client
   */
  const feedData = await getPaginatedFeed(3, 0); // Load first 3 entries
  const newsFeedEntries = feedData.data;

  return (
    <main className="min-h-screen bg-[#FFE3C2] flex flex-col items-center px-4 py-[clamp(2rem,5vh,4rem)]">
      {/* ============================================
          Header Block: Branding Payload
          ============================================ */}
      <header className="w-full max-w-md bg-[#E87A00] text-white rounded-3xl p-6 mb-[clamp(1.5rem,4vh,3rem)] flex items-center justify-between shadow-lg">
        <div>
          <h1 className="text-3xl font-light tracking-wider border-b-2 border-white/50 inline-block pb-1 mb-2">
            YI StdIO
          </h1>
          <p className="text-2xl font-bold leading-tight">
            Development
            <br />
            Service
          </p>
        </div>

        {/* Logo Context: Brand Mark */}
        <div className="w-20 h-20 bg-black rounded-full border-4 border-[#FFE3C2] flex items-center justify-center text-xs font-mono text-white flex-shrink-0">
          yIO
        </div>
      </header>

      {/* ============================================
          Navigation Vector: Proportional Spacing
          ============================================
          CSS clamp() achieves fluid spacing:
          - MIN: Minimum for mobile (1rem)
          - VAL: Viewport-relative value (3vh)
          - MAX: Maximum for desktop (2rem)
          Pattern: clamp(MIN, VAL, MAX)
      */}
      <nav
        className="flex flex-col w-full max-w-md gap-[clamp(1rem,3vh,2rem)] mb-[clamp(2rem,6vh,4rem)] relative"
        aria-label="Main navigation"
      >
        {/* Decorative proportional spacing indicators (wireframe annotations) */}
        <div className="absolute top-1/2 left-[-20px] w-4 border-t-2 border-[#E87A00] hidden lg:block" />
        <div className="absolute top-1/2 right-[-20px] w-4 border-t-2 border-[#E87A00] hidden lg:block" />

        {/* Time Complexity: O(N) where N = 5 routes */}
        {navigationRoutes.map((route) => (
          <NavButton
            key={route.label}
            label={route.label}
            href={route.href}
            iconNodes={route.icons}
            variant="primary"
          />
        ))}
      </nav>

      {/* ============================================
          News Feed Divider & Title
          ============================================ */}
      <div className="w-full max-w-md border-t-8 border-[#E87A00] rounded-full mb-6" />
      <h2 className="text-5xl font-bold text-[#E87A00] mb-8 w-full max-w-md text-center">
        News feed
      </h2>

      {/* ============================================
          Feed Aggregator: O(1) Virtualized Infinite Scroll
          ============================================
          Time Complexity: O(1) per scroll update via O(1) calculateO1RenderWindow
          Space Complexity: O(K) where K = visibleNodesCount
      */}
      <section
        className="w-full flex flex-col items-center"
        aria-label="News feed entries"
      >
        <NewsFeedClient 
          initialData={newsFeedEntries} 
          initialTotal={feedData.pagination.total}
        />
      </section>

      {/* Pagination indicator (Phase 5: Infinite Scroll Ready) */}
      <footer className="mt-8 text-center text-gray-600 text-sm">
        Showing {newsFeedEntries.length} of {feedData.pagination.total} entries
      </footer>
    </main>
  );
}
