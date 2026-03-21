# YI Studio Business Service

## Architecture Overview

This repository implements a **S.O.L.I.D.-compliant**, **zero-trust privacy** architecture using Next.js (App Router) and TypeScript.

### Design Principles

#### 1. **Single Responsibility Principle (SRP)**
- Components render DOM only
- Hooks encapsulate business logic
- Services handle external integration

Example:
- `WhatsAppButton.tsx` - Renders UI, delegates validation to `useTurnstileValidation` hook
- `useTurnstileValidation.ts` - Encapsulates CAPTCHA validation only
- `pii-hasher.ts` - Handles cryptographic operations only

#### 2. **Open/Closed Principle (OCP)**
- Components are open for extension via composition
- Closed for modification through props and context

Example:
- `Header` component accepts `children` for flexible content injection
- `MainLayout` composition pattern for page layouts

#### 3. **Liskov Substitution Principle (LSP)**
- Services implement strict interfaces
- Any provider implementation can replace another without breaking behavior

Example:
- `ICaptchaValidator` abstraction allows swapping Turnstile, reCAPTCHA, or custom validators
- `ITelemetryProvider` allows analytics provider swapping

#### 4. **Interface Segregation Principle (ISP)**
- Minimal, focused interfaces prevent prop-drilling
- Components receive only required data

Example:
- `IProjectSummary` (5 fields) instead of full GitHub API response
- `IUserInteractionTelemetry` for interaction tracking only

#### 5. **Dependency Inversion Principle (DIP)**
- High-level components depend on abstractions, not low-level implementations
- Context and injection frameworks supply dependencies

Example:
- Components inject telemetry provider instead of importing directly
- Hooks receive validators as parameters

### Privacy Architecture

#### Constraint Alpha: Zero-State PII Persistence
```
H = SHA-256(PII ∥ Salt_daily)
```
- PII is never stored in raw form
- Daily-rotating salt enables analytics tracking
- Mathematically useless if exfiltrated

**Implementation**: `lib/security/pii-hasher.ts`

#### Constraint Beta: Environment Variable Isolation
- Public Git index remains sterile
- All secrets resolved at runtime via Edge provider
- Client-safe variables prefixed with `NEXT_PUBLIC_`
- Server-only variables never exposed to browser

**Implementation**: `lib/security/environment-config.ts`

#### Constraint Gamma: Client-Side Hostility Assumption
- Client validation is UX only
- All inputs re-validated at serverless boundary
- No Base64/bit-shifting obfuscation (cryptographically useless)
- Strict typing enforced server-side

**Implementation**: `lib/security/input-validator.ts`, `app/api/v1/contact/route.ts`

### Directory Structure

```
├── app/
│   ├── api/v1/
│   │   ├── contact/       → Contact form API (PII handling)
│   │   └── telemetry/     → Analytics API (hashing)
│   ├── contact/           → Contact page
│   ├── portfolio/         → Portfolio page
│   ├── feed/              → News feed page
│   ├── stack/             → Tech stack page
│   ├── about/             → About page
│   ├── layout.tsx         → Root layout
│   ├── page.tsx           → Home page
│   └── globals.css        → Tailwind styles
│
├── components/
│   ├── ui/
│   │   └── WhatsAppButton.tsx    → SRP: Rendering only
│   ├── layout/
│   │   ├── Header.tsx            → OCP: Composable header
│   │   └── MainLayout.tsx        → SRP: Layout structure
│   ├── forms/
│   └── charts/
│
├── lib/
│   ├── security/
│   │   ├── pii-hasher.ts         → Constraint Alpha
│   │   ├── environment-config.ts → Constraint Beta
│   │   └── input-validator.ts    → Constraint Gamma
│   ├── telemetry/
│   │   ├── interfaces.ts         → ISP abstractions
│   │   └── provider.ts           → Telemetry implementation
│   ├── hooks/
│   │   ├── useTurnstileValidation.ts
│   │   └── useInteractionTelemetry.ts
│   └── utils/
│       └── common.ts
│
├── content/
│   ├── news/                → MDX news articles
│   └── portfolio/           → Portfolio project data
│
└── .devcontainer/
    └── devcontainer.json    → WSL2 isolation
```

### Development

**Local Setup (WSL2 DevContainer)**
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Linting & formatting
npm run lint
npm run lint:fix

# Production build
npm run build
npm start
```

**Environment Configuration**
1. Copy `.env.example` to `.env.local`
2. Populate with actual secrets from Edge provider
3. Never commit `.env.local` (in `.gitignore`)

### Security Best Practices

✅ **Implemented**
- PII hashing with daily salt rotation
- Zero-trust client assumption
- Serverless boundary validation
- Type-safe environment configuration
- Input sanitization (no obfuscation)
- Immutable privacy constraints

❌ **Forbidden**
- Base64/bit-shifting PII encoding
- Raw PII in logs or database
- Obfuscation as security
- Client-only validation
- Exposing secrets in version control

### Trade-offs

| Aspect | Benefit | Cost |
|--------|---------|------|
| S.O.L.I.D. interfaces | Maintainability, testability | Initial development overhead |
| Zero-trust architecture | Absolute privacy compliance | Slight performance overhead |
| DevContainer isolation | Environment reproducibility | WSL2 hypervisor resource usage |
| Daily-rotating salt | Analytics tracking | Cannot reconstruct hourly patterns |

---

**Version**: 0.1.0  
**License**: MIT
