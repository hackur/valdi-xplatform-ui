# Security Policy

## Supported Versions

Currently supported versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 0.2.x   | :white_check_mark: |
| 0.1.x   | :x:                |
| < 0.1   | :x:                |

---

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please follow these steps:

### 1. **DO NOT** Open a Public Issue

Please do not report security vulnerabilities through public GitHub issues.

### 2. Report Privately

Send a detailed report to: **security@valdi-ai-ui.dev** _(update with actual email)_

Include in your report:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)
- Your contact information

### 3. Response Timeline

- **Acknowledgment:** Within 48 hours
- **Initial Assessment:** Within 7 days
- **Fix Timeline:** Depends on severity (see below)

### Severity Levels

**Critical (CVSS 9.0-10.0)**
- Fix: Within 24-48 hours
- Examples: Remote code execution, authentication bypass

**High (CVSS 7.0-8.9)**
- Fix: Within 7 days
- Examples: SQL injection, XSS, privilege escalation

**Medium (CVSS 4.0-6.9)**
- Fix: Within 30 days
- Examples: CSRF, information disclosure

**Low (CVSS 0.1-3.9)**
- Fix: Next release cycle
- Examples: Minor information leaks

---

## Security Best Practices

### For Users

#### API Key Management

**✅ DO:**
- Store API keys in environment variables
- Use `.env` files (never commit to git)
- Rotate keys regularly
- Use separate keys for dev/prod
- Enable key restrictions when possible

**❌ DON'T:**
- Hard-code API keys in code
- Commit `.env` files to version control
- Share keys in chat/email
- Use production keys in development
- Log API keys

#### Secure Storage

API keys are stored securely using platform-specific mechanisms:

**iOS:**
```typescript
// Uses iOS Keychain
await ApiKeyStore.setApiKey('openai', key)
```

**Android:**
```typescript
// Uses EncryptedSharedPreferences
await ApiKeyStore.setApiKey('openai', key)
```

### For Developers

#### Input Validation

**Always validate user input:**

```typescript
// ✅ GOOD
function sendMessage(content: string): void {
  if (!content || content.trim().length === 0) {
    throw new Error('Message cannot be empty')
  }
  if (content.length > MAX_MESSAGE_LENGTH) {
    throw new Error('Message too long')
  }
  // Process validated input
}

// ❌ BAD
function sendMessage(content: any): void {
  // No validation, accepts anything
}
```

#### SQL Injection Prevention

We don't use SQL directly, but for any database queries:

```typescript
// ✅ GOOD: Parameterized queries
db.query('SELECT * FROM messages WHERE id = ?', [messageId])

// ❌ BAD: String concatenation
db.query(`SELECT * FROM messages WHERE id = ${messageId}`)
```

#### XSS Prevention

```typescript
// ✅ GOOD: Sanitize HTML
import DOMPurify from 'dompurify'
const clean = DOMPurify.sanitize(userInput)

// ❌ BAD: Direct HTML injection
element.innerHTML = userInput
```

#### Authentication

```typescript
// ✅ GOOD: Verify tokens
if (!verifyToken(token)) {
  throw new UnauthorizedError()
}

// ❌ BAD: Trust without verification
const userId = parseToken(token).userId
```

---

## Known Security Considerations

### 1. API Key Exposure

**Risk:** API keys could be exposed if device is compromised

**Mitigation:**
- Keys stored in secure platform storage (Keychain/EncryptedSharedPreferences)
- Keys never logged
- Keys cleared on app uninstall

### 2. Man-in-the-Middle (MITM)

**Risk:** Network traffic could be intercepted

**Mitigation:**
- All API calls use HTTPS
- Certificate pinning (recommended for production)
- No sensitive data in URLs

### 3. Local Storage Security

**Risk:** Conversations stored locally could be accessed

**Mitigation:**
- Device-level encryption (iOS/Android)
- Option to disable local storage
- Export/delete functionality for users

### 4. Third-Party Dependencies

**Risk:** Vulnerabilities in dependencies

**Mitigation:**
- Regular dependency updates
- Automated vulnerability scanning (Dependabot)
- Minimal dependency footprint
- Security audits of critical deps

---

## Secure Coding Guidelines

### 1. Type Safety

Use TypeScript strict mode:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### 2. Error Handling

Never expose internal errors:

```typescript
// ✅ GOOD
try {
  await riskyOperation()
} catch (error) {
  console.error('Internal error:', error) // Log internally
  throw new UserFacingError('Operation failed') // Show to user
}

// ❌ BAD
try {
  await riskyOperation()
} catch (error) {
  alert(error.message) // Exposes internals
}
```

### 3. Rate Limiting

Implement client-side rate limiting:

```typescript
class RateLimiter {
  private calls: number[] = []

  async limit(fn: () => Promise<any>, maxCalls: number, windowMs: number) {
    const now = Date.now()
    this.calls = this.calls.filter(t => t > now - windowMs)

    if (this.calls.length >= maxCalls) {
      throw new Error('Rate limit exceeded')
    }

    this.calls.push(now)
    return fn()
  }
}
```

### 4. Data Sanitization

```typescript
// Sanitize before storage
function sanitizeConversation(conv: Conversation): Conversation {
  return {
    ...conv,
    title: sanitizeString(conv.title),
    metadata: sanitizeMetadata(conv.metadata)
  }
}
```

---

## Security Checklist

### Before Release

- [ ] All dependencies up to date
- [ ] No hardcoded secrets in code
- [ ] API keys use secure storage
- [ ] Input validation on all user inputs
- [ ] Error messages don't expose internals
- [ ] HTTPS for all API calls
- [ ] Rate limiting implemented
- [ ] Security headers configured
- [ ] Dependency audit passed (`npm audit`)
- [ ] Code review completed
- [ ] Security testing performed

### Regular Maintenance

- [ ] Monthly dependency updates
- [ ] Quarterly security audits
- [ ] Review access logs
- [ ] Monitor for CVEs
- [ ] Update security documentation

---

## Third-Party Security

### AI Provider Security

We integrate with multiple AI providers. Security considerations:

**OpenAI:**
- API keys transmitted over HTTPS
- No data retention by default
- Follow [OpenAI security best practices](https://platform.openai.com/docs/guides/safety-best-practices)

**Anthropic:**
- API keys transmitted over HTTPS
- Data handling per [Anthropic privacy policy](https://www.anthropic.com/privacy)

**Google AI:**
- API keys transmitted over HTTPS
- Data handling per [Google AI privacy policy](https://ai.google.dev/terms)

### Custom Providers

When using custom OpenAI-compatible providers:

**⚠️ Important:**
- Verify provider trustworthiness
- Use HTTPS endpoints only
- Review provider's data retention policy
- Don't send sensitive data to untrusted providers
- Test connections before use

---

## Incident Response

### If a Security Incident Occurs

1. **Contain:** Immediately disable affected functionality
2. **Assess:** Determine scope and impact
3. **Notify:** Inform affected users within 72 hours
4. **Fix:** Deploy patches/updates
5. **Review:** Post-mortem and process improvement

### User Notification Template

```
Subject: Security Update Required - Valdi AI UI

We recently discovered a security issue affecting version X.X.X.
The issue has been fixed in version Y.Y.Y.

What you need to do:
1. Update to version Y.Y.Y immediately
2. [Additional steps if needed]

What we did:
- [Description of fix]
- [Additional measures]

Questions? Contact security@valdi-ai-ui.dev
```

---

## Security Tools

### Recommended Tools

**Static Analysis:**
- ESLint with security plugins
- TypeScript strict mode
- Semgrep for code patterns

**Dependency Scanning:**
- `npm audit`
- Snyk
- Dependabot

**Secret Scanning:**
- git-secrets
- truffleHog
- GitHub secret scanning

### CI/CD Security

```yaml
# .github/workflows/security.yml
name: Security Checks

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run npm audit
        run: npm audit
      - name: Run Snyk
        run: npx snyk test
      - name: Secret scanning
        run: npx @secretlint/cli
```

---

## Responsible Disclosure

We believe in coordinated vulnerability disclosure:

1. Report vulnerability privately
2. We acknowledge and investigate
3. We develop and test fix
4. We release patched version
5. We publish security advisory
6. Public disclosure (after users have time to update)

### Recognition

Security researchers who responsibly disclose vulnerabilities will be:
- Acknowledged in security advisories (with permission)
- Listed in CONTRIBUTORS.md
- Eligible for bug bounty (if program active)

---

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [Security Best Practices for TypeScript](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html)

---

## Contact

- **Security Issues:** security@valdi-ai-ui.dev
- **General Questions:** hello@valdi-ai-ui.dev
- **GitHub:** [Security Advisories](https://github.com/your-org/valdi-ai-ui/security/advisories)

---

**Last Updated:** November 2024
**Version:** 1.0.0
