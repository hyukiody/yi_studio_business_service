# Interface Segregation Principle (ISP) Implementation Guide

## Overview

This document details how the Interface Segregation Principle (ISP) is applied throughout the YI Studio architecture, preventing prop-drilling bloat and enabling semantic type safety.

## Core Concept

**ISP states:** "Clients should not be forced to depend upon interfaces they do not use."

In React terms: Components should receive only the data they require, not large composite objects.

## Implementation Patterns

### Pattern 1: Minimal Component Props

#### ❌ Anti-Pattern
```typescript
interface IGitHubRepository {
  id: string;
  name: string;
  description: string;
  url: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  stars: number;
  watchers: number;
  forks: number;
  language: string;
  topics: string[];
  issues: number;
  pullRequests: number;
  releases: number;
  branches: number;
  // ... 40+ fields
}

// ❌ Component bloated with unused fields
function ProjectCard(repo: IGitHubRepository) {
  return <div>{repo.name} - {repo.stars} stars</div>;
}
```

#### ✅ ISP-Compliant
```typescript
interface IProjectSummary {
  name: string;
  stars: number;
}

function ProjectCard(project: IProjectSummary) {
  return <div>{project.name} - {project.stars} stars</div>;
}
```

### Pattern 2: Segregated Telemetry Interfaces

#### Implementation in `lib/telemetry/interfaces.ts`

```typescript
// ✅ Minimal core event
export interface ITelemetryEvent {
  eventName: string;
  timestamp: number;
  sessionId: string;
}

// ✅ Segregated for UI interactions only
export interface IUserInteractionTelemetry extends ITelemetryEvent {
  eventType: 'click' | 'submit' | 'input' | 'navigation';
  componentId: string;
  metadata?: Record<string, unknown>;
}

// ✅ Segregated for analytics provider
export interface ITelemetryProvider {
  recordEvent(event: ITelemetryEvent): Promise<void>;
  recordInteraction(interaction: IUserInteractionTelemetry): Promise<void>;
  flush(): Promise<void>;
}
```

**Benefits:**
- Each interface has a single reason to change
- Components don't receive provider methods they don't use
- Custom telemetry types can extend the core interface

### Pattern 3: Content Parser Abstraction

#### Implementation in `lib/telemetry/interfaces.ts`

```typescript
export interface IContentParser {
  parse(content: string): Promise<IParsedContent>;
}

export interface IParsedContent {
  title: string;
  description: string;
  html: string;
  frontmatter: Record<string, unknown>;
}
```

**Usage in `/app/feed` layout:**
```typescript
// ✅ Component receives only parser abstraction
function NewsFeed(props: { parser: IContentParser }) {
  // Can swap Markdown → MDX → Headless CMS without changes
}
```

**Trade-off:**
- Adds abstraction layer (slight complexity)
- Enables provider swapping (infinite flexibility)

### Pattern 4: Validation Service Segregation

#### Implementation in `lib/telemetry/interfaces.ts`

```typescript
export interface ICaptchaValidator {
  validateToken(token: string): Promise<boolean>;
  getError(): string | null;
}
```

**Usage in `components/ui/WhatsAppButton.tsx`:**
```typescript
function useTurnstileValidation(
  validator: ICaptchaValidator
): UseTurnstileValidationReturn {
  // ✅ Hook receives only validation interface
  // ✅ No knowledge of underlying implementation
  // ✅ Can swap Turnstile ↔ reCAPTCHA ↔ custom validator
}
```

## ISP + DIP (Dependency Inversion)

ISP and Dependency Inversion work together:

```typescript
// ✅ High-level component depends on abstraction (ISP + DIP)
function ContactForm(props: {
  validator: ICaptchaValidator;      // ISP: Only what we need
  telemetry: ITelemetryProvider;     // ISP: Only what we need
}) {
  // Component has no hard dependency on Turnstile or Analytics provider
}

// ✅ Provider supplies concrete implementations
<ContactForm
  validator={new TurnstileValidator()}
  telemetry={telemetryProvider}
/>
```

## Comparison: News Feed Route

### News Feed Routing Layer

The `IContentParser` interface enables flexible content routing:

```typescript
// lib/telemetry/interfaces.ts
export interface IContentParser {
  parse(content: string): Promise<IParsedContent>;
}

// Implementation: `lib/content/markdown-parser.ts`
class MarkdownParser implements IContentParser {
  async parse(content: string): Promise<IParsedContent> {
    // Parse Markdown
  }
}

// Implementation: `lib/content/mdx-parser.ts`
class MDXParser implements IContentParser {
  async parse(content: string): Promise<IParsedContent> {
    // Parse MDX
  }
}

// Component: `components/NewsFeed.tsx`
function NewsFeed(props: {
  parser: IContentParser;  // ✅ ISP: Only parser interface
  articles: string[];
}) {
  return articles.map(async (article) => {
    const parsed = await props.parser.parse(article);
    return <div>{parsed.html}</div>;
  });
}

// ✅ Later: Switch to Headless CMS without touching component
function useNewsFeedWithCMS() {
  const parser = new HeadlessCMSParser();
  return <NewsFeed parser={parser} articles={articles} />;
}
```

## Guidelines

### When to Segregate

1. **Multiple clients need different subsets** of interface
2. **Future provider swapping** is likely
3. **Component receives unused properties**
4. **Prevents "prop-drilling" complexity**

### Implementation Checklist

- [ ] Identify unused properties in interfaces
- [ ] Extract minimal interface per use case
- [ ] Use `extends` for specialization, not inflation
- [ ] Document reason for segregation
- [ ] Consider DIP implications

### Metrics

- **Prop Complexity**: Average properties per interface < 5
- **Component Coupling**: Components depend on 2-3 interfaces maximum
- **Provider Swapping**: No component changes needed when provider swapped

---

**Last Updated**: 2026-03-21  
**Version**: 1.0.0
