# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### ✨ Added

- **Invitation Sending System**: Complete system for sending wedding invitations via Zalo OA and Email. Features include real-time streaming progress, delivery status tracking, and batch processing.

- **Slug Support for Events**: Events now have a URL-friendly slug field for SEO-optimized sharing. Generate beautiful URLs like `/invite/anh-minh-wedding` instead of UUID-based URLs.

- **Zalo Integration**: Native Zalo OA messaging support for sending invitations to guests with Zalo accounts. Includes Zalo SDK wrapper, message templating, and delivery tracking.

- **Email Integration**: Email delivery support via Resend API for guests without Zalo. HTML email templates with wedding branding.

- **Delivery Tracking**: Comprehensive delivery status tracking with `invite_deliveries` and `invite_send_jobs` tables. Real-time status updates: pending, sending, sent, delivered, failed.

- **Send Invites UI**: User-friendly interface for sending invitations with progress indicators, delivery statistics, and retry capabilities.

- **Slug Utility Library**: New `src/lib/slug.ts` for generating URL-safe, transliterated slugs from Vietnamese text and other languages.

- **i18n Translations**: Multi-language support for invitation delivery messages (Vietnamese, English).

### 🔧 Improved

- **API Routes**: Updated all API routes to support slug-based queries while maintaining backward compatibility with ID-based access.

- **Event Wizard**: Added slug preview during event creation, showing how the invitation URL will look.

- **Preview Component**: Now displays slug-aware URLs for better user experience.

- **Quality Gates**: Added automated checks for lint, build, and tests to ensure code quality.

### 📚 Documentation

- **AI Rules Sync**: Updated `.ai` rules and prompts to reflect actual project configuration (Next.js 16, React 19, pnpm, Drizzle ORM, etc.)

- **Quality Gates Documentation**: Added preflight rules with quality gates (lint → build → test) to prevent hallucinations and ensure consistent code quality.