# OKRskill - OKR绩效管理Skill系统

> 创建时间: 2026-04-21
> 来源文档: `/Users/garyge/knowEverythings/KnowEverythings/Spaces/LLM-Wiki/01Inbox/待处理/raw/OKR绩效管理系统设计计划.md`

## What This Is

一套基于Claude Code Skills的OKR目标管理辅助工具，通过3个Skill覆盖OKR全生命周期：目标设定 → 过程跟进 → 期末评审。服务于约150人的技术部门（产品、研发、测试、运维、架构、管理等岗位）。

## Core Value

**辅助管理者确保OKR目标设定合理、过程跟进及时、期末评审有真实数据支撑。** 不计算完整KPI评分，只管理20%季度任务目标部分。

## Context

### 核心诉求（第一性原理）
1. **目标设定教研辅助工具** - 检查OKR是否符合SMART原则，拉齐上下级/平级目标，给出简单建议
2. **过程跟进提醒风险预警工具** - 双周跟进，标记无进展KR，提醒更新，暴露风险
3. **期末材料收集评估工具** - 收集材料链接，核对客观数据，生成评审报告

### 技术前提
- 飞书OKR作为目标跟踪平台
- `lark-cli` 可获取：OKR周期/目标/关键结果/对齐/指标、会议纪要、文档、评论、周报
- Git仓库可读取代码提交记录（先读本地IDE git配置，获取不到再问用户）
- 人效数据表（飞书多维表格+文档）作为辅助，PMO后台录入云文档
- 岗位说明书（24类岗位）作为了解内部协作流程

### 数据来源
| 数据源 | 用途 | 获取方式 |
|--------|------|----------|
| 飞书OKR | 用户OKR、上级OKR、对齐关系 | `lark-cli okr` |
| 用户自述文档 | 期末评审核心输入，非结构化叙述+截图+链接 | `lark-cli docs +fetch` + 截图解析 |
| GitLab | 研发代码提交，分析目标相关性 | 先读本地IDE git配置 |
| 人效数据 | 目标设定评估参考 | PMO录入云文档（每期不同） |
| 质量管理数据 | 质量评分证据 | 飞书知识库 `lark-cli wiki` |

### 已确认设计参数
- 评分体系：技术中心标准 难度40% + 努力度40% + 完成度20%
- OKR占KPI的20%（主观任务部分）
- 岗位权重：4类（研发、产品、测试、管理）
- 风险分级：2级（有进展🟢 / 无进展🔴）
- SMART检查：5维度，输出"通过/问题/建议"格式
- 跟进频率：双周
- 评审周期：季度
- 触发机制：飞书机器人定时推送 + 用户更新OKR后实时触发

### 关键设计决策
1. scoring-engine改为"数据汇总引擎"，提供汇总数据供人类参考评分
2. 飞书机器人定时触发机制（双周推送）需在Phase中包含开发
3. 用户自述文档需要截图解析模块
4. 往期OKR分析保留（历史完成度、重复目标识别）
5. 进度历史存储保留

### 简化后的核心设计
- **Skill 1 (okr-goal-setting)**: 目标设定专家 - 5步（收集背景、SMART验证、对齐检查、修改建议、用户确认）
- **Skill 2 (okr-process-tracking)**: 过程跟进专家 - 5步（数据采集、进展对比、风险识别、提醒生成、辅导建议）+ 定时触发机制
- **Skill 3 (okr-review-scoring)**: 评审评分专家 - 6步（材料收集、数据验证、证据匹配、评分计算、报告生成、用户自述文档解析）

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 保持完整版步骤(5-6步) | 用户确认简化版"3步"不够用 | Skill 1: 5步, Skill 2: 5步, Skill 3: 6步 |
| 保留评分引擎 | 用于汇总数据和生成评分建议（供人类参考） | 改为"数据汇总引擎" |
| 定时自动触发 | 飞书机器人双周推送 | Phase需包含触发机制开发 |
| GitLab先读本地配置 | 避免额外API配置 | 获取不到再问用户 |
| 人效数据云文档 | PMO后台录入，每期不同 | 需要云文档解析规则 |
| 岗位差异化证据采集 | 不同岗位的证据类型和搜索策略完全不同 | 产品看PRD+会议纪要+聊天、研发看技术文档+Git+迭代表、测试看用例+Bug文档、管理看会议决策+周报 |

## Requirements

### Active

- [ ] **SHARED-01**: 共享数据层模块（okr-shared）包含数据采集、类型定义、岗位权重配置、数据汇总引擎
- [ ] **SHARED-02**: 飞书CLI数据采集团包装（OKR周期/目标/关键结果/对齐/指标）
- [ ] **SHARED-03**: Git数据采集模块（本地IDE git配置读取 + GitLab API）
- [ ] **SHARED-04**: 4类岗位权重配置（研发、产品、测试、管理）
- [ ] **SHARED-05**: 数据汇总引擎（scoring-engine，汇总数据供人类参考评分）
- [ ] **SHARED-06**: 证据匹配器（验证材料与KR的相关性）
- [ ] **SHARED-07**: 产品经理证据采集 — PRD文档识别 + 会议纪要 + 项目关键词聊天记录搜索
- [ ] **SHARED-08**: 研发证据采集 — 技术文档 + Git代码相关性 + 迭代表排期任务
- [ ] **SHARED-09**: 测试证据采集 — 测试用例文档 + 测试结果 + Bug提交文档
- [ ] **SHARED-10**: 管理证据采集 — 会议决策文档 + 周报
- [ ] **GOAL-01**: Skill 1 目标设定专家 - 收集背景信息（用户身份、岗位说明书、往期OKR分析）
- [ ] **GOAL-02**: Skill 1 目标设定专家 - SMART验证（5维度，输出通过/问题/建议）
- [ ] **GOAL-03**: Skill 1 目标设定专家 - 对齐检查（贡献型vs依赖型对齐）
- [ ] **GOAL-04**: Skill 1 目标设定专家 - 生成修改建议并用户确认
- [ ] **TRACK-01**: Skill 2 过程跟进专家 - 双周定时触发机制（飞书机器人）
- [ ] **TRACK-02**: Skill 2 过程跟进专家 - 数据采集（飞书活动+Git提交+任务完成）
- [ ] **TRACK-03**: Skill 2 过程跟进专家 - 进展对比与风险识别（2级风险：有进展/无进展）
- [ ] **TRACK-04**: Skill 2 过程跟进专家 - 提醒生成与辅导建议
- [ ] **REVIEW-01**: Skill 3 评审评分专家 - 材料收集（用户自述文档+飞书OKR系统数据）
- [ ] **REVIEW-02**: Skill 3 评审评分专家 - 数据验证（飞书会议/文档/聊天/Git/任务/人效）
- [ ] **REVIEW-03**: Skill 3 评审评分专家 - 证据匹配与验证（链接有效性、创建者、时间、相关性）
- [ ] **REVIEW-04**: Skill 3 评审评分专家 - 评分计算（难度40%+努力度40%+完成度20%）
- [ ] **REVIEW-05**: Skill 3 评审评分专家 - 用户自述文档解析（含截图解析）
- [ ] **REVIEW-06**: Skill 3 评审评分专家 - 评审报告生成（评分结果、证据清单、优势不足、建议）
- [ ] **INTEG-01**: 人效数据云文档解析模块（PMO录入文档解析）
- [ ] **INTEG-02**: 截图解析模块（用户自述文档中的截图内容提取）
- [ ] **INTEG-03**: 集成测试与迭代（3个Skill端到端流程验证）

### Out of Scope

- **完整KPI评分计算** — OKR Skill只管理20%主观任务，不计算60%客观人效+质量分数
- **价值观评分** — 由人类主管直接评分，不需要Skill支持
- **24类岗位证据差异化阈值** — 简化为4类岗位，不再细化
- **Git邮箱映射配置** — 改为先读本地IDE git配置

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-21 after initialization*
