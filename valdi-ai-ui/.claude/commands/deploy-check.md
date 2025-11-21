---
description: Pre-deployment checklist and validation
---

Perform comprehensive pre-deployment checks:

## Deployment Validation Checklist

### 1. Code Quality Checks

**Git Status**:
- No uncommitted changes
- All changes pushed to remote
- Branch is up to date with main
- No merge conflicts

**Tests**:
- All unit tests passing
- All feature tests passing
- Dusk tests passing (if applicable)
- No skipped tests

**Code Standards**:
- Laravel Pint passes (code style)
- PHPStan analysis clean (if configured)
- No PHP errors or warnings

### 2. Configuration Checks

**Environment**:
- .env.example up to date
- No sensitive data in .env.example
- Required ENV vars documented
- APP_DEBUG=false for production

**Dependencies**:
- composer.lock committed
- package-lock.json committed
- No dev dependencies in production build
- All packages up to date (or intentionally pinned)

### 3. Database Checks

**Migrations**:
- All migrations committed
- No pending migrations
- Migration order correct
- Down methods implemented

**Seeders**:
- Production seeders ready
- No dev data in production seeders
- Idempotent design (safe to re-run)
- Admin user seeder configured

### 4. Assets & Build

**Frontend**:
- npm run build completes successfully
- No console errors in compiled assets
- Assets versioned/hashed (for cache busting)
- public/build directory exists

**Mix/Vite**:
- Correct asset references in views
- No missing asset errors
- Proper CDN configuration (if used)

### 5. Routes & APIs

**Route Validation**:
- `php artisan route:list` shows all routes
- No route conflicts
- Auth middleware applied correctly
- API rate limiting configured

**Nova Admin**:
- Nova assets published
- Resources registered
- Policies configured
- Search validation passes

### 6. Performance

**Optimization**:
- Routes cached: `php artisan route:cache`
- Config cached: `php artisan config:cache`
- Views cached: `php artisan view:cache`
- Opcache enabled (check php.ini)

**Queries**:
- No N+1 queries in critical paths
- Indexes on foreign keys
- Database query logging disabled in production

### 7. Security

**Authentication**:
- Strong password requirements
- CSRF protection enabled
- Session security configured
- API authentication working

**Secrets**:
- No secrets in code
- .env file secured
- API keys rotated
- Database credentials secure

### 8. Logging & Monitoring

**Logs**:
- Log channel configured
- Log rotation set up
- Error reporting configured
- Stack traces disabled in production

**Monitoring**:
- Health check endpoint exists
- Uptime monitoring configured
- Error tracking (Sentry, Bugsnag) configured
- Performance monitoring ready

### 9. Deployment Scripts

**Scripts**:
- Deployment scripts tested
- Rollback procedure documented
- Database backup before deployment
- Zero-downtime strategy (if required)

**CI/CD**:
- Pipeline passing
- Automated tests run
- Build artifacts created
- Deployment approval required

### 10. Documentation

**Updated**:
- CHANGELOG.md updated
- Deployment notes written
- Breaking changes documented
- Migration guide provided (if needed)

## Deployment Readiness Report

Generate report showing:
- [PASS] All checks passed
- [WARN] Warnings (non-blocking)
- [FAIL] Failures (blocking)
- [TODO] Action items before deployment

## Final Status

- **Ready to Deploy**: Yes/No
- **Blockers**: List any
- **Warnings**: List any
- **Recommended Actions**: Prioritized list
- **Estimated Deployment Time**: X minutes
- **Rollback Plan**: Documented

Provide comprehensive deployment readiness assessment.
