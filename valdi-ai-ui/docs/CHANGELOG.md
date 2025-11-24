# Changelog

All notable changes to the Valdi AI UI project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Created comprehensive STABILIZATION_STATUS.md documenting project health and 40-task action plan
- Added 7 Claude Code slash commands for common development workflows
- Added module.yaml files for all modules

### Changed
- **BREAKING**: Migrated all BUILD.bazel module paths from `//apps/valdi_ai_ui/modules/...` to `//modules/...`
- Fixed TypeScript import paths in 19 files to use path aliases (`@common/*`, `@chat_core/*`)
- Updated MODULE.bazel to use `vendor/valdi` for self-contained builds

### Fixed
- Removed 35 accumulated build log files from repository
- Verified `.gitignore` correctly excludes `*.log` files

## [0.1.0] - 2025-11-21

### Added
- Initial project structure with 10 modules
- Complete design system
- Core chat functionality with AI SDK v5
- Multi-provider AI support
- Comprehensive documentation

