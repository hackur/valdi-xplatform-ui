# Performance Test Command

Profile and optimize application performance.

## Task

Analyze and measure application performance metrics.

## Performance Analysis

1. **Bundle Size Analysis**
   ```bash
   npx react-native bundle --platform ios --entry-file index.js --bundle-output /tmp/bundle.js --dev false

   # Analyze bundle
   ls -lh /tmp/bundle.js

   # Source map analysis (if available)
   npx source-map-explorer /tmp/bundle.js
   ```

2. **Component Render Performance**
   ```bash
   # Enable React DevTools Profiler
   # Run app in profile mode
   # Record: npm run ios -- --configuration Release
   ```

3. **Memory Profiling**
   - Check for memory leaks
   - Analyze component lifecycle
   - Monitor observable subscriptions

4. **TypeScript Compilation Time**
   ```bash
   time npx tsc --noEmit
   ```

5. **Test Execution Time**
   ```bash
   npm test -- --verbose --maxWorkers=1
   ```

## Key Metrics

### Bundle Metrics
- Total bundle size (target: <10MB)
- JavaScript bundle size
- Asset size (images, fonts)
- Dependencies contributing most to size

### Runtime Metrics
- Initial load time (target: <2s)
- Screen navigation time (target: <100ms)
- Component render time
- API response time

### Memory Metrics
- Initial memory footprint
- Memory after navigation
- Memory leaks check
- Observable cleanup verification

## Optimization Recommendations

### Code Splitting
```javascript
// Use dynamic imports
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

// Lazy load screens
const LazyScreen = lazy(() => import('./screens/LazyScreen'));
```

### Memoization
```javascript
// Memoize expensive calculations
const result = useMemo(() => expensiveOperation(data), [data]);

// Memoize callbacks
const handlePress = useCallback(() => {}, []);

// MobX computed values
@computed get derivedValue() {
  return this.expensiveComputation();
}
```

### Image Optimization
```javascript
// Use appropriate image formats
// Implement lazy loading
// Use cached images
<FastImage source={{uri}} resizeMode="contain" />
```

### List Optimization
```javascript
// Use FlatList with proper keys
<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  removeClippedSubviews
  maxToRenderPerBatch={10}
  windowSize={10}
/>
```

## Performance Testing Script

Create `scripts/performance-test.sh`:
```bash
#!/bin/bash
set -e

echo "🚀 Performance Testing"
echo "====================="

# Bundle size
echo "[PACKAGE] Analyzing bundle size..."
npx react-native bundle --platform ios --entry-file index.js --bundle-output /tmp/bundle.js --dev false
BUNDLE_SIZE=$(ls -lh /tmp/bundle.js | awk '{print $5}')
echo "  Bundle size: $BUNDLE_SIZE"

# TypeScript compilation
echo "[TIME]  TypeScript compilation time..."
TIME_TS=$( { time npx tsc --noEmit; } 2>&1 | grep real | awk '{print $2}')
echo "  Compilation time: $TIME_TS"

# Test execution
echo "[TEST] Test execution time..."
TIME_TEST=$( { time npm test -- --silent; } 2>&1 | grep real | awk '{print $2}')
echo "  Test time: $TIME_TEST"

# Dependencies audit
echo "[REPORT] Dependency analysis..."
npx depcheck

echo "[PASS] Performance analysis complete!"
```

## Output Format

```
🚀 Performance Report
=====================

Bundle Analysis:
  [PACKAGE] Total: 8.2MB
  [PACKAGE] JS: 6.1MB
  [PACKAGE] Assets: 2.1MB
  [WARN]  Largest dependencies:
     - react-native: 2.1MB
     - lodash: 500KB
     - moment: 300KB

Runtime Metrics:
  [TIME]  Initial Load: 1.8s [PASS]
  [TIME]  Screen Navigation: 85ms [PASS]
  💾 Memory (Initial): 45MB
  💾 Memory (After Nav): 52MB

Compilation:
  [TIME]  TypeScript: 12.3s
  [TIME]  Tests: 8.5s

[TARGET] Optimization Recommendations:
  1. Replace moment with date-fns (save ~200KB)
  2. Enable hermes engine (faster startup)
  3. Implement code splitting for heavy screens
  4. Add image compression

[REPORT] Performance Score: 85/100 [PASS]
```

Use these insights to identify and fix performance bottlenecks.
