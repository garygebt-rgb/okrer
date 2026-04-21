# Phase 3: Skill 2 过程跟进专家 - Context

**Gathered:** 2026-04-21
**Status:** Ready for planning

<domain>
## Phase Boundary

实现 `okr-process-tracking` Skill，提供 5 步工作流辅助双周 OKR 过程跟进：

1. 定时触发（客户端-服务端注册机制，Phase 3 先实现提醒功能）
2. 数据采集（自动查询 OKR 系统，无需用户手动补充）
3. 进展对比（与计划基线对比）
4. 风险识别（LLM 综合判断 🟢/🔴）
5. 辅导建议（生成提醒消息，推送员工+主管）

**交付物：**
- `~/.claude/skills/okr-process-tracking/SKILL.md` — Skill 入口
- `~/.claude/skills/okr-process-tracking/workflows/` — 5 步工作流文件
- `~/.claude/skills/okr-process-tracking/templates/risk-alert-template.md` — 风险提醒模板

依赖 Phase 1 的 `okr-shared` 共享模块（数据采集函数）。
依赖 Phase 2 的交互模式（用户主动逐步执行、纯文本+Markdown表格输出）。

</domain>

<decisions>
## Implementation Decisions

### 架构设计
- **D-09:** 采用**客户端-服务端机制** — 用户安装 Skill 后自动向服务端注册。季度中期每双周由服务端触发跟进任务，推送消息给用户并提醒补充材料。但 **Phase 3 只实现提醒跟进功能**，完整的自动触发服务端后续再做
- **D-10:** 跟进数据**自动查询**，不需要用户手动补充材料 — 系统直接查询 OKR 系统里的完成度、备注记录、每条 KR 的进展记录是否有更新

### 数据采集策略
- **D-11:** 数据来源于 OKR 系统内部数据（完成度、备注、KR 进展记录），而非用户主动提交
- **D-12:** 沿用 Phase 1 的 `lark-cli` 封装采集 OKR 数据，Phase 3 新增查询 KR 进展记录和备注的能力

### 进展对比逻辑
- **D-13:** 与**计划基线**对比 — 检查是否按 OKR 设定时预期的里程碑推进
- **D-14:** 风险识别由 **LLM 综合判断** — 综合完成度变化幅度、备注内容质量等因素，智能判定 🟢（有进展）或 🔴（无进展），不做硬编码阈值

### 提醒消息设计
- **D-15:** 提醒消息**同时推送员工和主管** — 员工收到友好提醒，主管收到进度汇报
- **D-16:** 语气风格由 **Claude 自动判断** — 对员工用友好提醒式语气，对主管用正式汇报式语气
- **D-17:** 提醒频率为**双周 + 智能跳过** — 如果用户在上次提醒后已有更新，跳过本次提醒

### 工作流交互设计
- **D-18:** 延续 Phase 2 的交互模式 — 用户主动逐步执行（D-01），纯文本 + Markdown 表格输出（D-02）

### Claude's Discretion
- 5 步工作流的具体文件命名和组织由 Claude 决定
- LLM 判断 prompt 的具体措辞由 Claude 设计
- 客户端-服务端注册机制的具体实现方式由 Claude 规划（Phase 3 只需预留接口）

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — 项目核心诉求、设计参数、数据来源
- `.planning/REQUIREMENTS.md` — 需求文档（TRACK-01 ~ TRACK-04）
- `.planning/ROADMAP.md` — Phase 3 目标和成功标准

### Phase 1 Dependencies
- `~/.claude/skills/okr-shared/okr-types.ts` — OKR 数据类型定义
- `~/.claude/skills/okr-shared/data-collector.ts` — 数据采集函数
- `~/.claude/skills/okr-shared/job-weights.ts` — 4 类岗位权重配置

### Phase 2 Dependencies
- `~/.claude/skills/okr-goal-setting/SKILL.md` — 参考 Phase 2 的 Skill 结构和交互模式

### Skill Design
- `~/.claude/skills/okr-shared/SKILL.md` — 共享模块入口

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `okr-shared/data-collector.ts` — 已封装 `fetchObjectives()`, `fetchKeyResults()`, `fetchCycles()` 等函数，数据采集可直接调用
- `okr-shared/okr-types.ts` — 已定义 Objective, KeyResult, OKRCycle 类型，进展对比可直接使用

### Established Patterns
- CLI Wrapper Pattern: 所有 lark-cli 命令通过统一 `runLarkCommand()` 执行
- 5 步工作流模式: Phase 2 已建立 step1~step5 的 workflow 文件组织方式
- 用户逐步执行 + 纯文本+Markdown 表格输出模式已在 Phase 2 验证

### Integration Points
- 数据采集需要调用 OKR 系统的 KR 进展记录和备注查询（可能需要扩展 data-collector.ts）
- 提醒消息需要通过飞书消息通道推送（lark-cli 或飞书 API）

</code_context>

<specifics>
## Specific Ideas

- 风险提醒消息示例（员工端）：
  > 你的 OKR 已经两周没更新了。系统检测到「提升系统稳定性」KR 的完成度从 60% 变为 62%，但备注记录无更新。建议花 5 分钟记录近期进展。

- 风险提醒消息示例（主管端）：
  > [员工姓名] 的 OKR 双周跟进：3 个 KR 中 2 个有进展，1 个无进展。详细进度报告如下...

- LLM 判断逻辑：输入两次 KR 状态快照（本次 vs 基线），输出 🟢 或 🔴 + 判断理由

</specifics>

<deferred>
## Deferred Ideas

- **完整服务端自动触发** — Phase 3 只实现提醒功能，完整的定时触发 + 消息推送后续实现
- **外部 cron/云函数方案** — 当前不涉及外部服务部署，后续需要时再考虑

</deferred>

---

*Phase: 03-skill-2*
*Context gathered: 2026-04-21*
