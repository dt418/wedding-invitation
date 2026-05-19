# Deployment

## Local Development

```bash
pnpm install
docker compose up -d              # Start PostgreSQL
cp .env.example .env.local         # Set DATABASE_URL, JWT_SECRET
pnpm db:migrate                    # Apply migrations
pnpm db:seed                       # Seed demo user + templates
pnpm dev                           # Start dev server (Turbopack)
```

### Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://wedding:wedding123@localhost:5432/wedding_invitation` |
| `JWT_SECRET` | Min 32 chars, used for JWT signing | Any secure random string |
| `NODE_ENV` | `development` or `production` | `development` |
| `NEXT_PUBLIC_BASE_URL` | Public URL for invite page self-fetch (optional) | `http://localhost:3000` |

## Production

### Database

- **Neon PostgreSQL** (recommended for serverless)
  - Neon connection string in `DATABASE_URL`
  - Branch-based workflow for staging/production separation
- **Self-hosted Docker** via `docker-compose.yml` for local/monolith

### Runtime

- **Node.js** runtime (Next.js server)
- Vercel deployment recommended for zero-config Next.js hosting
- Environment variables set via Vercel dashboard or `vercel env`

### Build

```bash
pnpm build          # Next.js production build
pnpm db:generate    # Generate migration from schema changes
pnpm db:migrate     # Apply migrations to production DB
```

### Docker Compose (self-hosted)

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: wedding
      POSTGRES_PASSWORD: wedding123
      POSTGRES_DB: wedding_invitation
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

## Deployment Checklist

- [ ] Set `JWT_SECRET` in production env (min 32 chars)
- [ ] Set `DATABASE_URL` to production Neon connection string
- [ ] Run `pnpm db:migrate` against production DB
- [ ] Verify `wedding_token` cookie domain matches production domain
- [ ] Test public invite page at `/invite/[code]` with a seeded event
- [ ] Set `NEXT_PUBLIC_BASE_URL` to production public URL if using Vercel

## Auth Cookie

- Cookie name: `wedding_token`
- HttpOnly, SameSite=Lax
- 7-day expiry
- Requires `JWT_SECRET` to be consistent across instances

## Current Implementation

### What's Working
- Docker Compose local dev with PostgreSQL
- Vercel-compatible Next.js deployment structure
- Environment variable based configuration (no hardcoded secrets)
- Seed script for demo data provisioning

### Gaps

1. **No CI/CD pipeline**: no GitHub Actions workflow defined.
2. **No CDN configuration**: invite images/thumbnails served directly; no CDN for static assets.
3. **No Redis/session store**: JWT is stateless; no server-side session invalidation.
4. **No rate limiting on public RSVP endpoint**: `/api/invites/[code]/rsvp` can be hammered.
5. **No email/SMS dispatch infrastructure**: invite delivery is not yet implemented.

## Recommended Incremental Improvements

1. Add GitHub Actions workflow: lint → typecheck → build → deploy preview.
2. Configure `vercel.json` for Edge Functions if latency-sensitive routes benefit.
3. Add rate limiting middleware on `/api/invites/*` using `@upstash/ratelimit` or similar.
4. Implement server-side session invalidation list with Upstash Redis if JWT revocation needed.
5. Add CDN configuration for invite thumbnails and template previews (Vercel Blob or Cloudflare R2).
6. Integrate Resend for email invite delivery.
7. Set up Neon branching for staging environment separate from production.