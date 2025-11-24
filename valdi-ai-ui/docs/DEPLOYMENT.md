# Deployment Guide

Complete guide for deploying Valdi AI UI to production environments.

---

## Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Configuration](#environment-configuration)
- [API Key Management](#api-key-management)
- [Build Optimization](#build-optimization)
- [Performance Testing](#performance-testing)
- [Security Checklist](#security-checklist)
- [iOS Deployment](#ios-deployment)
- [Android Deployment](#android-deployment)
- [Monitoring & Analytics](#monitoring--analytics)

---

## Pre-Deployment Checklist

Before deploying to production, ensure all items are completed:

### Code Quality

- [ ] All tests passing (`npm test`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No linting errors (`npm run lint`)
- [ ] Code formatted (`npm run format:check`)
- [ ] All validation checks pass (`npm run validate`)

### Features & Functionality

- [ ] All critical features implemented
- [ ] User flows tested end-to-end
- [ ] Error handling tested
- [ ] Offline behavior verified
- [ ] Multi-provider AI switching works
- [ ] Tool calling functional
- [ ] Conversation persistence working
- [ ] Export functionality tested

### Performance

- [ ] App loads in < 3 seconds
- [ ] Message sending responsive (< 1s to start)
- [ ] Streaming works smoothly
- [ ] No memory leaks detected
- [ ] Bundle size optimized (< 10MB)
- [ ] Images optimized
- [ ] Lazy loading implemented

### UI/UX

- [ ] All screens tested on multiple devices
- [ ] Portrait and landscape modes work
- [ ] Accessibility features verified
- [ ] Loading states implemented
- [ ] Error states handled gracefully
- [ ] Success feedback provided
- [ ] Consistent styling across app

### Security

- [ ] API keys properly secured
- [ ] No sensitive data in logs
- [ ] HTTPS enforced for API calls
- [ ] Input validation implemented
- [ ] XSS protection in place
- [ ] Dependencies audited (`npm audit`)
- [ ] Security best practices followed

### Documentation

- [ ] README.md updated
- [ ] API documentation complete
- [ ] Deployment guide reviewed
- [ ] Changelog updated
- [ ] Version number incremented
- [ ] Release notes prepared

---

## Environment Configuration

### Environment Variables

Create production environment configuration:

```bash
# .env.production
NODE_ENV=production

# API Keys (use secrets management in production)
OPENAI_API_KEY=sk-prod-xxx
ANTHROPIC_API_KEY=sk-ant-prod-xxx
GOOGLE_API_KEY=AIzaSyProd-xxx

# API Configuration
API_TIMEOUT=30000
MAX_RETRIES=3
RETRY_DELAY=1000

# Feature Flags
ENABLE_STREAMING=true
ENABLE_TOOLS=true
ENABLE_WORKFLOWS=true
ENABLE_PERSISTENCE=true

# Analytics
ANALYTICS_ENABLED=true
ANALYTICS_ENDPOINT=https://analytics.yourdomain.com

# Error Reporting
ERROR_REPORTING_ENABLED=true
SENTRY_DSN=https://xxx@sentry.io/xxx

# App Configuration
APP_VERSION=1.0.0
APP_BUILD_NUMBER=1
```

### Configuration Management

**Using Secret Management:**

```typescript
// config/production.ts
export const config = {
  apiKeys: {
    openai: process.env.OPENAI_API_KEY || getSecureValue('OPENAI_API_KEY'),
    anthropic: process.env.ANTHROPIC_API_KEY || getSecureValue('ANTHROPIC_API_KEY'),
    google: process.env.GOOGLE_API_KEY || getSecureValue('GOOGLE_API_KEY'),
  },
  api: {
    timeout: parseInt(process.env.API_TIMEOUT || '30000', 10),
    maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
    retryDelay: parseInt(process.env.RETRY_DELAY || '1000', 10),
  },
  features: {
    streaming: process.env.ENABLE_STREAMING === 'true',
    tools: process.env.ENABLE_TOOLS === 'true',
    workflows: process.env.ENABLE_WORKFLOWS === 'true',
    persistence: process.env.ENABLE_PERSISTENCE === 'true',
  },
};
```

---

## API Key Management

### Best Practices

1. **Never commit API keys to version control**
   ```bash
   # .gitignore
   .env
   .env.local
   .env.production
   secrets/
   ```

2. **Use environment-specific keys**
   - Development: Limited rate limits, test keys
   - Staging: Moderate limits, separate billing
   - Production: Full limits, production keys

3. **Rotate keys regularly**
   - Schedule: Every 90 days
   - Process: Generate new keys, update, verify, revoke old

4. **Monitor key usage**
   - Track API calls per key
   - Set up alerts for unusual activity
   - Review usage reports monthly

### Secure Storage Options

#### iOS Keychain

```typescript
// iOS secure storage
import { Keychain } from 'valdi_keychain';

async function storeAPIKey(key: string, value: string) {
  await Keychain.setItem(key, value, {
    accessible: 'whenUnlocked',
    synchronizable: false,
  });
}

async function getAPIKey(key: string): Promise<string> {
  return await Keychain.getItem(key);
}
```

#### Android Keystore

```typescript
// Android secure storage
import { SecureStorage } from 'valdi_secure_storage';

async function storeAPIKey(key: string, value: string) {
  await SecureStorage.setItem(key, value, {
    encryptionLevel: 'strong',
  });
}

async function getAPIKey(key: string): Promise<string> {
  return await SecureStorage.getItem(key);
}
```

#### Environment Variables (Server-Side)

```bash
# Using cloud provider secrets management

# AWS Secrets Manager
aws secretsmanager create-secret \
  --name valdi-ai-ui/openai-key \
  --secret-string "sk-xxx"

# Google Cloud Secret Manager
gcloud secrets create openai-key \
  --data-file=-

# Azure Key Vault
az keyvault secret set \
  --vault-name valdi-ai-ui \
  --name openai-key \
  --value "sk-xxx"
```

---

## Build Optimization

### Production Build Configuration

```bash
# Build for production
npm run build -- --mode=production

# iOS production build
npm run build:ios -- --mode=release --optimize

# Android production build
npm run build:android -- --mode=release --optimize
```

### Optimization Checklist

- [ ] Enable code minification
- [ ] Remove debug code
- [ ] Strip console.log statements
- [ ] Enable dead code elimination
- [ ] Optimize images and assets
- [ ] Enable compression
- [ ] Use production React build
- [ ] Enable source maps for debugging

### Bundle Size Analysis

```bash
# Analyze bundle size
bazel build //:valdi_ai_ui --output_groups=+size_analysis

# View size breakdown
ls -lh bazel-bin/

# Generate size report
npm run analyze-bundle
```

### Code Splitting

```typescript
// Lazy load routes
const ChatView = lazy(() => import('./modules/chat_ui/src/ChatView'));
const SettingsScreen = lazy(() => import('./modules/settings/src/SettingsScreen'));
const WorkflowDemo = lazy(() => import('./modules/workflow_demo/src/WorkflowDemoScreen'));

// Use suspense for loading
<Suspense fallback={<LoadingSpinner />}>
  <ChatView />
</Suspense>
```

### Asset Optimization

```bash
# Optimize images
npm install -g imagemin-cli

# Compress PNG images
imagemin assets/images/*.png --out-dir=assets/images/optimized

# Compress JPEG images
imagemin assets/images/*.jpg --out-dir=assets/images/optimized --plugin=mozjpeg

# Convert to WebP
imagemin assets/images/*.{jpg,png} --out-dir=assets/images/optimized --plugin=webp
```

---

## Performance Testing

### Load Testing

```bash
# Install load testing tool
npm install -g artillery

# Create load test config
# artillery.yml
config:
  target: 'https://api.yourdomain.com'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 300
      arrivalRate: 50
      name: "Sustained load"

scenarios:
  - name: "Send message"
    flow:
      - post:
          url: "/api/chat"
          json:
            message: "Test message"
            conversationId: "conv_123"

# Run load test
artillery run artillery.yml
```

### Performance Benchmarks

```typescript
// performance-tests.ts
import { performance } from 'perf_hooks';

async function benchmarkMessageSend() {
  const iterations = 100;
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();

    await chatService.sendMessage({
      conversationId: 'conv_test',
      message: 'Benchmark test',
    });

    const end = performance.now();
    times.push(end - start);
  }

  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);

  console.log(`Average: ${avg.toFixed(2)}ms`);
  console.log(`Min: ${min.toFixed(2)}ms`);
  console.log(`Max: ${max.toFixed(2)}ms`);
}
```

### Memory Profiling

```typescript
// memory-profiler.ts
import { MemoryProfiler } from 'valdi_profiler';

const profiler = new MemoryProfiler();

profiler.start();

// Perform operations
for (let i = 0; i < 1000; i++) {
  await messageStore.addMessage(testMessage);
}

const stats = profiler.stop();

console.log('Memory usage:', stats);
// {
//   heapUsed: 15.2 MB,
//   heapTotal: 20.5 MB,
//   external: 1.3 MB,
//   rss: 45.7 MB
// }
```

---

## Security Checklist

### API Security

- [ ] **HTTPS Only**: All API calls use HTTPS
- [ ] **API Key Rotation**: Keys rotated every 90 days
- [ ] **Rate Limiting**: Implement client-side rate limiting
- [ ] **Request Signing**: Sign requests to prevent tampering
- [ ] **Certificate Pinning**: Pin SSL certificates (optional)

### Data Security

- [ ] **Encryption at Rest**: Sensitive data encrypted in storage
- [ ] **Encryption in Transit**: All network traffic encrypted
- [ ] **Secure Key Storage**: API keys in secure storage
- [ ] **Data Sanitization**: User input sanitized
- [ ] **PII Protection**: Personal data properly handled

### Code Security

- [ ] **Dependency Audit**: Run `npm audit` and fix issues
- [ ] **No Hardcoded Secrets**: No API keys in code
- [ ] **Input Validation**: All inputs validated
- [ ] **Output Encoding**: Prevent XSS attacks
- [ ] **Error Messages**: Don't leak sensitive info

### Security Headers

```typescript
// Configure security headers
export const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'",
};
```

### Security Audit

```bash
# Run security audit
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Force fix breaking changes
npm audit fix --force

# Check for outdated packages
npm outdated

# Update dependencies
npm update
```

---

## iOS Deployment

### Prepare for App Store

1. **Update Version Numbers**
   ```bash
   # In Xcode:
   # General > Identity > Version: 1.0.0
   # General > Identity > Build: 1
   ```

2. **Configure Signing**
   ```bash
   # Xcode > Signing & Capabilities
   # - Team: Your Apple Developer Team
   # - Bundle Identifier: com.yourdomain.valdi-ai-ui
   # - Automatically manage signing: ✓
   ```

3. **Create App Store Connect Record**
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - Create new app
   - Fill in metadata
   - Upload screenshots
   - Set pricing and availability

4. **Archive and Upload**
   ```bash
   # In Xcode:
   # Product > Archive
   # Window > Organizer > Distribute App
   # Select "App Store Connect"
   # Upload to App Store Connect
   ```

5. **TestFlight Beta Testing**
   - Add internal testers
   - Add external testers (requires review)
   - Collect feedback
   - Fix issues
   - Repeat

6. **Submit for Review**
   - Complete all app metadata
   - Submit for review
   - Wait for approval (typically 1-3 days)
   - Release to App Store

### iOS Deployment Checklist

- [ ] App Store Connect app created
- [ ] Bundle ID registered
- [ ] Provisioning profiles configured
- [ ] App icon provided (all sizes)
- [ ] Launch screen configured
- [ ] Screenshots prepared (all devices)
- [ ] App description written
- [ ] Keywords optimized
- [ ] Privacy policy URL provided
- [ ] Support URL provided
- [ ] App reviewed and approved
- [ ] Release notes prepared

---

## Android Deployment

### Prepare for Play Store

1. **Update Version Numbers**
   ```gradle
   // android/app/build.gradle
   android {
     defaultConfig {
       versionCode 1
       versionName "1.0.0"
     }
   }
   ```

2. **Generate Signing Key**
   ```bash
   # Generate release keystore
   keytool -genkey -v -keystore release.keystore \
     -alias valdi-ai-ui -keyalg RSA -keysize 2048 -validity 10000

   # Store keystore securely (NOT in version control)
   ```

3. **Configure Signing**
   ```gradle
   // android/app/build.gradle
   android {
     signingConfigs {
       release {
         storeFile file("release.keystore")
         storePassword System.getenv("KEYSTORE_PASSWORD")
         keyAlias "valdi-ai-ui"
         keyPassword System.getenv("KEY_PASSWORD")
       }
     }
     buildTypes {
       release {
         signingConfig signingConfigs.release
         minifyEnabled true
         shrinkResources true
       }
     }
   }
   ```

4. **Build App Bundle**
   ```bash
   # Build release AAB
   ./gradlew bundleRelease

   # Output: android/app/build/outputs/bundle/release/app-release.aab
   ```

5. **Create Play Console Record**
   - Go to [Google Play Console](https://play.google.com/console)
   - Create new app
   - Fill in app details
   - Upload app bundle
   - Complete store listing
   - Set content rating
   - Set pricing and distribution

6. **Internal Testing**
   - Create internal testing release
   - Add test users
   - Distribute app
   - Collect feedback
   - Fix issues

7. **Submit for Review**
   - Complete all required sections
   - Submit for review
   - Wait for approval (typically 1-3 days)
   - Release to Play Store

### Android Deployment Checklist

- [ ] Play Console app created
- [ ] App bundle generated and signed
- [ ] App icon provided (all densities)
- [ ] Screenshots prepared (phone and tablet)
- [ ] Feature graphic prepared
- [ ] App description written
- [ ] Short description written
- [ ] Privacy policy URL provided
- [ ] Content rating completed
- [ ] Target audience selected
- [ ] App reviewed and approved
- [ ] Release notes prepared

---

## Monitoring & Analytics

### Error Tracking

**Sentry Integration:**

```typescript
// error-tracking.ts
import * as Sentry from '@sentry/valdi';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: `valdi-ai-ui@${process.env.APP_VERSION}`,
  tracesSampleRate: 1.0,
});

// Capture errors
try {
  await chatService.sendMessage(options);
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      conversationId: options.conversationId,
      provider: options.modelConfig?.provider,
    },
  });
}
```

### Analytics

**Track User Events:**

```typescript
// analytics.ts
import { Analytics } from 'valdi_analytics';

// Initialize
Analytics.init({
  apiKey: process.env.ANALYTICS_API_KEY,
  appVersion: process.env.APP_VERSION,
});

// Track events
Analytics.track('message_sent', {
  conversationId: 'conv_123',
  provider: 'openai',
  model: 'gpt-4-turbo',
  messageLength: 150,
});

Analytics.track('conversation_created', {
  provider: 'openai',
  hasSystemPrompt: true,
});

Analytics.track('tool_executed', {
  toolName: 'weather',
  success: true,
  executionTime: 245,
});
```

### Performance Monitoring

```typescript
// performance-monitoring.ts
import { Performance } from 'valdi_performance';

// Monitor API calls
Performance.measureAsync('api_call', async () => {
  return await chatService.sendMessage(options);
});

// Monitor screen rendering
Performance.mark('screen_start');
// ... render screen
Performance.mark('screen_end');
Performance.measure('screen_render', 'screen_start', 'screen_end');

// Get metrics
const metrics = Performance.getMetrics();
console.log('Performance metrics:', metrics);
```

### Health Checks

```typescript
// health-check.ts
export async function performHealthCheck(): Promise<HealthStatus> {
  const checks = {
    storage: await checkStorage(),
    apiConnection: await checkAPIConnection(),
    memory: checkMemory(),
    performance: checkPerformance(),
  };

  return {
    healthy: Object.values(checks).every((c) => c.healthy),
    checks,
    timestamp: new Date(),
  };
}
```

---

## Post-Deployment

### Monitoring Plan

1. **First 24 Hours**
   - Monitor error rates closely
   - Check API response times
   - Watch for crash reports
   - Review user feedback
   - Be ready for hotfix

2. **First Week**
   - Analyze usage patterns
   - Monitor performance metrics
   - Review analytics data
   - Collect user feedback
   - Plan improvements

3. **Ongoing**
   - Weekly error report review
   - Monthly performance analysis
   - Quarterly security audit
   - Regular dependency updates
   - Feature usage analysis

### Rollback Plan

If critical issues arise:

```bash
# iOS: Submit hotfix via TestFlight
# 1. Fix issue
# 2. Increment build number
# 3. Archive and upload
# 4. Submit for expedited review

# Android: Use Play Console rollback
# 1. Go to Play Console
# 2. Release management > App releases
# 3. Select previous version
# 4. Rollback to previous release
```

---

## Additional Resources

- [iOS App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Developer Policy Center](https://play.google.com/about/developer-content-policy/)
- [App Security Best Practices](https://owasp.org/www-project-mobile-app-security/)
- [Performance Optimization Guide](https://web.dev/performance/)

---

**Questions?** Open an issue on [GitHub](https://github.com/your-org/valdi-ai-ui/issues).
