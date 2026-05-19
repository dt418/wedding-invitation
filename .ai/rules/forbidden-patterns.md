# Forbidden Patterns

## Security

### Never Do This
```typescript
// SQL injection - FORBIDDEN
const query = \`SELECT * FROM users WHERE id = '\${userInput}'\`;


// XSS - FORBIDDEN  
dangerouslySetInnerHTML={{ __html: userInput }}


// Hardcoded secrets - FORBIDDEN
const apiKey = 'sk-1234567890abcdef';

// Insecure cookies
cookieStore.set('token', token, { httpOnly: false });
```

## Code Quality

### Forbidden
```typescript
// Any
// TODO: fix later
// HACK
// FIXME
// Remove this later

// commented code in PRs

// console.log in production code

// @ts-ignore without comment

// Magic numbers
const timeout = 12345; // use constant

// Deep nesting
if (a) {
  if (b) {
    if (c) {
      if (d) { // max 3 levels
```

## React

### Forbidden Patterns
```typescript
// Inline event handlers in JSX - bad
<button onClick={() => handleClick()}>

// Create functions in render - bad
return items.map(item => <div>{() => format(item)}</div>);

// Mutate state directly - bad
setData(data.push(newItem));

// Prop drilling - bad
<Parent><Child><GrandChild data={data} /></Child></Parent>

// Missing key in list - bad
items.map(item => <div>{item.name}</div>);

// Index as key (when order changes) - bad
items.map((item, i) => <div key={i}>)

// className instead of class - bad
<div class="my-class">

// Internal state for derived data - bad
const [derivedData, setDerivedData] = useState([]);
useEffect(() => setDerivedData(computeData(data)), [data]);
// useMemo instead
```

## State Management

### Forbidden
```typescript
// Prop drilling beyond 2 levels
<Level1><Level2><Level3 data={data} /></Level2></Level1>

// Fetch in useEffect for server data
useEffect(() => {
  fetch('/api/data').then(setData);
}, []);

// Duplicate state
const [name, setName] = useState('');
const [nameCopy, setNameCopy] = useState('');

// Blocking state updates
setState(value);
await nextState; // use await setState instead
```

## Performance

### Forbidden
```typescript
// Animating layout properties
transition: width 0.3s, height 0.3s;

// Unoptimized images
<img src={largeImage} /> // Use Next.js Image

// Large bundle imports
import _ from 'lodash'; // import specific functions

// Client component for static content
'use client'; // only when interactivity needed

// Unnecessary re-renders
function Parent() {
  return <Child onClick={() => console.log('click')} />;
  // onClick recreated each render - use useCallback
}
```

## Database

### Forbidden
```typescript
// SELECT * in production
await db.select().from(events); // specify columns

// N+1 queries
for (const event of events) {
  const guests = await db.query.guests.findMany({ where: eq(guests.eventId, event.id) });
}

// Missing indexes on large tables
// Add composite indexes for WHERE + ORDER BY

// Not using transactions
await db.insert(event);
await db.insert(guests); // if guests insert fails, event orphaned

// String interpolation in queries (use Drizzle)
.where(sql\`id = '\${id}'\`); // danger
```

## File Structure

### Forbidden
```typescript
// Components in wrong location
components/
  some-random-file.ts // not a component

// Utils without tests
lib/complex-util.ts // needs tests

// Mixed concerns
component.tsx // contains both component and utility
```

## Testing

### Forbidden
```typescript
// No tests for critical paths
// Critical: auth, payments, data mutations

// Skipping tests
test.skip('important test', () => { ... });

// Sleep in tests
await new Promise(r => setTimeout(r, 1000)); // use waitFor instead

// Not testing error states
// Must test both success and failure
```
