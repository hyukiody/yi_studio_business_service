/**
 * Content Ingestion Engine — O(MlogM) Complexity
 *
 * Time Complexity: O(MlogM) where M = total markdown files
 * - Filesystem traversal: O(M)
 * - Parse frontmatter: O(M)
 * - Sort by date (chronological): O(MlogM)
 *
 * Space Complexity: O(M) for metadata in V8 heap
 *
 * Server-side execution: No JavaScript shipped to client
 */

import fs from 'fs';
import path from 'path';

/**
 * News entry from parsed markdown file
 * ISP Interface: Only required fields for feed rendering
 */
export interface IFeedEntry {
  id: string;
  title: string;
  subtitle: string;
  isoDateString: string;
  content: string;
  tags?: string[];
  author?: string;
}

/**
 * Paginated response DTO
 */
export interface IPaginationResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

/**
 * Parse YAML-like frontmatter from markdown file
 * Time Complexity: O(L) where L = file length
 */
function parseFrontmatter(content: string): Record<string, unknown> {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
  const match = content.match(frontmatterRegex);

  if (!match) return {};

  const fm = match[1];
  const result: Record<string, unknown> = {};

  // Simple YAML parser (handles basic key: value pairs)
  fm.split('\n').forEach((line) => {
    const [key, ...valueParts] = line.split(':');
    if (key?.trim()) {
      const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
      result[key.trim()] = value;
    }
  });

  return result;
}

/**
 * Extract markdown content body (after frontmatter)
 */
function extractContent(content: string): string {
  const withoutFrontmatter = content.replace(/^---\n[\s\S]*?\n---\n/, '');
  return withoutFrontmatter.substring(0, 200) + '...'; // Excerpt
}

/**
 * Ingest markdown files from content/news directory
 * Time Complexity: O(MlogM) due to chronological sort
 *
 * @returns Array of feed entries sorted by date (newest first)
 */
export async function ingestNewsFeed(): Promise<IFeedEntry[]> {
  const newsDir = path.join(process.cwd(), 'content', 'news');

  try {
    // O(M) filesystem traversal
    const files = fs
      .readdirSync(newsDir)
      .filter((file) => file.endsWith('.md') || file.endsWith('.mdx'))
      .filter((file) => file !== 'README.md');

    // O(M) content parsing
    const entries: IFeedEntry[] = files.map((file) => {
      const filePath = path.join(newsDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const frontmatter = parseFrontmatter(content);
      const bodyContent = extractContent(content);

      // Extract ISO date from filename (YYYY-MM-DD-*) or frontmatter
      let isoDate = '2026-03-21'; // Fallback
      if (file.match(/^\d{4}-\d{2}-\d{2}/)) {
        isoDate = file.substring(0, 10);
      } else if (frontmatter.date) {
        isoDate = String(frontmatter.date);
      }

      return {
        id: file.replace(/\.(md|mdx)$/, ''),
        title: String(frontmatter.title || file),
        subtitle: String(frontmatter.description || ''),
        isoDateString: isoDate + 'T00:00:00Z',
        content: bodyContent,
        tags: Array.isArray(frontmatter.tags) ? (frontmatter.tags as string[]) : [],
        author: String(frontmatter.author || ''),
      };
    });

    // O(MlogM) chronological sort (newest first)
    entries.sort(
      (a, b) =>
        new Date(b.isoDateString).getTime() - new Date(a.isoDateString).getTime()
    );

    return entries;
  } catch (error) {
    console.error('Content ingestion failed:', error);
    return [];
  }
}

/**
 * Get paginated feed entries using offset pagination
 *
 * Time Complexity: O(M) to load all entries, then O(limit) to slice
 * Space Complexity: O(limit) for response payload
 *
 * @param limit - Number of entries per page
 * @param offset - Number of entries to skip
 * @returns Paginated response with pagination metadata
 */
export async function getPaginatedFeed(
  limit: number = 10,
  offset: number = 0
): Promise<IPaginationResponse<IFeedEntry>> {
  const allEntries = await ingestNewsFeed();
  const total = allEntries.length;

  // O(limit) slice operation
  const paginatedEntries = allEntries.slice(offset, offset + limit);

  return {
    data: paginatedEntries,
    pagination: {
      limit,
      offset,
      total,
      hasMore: offset + limit < total,
    },
  };
}

/**
 * Get single feed entry by ID
 * Time Complexity: O(M) for initial ingestion + O(1) array lookup
 */
export async function getFeedEntryById(id: string): Promise<IFeedEntry | null> {
  const allEntries = await ingestNewsFeed();
  return allEntries.find((entry) => entry.id === id) || null;
}
