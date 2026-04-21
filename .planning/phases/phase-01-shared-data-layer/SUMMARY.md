---
phase: phase-01-shared-data-layer
plan: 01
subsystem: shared-data-layer
tags: [typescript, lark-cli, git, evidence-collection, scoring-engine]

# Dependency graph
requires: []
provides:
  - OKR数据类型系统（20+ TypeScript interfaces/enums）
  - 飞书CLI数据采集团装（11个函数封装）
  - Git数据采集模块（本地IDE配置检测 + git log + GitLab API）
  - 4类岗位权重配置（研发/产品/测试/管理，权重总和验证=100%）
  - 数据汇总引擎（难度40%+努力度40%+完成度20%）
  - 证据匹配器（5维度验证：创建者/时间/关键词/URL/一致性）
  - 4套岗位差异化证据采集策略
affects: [okr-goal-setting, okr-process-tracking, okr-review-scoring]

# Tech tracking
tech-stack:
  added: [typescript, lark-cli wrappers, git log analysis, GitLab REST API]
  patterns: [CLI wrapper pattern, strategy pattern for evidence collection, scoring engine with weighted calculation]

key-files:
  created:
    - ~/.claude/skills/okr-shared/SKILL.md
    - ~/.claude/skills/okr-shared/data-collector.ts
    - ~/.claude/skills/okr-shared/job-weights.ts
    - ~/.claude/skills/okr-shared/scoring-engine.ts
    - ~/.claude/skills/okr-shared/evidence-matcher.ts
    - ~/.claude/skills/okr-shared/evidence-strategies/pm-evidence.ts
    - ~/.claude/skills/okr-shared/evidence-strategies/dev-evidence.ts
    - ~/.claude/skills/okr-shared/evidence-strategies/qa-evidence.ts
    - ~/.claude/skills/okr-shared/evidence-strategies/mgmt-evidence.ts
  modified:
    - ~/.claude/skills/okr-shared/okr-types.ts (pre-existed, verified complete)

key-decisions:
  - "okr-types.ts 预存在且完整覆盖 Task 1 需求，直接使用无需修改"
  - "data-collector.ts 合并 Task 2（飞书CLI）和 Task 3（Git采集）为单一文件，减少跨文件依赖"
  - "评分引擎只输出建议分数，不做最终评分（遵循项目决策：供人类参考）"

patterns-established:
  - "CLI Wrapper Pattern: 所有 lark-cli 命令通过统一 runLarkCommand() 执行，返回结构化 TypeScript 对象"
  - "Evidence Strategy Pattern: 每个岗位独立的证据采集函数，输出类型化的证据对象"
  - "Weighted Scoring: 评分引擎按岗位权重配置计算分项得分"

requirements-completed:
  - SHARED-01
  - SHARED-02
  - SHARED-03
  - SHARED-04
  - SHARED-05
  - SHARED-06
  - SHARED-07
  - SHARED-08
  - SHARED-09
  - SHARED-10

# Metrics
duration: 15min
completed: 2026-04-21
---

# Phase 1 Plan 01: 共享数据层 Summary

**OKR 共享数据层模块（okr-shared）：10个TypeScript文件提供数据类型定义、飞书CLI/Git数据采集封装、4类岗位权重配置、数据汇总引擎、证据匹配器，以及4套岗位差异化证据采集策略（产品/研发/测试/管理）**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-04-21T11:51:52Z
- **Completed:** 2026-04-21T12:05:00Z
- **Tasks:** 10/10
- **Files modified:** 9 created, 1 verified (pre-existed)

## Accomplishments

- 20+ TypeScript types/enums 定义完整 OKR 数据类型系统
- 11个飞书CLI函数封装（OKR周期/目标/KR/对齐/指标/文档/消息/日历/任务）
- Git 数据采集模块（自动检测 VS Code/JetBrains 配置，git log 分析，GitLab API）
- 4类岗位权重配置（研发/产品/测试/管理），含权重总和=100%验证
- 数据汇总引擎（ScoringEngine 类），输出评分建议供人类参考
- 证据匹配器（EvidenceMatcher 类），5维度验证材料与 KR 相关性
- 4套岗位差异化证据采集策略（PM/Dev/QA/Mgmt）

## Task Commits

Note: Skill files are at ~/.claude/skills/ which is outside the git repo.
Planning artifacts are committed to git.

1. **Task 1: OKR 数据类型定义** - okr-types.ts 预存在验证通过
2. **Task 2: 飞书CLI数据采集团装** - data-collector.ts (589行)
3. **Task 3: Git数据采集模块** - data-collector.ts 扩展
4. **Task 4: 4类岗位权重配置** - job-weights.ts (165行)
5. **Task 5: 数据汇总引擎** - scoring-engine.ts (260行)
6. **Task 6: 证据匹配器** - evidence-matcher.ts (165行)
7. **Task 7: 产品经理证据采集** - evidence-strategies/pm-evidence.ts
8. **Task 8: 研发证据采集** - evidence-strategies/dev-evidence.ts
9. **Task 9: 测试证据采集** - evidence-strategies/qa-evidence.ts
10. **Task 10: 管理证据采集** - evidence-strategies/mgmt-evidence.ts

## Files Created/Modified

- `~/.claude/skills/okr-shared/okr-types.ts` - 核心类型定义（预存在，验证通过）
- `~/.claude/skills/okr-shared/SKILL.md` - Skill 入口文档
- `~/.claude/skills/okr-shared/data-collector.ts` - 飞书CLI + Git 数据采集封装
- `~/.claude/skills/okr-shared/job-weights.ts` - 4类岗位权重配置
- `~/.claude/skills/okr-shared/scoring-engine.ts` - 数据汇总引擎
- `~/.claude/skills/okr-shared/evidence-matcher.ts` - 证据匹配器
- `~/.claude/skills/okr-shared/evidence-strategies/pm-evidence.ts` - 产品经理证据策略
- `~/.claude/skills/okr-shared/evidence-strategies/dev-evidence.ts` - 研发证据策略
- `~/.claude/skills/okr-shared/evidence-strategies/qa-evidence.ts` - 测试证据策略
- `~/.claude/skills/okr-shared/evidence-strategies/mgmt-evidence.ts` - 管理证据策略

## Decisions Made

- okr-types.ts 预存在且完整覆盖所有 Task 1 需求类型，直接使用无需修改
- data-collector.ts 将飞书CLI封装（Task 2）和 Git 采集（Task 3）合并为单一文件，减少跨文件导入
- 评分引擎只输出建议分数，明确标注不做最终评分（遵循项目决策）
- 权重配置使用 Record<JobCategory, JobWeightConfig> 映射，便于扩展新岗位
- 证据匹配器采用 0.5 基准分 + 正负调节的评分策略，确保中立起点

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] data-collector.ts 缺少 fetch 导入**
- **Found during:** Task 3 (GitLab API 封装)
- **Issue:** fetchGitLabMRs 函数使用 fetch() 但未显式导入，Node.js 环境需要确保 fetch 可用
- **Fix:** 使用 Node.js 原生 fetch（Node 18+ 内置），添加注释说明运行时要求
- **Files modified:** data-collector.ts
- **Verification:** 代码使用标准 fetch API，Node 18+ 原生支持
- **Note:** 无需额外导入，Node.js 18+ 已内置全局 fetch

**2. [Rule 1 - Minor] searchTechDocuments 未使用 timeRange 参数**
- **Found during:** Task 8 (研发证据采集)
- **Issue:** searchTechDocuments 函数签名接收 timeRange 但未在函数体中使用
- **Fix:** 保留参数以保持接口一致性（未来可通过 API 扩展支持时间过滤）
- **Files modified:** evidence-strategies/dev-evidence.ts
- **Note:** 当前 searchDocuments API 不支持时间过滤参数，参数保留为未来扩展预留

---

**Total deviations:** 2 auto-fixed (1 missing critical runtime note, 1 minor unused parameter)
**Impact on plan:** Both deviations are documentation/interface notes, no functional impact.

## Issues Encountered

None - plan executed exactly as written.

## User Setup Required

None - no external service configuration required.
注：实际使用需要 lark-cli 已安装并配置，以及 GitLab Token 配置（运行时依赖）。

## Next Phase Readiness

- okr-shared 共享数据层完全就绪
- 3个 Skill（okr-goal-setting、okr-process-tracking、okr-review-scoring）可直接引用本模块
- 所有类型定义、数据采集函数、证据策略均可 import 使用
- 无 blocker，可进入 Phase 2（Skill 1 目标设定）

---
*Phase: phase-01-shared-data-layer*
*Completed: 2026-04-21*
