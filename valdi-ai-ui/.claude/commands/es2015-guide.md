# ES2015 (ES6) Constraints for Valdi

Valdi compiles TypeScript to native code (iOS/Android) targeting ES2015 (ES6) only. This command provides guidance on ES2015 constraints and compatible alternatives for modern JavaScript features.

## Core Constraint

**Target:** ES2015 (ES6) only - No ES2017+ features available

**Why:** Valdi compiles TypeScript directly to native code without a JavaScript runtime. The TypeScript compiler is configured to target ES2015, which means newer JavaScript features from ES2017+ are not available.

## Unavailable ES2017+ Features

### 1. Promise.allSettled (ES2020)

```typescript
// ❌ NOT AVAILABLE - ES2020 feature
const results = await Promise.allSettled(promises);

// ✅ ES2015 ALTERNATIVE - Manual implementation
const results = await Promise.all(
  promises.map(p =>
    p.then(value => ({ status: 'fulfilled' as const, value }))
     .catch(reason => ({ status: 'rejected' as const, reason }))
  )
);

// Filter fulfilled promises
const fulfilled = results
  .filter((r): r is { status: 'fulfilled'; value: any } => r.status === 'fulfilled')
  .map(r => r.value);

// Filter rejected promises
const rejected = results
  .filter((r): r is { status: 'rejected'; reason: any } => r.status === 'rejected')
  .map(r => r.reason);
```

### 2. Object.entries / Object.values (ES2017)

```typescript
// ❌ NOT AVAILABLE - ES2017 feature
const entries = Object.entries(obj);
const values = Object.values(obj);

// ✅ ES2015 ALTERNATIVE - Manual iteration
const entries: [string, any][] = [];
for (const key in obj) {
  if (obj.hasOwnProperty(key)) {
    entries.push([key, obj[key]]);
  }
}

const values: any[] = [];
for (const key in obj) {
  if (obj.hasOwnProperty(key)) {
    values.push(obj[key]);
  }
}

// Or use Object.keys (ES5, available)
const entries = Object.keys(obj).map(key => [key, obj[key]] as [string, any]);
const values = Object.keys(obj).map(key => obj[key]);
```

### 3. Optional Chaining (?.) (ES2020)

```typescript
// ❌ NOT AVAILABLE - ES2020 feature
const value = obj?.prop?.nested;

// ✅ ES2015 ALTERNATIVE - Manual null checks
const value = obj && obj.prop && obj.prop.nested;

// Or with ternary
const value = obj ? (obj.prop ? obj.prop.nested : undefined) : undefined;
```

### 4. Nullish Coalescing (??) (ES2020)

```typescript
// ❌ NOT AVAILABLE - ES2020 feature
const value = input ?? defaultValue;

// ✅ ES2015 ALTERNATIVE - Explicit null/undefined check
const value = (input !== null && input !== undefined) ? input : defaultValue;

// ⚠️ NOT THE SAME - treats falsy values differently
const value = input || defaultValue; // Also replaces 0, '', false
```

### 5. Async Iteration (ES2018)

```typescript
// ❌ NOT AVAILABLE - ES2018 feature
for await (const item of asyncIterable) {
  console.log(item);
}

// ✅ ES2015 ALTERNATIVE - Promise.all or sequential awaits
const items = await Promise.all(arrayOfPromises);
for (const item of items) {
  console.log(item);
}

// Or sequential processing
for (const promise of arrayOfPromises) {
  const item = await promise;
  console.log(item);
}
```

### 6. String.prototype.padStart / padEnd (ES2017)

```typescript
// ❌ NOT AVAILABLE - ES2017 feature
const padded = str.padStart(10, '0');

// ✅ ES2015 ALTERNATIVE - Manual padding
function padStart(str: string, targetLength: number, padString: string = ' '): string {
  if (str.length >= targetLength) {
    return str;
  }
  const padding = padString.repeat(Math.ceil((targetLength - str.length) / padString.length));
  return padding.slice(0, targetLength - str.length) + str;
}
```

### 7. Object.fromEntries (ES2019)

```typescript
// ❌ NOT AVAILABLE - ES2019 feature
const obj = Object.fromEntries(entries);

// ✅ ES2015 ALTERNATIVE - Manual object construction
const obj: Record<string, any> = {};
for (const [key, value] of entries) {
  obj[key] = value;
}

// Or with reduce
const obj = entries.reduce((acc, [key, value]) => {
  acc[key] = value;
  return acc;
}, {} as Record<string, any>);
```

### 8. Array.prototype.flat / flatMap (ES2019)

```typescript
// ❌ NOT AVAILABLE - ES2019 feature
const flat = nested.flat();
const mapped = arr.flatMap(x => [x, x * 2]);

// ✅ ES2015 ALTERNATIVE - Manual flattening
const flat: any[] = [];
for (const item of nested) {
  if (Array.isArray(item)) {
    flat.push(...item);
  } else {
    flat.push(item);
  }
}

// Or with reduce
const flat = nested.reduce((acc, val) => acc.concat(val), []);

// flatMap alternative
const mapped = arr.reduce((acc, x) => acc.concat([x, x * 2]), [] as number[]);
```

### 9. Promise.finally (ES2018)

```typescript
// ❌ NOT AVAILABLE - ES2018 feature
promise
  .then(handleSuccess)
  .catch(handleError)
  .finally(cleanup);

// ✅ ES2015 ALTERNATIVE - Manual cleanup in both paths
promise
  .then(result => {
    cleanup();
    return handleSuccess(result);
  })
  .catch(error => {
    cleanup();
    return handleError(error);
  });

// Or with explicit try-catch in async function
try {
  const result = await promise;
  return handleSuccess(result);
} catch (error) {
  return handleError(error);
} finally {
  cleanup();
}
```

### 10. Async Generators (ES2018)

```typescript
// ❌ NOT AVAILABLE - ES2018 feature
async function* generateValues() {
  yield await fetchValue1();
  yield await fetchValue2();
}

// ✅ ES2015 ALTERNATIVE - Return array of promises
async function generateValues(): Promise<any[]> {
  return [
    await fetchValue1(),
    await fetchValue2(),
  ];
}
```

## Available ES2015 Features

These ES6 features ARE available and should be used:

- **Arrow functions:** `(x) => x * 2`
- **let/const:** Block-scoped variables
- **Template literals:** `` `Hello ${name}` ``
- **Destructuring:** `const { x, y } = obj`
- **Spread operator:** `[...arr]`, `{ ...obj }`
- **Classes:** `class MyClass extends BaseClass`
- **Promises:** `new Promise()`, `Promise.all()`, `Promise.race()`
- **Modules:** `import/export`
- **Default parameters:** `function foo(x = 10)`
- **Rest parameters:** `function foo(...args)`
- **for...of loops:** `for (const item of items)`
- **Map/Set:** `new Map()`, `new Set()`
- **Symbol:** `Symbol('description')`
- **Iterators/Generators:** `function*`, `yield`
- **Array methods:** `.find()`, `.findIndex()`, `.includes()` (ES2016, but available)

## TypeScript Configuration

Your `tsconfig.json` should specify ES2015 target:

```json
{
  "compilerOptions": {
    "target": "ES2015",
    "lib": ["ES2015"],
    "module": "ES2015"
  }
}
```

## Common Patterns

### Safe Property Access

```typescript
// ✅ Pattern: Guard clauses
function getUserEmail(user: User | undefined): string | undefined {
  if (!user) return undefined;
  if (!user.profile) return undefined;
  return user.profile.email;
}

// ✅ Pattern: Type guards
function hasEmail(user: any): user is { profile: { email: string } } {
  return user && user.profile && typeof user.profile.email === 'string';
}

if (hasEmail(user)) {
  console.log(user.profile.email); // Type-safe access
}
```

### Default Values

```typescript
// ✅ Pattern: Function parameters with defaults
function createUser(name: string, role: string = 'user') {
  // role defaults to 'user' if not provided
}

// ✅ Pattern: Destructuring with defaults
function processConfig({ timeout = 5000, retries = 3 } = {}) {
  // Use timeout and retries
}

// ✅ Pattern: Explicit undefined checks
const displayName = (name !== undefined && name !== null) ? name : 'Anonymous';
```

### Array Flattening

```typescript
// ✅ Pattern: One-level flatten with spread
const flattened = [].concat(...nested);

// ✅ Pattern: Deep flatten with recursion
function flattenDeep(arr: any[]): any[] {
  return arr.reduce(
    (acc, val) => Array.isArray(val)
      ? acc.concat(flattenDeep(val))
      : acc.concat(val),
    []
  );
}
```

### Object Manipulation

```typescript
// ✅ Pattern: Map object with Object.keys
const mapped = Object.keys(obj).reduce((acc, key) => {
  acc[key] = transform(obj[key]);
  return acc;
}, {} as Record<string, any>);

// ✅ Pattern: Filter object properties
const filtered = Object.keys(obj).reduce((acc, key) => {
  if (shouldKeep(obj[key])) {
    acc[key] = obj[key];
  }
  return acc;
}, {} as Record<string, any>);
```

## Reference Documentation

For detailed lessons learned about Valdi's ES2015 constraints, see:
- `/Users/sarda/valdi-xplatform-ui/valdi-ai-ui/VALDI_LESSONS_LEARNED.md` (Lesson #7)

## Quick Checklist

Before writing code for Valdi:
- [ ] No `Promise.allSettled` - use manual Promise.all wrapper
- [ ] No `Object.entries`/`values` - use Object.keys with map
- [ ] No optional chaining (`?.`) - use manual null checks
- [ ] No nullish coalescing (`??`) - use explicit checks
- [ ] No async iteration - use Promise.all or sequential await
- [ ] No `Promise.finally` - use try-catch-finally or manual cleanup
- [ ] Verify all code compiles with ES2015 target
- [ ] Test that TypeScript doesn't show property not found errors

## Error Messages to Watch For

If you see these TypeScript errors, you're using ES2017+ features:
- `Property 'allSettled' does not exist on type 'PromiseConstructor'`
- `Property 'entries' does not exist on type 'ObjectConstructor'`
- `Property 'values' does not exist on type 'ObjectConstructor'`
- `Property 'finally' does not exist on type 'Promise'`
- `Property 'flat' does not exist on type 'any[]'`
- `Property 'flatMap' does not exist on type 'any[]'`

When you encounter these, refer to this guide for ES2015-compatible alternatives.
