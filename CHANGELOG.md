# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### ✨ Added

- **Slug Support for Events**: Events now have a URL-friendly slug field for SEO-optimized sharing. Generate beautiful URLs like `/invite/anh-minh-wedding` instead of UUID-based URLs.

- **Slug Utility Library**: New `src/lib/slug.ts` for generating URL-safe, transliterated slugs from Vietnamese text and other languages.

- **Comprehensive Test Coverage**: Added 107 tests covering authentication, API ownership, RSVP endpoints, and slug generation.

### 🔧 Improved

- **API Routes**: Updated all API routes to support slug-based queries while maintaining backward compatibility with ID-based access.

- **Event Wizard**: Added slug preview during event creation, showing how the invitation URL will look.

- **Preview Component**: Now displays slug-aware URLs for better user experience.

- **Quality Gates**: Added automated checks for lint, build, and tests to ensure code quality.

### 📚 Documentation

- **AI Rules Sync**: Updated `.ai` rules and prompts to reflect actual project configuration (Next.js 16, React 19, pnpm, Drizzle ORM, etc.)

- **Quality Gates Documentation**: Added preflight rules with quality gates (lint → build → test) to prevent hallucinations and ensure consistent code quality.