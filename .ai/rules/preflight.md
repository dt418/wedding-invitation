# Preflight Rules for AI Coding Agents

## Purpose

Prevent AI coding agents from hallucinating architecture, inventing APIs, and generating implementation without verified codebase evidence.

**Scope:** These rules apply to code generation tasks only. General conversation, factual questions, and non-coding tasks are unaffected.

**Core objectives:**
- Force codebase discovery before any code action
- Prevent architecture assumption and file hallucination
- Ensure all implementation derives from actual code, not inference
- Create auditable evidence trail for every decision

---

## Mandatory Preflight Workflow

Before writing code, complete discovery:

### Step 1: Knowledge Graph Check
- Read `.ai/graphify/GRAPH_REPORT.md` if available
- Identify god nodes and entry points for target domain

### Step 2: File Discovery
- Use `glob` to find relevant files by pattern
- Use `grep` to locate functions, types, and imports

### Step 3: Evidence Reading
- Read files in dependency order (imports before dependents)
- Extract exact function signatures, not approximations
- Note file paths and line numbers for citations

### Step 4: Dependency Tracing
- Trace import chains to understand module relationships
- Find existing patterns for the requested feature

### Step 5: Reasoning from Evidence
- Synthesize findings from actual code
- Identify gaps before writing code

---

## Hard Constraints

### MUST NOT Rules

1. **MUST NOT write code before completing discovery**
   - Code generation without discovery is a violation

2. **MUST NOT assume file existence**
   - Always use glob to confirm file presence before creating

3. **MUST NOT invent function signatures**
   - Copy exact signatures from existing code
   - Verify in source before use

4. **MUST NOT guess module structure**
   - Always read actual exports before using them

5. **MUST NOT generate code without evidence**
   - Every decision must reference verified source
   - Cite file path and line number for key facts

---

## Evidence System

**Inline citations required.** Every code response must include citations inline:

```
src/auth/login.ts:23-45 — copied exact User type from this definition
src/db/schema.ts:67 — verified createUser function signature
```

**Format flexibility:** Evidence citations can be inline or in a brief Evidence section. The goal is traceability, not rigid formatting. Match the response style while ensuring citations are present.

**Rule:** If no evidence exists, state "Need to read [file] before proceeding."

---

## Failure Conditions

The AI violates rules when ANY of the following occur:

1. **Skipping discovery** — Responding without any file search
2. **Generating code without evidence** — Writing implementation not backed by source
3. **Guessing system structure** — Assuming exports without verification
4. **Missing citations** — Code without file/line references

---

## Emergency Stop Rule

**Stop and request context when:**
- Target file doesn't exist and cannot be found via glob
- Required dependencies are not visible in codebase
- Contradictory evidence exists — clarify before proceeding

**Do NOT stop for:**
- Novel questions outside the codebase
- Philosophical discussions
- Simple factual queries

---

## Minimal Compliance Checklist

Before writing code:

```
□ Files discovered via glob
□ Function signatures verified in source
□ Import paths confirmed before use
□ Key facts have inline citations (file:line)
```

---

## Enforcement

These rules are binding for code generation tasks.

| Violation | Action |
|-----------|--------|
| No discovery | Acknowledge gap, request context |
| Code without verification | Stop, do not proceed |

**Goal:** Zero hallucinations. Every implementation traceable to verified source.

---

## Quality Gates

Before marking any implementation complete, verify all gates pass:

### 1. Lint
```bash
pnpm lint
```
- No ESLint errors
- No warnings in critical rules

### 2. TypeScript
```bash
pnpm build
```
- Build completes without errors (includes type checking)
- No TypeScript errors

### 3. Format
```bash
pnpm lint
```
- ESLint handles formatting checks
- No lint errors

### 4. Tests
```bash
pnpm test
```
- All tests pass
- No skipped tests in critical paths

### 5. Build
```bash
pnpm build
```
- Production build succeeds
- No bundle analysis errors

### Quality Gate Checklist

```
□ pnpm lint passes
□ pnpm build succeeds
□ pnpm test passes (if tests exist)
□ Manual verification in browser (if UI changes)
```

---

*Last updated: 2026-05-20*
*Version: 1.1*