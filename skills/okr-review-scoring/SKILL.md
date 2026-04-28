---
name: okr-review-scoring
description: OKR期末评审评分专家 — 6步工作流实现期末OKR评审评分，解析用户自述文档，验证证据，计算评分，生成评审报告
version: 1.0.0
---

# OKR Review Scoring — OKR期末评审评分专家

实现期末OKR评审评分，解析用户自述文档（含截图），验证证据，计算评分，生成评审报告。不计算完整KPI评分，只提供评分建议供人类参考。

## 适用场景

当用户需要以下帮助时使用本 Skill：

- 期末评审OKR完成情况，收集用户自述文档和案例链接
- 自动化采集飞书会议/文档/聊天/Git/任务/人效数据进行验证
- 验证证据链接有效性（可访问性、创建者、时间范围、关键词相关性）
- 计算评分：难度40% + 努力度40% + 完成度20%，按岗位权重
- 解析用户自述文档中的非结构化内容（文字、表格、截图、OKR卡片）
- 生成评审报告：评分结果、证据清单、优势不足、往期对比、下季度建议

## 使用方法

### 启动命令

用户通过以下任一方式启动：
- `init`（进入初始化流程）
- 直接触发 okr-review-scoring Skill

### 7步工作流

| 步骤 | 名称 | 说明 | 工作流文件 |
|------|------|------|------|
| Step 0 | 初始化 | 验证认证，识别身份，获取OKR目标，读取Skill2周报快照 | `workflows/step0-init.md` |
| Step 1 | 材料收集 | 获取用户自述文档 + Skill2每周进度快照MD文件 | `workflows/step1-material-collect.md` |
| Step 2 | 数据验证 | 自动采集飞书会议/文档/聊天/Git/任务/人效数据 | `workflows/step2-data-validate.md` |
| Step 3 | 证据匹配 | 验证链接可访问性、创建者、时间范围、关键词相关性、数据一致性 | `workflows/step3-evidence-match.md` |
| Step 4 | 评分计算 | 应用难度40%+努力度40%+完成度20%公式，按岗位权重计算 | `workflows/step4-score-calc.md` |
| Step 5 | 自述文档解析 | 深度解析非结构化文档，截图识别，叙事与证据对比分析 | `workflows/step5-doc-parse.md` |
| Step 6 | 报告生成 | 输出评分结果、材料支撑清单、优势与不足、往期对比、下季度建议 | `workflows/step6-report-gen.md` |

## 交互模式

本工作流采用**用户主动逐步执行**模式。每步完成后，Skill 会输出当前步骤的结果并询问：

> "是否继续下一步？"

用户确认后才进入下一步。这样给用户充分的控制权，避免自动化跳过关键决策。

## 输出格式

所有输出均为**纯文本 + Markdown 表格**，可直接在飞书聊天/文档中阅读，不依赖飞书卡片模板。

评审报告保存至 `~/.claude/skills/okr-review-scoring/reports/` 目录。

## 依赖模块

本 Skill 依赖 `okr-shared` 共享模块：

### 类型定义（okr-types.ts）

- `OKRCycle` — OKR周期（包含目标列表）
- `Objective` — OKR目标（标题、描述、权重、得分、关键结果、对齐关系）
- `KeyResult` — 关键结果（标题、描述、权重、得分、指标）
- `JobCategory` — 岗位类型（研发/产品/测试/管理）
- `ScoringBreakdown` — 评分分解（难度/努力度/完成度）
- `EvidenceMatchResult` — 证据匹配结果

### 数据采集（data-collector.ts）

- `fetchCycles(userId, timeRange?)` — 获取OKR周期列表
- `fetchCycleDetail(cycleId)` — 获取周期详情（包含目标列表）
- `detectGitConfig()` — 检测本地IDE Git配置
- `analyzeGitActivity(author, repo, timeRange)` — 分析Git提交活动

### 评分引擎（scoring-engine.ts）

- `ScoringEngine` — 加权评分计算引擎

### 证据匹配器（evidence-matcher.ts）

- `EvidenceMatcher` — 5维度证据匹配（创建者/时间/关键词/URL/一致性）

### 岗位权重（job-weights.ts）

- 4类岗位权重配置（研发/产品/测试/管理）

## 使用方法

1. 用户提供自述文档链接（飞书文档）
2. Skill 自动验证认证状态，识别当前评审周期
3. 引导用户完成6步工作流

示例：
```
我需要对本期OKR进行期末评审
我的自述文档链接: https://xxx.feishu.cn/docx/xxxxx
```

## 数据来源

| 数据源 | 获取方式 | 用途 |
|--------|----------|------|
| 飞书OKR | `lark-cli okr` | OKR周期/目标/关键结果/进度数据 |
| 用户自述文档 | `lark-cli docs +fetch` | 自述内容解析、截图提取、证据链接识别 |
| Git | `okr-shared/data-collector.ts` | 代码提交记录、KR相关性分析 |
| 人效数据 | `lark-cli docs +fetch` | PMO录入的云文档解析 |
| 质量管理 | `lark-cli wiki` | 飞书知识库质量数据 |

## 评分体系

| 维度 | 权重 | 评估方式 |
|------|------|----------|
| 难度 | 40% | LLM综合评估（技术复杂度/资源投入/时间压力/创新性/跨部门协作） |
| 努力度 | 40% | 客观证据（证据数量/更新频率/Git活跃度） |
| 完成度 | 20% | 飞书OKR系统KR最终score值（0-1范围） |

**总分 = 难度×40% + 努力度×40% + 完成度×20%**

> **重要**: 所有评分均为**建议评分**，最终评分由人类评审决定。

## 范围说明

Phase 4 仅实现用户主动触发的评审流程。完整的定时自动评审服务端机制后续实现。

## 评审报告模板

评审报告使用 `~/.claude/skills/okr-review-scoring/templates/review-report-template.md` 模板，包含评分结果、证据清单、优势不足、往期对比、下季度建议。

## 执行日志邮件

本 Skill 执行完成后，自动记录执行日志并发送至 `ITPMO@homeinns.com`。

日志内容包括：
- 谁执行了技能（用户姓名、userID）
- 执行时间
- 各步骤执行结果（材料收集、数据验证、证据匹配、评分结果、报告文件路径）

日志模块位于 `okr-shared/log-sender.ts`。
