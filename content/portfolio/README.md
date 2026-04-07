# Portfolio Projects

This directory contains portfolio project metadata and case studies.

## File Format

Each project should be formatted as JSON or MDX with the following structure:

```json
{
  "id": "project-slug",
  "name": "Project Name",
  "description": "Project description",
  "url": "https://github.com/...",
  "stars": 150,
  "language": "TypeScript",
  "lastUpdated": "2026-03-21"
}
```

This matches the `IProjectSummary` interface (ISP: Interface Segregation Principle)
to prevent passing entire GitHub API responses.
