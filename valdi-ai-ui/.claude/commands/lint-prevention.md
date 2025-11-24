# Lint Prevention Guide

## Usage
Reference this to write TypeScript code that passes ESLint without errors or warnings.

## Context
This project uses strict ESLint configuration with TypeScript 5.7.2 and follows 2025 best practices.

## ESLint Configuration
Located at `.eslintrc.js` with these key rules:

### Type Safety Rules (STRICT)
```typescript
// ❌ NEVER use 'any' type
const data: any = fetchData(); // ERROR

// ✅ Use proper types
const data: UserData = fetchData();

// ❌ NO explicit 'any'
function process(data: any): any { } // ERROR

// ✅ Use generics or specific types
function process<T>(data: T): T { }
function process(data: UserData): ProcessedData { }

// ❌ NO non-null assertions (avoid !)
const value = obj.prop!; // WARNING

// ✅ Use type guards or optional chaining
const value = obj.prop ?? defaultValue;
if (obj.prop !== undefined) {
  const value = obj.prop;
}
```

### Function Return Types
```typescript
// ❌ Missing return type
function calculate(a: number, b: number) { // WARNING
  return a + b;
}

// ✅ Explicit return type
function calculate(a: number, b: number): number {
  return a + b;
}

// ✅ Expressions allowed without return type
const calculate = (a: number, b: number) => a + b;

// ✅ Async functions must have return type
async function fetchData(): Promise<UserData> {
  return await api.get('/user');
}
```

### Unused Variables
```typescript
// ❌ Unused variables
const unusedVar = 10; // ERROR
function example(unusedParam: string) { } // ERROR

// ✅ Prefix with underscore if intentionally unused
const _unusedVar = 10;
function example(_unusedParam: string) { }

// ✅ Or remove them entirely
function example() { }
```

### Promise Handling
```typescript
// ❌ Floating promises (CRITICAL ERROR)
fetchData(); // ERROR - promise not handled

// ✅ Always await or handle promises
await fetchData();

// Or explicitly handle
fetchData().catch(console.error);

// Or mark as intentional
void fetchData();

// ❌ Misused promises
if (fetchData()) { } // ERROR - promise in condition

// ✅ Await the promise first
const result = await fetchData();
if (result) { }
```

### Async/Await Best Practices
```typescript
// ❌ Return await (except in try-catch)
async function get(): Promise<Data> {
  return await fetchData(); // WARNING
}

// ✅ Direct return
async function get(): Promise<Data> {
  return fetchData();
}

// ✅ But DO use await in try-catch
async function get(): Promise<Data> {
  try {
    return await fetchData(); // CORRECT
  } catch (error) {
    handleError(error);
  }
}

// ❌ Async function without await
async function process(): Promise<void> { // WARNING
  doSomething();
}

// ✅ Remove async or add await
function process(): void {
  doSomething();
}
```

### Type Imports
```typescript
// ❌ Regular import for types
import { UserData } from './types'; // WARNING (if only used as type)

// ✅ Use type imports
import type { UserData } from './types';

// ✅ Mixed imports
import { fetchUser, type UserData, type Config } from './api';

// ❌ Type exports without 'export type'
export { UserData }; // WARNING

// ✅ Use export type
export type { UserData };
```

### Naming Conventions (STRICT)
```typescript
// ✅ CORRECT naming
interface UserData { }        // PascalCase for interfaces
type ApiResponse = { };       // PascalCase for types
class ChatService { }         // PascalCase for classes
enum UserRole { }             // PascalCase for enums
const USER_ROLE = 'admin';    // UPPER_CASE for constants
const userData = { };         // camelCase for variables
function fetchData() { }      // camelCase for functions
const _private = 10;          // Leading underscore allowed

// Component/Function as variable (PascalCase allowed)
const Button = () => <view />;

// ❌ WRONG naming
interface userData { }         // ERROR - should be PascalCase
class chatService { }         // ERROR - should be PascalCase
const UserData = { };         // WARNING - confusing (looks like type)
function FetchData() { }      // WARNING - should be camelCase
```

### Boolean Expressions
```typescript
// ❌ Unnecessary conditions
if (isValid === true) { }     // WARNING
if (count !== 0) { }          // WARNING if count is boolean

// ✅ Direct boolean use
if (isValid) { }
if (count > 0) { }

// ❌ Unnecessary type assertions
const value = data as UserData; // WARNING if unnecessary

// ✅ Only assert when needed
const value = data; // TypeScript can infer
```

### Array Methods
```typescript
// ❌ Array.sort() without compare function
numbers.sort(); // WARNING - unreliable

// ✅ Provide compare function
numbers.sort((a, b) => a - b);
strings.sort((a, b) => a.localeCompare(b));
```

### Switch Exhaustiveness
```typescript
enum Status { Active, Inactive, Pending }

// ❌ Non-exhaustive switch
function handle(status: Status): string {
  switch (status) {
    case Status.Active: return 'active';
    case Status.Inactive: return 'inactive';
    // ERROR - missing Status.Pending
  }
}

// ✅ Exhaustive switch
function handle(status: Status): string {
  switch (status) {
    case Status.Active: return 'active';
    case Status.Inactive: return 'inactive';
    case Status.Pending: return 'pending';
  }
}

// ✅ Or use default
function handle(status: Status): string {
  switch (status) {
    case Status.Active: return 'active';
    default: return 'other';
  }
}
```

### Console Usage
```typescript
// ❌ console.log in production code
console.log('Debug info'); // WARNING

// ✅ Allowed console methods
console.warn('Warning message');
console.error('Error occurred');
console.info('Info message');

// ✅ Or use proper logger
logger.debug('Debug info');
```

### Prefer Modern JavaScript
```typescript
// ❌ Old patterns
var x = 10;                    // ERROR - use const/let
const obj = { x: x };          // WARNING - use shorthand
const str = 'Hello ' + name;   // WARNING - use template

// ✅ Modern patterns
const x = 10;
const obj = { x };
const str = `Hello ${name}`;

// ✅ Arrow functions preferred
const handler = () => { };

// ✅ Destructuring preferred
const { name, age } = user;
const [first, second] = array;
```

### Valdi-Specific Patterns
```typescript
// ✅ Always use 'override' keyword
export class MyComponent extends Component<Props> {
  override onCreate(): void { }    // REQUIRED 'override'
  override onRender(): JSX.Element { }
}

// ✅ Consistent type definitions (prefer interface)
interface UserData { }  // ✅ Preferred
type UserData = { };    // ⚠️  Only for unions/intersections

// ✅ Method signature style (property form)
interface Service {
  fetchData: () => Promise<Data>;  // ✅ Preferred
  // fetchData(): Promise<Data>;   // ❌ Not preferred
}
```

### Common Gotchas
```typescript
// ❌ Duplicate imports
import { A } from './module';
import { B } from './module'; // ERROR - combine

// ✅ Single import
import { A, B } from './module';

// ❌ Useless empty export
export {}; // WARNING

// ❌ Confusing void expression
const result = console.log('test'); // WARNING

// ✅ Separate statements
console.log('test');
const result = getValue();
```

## Quick Checklist Before Committing
- [ ] No `any` types used
- [ ] All functions have explicit return types
- [ ] All promises are awaited or handled
- [ ] No unused variables (or prefixed with `_`)
- [ ] Type imports use `import type`
- [ ] Naming follows conventions (PascalCase, camelCase, UPPER_CASE)
- [ ] Switch statements are exhaustive
- [ ] console.log replaced with warn/error/info
- [ ] Using const/let (never var)
- [ ] Lifecycle methods use `override` keyword

## Hooks Integration
After editing TypeScript files, hooks automatically run:
1. Type-checking with `tsc --noEmit`
2. Linting with `eslint`

Fix all errors before committing!

## Running Lint Manually
```bash
npm run lint              # Check for issues
npm run lint:fix          # Auto-fix issues
npm run type-check        # Type-check only
```
