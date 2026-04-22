# Phase 4: Skill 3 评审评分专家 - Context

**Gathered:** 2026-04-22
**Status:** Ready for planning

<domain>
## Phase Boundary

实现 `okr-review-scoring` Skill，提供 6 步工作流辅助期末 OKR 评审评分：

1. 材料收集（用户自述文档、案例链接、达成情况自述）
2. 数据验证（自动采集飞书会议/文档/聊天/Git/任务/人效数据）
3. 证据匹配（验证链接有效性、创建者、时间范围、关键词相关性、数据一致性）
4. 评分计算（难度40% + 努力度40% + 完成度20%，按岗位权重）
5. 自述文档解析（非结构化文档解析，含截图识别）
6. 报告生成（评分结果、证据清单、优势不足、往期对比、下季度建议）

**交付物：**
- `~/.claude/skills/okr-review-scoring/SKILL.md` — Skill 入口
- `~/.claude/skills/okr-review-scoring/workflows/` — 6 步工作流文件
- `~/.claude/skills/okr-review-scoring/templates/review-report-template.md` — 评审报告模板
- `~/.claude/skills/okr-review-scoring/modules/screenshot-parser.ts` — 截图解析模块
- `~/.claude/skills/okr-review-scoring/modules/doc-parser.ts` — 云文档解析模块

依赖 Phase 1 的 `okr-shared` 共享模块（评分引擎、证据匹配器、数据类型定义）。
延续 Phase 2/3 的交互模式（用户主动逐步执行、纯文本+Markdown表格输出）。

</domain>

<decisions>
## Implementation Decisions

### 工作流交互设计
- **D-19:** 延续 Phase 2/3 的交互模式 — 用户主动逐步执行（D-01），纯文本 + Markdown 表格输出（D-02）
- **D-20:** 评审报告由 **LLM 生成 + 用户确认** — 报告生成后预览给用户，确认后才保存为文件

### 评分计算规则
- **D-21:** 难度评分由 **LLM 综合评估** — 基于技术复杂度、资源投入、时间压力、创新性、跨部门协作 5 个维度
- **D-22:** 努力度评分基于 **客观证据** — 证据数量、更新频率、Git 活跃度综合计算
- **D-23:** 完成度直接使用 **KR 最终 score 值** — 来自飞书 OKR 系统（0-1 范围）
- **D-24:** 最终评分 = 难度×40% + 努力度×40% + 完成度×20%，输出分项得分 + 总分

### 证据验证规则
- **D-25:** 证据验证使用 Phase 1 的 `EvidenceMatcher` — 5 维度验证（创建者/时间/关键词/URL/一致性）
- **D-26:** 无法访问的链接标记为"无法验证"，不阻断整个评审流程

### 文档解析规则
- **D-27:** 自述文档解析由 **LLM 语义理解** — 不做硬性规则解析，灵活提取关键信息
- **D-28:** 截图解析使用 **Claude 视觉能力** — 提取截图中的关键证据信息

### 人效数据解析（INTEG-01）
- **D-29:** 人效数据来自 PMO 云文档 — 通过 `lark-cli docs +fetch` 获取，LLM 提取结构化指标

### Claude's Discretion
- 6 步工作流的具体文件命名和组织由 Claude 决定
- 评分 prompt 的具体措辞和难度评估标准由 Claude 设计
- 评审报告模板的具体格式由 Claude 规划

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — 项目核心诉求、设计参数、数据来源
- `.planning/REQUIREMENTS.md` — 需求文档（REVIEW-01 ~ REVIEW-06, INTEG-01 ~ INTEG-02）
- `.planning/ROADMAP.md` — Phase 4 目标和成功标准

### Phase 1 Dependencies
- `~/.claude/skills/okr-shared/okr-types.ts` — OKR 数据类型定义
- `~/.claude/skills/okr-shared/scoring-engine.ts` — 数据汇总引擎（加权评分基础）
- `~/.claude/skills/okr-shared/evidence-matcher.ts` — 证据匹配器（5 维度验证）
- `~/.claude/skills/okr-shared/job-weights.ts` — 4 类岗位权重配置
- `~/.claude/skills/okr-shared/data-collector.ts` — 数据采集函数

### Phase 2/3 Dependencies
- `~/.claude/skills/okr-goal-setting/SKILL.md` — 参考 Skill 结构
- `~/.claude/skills/okr-process-tracking/SKILL.md` — 参考 Skill 结构和交互模式

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `okr-shared/scoring-engine.ts` — ScoringEngine 类，已实现加权评分计算逻辑，可直接扩展
- `okr-shared/evidence-matcher.ts` — EvidenceMatcher 类，已实现 5 维度证据匹配，可直接使用
- `okr-shared/job-weights.ts` — 4 类岗位权重配置，评分计算时按岗位加载
- `okr-shared/data-collector.ts` — 已封装飞书 CLI 和 Git 数据采集函数

### Established Patterns
- CLI Wrapper Pattern: 所有 lark-cli 命令通过统一 `runLarkCommand()` 执行
- Workflow Step Pattern: 每步工作流文件包含 Input → Execution Steps → Output Format → Continue Prompt
- User Confirmation Pattern: 关键操作（消息发送、报告保存）需用户显式确认

### Integration Points
- 评分计算需要扩展 `scoring-engine.ts`，添加难度/努力度/完成度三维评分
- 截图解析需要新的 `screenshot-parser.ts` 模块
- 自述文档解析需要新的 `doc-parser.ts` 模块

</code_context>

<specifics>
## Specific Ideas

- 难度评估 prompt 示例：
  > 请从以下 5 个维度评估此 KR 的难度（每项 1-5 分）：
  > 1. 技术复杂度：是否涉及新技术、架构变更、跨系统集成
  > 2. 资源投入：所需人力、时间、预算
  > 3. 时间压力：交付期限是否紧张
  > 4. 创新性要求：是否需要首创方案、无先例可循
  > 5. 跨部门协作：依赖多少外部团队

- 评审报告输出格式：
  ```
  ## 期末评审报告 - [员工姓名] - [季度名称]

  ### 评分结果
  | 维度 | 得分 | 权重 | 加权分 |
  |------|------|------|--------|
  | 难度 | XX/100 | 40% | XX |
  | 努力度 | XX/100 | 40% | XX |
  | 完成度 | XX/100 | 20% | XX |
  | 总分 | | | XX/100 |

  ### 证据清单
  | 证据类型 | 数量 | 有效性 |
  |----------|------|--------|
  | 文档链接 | N | M/N 可访问 |
  | Git 提交 | N | 相关性 XX% |
  | ... | ... | ... |

  ### 优势与不足
  ...

  ### 往期对比
  ...

  ### 下季度建议
  ...
  ```

</specifics>

<deferred>
## Deferred Ideas

- **完整服务端自动触发评审流程** — Phase 4 只做用户主动触发的评审，完整的定时评审后续再做
- **24 类岗位细粒度权重** — 当前使用 4 类岗位权重，细粒度权重延期至后续阶段
- **往期 OKR 趋势可视化** — 本期只做文字对比，不做可视化图表

</deferred>

---

*Phase: 04-skill-3*
*Context gathered: 2026-04-22*
