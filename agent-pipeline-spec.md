# Multi-Stage Agent Pipeline Specification

## 1. Overview

This specification defines a **deterministic, codebase-first** runtime execution pipeline enforced across all agent operations.

### Pipeline Stages

| Stage | Agent | Purpose | Blocking Condition |
|-------|-------|---------|-------------------|
| 1 | **Planner** | Decompose task into verifiable execution units | Schema invalid → halt |
| 2 | **Reader** | Gather verified codebase evidence for each unit | No files read → halt |
| 3 | **Implementer** | Execute ONLY using verified evidence | Uncited code → reject |

### Core Principle

> **No implementation without evidence. No evidence without files read.**

---

## 2. Global Enforcement Rules

### 2.1 MUST Rules

| Rule | Description | Enforcement |
|------|-------------|-------------|
| M1 | Agents **MUST** produce structured JSON output matching schema | Gate validation |
| M2 | Evidence **MUST** be sourced from actual file reads | Reader fileReadCount ≥ 1 |
| M3 | Implementer **MUST** cite evidence for every code decision | Anti-hallucination gate |
| M4 | Pipeline **MUST** halt on blocking condition | Hard halt |
| M5 | File hashes **MUST** match between read and implementation | Freshness check |
| M6 | Evidence **MUST** be traceable to specific file:line ranges | Citation format enforced |

### 2.2 MUST NOT Rules

| Rule | Description | Penalty |
|------|-------------|---------|
| N1 | Agents **MUST NOT** write code without evidence citation | Output rejected |
| N2 | Agents **MUST NOT** assume file locations | Pre-flight validation required |
| N3 | Agents **MUST NOT** reference absent imports/types | Evidence gap = halt |
| N4 | Agents **MUST NOT** skip stages | Pipeline invalid |
| N5 | Agents **MUST NOT** use external docs as sole evidence | Internal codebase only |
| N6 | Planner **MUST NOT** output ambiguous execution units | Schema validation |

### 2.3 Blocking Conditions (Hard Halt)

| Code | Condition | Recovery |
|------|-----------|----------|
| BC-01 | Planner output fails schema | Return to Planner |
| BC-02 | Reader fileReadCount = 0 | **Pipeline halts permanently** |
| BC-03 | Evidence pack fails schema | Return to Reader |
| BC-04 | Implementer output lacks citations | Return to Implementer |
| BC-05 | File hash mismatch (stale evidence) | Re-read required |
| BC-06 | Circular dependency detected | Return to Planner |

### 2.4 Non-Blocking Conditions (Recovery Path)

| Code | Condition | Recovery |
|------|-----------|----------|
| NC-01 | Evidence gap identified | Add evidence, continue |
| NC-02 | Optional pattern not found | Skip or warn, continue |
| NC-03 | Implementation complexity exceeded | Split unit, continue |

---

## 3. Shared Data Contracts

### 3.1 Planner Output Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["taskId", "executionUnits", "validationCriteria", "metadata"],
  "additionalProperties": false,
  "properties": {
    "taskId": {
      "type": "string",
      "pattern": "^[a-z0-9-]+$",
      "minLength": 3
    },
    "executionUnits": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["unitId", "description", "verificationMethod", "requiredEvidence"],
        "additionalProperties": false,
        "properties": {
          "unitId": {
            "type": "string",
            "pattern": "^unit-[0-9]{3}$"
          },
          "description": {
            "type": "string",
            "minLength": 20,
            "maxLength": 500
          },
          "verificationMethod": {
            "type": "string",
            "enum": ["file-read", "pattern-match", "import-trace", "type-check", "integration"]
          },
          "requiredEvidence": {
            "type": "array",
            "minItems": 1,
            "items": {
              "type": "object",
              "required": ["type", "count"],
              "properties": {
                "type": {
                  "type": "string",
                  "enum": ["implementation", "test", "config", "schema", "type-definition", "convention"]
                },
                "count": {
                  "type": "integer",
                  "minimum": 1,
                  "maximum": 10
                },
                "description": {
                  "type": "string"
                }
              }
            }
          },
          "complexity": {
            "type": "string",
            "enum": ["low", "medium", "high"],
            "default": "medium"
          }
        }
      }
    },
    "dependencies": {
      "type": "object",
      "description": "Adjacency list: unitId -> [unitIds it depends on]",
      "additionalProperties": {
        "type": "array",
        "items": { "type": "string", "pattern": "^unit-[0-9]{3}$" }
      }
    },
    "validationCriteria": {
      "type": "object",
      "required": ["successConditions", "failureConditions"],
      "properties": {
        "successConditions": {
          "type": "array",
          "minItems": 1,
          "items": { "type": "string" }
        },
        "failureConditions": {
          "type": "array",
          "items": { "type": "string" }
        }
      }
    },
    "metadata": {
      "type": "object",
      "required": ["plannedAt", "agentVersion"],
      "properties": {
        "plannedAt": { "type": "string", "format": "date-time" },
        "agentVersion": { "type": "string" },
        "estimatedUnits": { "type": "integer" },
        "parallelizable": { "type": "boolean", "default": false }
      }
    }
  }
}
```

### 3.2 Reader Evidence Pack Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["taskId", "unitId", "filesRead", "evidence", "timestamp", "metadata"],
  "additionalProperties": false,
  "properties": {
    "taskId": {
      "type": "string"
    },
    "unitId": {
      "type": "string",
      "pattern": "^unit-[0-9]{3}$"
    },
    "filesRead": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["path", "linesRead", "contentHash", "readAt"],
        "additionalProperties": false,
        "properties": {
          "path": {
            "type": "string",
            "description": "Absolute normalized file path"
          },
          "linesRead": {
            "type": "integer",
            "minimum": 1
          },
          "totalLines": {
            "type": "integer"
          },
          "contentHash": {
            "type": "string",
            "description": "SHA256 of file content at read time"
          },
          "readAt": {
            "type": "string",
            "format": "date-time"
          },
          "relevantSnippets": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["lineStart", "lineEnd", "content"],
              "properties": {
                "lineStart": { "type": "integer", "minimum": 1 },
                "lineEnd": { "type": "integer" },
                "content": { "type": "string" }
              }
            }
          }
        }
      }
    },
    "evidence": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "patterns": {
          "type": "array",
          "description": "Code patterns found; each must cite file:line",
          "items": {
            "type": "object",
            "required": ["pattern", "source"],
            "properties": {
              "pattern": { "type": "string" },
              "source": { "type": "string" },
              "description": { "type": "string" }
            }
          }
        },
        "conventions": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["convention", "source"],
            "properties": {
              "convention": { "type": "string" },
              "source": { "type": "string" }
            }
          }
        },
        "imports": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["import", "source"],
            "properties": {
              "import": { "type": "string" },
              "source": { "type": "string" }
            }
          }
        },
        "types": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["typeName", "source"],
            "properties": {
              "typeName": { "type": "string" },
              "source": { "type": "string" },
              "definition": { "type": "string" }
            }
          }
        }
      }
    },
    "gaps": {
      "type": "array",
      "description": "Evidence gaps; pipeline may continue if gaps are optional",
      "items": {
        "type": "object",
        "required": ["description", "severity"],
        "properties": {
          "description": { "type": "string" },
          "severity": { "type": "string", "enum": ["blocking", "warning", "info"] },
          "requiredEvidenceType": { "type": "string" }
        }
      }
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "metadata": {
      "type": "object",
      "required": ["agentId", "evidenceFreshnessWindow"],
      "properties": {
        "agentId": { "type": "string" },
        "evidenceFreshnessWindow": {
          "type": "integer",
          "description": "Seconds this evidence remains valid",
          "default": 300
        }
      }
    }
  }
}
```

---

## 4. Stage Definitions

### 4.1 Planner Agent

#### Responsibilities

1. Analyze task complexity before decomposition
2. Create execution units with unambiguous descriptions
3. Assign verification method per unit
4. Define required evidence types and counts
5. Map inter-unit dependencies
6. Establish validation criteria

#### MUST Rules

| ID | Rule |
|----|------|
| P-M1 | Output **MUST** match Planner Output Schema exactly |
| P-M2 | Each execution unit **MUST** have verificationMethod set |
| P-M3 | Each execution unit **MUST** specify requiredEvidence with count ≥ 1 |
| P-M4 | Dependencies **MUST** use valid unitId references |
| P-M5 | Descriptions **MUST** be ≥ 20 characters, no ambiguity |
| P-M6 | Circular dependencies **MUST** be detected and rejected |

#### MUST NOT Rules

| ID | Rule |
|----|------|
| P-N1 | Planner **MUST NOT** create units without task analysis |
| P-N2 | Planner **MUST NOT** skip dependency mapping |
| P-N3 | Planner **MUST NOT** output validationCriteria without both conditions |

#### Output Format

```yaml
Planner Output:
  taskId: "task-001"
  executionUnits:
    - unitId: "unit-001"
      description: "..."  # ≥20 chars
      verificationMethod: "file-read" | "pattern-match" | "import-trace" | "type-check" | "integration"
      requiredEvidence:
        - type: "implementation"
          count: 2
      complexity: "low" | "medium" | "high"
    - unitId: "unit-002"
      # ...
  dependencies:
    "unit-001": []
    "unit-002": ["unit-001"]
  validationCriteria:
    successConditions: ["..."]
    failureConditions: ["..."]
  metadata:
    plannedAt: "2025-01-01T00:00:00Z"
    agentVersion: "1.0.0"
    estimatedUnits: 3
    parallelizable: true
```

#### Validation Gate

```
IF plannerOutput validates against schema
   AND all unitIds match pattern "^unit-[0-9]{3}$"
   AND all dependencies reference valid unitIds
   AND no circular dependencies detected
THEN pass
ELSE block with BC-01
```

---

### 4.2 Reader Agent

#### Responsibilities

1. Read files to satisfy required evidence per execution unit
2. Extract and structure relevant code snippets
3. Document patterns, conventions, imports, types
4. Identify evidence gaps with severity classification
5. Generate cryptographic proof of file content

#### MUST Rules

| ID | Rule |
|----|------|
| R-M1 | Output **MUST** match Evidence Pack Schema exactly |
| R-M2 | filesRead **MUST** contain ≥ 1 file per execution unit |
| R-M3 | Each file **MUST** include contentHash (SHA256) |
| R-M4 | Each relevantSnippet **MUST** include lineStart and lineEnd |
| R-M5 | Evidence gaps **MUST** include severity classification |
| R-M6 | Evidence **MUST** include source citation for every item |

#### MUST NOT Rules

| ID | Rule |
|----|------|
| R-N1 | Reader **MUST NOT** cite file without reading it |
| R-N2 | Reader **MUST NOT** produce evidence without source reference |
| R-N3 | Reader **MUST NOT** skip gaps analysis |
| R-N4 | Reader **MUST NOT** use stale file hash (must match at read time) |

#### Citation Format

All evidence citations **MUST** use format:

```
{absolutePath}:{lineStart}-{lineEnd}
```

Examples:
- `src/auth/login.ts:45-52`
- `src/db/schema.ts:1-15`

#### Failure Condition

```
IF filesRead.length === 0
THEN pipeline halts with BC-02
     # Recovery: impossible, task must be re-planned
```

#### Parallel Execution

Reader **MAY** execute multiple units in parallel if:
- Units have no interdependencies (checked from Planner.dependencies)
- Each parallel branch produces independent evidence pack
- Results are merged before Implementer stage

---

### 4.3 Implementer Agent

#### Responsibilities

1. Consume and validate evidence pack
2. Execute implementation using ONLY cited evidence
3. Cite evidence for every code decision
4. Validate implementation against success criteria
5. Report gaps requiring additional evidence

#### MUST Rules

| ID | Rule |
|----|------|
| I-M1 | Every code decision **MUST** cite evidence (file:line format) |
| I-M2 | Imports **MUST** be verified against evidence.imports |
| I-M3 | Types **MUST** be verified against evidence.types |
| I-M4 | Patterns **MUST** match evidence.patterns exactly |
| I-M5 | Output **MUST** include evidence section per citation |
| I-M6 | Output **MUST** include validation result against criteria |

#### MUST NOT Rules

| ID | Rule |
|----|------|
| I-N1 | Implementer **MUST NOT** use imports not in evidence.imports |
| I-N2 | Implementer **MUST NOT** extrapolate types beyond evidence |
| I-N3 | Implementer **MUST NOT** create patterns not found in evidence |
| I-N4 | Implementer **MUST NOT** skip evidence citation for any code |
| I-N5 | Implementer **MUST NOT** use external documentation as evidence |
| I-N6 | Implementer **MUST NOT** leave TODO/FIXME without evidence |

#### Required Output Sections

```yaml
Implementation Output:
  unitId: "unit-001"
  evidence:
    - ref: "src/path/file.ts:45-52"
      content: "# exact snippet from file"
      usedFor: "pattern implementation"
    - ref: "src/types/api.ts:12-18"
      content: "# type definition"
      usedFor: "type reference"
  analysis:
    - decision: "Use pattern X because..."
      evidence: "src/path/file.ts:45-52"
      rationale: "Matches codebase convention"
  implementation:
    files:
      - path: "src/output/file.ts"
        action: "create" | "modify"
        lines: [startLine, endLine]
    code: |
      # Full implementation code
  validation:
    successCriteria:
      - condition: "..."
        passed: true | false
        evidence: "..."
    failureCriteria:
      - condition: "..."
        triggered: true | false
  gaps:
    - description: "..."
      severity: "warning"
      canProceed: true | false
```

#### Anti-Hallucination Validation

```
FOR each codeBlock IN implementation.code
    FOR each import IN codeBlock.imports
        IF import NOT IN evidence.imports
           THEN reject with NC-01 (evidence gap)
    FOR each typeUsage IN codeBlock.types
        IF typeUsage NOT IN evidence.types
           THEN reject with NC-01
    FOR each pattern IN codeBlock.patterns
        IF pattern NOT IN evidence.patterns
           THEN reject with NC-02
```

---

## 5. Validation Gates

### 5.1 Schema Gate

| Stage | Validation | Action |
|-------|------------|--------|
| Planner | JSON Schema validation | Return on BC-01 |
| Reader | JSON Schema validation | Return on BC-03 |
| Implementer | JSON Schema validation | Return on BC-04 |

### 5.2 Evidence Gate

| Check | Condition | Action |
|-------|-----------|--------|
| File existence | `path.exists() === true` | **BLOCK** BC-01 |
| Line validity | `lineStart >= 1 AND lineEnd <= totalLines` | **BLOCK** BC-01 |
| Freshness | `currentHash === contentHash` | **BLOCK** BC-05 |
| Completeness | All requiredEvidence types present | **BLOCK** or **WARN** |

### 5.3 Stage Completion Gate

| Stage | Gate | Pass Condition | Fail Action |
|-------|------|----------------|-------------|
| Planner | SG-1 | Schema valid | BC-01 |
| Planner | SG-2 | Dependencies acyclic | BC-06 |
| Reader | SG-3 | filesRead ≥ 1 | **BC-02 (halt)** |
| Reader | SG-4 | No blocking gaps | NC-01 + continue |
| Implementer | SG-5 | All citations present | BC-04 |
| Implementer | SG-6 | No hallucinated imports/types | BC-04 |

### 5.4 Anti-Hallucination Gate

| Detection | Method | Action |
|-----------|--------|--------|
| Import anomaly | Cross-reference evidence.imports | Reject BC-04 |
| Type extrapolation | Cross-reference evidence.types | Reject BC-04 |
| Pattern mismatch | Regex match against evidence.patterns | Reject BC-04 |
| Assumption flag | Any `// assumed` comment | Review required |

---

## 6. Execution Flow

### 6.1 Sequential Pipeline

```
START
  │
  ▼
┌──────────────────────────────┐
│ STAGE 1: PLANNER             │
│ ┌────────────────────────┐   │
│ │ Analyze task           │   │
│ │ Decompose to units     │   │
│ │ Map dependencies       │   │
│ │ Output: Planner JSON  │   │
│ └────────────────────────┘   │
└──────────────┬───────────────┘
               │
               ▼
        ┌──────────────┐
        │ Schema Gate  │◄─── Fail ───┐
        │ SG-1, SG-2   │             │
        └──────┬───────┘             │
               │ Pass                │
               ▼                     │
┌──────────────────────────────┐     │
│ STAGE 2: READER (per unit)   │     │
│ ┌────────────────────────┐   │     │
│ │ Read required files    │   │     │
│ │ Extract evidence       │   │     │
│ │ Generate evidence pack │   │     │
│ └────────────────────────┘   │     │
└──────────────┬───────────────┘     │
               │                   │
               ▼                   │
        ┌──────────────┐            │
        │ Evidence    │◄─── Fail ───┤
        │ SG-3        │            │
        └──────┬───────┘            │
               │ Pass                │
               ▼                     │
        ┌──────────────┐            │
        │ Blocking     │◄─── Yes ────┘
        │ Gap?         │
        └──────┬───────┘
               │ No
               ▼
┌──────────────────────────────┐
│ STAGE 3: IMPLEMENTER        │
│ ┌────────────────────────┐  │
│ │ Validate evidence pack  │  │
│ │ Implement using only    │  │
│ │   cited evidence        │  │
│ │ Output: Implementation  │  │
│ └────────────────────────┘  │
└──────────────┬───────────────┘
               │
               ▼
        ┌──────────────┐
        │ AH Gate     │◄─── Fail ───┐
        │ SG-5, SG-6  │             │
        └──────┬───────┘             │
               │ Pass                │
               ▼                     │
        ┌──────────────┐            │
        │ All Units   │◄─── No ─────┘
        │ Complete?   │
        └──────┬───────┘
               │ Yes
               ▼
           COMPLETE
```

### 6.2 Parallel Execution (when parallelizable=true)

```
START
  │
  ▼
┌──────────────────────────────┐
│ PLANNER                      │
│ Output: {unit-001, unit-002, │
│          unit-003, unit-004} │
│ Dependencies:                │
│   unit-002 → unit-001        │
│   unit-004 → unit-003        │
└──────────────┬───────────────┘
               │
               ▼
       ┌───────────────┐
       │ Dependency    │
       │ Analysis      │
       └───────┬───────┘
               │
               ▼
    ┌──────────┴──────────┐
    │ Level 0 (parallel)  │
    │ ┌─────────┐ ┌─────────┐
    │ │ unit-001│ │ unit-003│
    │ └────┬────┘ └────┬────┘
    └──────┼───────────┼──────┘
           │           │
           ▼           ▼
    ┌─────────────┐ ┌─────────────┐
    │ Reader-001  │ │ Reader-003  │
    │ Evidence    │ │ Evidence    │
    │ Pack-001    │ │ Pack-003    │
    └──────┬──────┘ └──────┬──────┘
           │           │
           ▼           ▼
    ┌─────────────┐ ┌─────────────┐
    │ Impl-001    │ │ Impl-003    │
    └──────┬──────┘ └──────┬──────┘
           │           │
           ▼           ▼
       Level 1 (sequential)
    ┌─────────┐ ┌─────────┐
    │ unit-002│ │ unit-004│
    └────┬────┘ └────┬────┘
```

---

## 7. Error Registry

| Code | Name | Description | Recovery |
|------|------|-------------|----------|
| BC-01 | SchemaValidationFailed | Output fails JSON schema | Return to stage |
| BC-02 | NoFilesRead | Reader produced empty filesRead | **Pipeline halt** |
| BC-03 | EvidencePackInvalid | Evidence pack schema invalid | Return to Reader |
| BC-04 | MissingCitations | Implementation lacks evidence citations | Return to Implementer |
| BC-05 | StaleEvidence | File hash mismatch | Re-read required |
| BC-06 | CircularDependency | Dependency cycle detected | Return to Planner |
| NC-01 | EvidenceGap | Required evidence not found | Add evidence, continue |
| NC-02 | PatternNotFound | Expected pattern absent | Skip or warn |
| NC-03 | ComplexityExceeded | Unit too complex | Split unit |

---

## 8. Glossary

| Term | Definition |
|------|------------|
| **Blocking Condition** | Pipeline halt that prevents further execution; requires re-planning |
| **Citation** | Reference to evidence using format `{path}:{lineStart}-{lineEnd}` |
| **Evidence** | Verified information extracted from codebase files |
| **Evidence Pack** | Complete structured output from Reader stage |
| **Evidence Freshness Window** | Time period (seconds) before evidence must be re-validated |
| **Execution Unit** | Atomic task defined by Planner for single Implementer output |
| **Hallucination** | Code, imports, types, or patterns used without evidence |
| **Non-Blocking Condition** | Issue that can be addressed while pipeline continues |
| **Parallelizable** | Units with no interdependencies that can execute concurrently |
| **Schema Gate** | Validation against JSON Schema before stage completion |
| **Verification Method** | Strategy for validating evidence sufficiency per unit |

---

## 9. Strict Mode (Production)

Activated when `ENFORCEMENT_LEVEL=STRICT`

### Additional Rules

| Rule | Enforcement |
|------|-------------|
| Evidence freshness | Hash verification at every file access |
| Citation format | Regex validation `^/[a-zA-Z0-9_./-]+:[0-9]+-[0-9]+$` |
| Evidence traceability | Line-level mapping required |
| No placeholders | `TODO`, `FIXME`, `TBD` prohibited without evidence |
| Audit logging | All stage outputs logged with timestamp + agentId |
| No external docs | Only internal codebase files as evidence |

### Strict Mode MUST NOT

| Rule | Penalty |
|------|---------|
| I-N7: Create stub functions without evidence | Reject |
| I-N8: Reference external URLs as evidence | Reject |
| I-N9: Use undefined variables | Reject |
| P-N4: Output unit without verification method | Block |

### Audit Requirements

```yaml
auditEntry:
  - stageOutput: REQUIRED
  - schemaValidation: REQUIRED  
  - gateResults: REQUIRED
  - timestamp: REQUIRED
  - agentId: REQUIRED
  - contentHash: REQUIRED
```

---

## 10. Core Principle

> **No implementation without evidence. No evidence without files read.**
>
> The codebase is the single source of truth. External documentation is not evidence. Assumptions are not evidence. Citations are mandatory. Schema compliance is mandatory.
>
> This principle is enforced through:
> 1. Hard blocking conditions that halt pipeline on violation
> 2. Schema validation at every stage boundary
> 3. Anti-hallucination gates that reject uncited code
> 4. Evidence freshness checks that prevent stale data
> 5. Comprehensive anti-hallucination ruleset (AH-01–AH-07) that covers citation format, cross-reference validation, content freshness, and explicit anti-patterns
>
> **Violation = rejection or halt. No exceptions. No workarounds.**

---

# Anti-Hallucination Rules (AH)

These rules apply **at all times** — no strict-mode toggle, no exceptions. Any agent that generates code or reasoning must satisfy every gate before output is considered valid. Output that fails a gate is rejected outright; no partial credit, no "close enough."

## Citation Requirements

Every statement of fact about the codebase **must** cite a source file with line range. This includes:

- "X function does Y" → must cite `src/path/file.ext:123-145`
- "This pattern is used in the codebase" → at least one citation
- "File X imports Y" → must cite the import statement's line range
- "This component renders A/B/C" → must cite the JSX/TSX lines
- "The API returns schema Z" → must cite the type/interface definition

Unsupported claims (no citation, or citation to non-existent file/line) are treated as hallucinated content.

**Citation format:** `^/[a-zA-Z0-9_./-]+:[0-9]+-[0-9]+$`

Examples:
- `src/lib/auth.ts:45-67` ✓
- `components/Button/index.tsx:12-34` ✓
- `docs/api.md:1-20` ✓
- `package.json:1-50` ✓

## Cross-Reference Validation

The citation alone is not sufficient. Evidence must also **prove the cited claim**:

1. The cited file **must exist** at the time the claim is made.
2. The cited line range **must be readable** and contain the quoted or paraphrased content.
3. Any secondary reference (e.g., a function called inside a cited block) **must also be cited** if the statement depends on it.
4. File paths in citations **must resolve** relative to the repository root. No relative-to-current-file paths.

## AH Blocking Codes

| Code | Title | Trigger |
|------|-------|---------|
| AH-01 | Missing Citation | A factual claim has no citation |
| AH-02 | Citation File Not Found | Citation file path does not exist |
| AH-03 | Citation Range Out of Bounds | Cited lines do not exist in the file |
| AH-04 | Citation Content Mismatch | Cited lines exist but don't support the claim |
| AH-05 | Nested Reference Uncited | A dependency within cited content is asserted without its own citation |
| AH-06 | Stale Citation | citation's contentHash does not match current file content |
| AH-07 | Unsupported Claim Type | Claim type (e.g., "the codebase uses X") has no defined evidence path |

## Blocking Behavior

**AH-01 / AH-02 / AH-03 / AH-04 / AH-05 / AH-07** → **BLOCK**. Output rejected. Agent must re-generate with valid citations before proceeding.

**AH-06** → **BLOCK**. Content stale. Agent must re-read the file and re-generate.

## Citation Metadata

Every citation block **must** include:

```json
{
  "path": "relative/path/to/file.ext",
  "lines": [startLine, endLine],
  "contentHash": "sha256:base64hash",
  "summary": "What this citation proves"
}
```

`contentHash` uses SHA-256 of the file at read time, base64-encoded. This enables AH-06 fresh-ness checks on subsequent passes.

## Anti-Patterns (Explicitly Rejected)

The following are **hallucination patterns** and are always blocked:

1. Inventing file names that don't exist in glob results.
2. Claiming behavior without citing the responsible code block.
3. Referencing types, interfaces, or enums without citing their definitions.
4. Stating "the codebase uses X library" without citing the import or dependency declaration.
5. Asserting a function's side effects without citing the actual mutation site.
6. Claiming a route exists without citing the route definition file.
7. Stating default values or config without citing the initialization site.
8. Asserting test coverage without citing the actual test file and line range.
9. Describing component hierarchy without citing the JSX/TSX file.

---

*Specification Version: 1.1*  
*Effective: Immediately upon loading*  
*Enforcement: Runtime, mandatory*  
*Schema Validation: JSON Schema Draft-07*
