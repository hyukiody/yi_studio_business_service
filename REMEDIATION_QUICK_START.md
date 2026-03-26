# Quick Setup Guide: Implementing Remediations

## Prerequisites
- Node.js 20+
- npm or yarn
- PostgreSQL 12+ (or SQLite for dev)
- Upstash Redis account (or local Redis)

---

## 🚀 Quick Start (15 minutes)

### Step 1: Install Dependencies
```bash
npm install @prisma/client @upstash/redis @upstash/ratelimit
npm install -D prisma
```

### Step 2: Configure Environment
```bash
cp .env.example .env.local

# Edit .env.local with your values:
# - DATABASE_URL (PostgreSQL or SQLite)
# - UPSTASH_REDIS_URL & UPSTASH_REDIS_TOKEN
# - TURNSTILE_SECRET_KEY
```

### Step 3: Setup Database
```bash
# Initialize Prisma (creates prisma/ folder)
npx prisma init

# Apply migrations
npx prisma migrate dev --name init

# Seed sample data (optional)
npx prisma db seed
```

### Step 4: Test Locally
```bash
npm run dev
# Visit http://localhost:3000/contact
# Submit form → Check database via `npx prisma studio`
```

---

## 📋 Implementation Checklist

### Database Persistence
- [ ] Create `prisma/schema.prisma`
- [ ] Create `prisma/seed.ts`
- [ ] Configure `DATABASE_URL` in `.env.local`
- [ ] Run migrations: `npx prisma migrate dev`
- [ ] Update `/api/v1/contact/route.ts` with Prisma queries
- [ ] Test: Submit form, verify in database

### Rate Limiting
- [ ] Create `lib/security/rate-limiter.ts`
- [ ] Configure Upstash Redis access keys
- [ ] Update `.env.local` with Redis credentials
- [ ] Modify `/api/v1/contact/route.ts` to check rate limit
- [ ] Test: Submit 6 requests, verify 429 on 6th

### CI/CD Pipeline
- [ ] Create `.github/workflows/ci.yml`
- [ ] Configure GitHub repository secrets
- [ ] Push to main branch
- [ ] Verify: GitHub Actions tab shows passing jobs
- [ ] Enable branch protection (require passing checks)

---

## 🔗 Full Documentation

See detailed implementation guide:
→ `.analysis/05_REMEDIATION_IMPLEMENTATION.md`

---

## 🧪 Validation Tests

### Database Persistence
```bash
# Connect to database
npx prisma studio

# Should see ContactSubmission table with sample data
```

### Rate Limiting
```bash
# Make 6 requests (5 succeed, 6 blocked)
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/v1/contact \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","name":"Test","message":"Hello"}'
  echo ""
done
# Last request returns 429 Too Many Requests
```

### CI/CD Pipeline
```bash
# Push to GitHub main branch
git add .
git commit -m "Add database, rate limiting, CI/CD"
git push origin main

# Watch: GitHub Actions tab
# Verify: lint, build, security jobs all pass ✅
```

---

## 🐛 Troubleshooting

### "DATABASE_URL not configured"
```bash
# Verify .env.local exists
cat .env.local | grep DATABASE_URL

# Restart dev server
npm run dev
```

### "Rate limit not working"
```bash
# Check Redis is running
curl https://your-upstash-instance.upstash.io

# Verify UPSTASH_REDIS_* env vars
echo $UPSTASH_REDIS_URL
```

### "GitHub Actions failing"
```bash
# Check secrets are configured
GitHub → Settings → Secrets and variables

# Required secrets:
# - DATABASE_URL
# - UPSTASH_REDIS_URL
# - UPSTASH_REDIS_TOKEN
# - TURNSTILE_SECRET_KEY
```

---

**Ready to implement? Start with Step 1 above!**
