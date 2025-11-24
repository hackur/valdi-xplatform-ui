# GitHub Actions Status Badges

Add the following badges to your project's README.md to display the current status of CI/CD workflows:

## Default Branch (main)

```markdown
<!-- CI/CD Status -->
[![CI](https://github.com/sarda-xplatform-ui/valdi-ai-ui/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/sarda-xplatform-ui/valdi-ai-ui/actions/workflows/ci.yml)
[![Build](https://github.com/sarda-xplatform-ui/valdi-ai-ui/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/sarda-xplatform-ui/valdi-ai-ui/actions/workflows/build.yml)
[![Release](https://github.com/sarda-xplatform-ui/valdi-ai-ui/actions/workflows/release.yml/badge.svg?branch=main)](https://github.com/sarda-xplatform-ui/valdi-ai-ui/actions/workflows/release.yml)
```

## Development Branch (develop)

```markdown
[![CI (develop)](https://github.com/sarda-xplatform-ui/valdi-ai-ui/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/sarda-xplatform-ui/valdi-ai-ui/actions/workflows/ci.yml)
[![Build (develop)](https://github.com/sarda-xplatform-ui/valdi-ai-ui/actions/workflows/build.yml/badge.svg?branch=develop)](https://github.com/sarda-xplatform-ui/valdi-ai-ui/actions/workflows/build.yml)
```

## Badge Styles

The GitHub actions badge supports different styles and can be customized:

### Standard Badge (default)
```
https://github.com/[owner]/[repo]/actions/workflows/[workflow].yml/badge.svg
```

### Branch-specific Badge
```
https://github.com/[owner]/[repo]/actions/workflows/[workflow].yml/badge.svg?branch=[branch]
```

### Event-specific Badge (PR or Push)
```
https://github.com/[owner]/[repo]/actions/workflows/[workflow].yml/badge.svg?event=[event]
```

## Live Badge Preview

When you replace `[owner]` and `[repo]` with actual values:
- Passing workflows show a green "passing" badge
- Failing workflows show a red "failing" badge
- Workflow status updates in real-time

## Coverage Badge (Optional)

If using Codecov, add coverage badge:

```markdown
[![codecov](https://codecov.io/gh/sarda-xplatform-ui/valdi-ai-ui/branch/main/graph/badge.svg)](https://codecov.io/gh/sarda-xplatform-ui/valdi-ai-ui)
```

## Complete Example

Here's a complete set of badges for your README.md header:

```markdown
# Valdi AI UI

Open Source Cross-Platform AI Chat Client built with Valdi and Vercel AI SDK v5

[![CI](https://github.com/sarda-xplatform-ui/valdi-ai-ui/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/sarda-xplatform-ui/valdi-ai-ui/actions/workflows/ci.yml)
[![Build](https://github.com/sarda-xplatform-ui/valdi-ai-ui/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/sarda-xplatform-ui/valdi-ai-ui/actions/workflows/build.yml)
[![Release](https://github.com/sarda-xplatform-ui/valdi-ai-ui/actions/workflows/release.yml/badge.svg)](https://github.com/sarda-xplatform-ui/valdi-ai-ui/actions/workflows/release.yml)

## Features

- ... (rest of README)
```

## Notes

- Update `sarda-xplatform-ui` with your actual GitHub organization/username
- Update `valdi-ai-ui` with your actual repository name
- Badges automatically update whenever workflows run
- No additional configuration needed
