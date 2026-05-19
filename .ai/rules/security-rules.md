# Security Rules

## Authentication

### JWT Tokens
```typescript
// Token structure
{
  userId: string;
  exp: number; // 7 days from now
}

// Always verify on protected routes
const token = req.cookies.get('wedding_token')?.value;
if (!token) return unauthorized;

const payload = verifyToken(token);
if (!payload) return unauthorized;
```

### Password Handling
```typescript
// Hash with bcrypt
const hash = await hashPassword(password);

// Verify with bcrypt
const match = await verifyPassword(password, hash);
```

### Cookie Settings
```typescript
cookieStore.set('wedding_token', token, {
  httpOnly: true,    // XSS protection
  secure: true,      // HTTPS only in production
  sameSite: 'lax',   // CSRF protection
  maxAge: 60 * 60 * 24 * 7, // 7 days
});
```

## Authorization

### Resource Ownership
```typescript
async function getEvent(id: string, userId: string) {
  const event = await db.query.events.findFirst({
    where: and(
      eq(events.id, id),
      eq(events.userId, userId)
    ),
  });
  if (!event) return unauthorized;
  return event;
}
```

### Middleware
```typescript
// src/middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('wedding_token')?.value;
  const isAuthRoute = request.nextUrl.pathname.startsWith('/(dashboard)');
  
  if (isAuthRoute && !token) {
    return NextResponse.redirect('/login');
  }
}
```

## Input Validation

### Zod Schemas
```typescript
// Always validate at API boundary
const parsed = schema.safeParse(data);
if (!parsed.success) {
  return NextResponse.json(
    { error: 'Invalid input' },
    { status: 400 }
  );
}
```

### SQL Injection Prevention
```typescript
// Use parameterized queries (Drizzle handles this)
await db.query.events.findFirst({
  where: eq(events.id, id), // Safe
});

// Never interpolate user input in queries
// BAD: \`WHERE id = '\${userInput}'\`
```

## API Security

### Rate Limiting (Future)
```typescript
// Basic rate limiting
const requestCount = await redis.incr(ip);
if (requestCount > 100) return 429;
```

### CORS
```typescript
// Only allow known origins
export function GET(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (!allowedOrigins.includes(origin)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
}
```

### Security Headers
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    }],
  },
};
```

## Data Protection

### Sensitive Data
- Never log passwords or tokens
- Mask sensitive fields in responses
- Encrypt at rest (handled by Neon)

### Environment Variables
```
# NEVER commit these
DATABASE_URL=postgresql://...
JWT_SECRET=min-32-chars-secret
```

## Public Routes

### Invite Pages
- Validate invite code exists
- Track view analytics
- No sensitive data exposure

### RSVP Submission
- Validate invite code matches
- Rate limit submissions
- No duplicate RSVPs

## Security Checklist

- [ ] All inputs validated with Zod
- [ ] User can only access own data
- [ ] JWT tokens verified on protected routes
- [ ] Passwords hashed with bcrypt
- [ ] HTTP-only cookies
- [ ] No SQL injection (use Drizzle)
- [ ] Security headers set
- [ ] Sensitive data not logged
