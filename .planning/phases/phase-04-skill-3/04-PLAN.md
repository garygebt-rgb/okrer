---
phase: phase-04-skill-3
plan: 01
subsystem: skill-definition-and-parsing-modules
tags: [okr, review-scoring, skill, lark-cli, screenshot-parsing, doc-parsing]

# Dependency graph
requires:
  - phase: 01-shared-data-layer
    provides: okr-types.ts, scoring-engine.ts, evidence-matcher.ts, job-weights.ts, data-collector.ts
provides:
  - SKILL.md entry point for okr-review-scoring skill
  - step1-material-collect.md workflow
  - modules/screenshot-parser.ts
  - modules/doc-parser.ts
  - reports/ directory with .gitignore
affects:
  - 04-02 (Steps 2-4: data validation, evidence matching, score calculation)
  - 04-03 (Steps 5-6: doc parsing, report generation, template)

# Tech tracking
tech-stack:
  added: [lark-cli docs +fetch, lark-cli wiki, screenshot parsing via Claude vision]
  patterns:
    - "User-initiated step-by-step workflow mode with continue prompts (D-19)"
    - "Plain text + Markdown tables for Feishu-compatible output (D-20)"
    - "LLM-based semantic parsing for narrative documents (D-27)"
    - "Claude vision for screenshot evidence extraction (D-28)"

key-files:
  created:
    - "~/.claude/skills/okr-review-scoring/SKILL.md"
    - "~/.claude/skills/okr-review-scoring/workflows/step1-material-collect.md"
    - "~/.claude/skills/okr-review-scoring/modules/screenshot-parser.ts"
    - "~/.claude/skills/okr-review-scoring/modules/doc-parser.ts"
    - "~/.claude/skills/okr-review-scoring/reports/.gitignore"
  modified: []

key-decisions:
  - "Followed D-19: User-initiated step-by-step mode with explicit continue prompts"
  - "Followed D-20: All output plain text + Markdown tables, no Feishu card templates"
  - "Followed D-27: LLM semantic parsing for narrative documents, not rigid rule-based"
  - "Followed D-28: Claude vision for screenshot content extraction"

patterns-established:
  - "Skill entry SKILL.md with YAML frontmatter + 6 required sections (consistent with Phase 2/3)"
  - "Module files in modules/ directory for reusable TypeScript code"
  - "Workflow step files with: input, execution steps, error handling, output format, continue prompt"

requirements-completed:
  - REVIEW-01

# Metrics
duration: ~10min
completed: TBD
---

# Phase 04 Plan 01: Skill Entry + Material Collection + Parsing Modules

**okr-review-scoring skill entry point with 6-step workflow definition, Step 1 material collection workflow, screenshot parser module, and document parser module**

## Task Breakdown

### Task 1: Create SKILL.md entry point

Create `~/.claude/skills/okr-review-scoring/SKILL.md` with:

- YAML frontmatter (name, description, icon, version)
- 6-step workflow overview table
- Interaction mode: user-initiated step-by-step, plain text + Markdown tables
- Output format: review report saved to `reports/` directory
- Dependency references:
  - `okr-shared/scoring-engine.ts` — score calculation
  - `okr-shared/evidence-matcher.ts` — evidence verification
  - `okr-shared/job-weights.ts` — job-specific weights
  - `okr-shared/data-collector.ts` — data collection
  - `okr-shared/okr-types.ts` — type definitions
- Data sources:
  - 飞书OKR: `lark-cli okr` — OKR cycle/objective/key result data
  - 用户自述文档: `lark-cli docs +fetch` — narrative document parsing
  - Git: `okr-shared/data-collector.ts` — commit records
  - 人效数据: `lark-cli docs +fetch` — PMO cloud documents
  - 质量管理: `lark-cli wiki` — quality metrics
- Security notes: data scoped to authenticated user, explicit confirmation before saving report

### Task 2: Create Step 1 material collection workflow

Create `~/.claude/skills/okr-review-scoring/workflows/step1-material-collect.md` with:

**Input:** User provides self-narrative document URL (Feishu doc)

**Execution Steps:**
1. Validate the provided document URL
2. Fetch document content via `lark-cli docs +fetch <url>`
3. Extract key sections using LLM:
   - Executive summary (执行摘要)
   - OKR cards (OKR卡片 — objectives + key results + claimed scores)
   - Evidence links (附录链接 — docs, Git repos, dashboards)
   - Screenshot references (截图 — URLs or embedded image data)
4. Identify user's job category (auto-detect from Feishu OKR system)
5. Identify current/review quarter cycle
6. Display extracted summary table for user confirmation

**Output Format:**
- Material summary table (document sections found, links count, screenshots count)
- User info (name, job category, quarter)
- Continue prompt: "确认材料收集完成，输入'继续'进入数据验证"

**Error Handling:**
- If doc URL invalid: guide user to correct URL
- If doc content empty or inaccessible: fallback to manual input mode
- If job category undetectable: ask user to select from 4 categories

**Data Type References:**
- `Objective`, `KeyResult` from `okr-types.ts`
- `JobCategory` from `okr-types.ts`

**Security Notes:**
- Document content fetched via authenticated lark-cli (user's permissions only)
- Parse results displayed in session only, not persisted until report saved

**Continue Prompt:**
> 材料收集完成。共提取到 X 个 OKR 目标、Y 个案例链接、Z 张截图。输入"继续"进入下一步：数据验证。

### Task 3: Create screenshot parser module

Create `~/.claude/skills/okr-review-scoring/modules/screenshot-parser.ts` with:

**Interfaces:**
```typescript
interface ScreenshotAnalysis {
  imageUrl: string;
  description: string;       // What the screenshot shows
  extractedData: string;     // Actionable data extracted (metrics, counts, etc.)
  evidenceType: 'dashboard' | 'code' | 'document' | 'chat' | 'other';
  confidence: number;        // 0-1, how confident we are in the extraction
  usable: boolean;           // Whether the extracted data can be used as evidence
}
```

**Functions:**
- `parseScreenshot(imageUrl: string): Promise<ScreenshotAnalysis>` — Use Claude vision to analyze screenshot and extract evidence
- `parseMultipleScreenshots(imageUrls: string[]): Promise<ScreenshotAnalysis[]>` — Batch process

**Implementation:**
- This module is a thin wrapper around Claude's vision capabilities
- The actual parsing happens in the workflow step (step5-doc-parse.md) which calls Claude vision
- The module provides type definitions and a structured interface
- If Claude vision fails or image is unusable, mark as `usable: false` with reason

**Note:** Since this is a Claude Code Skill (not standalone TypeScript), the actual vision API calls happen in the workflow markdown files, not in TypeScript. The module provides type definitions and documentation for the workflow to follow.

### Task 4: Create document parser module

Create `~/.claude/skills/okr-review-scoring/modules/doc-parser.ts` with:

**Interfaces:**
```typescript
interface ParsedNarrativeDoc {
  executiveSummary: string;
  okrCards: Array<{
    objectiveTitle: string;
    keyResults: Array<{
      description: string;
      claimedScore: number;    // 0-1, what user claims
      evidenceLinks: string[];
    }>;
  }>;
  screenshots: string[];       // Image URLs or identifiers
  appendixLinks: string[];
  rawContent: string;
  quarter: string;             // e.g. "2026-Q1"
  userId: string;
}
```

**Functions:**
- `fetchAndParseDoc(docUrl: string): Promise<ParsedNarrativeDoc>` — Fetch via lark-cli + LLM extraction
- `extractOKRCards(rawContent: string): ParsedNarrativeDoc['okrCards']` — LLM-based OKR card extraction
- `extractEvidenceLinks(rawContent: string): string[]` — Extract all URLs and references

**Implementation:**
- Fetch content via `lark-cli docs +fetch <url>`
- Use LLM semantic understanding to extract structured sections
- No rigid parsing rules — rely on LLM's ability to identify sections by context
- Handle varied document formats gracefully

### Task 5: Create reports directory with .gitignore

Create `~/.claude/skills/okr-review-scoring/reports/.gitignore` with:
```
# Generated reports — not committed
*.md
```

## Verification

- SKILL.md: 6-step workflow ✓, modules/ references ✓, config references ✓
- step1: material collection ✓, doc fetching ✓, LLM extraction ✓, summary table ✓
- screenshot-parser: ScreenshotAnalysis interface ✓, parseScreenshot ✓, unusable handling ✓
- doc-parser: ParsedNarrativeDoc interface ✓, fetchAndParseDoc ✓, extractOKRCards ✓
- directory: reports/ ✓, .gitignore *.md ✓
