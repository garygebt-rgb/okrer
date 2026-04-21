---
phase: 1
plan: 1
slug: shared-data-layer
wave: 1
---

# Phase 1: 共享数据层 - PLAN

> Phase: 1
> Slug: shared-data-layer
> 目标: 建立 okr-shared 共享模块，为3个Skill提供统一的数据采集、类型定义、岗位权重配置、数据汇总能力，以及岗位差异化证据采集策略

## 需求映射

SHARED-01, SHARED-02, SHARED-03, SHARED-04, SHARED-05, SHARED-06, SHARED-07, SHARED-08, SHARED-09, SHARED-10

## 成功标准

1. `lark-cli okr` 命令封装后能正确获取OKR周期、目标、关键结果、对齐关系数据
2. 4类岗位（研发/产品/测试/管理）权重配置正确加载，权重总和=100%
3. 数据汇总引擎能接收多源数据并输出结构化的汇总报告（含评分建议）
4. 产品经理证据采集能通过飞书CLI搜索PRD文档、会议纪要、项目关键词聊天记录
5. 研发证据采集能通过飞书CLI搜索技术文档+Git代码相关性+迭代表排期任务
6. 测试证据采集能通过飞书CLI搜索测试用例文档、测试结果、Bug提交文档

## 任务分解

### Task 1: OKR数据类型定义 (okr-types.ts)
**type:** code | **dependencies:** none
- 定义 OKRCycle, Objective, KeyResult, Alignment, Indicator 等核心类型
- 定义 JobCategory (研发/产品/测试/管理) 枚举
- 定义 Evidence, EvidenceType, EvidenceSource 类型
- 定义 ScoringBreakdown (难度/努力度/完成度) 类型
- 定义 ProgressSnapshot (进度历史) 类型

### Task 2: 飞书CLI数据采集团装 (data-collector.ts)
**type:** code | **dependencies:** Task 1
- 封装 `lark-cli okr +cycle-list` → `fetchCycles(userId, timeRange)`
- 封装 `lark-cli okr +cycle-detail` → `fetchCycleDetail(cycleId)`
- 封装 `lark-cli okr objectives get` → `fetchObjectives(objectiveId)`
- 封装 `lark-cli okr key_results` → `fetchKeyResults(keyResultId)`
- 封装 `lark-cli okr alignments` → `fetchAlignments(objectiveId)`
- 封装 `lark-cli okr indicators` → `fetchIndicators(keyResultId)`
- 封装 `lark-cli docs +fetch` → `fetchDocument(docToken)`
- 封装 `lark-cli docs +search` → `searchDocuments(query, filters)`
- 封装 `lark-cli wiki nodes list` → `fetchWikiNodes(spaceId, parentNodeToken)`
- 封装 `lark-cli im +messages-search` → `searchMessages(query, userId)`
- 封装 `lark-cli calendar +agenda` → `fetchCalendarAgenda(userId, timeRange)`
- 封装 `lark-cli task +tasks-list` → `fetchTasks(userId, filters)`
- 每个函数返回结构化 TypeScript 对象（匹配 okr-types.ts 定义）

### Task 3: Git数据采集模块 (data-collector.ts 扩展)
**type:** code | **dependencies:** Task 1
- 读取本地IDE git配置（VS Code/.vscode/settings.json, JetBrains .idea/ 等）
- 从IDE配置中提取 GitLab URL、token、用户名
- 如果获取不到，提供交互提示询问用户配置
- 封装 `git log --author=<email>` → `fetchGitCommits(author, repo, timeRange)`
- 封装 GitLab API 获取 PR/MR 列表和详情
- 返回 GitActivity 结构化对象（提交次数、PR数量、代码行数变化等）

### Task 4: 4类岗位权重配置 (job-weights.ts)
**type:** code | **dependencies:** Task 1
- 研发岗位权重：饱和度20%、线上bug30%、SIT bug20%、代码评审30%
- 产品岗位权重：需求交付周期30%、工作量20%、需求完整性30%、初审通过率20%
- 测试岗位权重：缺陷发现率40%、逃逸率60%
- 管理岗位权重：会议决策50%、周报30%、文档20%
- 提供 `getJobWeights(category: JobCategory)` 函数
- 权重总和验证（必须=100%）

### Task 5: 数据汇总引擎 (scoring-engine.ts)
**type:** code | **dependencies:** Task 1, Task 4
- 输入：OKR进度数据 + 人效数据 + 质量数据 + Git活动
- 处理：按岗位权重计算各维度得分
- 输出：ScoringReport（含分项得分、总分建议、证据清单）
- 注意：只输出评分建议，不做最终评分（最终由人类完成）
- 支持历史进度对比（ProgressSnapshot）

### Task 6: 证据匹配器 (evidence-matcher.ts)
**type:** code | **dependencies:** Task 1, Task 2
- 输入：用户提供的材料链接 + KR描述
- 验证：链接可访问性、创建者匹配、时间范围、关键词相关性、数据一致性
- 输出：EvidenceMatchResult（匹配度分数、验证状态、不匹配原因）

### Task 7: 产品经理证据采集策略 (evidence-strategies/pm-evidence.ts)
**type:** code | **dependencies:** Task 2
- 搜索用户创建/参与编辑的文档
- 识别"产品需求文档"或"PRD"标志的文档
- 搜索用户参与的会议纪要文档
- 按项目关键词搜索聊天记录
- 输出：PMEvidence（PRD列表、会议纪要列表、聊天记录摘要）

### Task 8: 研发证据采集策略 (evidence-strategies/dev-evidence.ts)
**type:** code | **dependencies:** Task 2, Task 3
- 搜索技术文档（通过关键词和创建者过滤）
- Git代码相关性分析（提交频率、代码行数、文件类型分布）
- 迭代表排期任务交付情况（通过飞书任务或文档）
- 输出：DevEvidence（技术文档列表、Git活动统计、交付完成率）

### Task 9: 测试证据采集策略 (evidence-strategies/qa-evidence.ts)
**type:** code | **dependencies:** Task 2
- 搜索测试用例会议纪要
- 搜索测试用例文档（关键词：测试用例、Test Case）
- 搜索结果和Bug提交文档
- 输出：QAEvidence（测试用例列表、Bug统计、测试结果）

### Task 10: 管理证据采集策略 (evidence-strategies/mgmt-evidence.ts)
**type:** code | **dependencies:** Task 2
- 搜索会议决策文档（关键词：决策、决议）
- 搜索周报（关键词：周报、Weekly Report）
- 输出：MgmtEvidence（会议决策列表、周报摘要）

## 依赖关系

```
Task 1 (types)
  ├── Task 2 (data-collector) ──┬── Task 5 (scoring-engine)
  │                              ├── Task 6 (evidence-matcher)
  │                              ├── Task 7 (pm-evidence)
  │                              ├── Task 8 (dev-evidence)
  │                              ├── Task 9 (qa-evidence)
  │                              └── Task 10 (mgmt-evidence)
  ├── Task 3 (git-collector) ───┘
  └── Task 4 (job-weights) ──┬── Task 5 (scoring-engine)
```

## 执行顺序

1. Task 1 + Task 4（并行，无依赖）
2. Task 2（依赖 Task 1）
3. Task 3（依赖 Task 1，可与 Task 2 并行）
4. Task 5 + Task 6 + Task 7 + Task 8 + Task 9 + Task 10（可并行，依赖 Task 2）

## 文件结构

```
~/.claude/skills/okr-shared/
├── SKILL.md
├── okr-types.ts
├── data-collector.ts          # Task 2 + Task 3
├── job-weights.ts             # Task 4
├── scoring-engine.ts          # Task 5
├── evidence-matcher.ts        # Task 6
└── evidence-strategies/
    ├── pm-evidence.ts         # Task 7
    ├── dev-evidence.ts        # Task 8
    ├── qa-evidence.ts         # Task 9
    └── mgmt-evidence.ts       # Task 10
```

---
*Created: 2026-04-21*
