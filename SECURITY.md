# Security Policy

## Security Overview

YI Studio Business Service prioritizes security through:

1. **Zero-Trust Architecture** - All inputs re-validated server-side
2. **PII Protection** - Hashed storage with daily-rotating salt
3. **Rate Limiting** - Token bucket algorithm prevents abuse
4. **CI/CD Scanning** - TruffleHog detects secrets, npm audit scans dependencies
5. **Environment Isolation** - Secrets never committed, only injected at runtime

---

## Reporting Security Issues

⚠️ **DO NOT** open public GitHub issues for security vulnerabilities.

Instead, please email security concerns to: **yukio@example.com**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will acknowledge receipt within 48 hours and provide updates as we investigate.

---

## Security Best Practices for This Project

### For Contributors

1. **Never commit secrets**
   ```bash
   # ❌ Don't
   DATABASE_URL=postgresql://user:password@host
   TURNSTILE_SECRET_KEY=0x4AAE1234567890ABCDEF
   
   # ✅ Do
   DATABASE_URL=string
   TURNSTILE_SECRET_KEY=string
   ```

2. **Use `.env.local` for development**
   ```bash
   # Create locally (gitignored)
   echo "DATABASE_URL=postgresql://..." > .env.local
   echo "UPSTASH_REDIS_URL=..." >> .env.local
   ```

3. **Input Validation - Always**
   ```typescript
   // ❌ Never trust client input
   const email = req.body.email;
   
   // ✅ Always validate server-side
   const email = parseEmail(req.body.email);
   if (!isValidEmail(email)) throw new Error('Invalid');
   ```

4. **Use prepared statements**
   ```typescript
   // ✅ Prisma prevents SQL injection
   await db.contact.create({
     data: { emailHash: hasher(email) }
   });
   ```

### For Developers/Maintainers

1. **Keep dependencies updated**
   ```bash
   npm audit              # Check for vulnerabilities
   npm update             # Update to latest versions
   npm ci                 # Use lock file in CI/CD
   ```

2. **Branch protection rules** (enabled on `main`)
   - Require status checks to pass
   - Require code review
   - Require TruffleHog secret scan
   - Require npm audit < moderate

3. **GitHub Secrets Management**
   - Add to: Settings → Secrets and variables
   - Required secrets:
     ```
     DATABASE_URL          # PostgreSQL connection string
     UPSTASH_REDIS_URL     # Redis connection endpoint
     UPSTASH_REDIS_TOKEN   # Redis authentication token
     TURNSTILE_SECRET_KEY  # Cloudflare CAPTCHA secret
     WHATSAPP_API_TOKEN    # WhatsApp Business API token
     ```

4. **Monitoring & Alerting**
   - Review GitHub Actions security scanning logs
   - Monitor error logs for injection attempts
   - Rotate Redis/API tokens quarterly

---

## Security Architecture

### Privacy Constraints (Static)

```
α: Zero-State PII Persistence
   ├─ Email stored as SHA-256 hash
   ├─ Hash = SHA-256(email || daily_salt)
   └─ Prevents email-to-user correlation

β: Environment Variable Isolation
   ├─ Secrets loaded from ENV only
   ├─ Never hardcoded in source
   └─ Github Actions injects at build-time

γ: Client-Side Hostility Assumption
   ├─ Client validation is UX only
   ├─ Server re-validates all inputs
   └─ Never trust client state
```

### Rate Limiting Constraints (Dynamic)

```
Contact Form: 5 requests/hour per IP
├─ Prevents DoS attacks
├─ Token bucket (sliding window)
└─ Upstash Redis backend

Telemetry: 100 events/minute per session
├─ Prevents spam submissions
├─ Distributed state (multi-region)
└─ Falls back to in-memory
```

### CI/CD Security Gates

```
Job 1: Lint & Type Check (always required)
├─ ESLint rules enforced
└─ TypeScript strict mode

Job 2: Build (requires Job 1)
├─ Next.js compilation
├─ Prisma client generation
└─ Artifact size check

Job 3: Security Scanning (parallel)
├─ npm audit (moderate or lower)
├─ TruffleHog secret detection
└─ Dependency vulnerability scan

Job 4: Deploy (main branch only, requires all above)
├─ Upload to artifact storage
├─ Manual review before production
└─ Deployment logs secured
```

---

## Known Security Considerations

### Analyzed & Mitigated

1. **SQL Injection** ✅
   - Prisma ORM prevents injection
   - Parameterized queries used throughout

2. **XSS (Cross-Site Scripting)** ✅
   - React escapes JSX content by default
   - Input sanitization in `input-validator.ts`
   - Content Security Policy recommended

3. **CSRF (Cross-Site Request Forgery)** ✅
   - Next.js built-in CSRF protection
   - SameSite cookies enabled

4. **Brute Force / DoS** ✅
   - Rate limiting on all APIs
   - Upstash Redis handles distributed attacks
   - CAPTCHA on contact form

5. **Secrets Exposure** ✅
   - TruffleHog scans commits
   - Pre-commit hooks prevent .env commits
   - Environment variable isolation

### Recommendations for Further Hardening

- [ ] Implement Web Application Firewall (WAF)
- [ ] Add HSTS header (HTTP Strict Transport Security)
- [ ] Enable Content Security Policy (CSP)
- [ ] Implement request signing for sensitive operations
- [ ] Add end-to-end encryption for PII in transit
- [ ] Regular penetration testing (quarterly)
- [ ] Security audit of dependencies (triannually)

---

## Dependencies & Vulnerabilities

Current security status: **PASS**

Key dependencies with security implications:
- `@prisma/client` - Database ORM (actively maintained)
- `@upstash/ratelimit` - Rate limiting (regularly updated)
- `@upstash/redis` - Redis client (encrypted in transit)
- `next` - Framework (frequent security updates)
- `react` - UI library (security-focused maintainers)

Check status regularly:
```bash
npm audit                    # List vulnerabilities
npm audit fix                # Auto-fix safe vulnerabilities
npm outdated                 # Show outdated packages
```

---

## Compliance & Standards

This project adheres to:

- ✅ **OWASP Top 10** - Common security risks mitigated
- ✅ **S.O.L.I.D. Principles** - Secure by design
- ✅ **GDPR Ready** - PII hashed, user rights enabled
- ✅ **Zero-Trust Model** - Never trust client input
- ✅ **Least Privilege** - Environment variables scoped minimally

---

## Incident Response

If a security incident is suspected:

1. **Report immediately** (security@example.com or private email)
2. **Do not** open a public issue or discuss on social media
3. **Provide details**:
   - Affected component/endpoint
   - Reproduction steps
   - Severity assessment
   - Suggested mitigation
4. **Timeline**:
   - Acknowledgment: Within 24 hours
   - Patch release: Within 48-72 hours
   - Public disclosure: After patch released

---

## Last Updated

**Date**: March 26, 2026  
**Version**: 1.0  
**Next Review**: June 26, 2026

Contact: security@example.com
