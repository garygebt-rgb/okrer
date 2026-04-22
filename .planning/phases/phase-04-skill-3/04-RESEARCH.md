# Phase 4: Skill 3 评审评分专家 - Research

**Researched:** 2026-04-22
**Domain:** OKR review scoring, user narrative document parsing, evidence verification, weighted scoring
**Confidence:** HIGH

## Summary

Phase 4 implements the `okr-review-scoring` Claude Code Skill that provides a 6-step workflow for end-of-quarter OKR review and scoring:

1. **材料收集** — Collect user self-narrative document (Feishu doc link), case links, achievement summary
2. **数据验证** — Automated data collection from Feishu (meetings/docs/chat/Git/tasks/efficiency data)
3. **证据匹配** — Verify link accessibility, creator match, time range, keyword relevance, data consistency
4. **评分计算** — Apply difficulty 40% + effort 40% + completion 20% formula with job-specific weights
5. **自述文档解析** — Parse unstructured narrative documents (text, tables, screenshots, OKR cards, appendix links)
6. **报告生成** — Generate review report with scores, evidence list, strengths/weaknesses, period comparison, next-quarter suggestions

**Key finding:** The scoring engine (`scoring-engine.ts`) already exists from Phase 1, providing the weighted calculation foundation. Phase 4 extends it with review-specific scoring dimensions (difficulty, effort, completion).

## User Constraints (from REQUIREMENTS.md and PROJECT.md)

### Locked Decisions
- **REVIEW-01:** 材料收集 — 获取用户OKR自述文档（飞书文档链接）、案例链接、达成情况自述
- **REVIEW-02:** 数据验证 — 自动化采集飞书会议/文档/聊天/Git/任务/人效数据
- **REVIEW-03:** 证据匹配与验证 — 验证链接可访问性、创建者匹配、时间范围、关键词相关性、数据一致性
- **REVIEW-04:** 评分计算 — 应用难度40%+努力度40%+完成度20%公式，按岗位权重计算
- **REVIEW-05:** 用户自述文档解析 — 解析非结构化文档（含执行摘要、OKR卡片、补充表格、截图、附录链接）
- **REVIEW-06:** 评审报告生成 — 输出评分结果、材料支撑清单、优势与不足分析、往期对比、下季度建议
- **INTEG-01:** 人效数据云文档解析 — 解析PMO录入的云文档
- **INTEG-02:** 截图解析模块 — 解析用户自述文档中的截图内容

### Design Parameters (from PROJECT.md)
- 评分体系：难度40% + 努力度40% + 完成度20%
- OKR占KPI的20%（主观任务部分）
- 岗位权重：4类（研发、产品、测试、管理）
- 评审周期：季度
- 用户自述文档需要截图解析模块
- scoring-engine改为"数据汇总引擎"，提供汇总数据供人类参考评分

### Interaction Patterns (inherited from Phase 1/2)
- D-01: 用户主动逐步执行模式（每步完成后询问是否继续）
- D-02: 纯文本 + Markdown 表格输出格式
- 用户确认后才"发布"

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Narrative document parsing | Frontend (Claude Code) | -- | LLM parses Feishu doc content via lark-cli docs +fetch |
| Screenshot parsing | Frontend (Claude Code) | -- | Claude's vision capabilities extract evidence from screenshots |
| Evidence verification | Frontend (Claude Code) | lark-cli | LLM validates links, creators, time ranges; lark-cli fetches source data |
| Scoring calculation | Frontend (Claude Code) + okr-shared | -- | Uses scoring-engine.ts from Phase 1 with review-specific extensions |
| Report generation | Frontend (Claude Code) | -- | LLM generates structured review report |
| Efficiency data parsing | Client (lark-cli docs) | -- | Parses PMO cloud documents for efficiency metrics |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@larksuite/cli` | 1.0.14+ | Feishu CLI for OKR/docs/wiki/IM APIs | Already installed; provides `docs +fetch`, `wiki`, `okr` commands |
| Node.js built-in `fs` + `path` | -- | Local report storage | No external dependency needed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Node.js `child_process.execSync` | -- | Run lark-cli commands | Already pattern in `data-collector.ts` |

**No additional npm packages needed.** Phase 4 reuses Phase 1's `okr-shared` module.

## Architecture Patterns

### System Architecture Diagram

```
User invokes okr-review-scoring Skill
        |
        v
  Step 1: Material Collection
        |
        |-- User provides self-narrative doc link (Feishu doc)
        |-- lark-cli docs +fetch <doc_url> to get content
        |-- Extract: executive summary, OKR cards, tables, screenshots, appendix links
        |
        v
  Step 2: Data Validation
        |
        |-- Fetch current quarter OKR data (lark-cli okr +cycle-detail)
        |-- Fetch historical OKR data for comparison
        |-- Fetch Git commit records (data-collector.ts)
        |-- Fetch efficiency data from PMO cloud doc (lark-cli docs +fetch)
        |-- Fetch quality data from Feishu wiki (lark-cli wiki)
        |
        v
  Step 3: Evidence Matching
        |
        |-- For each evidence link provided in narrative doc:
        |   |-- Verify link accessibility
        |   |-- Check creator matches user
        |   |-- Verify time range within quarter
        |   |-- Keyword relevance to KR
        |   |-- Data consistency check
        |
        v
  Step 4: Score Calculation
        |
        |-- Load job-specific weights (okr-shared/job-weights.ts)
        |-- Calculate Difficulty score (40%) — LLM assessment of KR complexity
        |-- Calculate Effort score (40%) — based on evidence volume, update frequency, git activity
        |-- Calculate Completion score (20%) — based on final KR score vs target
        |-- Apply weighted formula → total score
        |
        v
  Step 5: Narrative Document Parsing (detailed)
        |
        |-- Full content analysis of self-narrative doc
        |-- Screenshot analysis (Claude vision) — extract evidence details
        |-- Cross-reference claimed achievements with system data
        |-- Identify gaps between narrative and evidence
        |
        v
  Step 6: Report Generation
        |
        |-- Compile all data into structured review report
        |-- Include: scores, evidence list, strengths/weaknesses, period comparison, next-quarter suggestions
        |-- Save report locally
        |-- Preview for user confirmation
```

### Recommended Project Structure

```
~/.claude/skills/okr-review-scoring/
├── SKILL.md                              # Skill entry point
├── workflows/
│   ├── step1-material-collect.md         # Material collection workflow
│   ├── step2-data-validate.md            # Data validation workflow
│   ├── step3-evidence-match.md           # Evidence matching workflow
│   ├── step4-score-calc.md              # Score calculation workflow
│   ├── step5-doc-parse.md               # Narrative document parsing workflow
│   └── step6-report-gen.md              # Report generation workflow
├── templates/
│   └── review-report-template.md         # Review report template
├── modules/
│   ├── screenshot-parser.ts              # Screenshot parsing module
│   └── doc-parser.ts                     # Cloud document parsing module
└── reports/                              # Generated reports storage (created at runtime)
    └── .gitignore                        # *.md (reports are generated, not committed)
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Feishu doc content extraction | Custom HTTP API calls | `lark-cli docs +fetch` | Auth, pagination, formatting already handled |
| Scoring calculation | Custom scoring logic | `okr-shared/scoring-engine.ts` | Weighted calculation already implemented |
| Evidence matching | Custom link checking | `EvidenceMatcher` from `okr-shared/evidence-matcher.ts` | 5-dimension matching already built |
| Job weights | Hard-coded weights | `okr-shared/job-weights.ts` | 4 job categories already configured |
| Git data collection | Direct GitLab API | `okr-shared/data-collector.ts` | IDE config detection + GitLab API already wrapped |

## Common Pitfalls

### Pitfall 1: Self-Narrative Document Structure Variability
**What goes wrong:** User narrative documents have wildly different formats, making parsing unreliable.
**Why it happens:** Documents are unstructured — different users write differently, include screenshots at different positions, use different table formats.
**How to avoid:** Use LLM's natural language understanding rather than rigid parsing rules. The doc-parser should be flexible and extract key sections (summary, OKR cards, evidence links, screenshots) by semantic understanding, not by fixed patterns.
**Warning signs:** If the parser fails to find expected sections, fall back to full-document LLM analysis.

### Pitfall 2: Screenshot Content Extraction
**What goes wrong:** Screenshots in narrative docs contain charts, dashboards, or code that needs interpretation.
**Why it happens:** Screenshots may be blurry, contain irrelevant UI elements, or show data that's hard to parse visually.
**How to avoid:** Use Claude's vision capabilities to extract meaningful content from screenshots. Focus on actionable evidence (commit counts, completion percentages, bug counts) rather than trying to parse every pixel.
**Warning signs:** If screenshot is too blurry or contains no actionable data, flag it as "无法解析" in the report.

### Pitfall 3: Evidence Link Verification
**What goes wrong:** Links in narrative docs may be broken, expired, or point to documents the current user can't access.
**Why it happens:** Permissions may have changed, documents may have been deleted, or links may be malformed.
**How to avoid:** Test each link via `lark-cli docs +fetch` during Step 3. Flag inaccessible links in the report. Don't fail the entire review if some links are broken — note them as "无法验证" and continue.
**Warning signs:** Multiple broken links may indicate fabricated evidence.

### Pitfall 4: Score Calculation Subjectivity
**What goes wrong:** Difficulty assessment is inherently subjective — different reviewers may score the same KR differently.
**Why it happens:** "Difficulty" depends on context — technical complexity, resource availability, time pressure.
**How to avoid:** Use LLM with explicit criteria for difficulty assessment (technical complexity, resource constraints, time pressure, innovation required). Provide transparent reasoning in the report so the human reviewer can adjust if needed.
**Warning signs:** If the LLM's difficulty reasoning is vague or circular, the score needs manual review.

### Pitfall 5: Period Comparison Data Availability
**What goes wrong:** Comparing current quarter with previous quarters requires historical OKR data that may not be available.
**Why it happens:** Previous quarters' OKRs may have been archived, or the user may not have them in the system.
**How to avoid:** Fall back to available data — if historical comparison is impossible, note it in the report and suggest future data retention. Use the current quarter's data alone for scoring.

## Code Examples

### Document Parser Module
```typescript
import { execSync } from 'child_process';
import { ReviewMaterial } from '../../okr-shared/okr-types';

interface ParsedNarrativeDoc {
  executiveSummary: string;
  okrCards: Array<{
    objective: string;
    keyResults: Array<{ description: string; claimedScore: number; evidence: string[] }>;
  }>;
  screenshots: string[];  // URLs or embedded image data
  appendixLinks: string[];
  rawContent: string;
}

async function parseNarrativeDoc(docUrl: string): Promise<ParsedNarrativeDoc> {
  const rawContent = execSync(`lark-cli docs +fetch "${docUrl}"`, { encoding: 'utf-8' });

  // Use LLM to extract structured sections
  // This is a Claude Code workflow step, not pure code
  return {
    executiveSummary: '...extracted by LLM...',
    okrCards: [],
    screenshots: [],
    appendixLinks: [],
    rawContent,
  };
}
```

### Evidence Link Verification
```typescript
import { EvidenceMatchResult } from '../../okr-shared/okr-types';

interface LinkVerification {
  url: string;
  accessible: boolean;
  creatorMatches: boolean;
  withinTimeRange: boolean;
  keywordRelevance: number;  // 0-1
  consistency: boolean;
  overallScore: number;      // 0-1
}

async function verifyLink(
  url: string,
  expectedCreator: string,
  quarterStart: string,
  quarterEnd: string,
  krKeywords: string[]
): Promise<LinkVerification> {
  // 1. Check accessibility
  try {
    execSync(`lark-cli docs +fetch "${url}"`, { encoding: 'utf-8' });
  } catch {
    return { url, accessible: false, creatorMatches: false, withinTimeRange: false, keywordRelevance: 0, consistency: false, overallScore: 0 };
  }

  // 2-5: Use EvidenceMatcher from okr-shared
  // ...
}
```

### Score Calculation (extends scoring-engine.ts)
```typescript
import { ScoringEngine } from '../../okr-shared/scoring-engine';
import { JobCategory } from '../../okr-shared/okr-types';

interface ReviewScores {
  difficulty: number;    // 0-100, LLM-assessed
  effort: number;        // 0-100, evidence-based
  completion: number;    // 0-100, from KR scores
  total: number;         // weighted sum
  breakdown: Record<string, number>;  // per-KR scores
}

function calculateReviewScore(
  jobCategory: JobCategory,
  difficultyAssessment: number,
  effortMetrics: { evidenceCount: number; updateFrequency: number; gitActivity: number },
  completionScores: Record<string, number>
): ReviewScores {
  const weights = getJobWeights(jobCategory);

  // Difficulty (40%) — LLM assessment
  const difficulty = difficultyAssessment;

  // Effort (40%) — composite of evidence metrics
  const effort = normalizeScore(
    effortMetrics.evidenceCount * 0.3 +
    effortMetrics.updateFrequency * 0.3 +
    effortMetrics.gitActivity * 0.4
  );

  // Completion (20%) — average KR completion
  const completion = average(Object.values(completionScores));

  const total = difficulty * 0.4 + effort * 0.4 + completion * 0.2;

  return { difficulty, effort, completion, total, breakdown: completionScores };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual review with spreadsheets | Automated evidence gathering + LLM scoring suggestions | This project | Faster, more consistent reviews |
| Hard-coded scoring rules | LLM-based difficulty + evidence-based effort + objective completion | Project decision | More nuanced scoring |
| Single-document review | Multi-source evidence cross-referencing | This project | Better fraud detection, more accurate scoring |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `lark-cli docs +fetch` can retrieve narrative doc content with screenshots | Standard Stack | Medium — if screenshots aren't included in fetch output, we need alternative extraction |
| A2 | Claude's vision API can process screenshots embedded in Feishu docs | Code Examples | Medium — if vision API can't access embedded screenshots, screenshot parsing degrades to text-only |
| A3 | `scoring-engine.ts` from Phase 1 can be extended with review-specific dimensions | Code Examples | Low — engine is designed for weighted calculations; extending dimensions is straightforward |
| A4 | PMO efficiency documents follow a consistent enough format for parsing | Pitfall 1 | Medium — if PMO docs are completely unstructured, INTEG-01 needs manual mapping |

## Open Questions (RESOLVED)

1. **Screenshot extraction from Feishu docs** — RESOLVED
   - **Resolution:** `lark-cli docs +fetch` 返回文档内容文本，截图以 URL 或 base64 形式嵌入。如果无法提取，Plan 03 Task 1 已设置 fallback："需要人工查看"，不阻断流程。

2. **Difficulty assessment criteria** — RESOLVED
   - **Resolution:** Plan 02 Task 3 已定义 5 项具体标准：技术复杂度、资源投入、时间压力、创新性要求、跨部门协作难度。每项 1-5 分，平均后转换为 0-100 分。

3. **Historical OKR comparison** — RESOLVED
   - **Resolution:** Plan 03 Task 2 已处理：往期数据可用时做对比，不可用时标注"无往期数据"，不阻断评审流程。

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `lark-cli` | All OKR/doc/wiki queries | Yes | 1.0.14 | -- |
| `docs:doc.content:readonly` scope | Step 1, 5 narrative doc parsing | Unknown | -- | User runs `lark-cli auth login --scope "docs:doc.content:readonly"` |
| `wiki:wiki:readonly` scope | Step 2 quality data | Unknown | -- | User runs `lark-cli auth login --scope "wiki:wiki:readonly"` |
| `okr-shared/scoring-engine.ts` | Step 4 score calculation | Yes | Phase 1 | -- |
| `okr-shared/evidence-matcher.ts` | Step 3 evidence matching | Yes | Phase 1 | -- |
| Claude vision API | Step 5 screenshot parsing | Unknown | -- | Flag as "需要人工查看" |

## Sources

### Primary (HIGH confidence)
- **okr-shared modules** — read from project directory, confirmed scoring-engine.ts and evidence-matcher.ts exist
- **lark-cli installed locally** — verified docs, wiki, okr subcommands
- **PROJECT.md** — confirmed design parameters, scoring formula, review scope
- **REQUIREMENTS.md** — REVIEW-01 through REVIEW-06, INTEG-01, INTEG-02 requirements

### Secondary (MEDIUM confidence)
- **Feishu docs API** — assumed to support content + image extraction
- **Claude vision API for screenshot parsing** — capability assumed based on multimodal support

### Tertiary (LOW confidence)
- **PMO efficiency doc format** — not verified, assumed to have some structure

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all tools verified via local installation
- Architecture: HIGH -- patterns derived from verified Phase 1 modules
- Pitfalls: MEDIUM -- some assumptions about Feishu doc/image handling
- Environment: MEDIUM -- scope availability depends on app configuration

**Research date:** 2026-04-22
**Valid until:** 2026-05-22 (30 days)
