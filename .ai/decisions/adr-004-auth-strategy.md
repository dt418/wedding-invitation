# ADR-004: JWT Cookie Authentication

## Status
Accepted

## Context
We needed an authentication system that:
- Works with Next.js App Router
- Is secure against XSS and CSRF
- Supports server-side rendering
- Has simple token management

## Decision
We use **JWT in HTTP-only cookies** with the `wedding_token` cookie name.

### Token Structure
```typescript
interface TokenPayload {
  userId: string;
  exp: number; // Expiry timestamp
}
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

### Verification Pattern
```typescript
// In API routes
export async function GET(req: NextRequest) {
  const token = req.cookies.get('wedding_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
  
  const userId = payload.userId;
  // Proceed with authenticated request
}
```

## Rationale

### JWT Benefits
1. **Stateless** - No session storage needed
2. **Scalable** - Works across instances
3. **Simple** - No complex session management

### HTTP-Only Cookie Benefits
1. **XSS protection** - JavaScript can't access token
2. **Automatic** - Browser handles storage
3. **CSRF protection** - `sameSite: 'lax'`

### Alternatives Considered

### Session Storage
- **Rejected**: Requires session storage service
- More complex infrastructure

### LocalStorage with Header
```typescript
localStorage.getItem('token')
```
- **Rejected**: Vulnerable to XSS attacks
- Need to manually handle header

### NextAuth.js
- **Rejected**: Overkill for simple JWT auth
- Want full control over implementation

## Consequences

### Positive
- Simple implementation
- No external dependencies
- Works with SSR
- Scalable

### Negative
- Token in URL is visible (avoid putting in URLs)
- Refresh token strategy needed for long sessions (future)
- Revocation requires token blacklist (future)

## Security Notes

1. **Never log tokens** - Security violation
2. **HTTPS only** - Secure flag in production
3. **7 day expiry** - Balance convenience vs security
4. **Min 32 char secret** - For JWT signing
