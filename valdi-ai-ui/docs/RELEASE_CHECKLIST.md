# Release Checklist

Use this checklist before releasing a new version of Valdi AI UI.

---

## Pre-Release Validation

### Code Quality
- [ ] All tests passing: `npm test`
- [ ] No TypeScript errors: `npm run type-check`
- [ ] No ESLint errors: `npm run lint`
- [ ] Code formatted: `npm run format`
- [ ] Pre-commit hooks working: Try committing a file

### Build Verification
- [ ] Bazel build succeeds: `bazel build //...`
- [ ] Bazel tests pass: `bazel test //...`
- [ ] iOS build works: `npm run build:ios`
- [ ] Android build works: `npm run build:android`

### Documentation
- [ ] CHANGELOG.md updated with version and date
- [ ] README.md reflects current features
- [ ] API_REFERENCE.md is current
- [ ] All new features documented
- [ ] Migration guides added if breaking changes

### Dependencies
- [ ] No vulnerable dependencies: `npm audit`
- [ ] Dependencies up to date: `npm outdated`
- [ ] No unused dependencies
- [ ] License compliance checked

---

## Release Process

### 1. Version Bump

Choose version type based on changes:
- **Major** (X.0.0) - Breaking changes
- **Minor** (x.X.0) - New features, backward compatible
- **Patch** (x.x.X) - Bug fixes, backward compatible

```bash
# Automated release script
./scripts/release.sh [major|minor|patch]

# Or manual
npm version [major|minor|patch]
```

### 2. Update CHANGELOG

Ensure CHANGELOG.md has:
- [ ] Version number
- [ ] Release date (YYYY-MM-DD)
- [ ] All changes categorized (Added, Changed, Fixed, etc.)
- [ ] Breaking changes highlighted
- [ ] Migration instructions if needed

### 3. Git Operations

```bash
# Commit version bump
git add package.json CHANGELOG.md
git commit -m "chore: release vX.X.X"

# Create tag
git tag -a vX.X.X -m "Release vX.X.X"

# Push to remote
git push origin main --tags
```

### 4. GitHub Release

```bash
# Using GitHub CLI
gh release create vX.X.X --generate-notes

# Or manually via GitHub UI
```

Include in release notes:
- [ ] Summary of changes
- [ ] Breaking changes (if any)
- [ ] Installation instructions
- [ ] Links to documentation
- [ ] Known issues

### 5. Post-Release

- [ ] Verify GitHub release created
- [ ] Verify CI/CD workflows passed
- [ ] Test installation from GitHub:
  ```bash
  git clone https://github.com/YOUR_ORG/valdi-ai-ui.git /tmp/test
  cd /tmp/test
  npm install
  npm run validate
  ```
- [ ] Announce release (if applicable)
- [ ] Update project board/roadmap

---

## Version Guidelines

### Semantic Versioning (semver)

Given a version number MAJOR.MINOR.PATCH:

1. **MAJOR** version when you make incompatible API changes
2. **MINOR** version when you add functionality in a backward compatible manner
3. **PATCH** version when you make backward compatible bug fixes

### Pre-release Versions

For beta/alpha releases:
- `vX.X.X-alpha.1` - Alpha release
- `vX.X.X-beta.1` - Beta release
- `vX.X.X-rc.1` - Release candidate

```bash
npm version prerelease --preid=beta
```

---

## Release Types

### Major Release (X.0.0)

**When**: Breaking API changes, major architectural changes

**Checklist**:
- [ ] Migration guide written
- [ ] Breaking changes documented
- [ ] Deprecation warnings in previous version
- [ ] Major version announcement prepared
- [ ] Community notified in advance

**Example**: v1.0.0 → v2.0.0

### Minor Release (x.X.0)

**When**: New features, enhancements, non-breaking changes

**Checklist**:
- [ ] New features documented
- [ ] Backward compatibility verified
- [ ] Feature announcement prepared

**Example**: v1.0.0 → v1.1.0

### Patch Release (x.x.X)

**When**: Bug fixes, security patches

**Checklist**:
- [ ] Bug fixes verified
- [ ] No new features added
- [ ] No API changes

**Example**: v1.0.0 → v1.0.1

---

## Automated Workflows

### CI/CD Release Workflow

The `.github/workflows/release.yml` workflow automates:
- ✅ Version validation
- ✅ Changelog generation
- ✅ Git tagging
- ✅ GitHub release creation
- ✅ Build verification

Trigger via:
```bash
gh workflow run release.yml -f version=minor
```

---

## Emergency Hotfix

For critical production bugs:

1. **Create hotfix branch** from production tag:
   ```bash
   git checkout -b hotfix/vX.X.X vX.X.X
   ```

2. **Fix the bug** and commit:
   ```bash
   git commit -m "fix: critical bug description"
   ```

3. **Bump patch version**:
   ```bash
   npm version patch
   ```

4. **Merge to main and tag**:
   ```bash
   git checkout main
   git merge hotfix/vX.X.X
   git push origin main --tags
   ```

5. **Create hotfix release**:
   ```bash
   gh release create vX.X.X --notes "Hotfix: [description]"
   ```

---

## Rollback Procedure

If a release has critical issues:

### 1. Revert Release

```bash
# Delete remote tag
git push origin :refs/tags/vX.X.X

# Delete local tag
git tag -d vX.X.X

# Revert commit
git revert HEAD
git push origin main
```

### 2. Delete GitHub Release

```bash
gh release delete vX.X.X --yes
```

### 3. Notify Users

- [ ] Update GitHub release with deprecation notice
- [ ] Announce rollback
- [ ] Provide alternative version

---

## Release Schedule

### Regular Releases

- **Patch**: As needed for critical bugs
- **Minor**: Every 2-4 weeks
- **Major**: Every 6-12 months

### Release Windows

Avoid releases during:
- Fridays (less support coverage)
- Holidays
- Major conferences
- End of year

### Best Release Times

- Tuesday-Thursday
- Morning hours (9-11 AM local)
- After thorough testing on staging

---

## Communication

### Release Announcement Template

```markdown
# Valdi AI UI vX.X.X Released 🎉

We're excited to announce the release of Valdi AI UI vX.X.X!

## Highlights

- Feature 1
- Feature 2
- Bug fixes

## Breaking Changes

[If any]

## Installation

```bash
git clone https://github.com/YOUR_ORG/valdi-ai-ui.git
cd valdi-ai-ui
npm install
```

## Documentation

See [CHANGELOG.md](CHANGELOG.md) for full details.

---

**Happy coding!** 🚀
```

### Channels

- [ ] GitHub Releases
- [ ] Project README
- [ ] Discord/Slack (if applicable)
- [ ] Twitter/Social media (if applicable)
- [ ] Email newsletter (if applicable)

---

## Metrics to Track

After each release, track:

- Download/clone count
- Installation success rate
- Bug reports filed
- GitHub stars/forks
- Community feedback

---

## Archive

Keep records of:
- Release notes
- Performance benchmarks
- Bundle sizes
- Test coverage percentages
- Build times

Create archive entry:
```bash
echo "vX.X.X - $(date) - [notes]" >> RELEASE_HISTORY.txt
```

---

**Last Updated**: November 23, 2025
**Template Version**: 1.0.0
