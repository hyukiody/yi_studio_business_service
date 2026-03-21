# News & Articles

This directory contains MDX-formatted news articles and technical insights.

## File Format

Each article should be named: `YYYY-MM-DD-title-slug.mdx`

Example frontmatter:
```yaml
---
title: "Article Title"
date: 2026-03-21
author: "Author Name"
description: "Brief description"
tags: ["tag1", "tag2"]
---
```

## Content Parser

Articles are parsed using the `IContentParser` interface implementing Interface Segregation Principle (ISP).
This allows switching between Markdown, MDX, and CMS providers without component changes.
