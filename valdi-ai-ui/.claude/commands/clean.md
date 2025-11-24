# Clean Build Artifacts

Clean all build artifacts and caches.

Basic clean (Bazel only):
```bash
npm run clean
```

Full clean (Bazel + node_modules + coverage):
```bash
npm run clean:full
```

This runs:
```bash
bazel clean --expunge && rm -rf node_modules coverage
```

Individual commands:

Clean Bazel cache:
```bash
bazel clean
```

Deep clean Bazel (removes all caches):
```bash
bazel clean --expunge
```

Remove node_modules:
```bash
rm -rf node_modules && npm install
```

Remove coverage reports:
```bash
rm -rf coverage
```
