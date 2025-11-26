# Lint Prevention Guide

## Usage
Reference this to write TypeScript code that passes ESLint without errors or warnings.

## Context
This project uses strict ESLint configuration with TypeScript 5.7.2 and follows 2025 best practices.

## ESLint Configuration
Located at `.eslintrc.js` with these key rules:

### Type Safety Rules (STRICT)
```typescript
// [FAIL] NEVER use 'any' type
const data: any = fetchData(); // ERROR

// [PASS] Use proper types
const data: UserData = fetchData();

// [FAIL] NO explicit 'any'
function process(data: any): any { } // ERROR

// [PASS] Use generics or specific types
function process<T>(data: T): T { }
function process(data: UserData): ProcessedData { }

// [FAIL] NO non-null assertions (avoid !)
const value = obj.prop!; // WARNING

// [PASS] Use type guards or optional chaining
const value = obj.prop ?? defaultValue;
if (obj.prop !== undefined) {
  const value = obj.prop;
}
```

### Function Return Types
```typescript
// [FAIL] Missing return type
function calculate(a: number, b: number) { // WARNING
  return a + b;
}

// [PASS] Explicit return type
function calculate(a: number, b: number): number {
  return a + b;
}

// [PASS] Expressions allowed without return type
const calculate = (a: number, b: number) => a + b;

// [PASS] Async functions must have return type
async function fetchData(): Promise<UserData> {
  return await api.get('/user');
}
```

### Unused Variables
```typescript
// [FAIL] Unused variables
const unusedVar = 10; // ERROR
function example(unusedParam: string) { } // ERROR

// [PASS] Prefix with underscore if intentionally unused
const _unusedVar = 10;
function example(_unusedParam: string) { }

// [PASS] Or remove them entirely
function example() { }
```

### Promise Handling
```typescript
// [FAIL] Floating promises (CRITICAL ERROR)
fetchData(); // ERROR - promise not handled

// [PASS] Always await or handle promises
await fetchData();

// Or explicitly handle
fetchData().catch(console.error);

// Or mark as intentional
void fetchData();

// [FAIL] Misused promises
if (fetchData()) { } // ERROR - promise in condition

// [PASS] Await the promise first
const result = await fetchData();
if (result) { }
```

### Async/Await Best Practices
```typescript
// [FAIL] Return await (except in try-catch)
async function get(): Promise<Data> {
  return await fetchData(); // WARNING
}

// [PASS] Direct return
async function get(): Promise<Data> {
  return fetchData();
}

// [PASS] But DO use await in try-catch
async function get(): Promise<Data> {
  try {
    return await fetchData(); // CORRECT
  } catch (error) {
    handleError(error);
  }
}

// [FAIL] Async function without await
async function process(): Promise<void> { // WARNING
  doSomething();
}

// [PASS] Remove async or add await
function process(): void {
  doSomething();
}
```

### Type Imports
```typescript
// [FAIL] Regular import for types
import { UserData } from './types'; // WARNING (if only used as type)

// [PASS] Use type imports
import type { UserData } from './types';

// [PASS] Mixed imports
import { fetchUser, type UserData, type Config } from './api';

// [FAIL] Type exports without 'export type'
export { UserData }; // WARNING

// [PASS] Use export type
export type { UserData };
```

### Naming Conventions (STRICT)
```typescript
// [PASS] CORRECT naming
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

// [FAIL] WRONG naming
interface userData { }         // ERROR - should be PascalCase
class chatService { }         // ERROR - should be PascalCase
const UserData = { };         // WARNING - confusing (looks like type)
function FetchData() { }      // WARNING - should be camelCase
```

### Boolean Expressions
```typescript
// [FAIL] Unnecessary conditions
if (isValid === true) { }     // WARNING
if (count !== 0) { }          // WARNING if count is boolean

// [PASS] Direct boolean use
if (isValid) { }
if (count > 0) { }

// [FAIL] Unnecessary type assertions
const value = data as UserData; // WARNING if unnecessary

// [PASS] Only assert when needed
const value = data; // TypeScript can infer
```

### Array Methods
```typescript
// [FAIL] Array.sort() without compare function
numbers.sort(); // WARNING - unreliable

// [PASS] Provide compare function
numbers.sort((a, b) => a - b);
strings.sort((a, b) => a.localeCompare(b));
```

### Switch Exhaustiveness
```typescript
enum Status { Active, Inactive, Pending }

// [FAIL] Non-exhaustive switch
function handle(status: Status): string {
  switch (status) {
    case Status.Active: return 'active';
    case Status.Inactive: return 'inactive';
    // ERROR - missing Status.Pending
  }
}

// [PASS] Exhaustive switch
function handle(status: Status): string {
  switch (status) {
    case Status.Active: return 'active';
    case Status.Inactive: return 'inactive';
    case Status.Pending: return 'pending';
  }
}

// [PASS] Or use default
function handle(status: Status): string {
  switch (status) {
    case Status.Active: return 'active';
    default: return 'other';
  }
}
```

### Console Usage
```typescript
// [FAIL] console.log in production code
console.log('Debug info'); // WARNING

// [PASS] Allowed console methods
console.warn('Warning message');
console.error('Error occurred');
console.info('Info message');

// [PASS] Or use proper logger
logger.debug('Debug info');
```

### Prefer Modern JavaScript
```typescript
// [FAIL] Old patterns
var x = 10;                    // ERROR - use const/let
const obj = { x: x };          // WARNING - use shorthand
const str = 'Hello ' + name;   // WARNING - use template

// [PASS] Modern patterns
const x = 10;
const obj = { x };
const str = `Hello ${name}`;

// [PASS] Arrow functions preferred
const handler = () => { };

// [PASS] Destructuring preferred
const { name, age } = user;
const [first, second] = array;
```

### Style Type Pattern (CRITICAL)
```typescript
// [FAIL] NEVER use generic type parameters with Style
new Style<View>({...})       // ERROR - remove <View>
new Style<Label>({...})      // ERROR - remove <Label>
: Style<View>                // ERROR - use just Style

// [PASS] Let TypeScript infer the type
new Style({...})             // CORRECT
: Style                      // CORRECT

// Run ./scripts/fix-style-types.sh to auto-fix violations
```

### Valdi-Specific Patterns
```typescript
// [PASS] Always use 'override' keyword
export class MyComponent extends Component<Props> {
  override onCreate(): void { }    // REQUIRED 'override'
  override onRender(): JSX.Element { }
}

// [PASS] Consistent type definitions (prefer interface)
interface UserData { }  // [PASS] Preferred
type UserData = { };    // [WARN]  Only for unions/intersections

// [PASS] Method signature style (property form)
interface Service {
  fetchData: () => Promise<Data>;  // [PASS] Preferred
  // fetchData(): Promise<Data>;   // [FAIL] Not preferred
}
```

### Common Gotchas
```typescript
// [FAIL] Duplicate imports
import { A } from './module';
import { B } from './module'; // ERROR - combine

// [PASS] Single import
import { A, B } from './module';

// [FAIL] Useless empty export
export {}; // WARNING

// [FAIL] Confusing void expression
const result = console.log('test'); // WARNING

// [PASS] Separate statements
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
- [ ] Style uses NO type parameters (new Style({...}) not new Style<View>({...}))

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
