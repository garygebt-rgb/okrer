# Phase 2: Skill 1 目标设定专家 - Context

**Gathered:** 2026-04-21
**Status:** Ready for planning

<domain>
## Phase Boundary

实现 `okr-goal-setting` Skill，提供 5 步工作流辅助用户设定符合 SMART 原则的 OKR 目标：

1. 收集背景（用户身份、岗位、往期 OKR 分析）
2. SMART 验证（5 维度检查）
3. 对齐检查（上级 + 平级）
4. 修改建议
5. 用户确认

**交付物：**
- `~/.claude/skills/okr-goal-setting/SKILL.md` — Skill 入口
- `~/.claude/skills/okr-goal-setting/workflows/` — 5 步工作流文件
- `~/.claude/skills/okr-goal-setting/templates/smart-checklist.md` — SMART 检查清单

依赖 Phase 1 的 `okr-shared` 共享模块（类型定义、数据采集函数）。

</domain>

<decisions>
## Implementation Decisions

### 工作流交互设计
- **D-01:** 5 步工作流采用**用户主动逐步执行**模式 — 每步完成后 Skill 询问是否继续，用户确认后再进入下一步。给用户充分控制权，避免自动化跳过关键决策
- **D-02:** 所有步骤输出格式为**纯文本 + Markdown 表格** — 在飞书聊天/文档中直接可读，不依赖飞书卡片模板

### 数据获取策略
- **D-03:** 往期 OKR 通过 `lark-cli` **自动拉取** — 用户只需提供 userID，自动获取历史完成度、重复目标识别、设定习惯分析。若拉取不到或数据不全，提示用户手动补充
- **D-04:** 用户身份和岗位信息**从飞书 OKR 系统自动识别** — 不要求用户手动选择岗位，lark-cli 能从 OKR 系统中获取岗位/部门信息，自动匹配 4 类岗位权重（研发/产品/测试/管理）

### SMART 验证规则
- **D-05:** SMART 5 个维度由 **LLM 智能判断** — 利用 LLM 的理解力分析 Specific/Measurable/Achievable/Relevant/Time-bound，不做硬编码规则检查。需通过 prompt 设计确保判断一致性
- **D-06:** 每个维度输出**详细分析 + 具体改写示例** — 不只是"通过/问题/建议"标签，还要输出当前状态描述、问题原因、1-2 个改写后的目标示例。员工能看懂

### 对齐检查范围
- **D-07:** 对齐检查覆盖**直属上级 OKR + 平级 OKR 依赖关系** — 不只检查上级贡献，还识别跨团队/平级依赖
- **D-08:** 输出中**明确标注**「贡献型」vs「依赖型」两种对齐类型：
  - 贡献型：你的目标 X 有助于上级目标 Y 达成
  - 依赖型：你的目标 X 需要上级/平级 Z 完成后才能达成
  - 每种类型给出具体追问建议

### Claude's Discretion
- SMART 检查 prompt 的具体措辞和格式由 Claude 在规划阶段设计
- 工作流文件的具体结构（step1~step5 的命名和组织）由 Claude 决定

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — 项目核心诉求、设计参数、数据来源
- `.planning/REQUIREMENTS.md` — 需求文档（GOAL-01 ~ GOAL-04）
- `.planning/ROADMAP.md` — Phase 2 目标和成功标准

### Phase 1 Dependencies
- `~/.claude/skills/okr-shared/okr-types.ts` — OKR 数据类型定义（Objective, KeyResult 等）
- `~/.claude/skills/okr-shared/data-collector.ts` — 数据采集函数（fetchObjectives, fetchKeyResults, fetchAlignments 等）
- `~/.claude/skills/okr-shared/job-weights.ts` — 4 类岗位权重配置

### Skill Design
- `~/.claude/skills/okr-shared/SKILL.md` — 共享模块入口，了解已有能力

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `okr-shared/okr-types.ts` — 已定义 OKRCycle, Objective, KeyResult, Alignment 类型，可直接 import 使用
- `okr-shared/data-collector.ts` — 已封装 `fetchObjectives()`, `fetchKeyResults()`, `fetchAlignments()` 函数，Step 1 背景收集可直接调用
- `okr-shared/job-weights.ts` — 已定义 4 类岗位权重和 `getJobWeights()` 函数，Step 1 岗位识别后可加载

### Established Patterns
- CLI Wrapper Pattern: 所有 lark-cli 命令通过统一 `runLarkCommand()` 执行，返回结构化 TypeScript 对象
- 所有 Skill 文件位于 `~/.claude/skills/` 目录

### Integration Points
- Step 1 需要调用 `okr-shared/data-collector.ts` 中的 OKR 数据获取函数
- Step 2 SMART 验证需要引用 `okr-shared/okr-types.ts` 中的 Objective/KeyResult 类型
- Step 3 对齐检查需要调用 `fetchAlignments()` 获取上级 OKR 数据

</code_context>

<specifics>
## Specific Ideas

- SMART 验证的输出示例格式（Measurable 维度）：
  > **Measurable — 问题**
  > 「提升系统稳定性」无法量化。建议改为「SLO 达到 99.9%」或「月度 P0 故障 ≤ 1 次」

- 对齐检查的输出示例：
  > **贡献型对齐**：你的目标「优化 CI/CD 流程」有助于上级目标「提升研发效率」达成
  > **依赖型对齐**：你的目标「完成新版 API 上线」需要平级团队「前端重构」完成后才能对接

- 用户确认步骤：输出完整的 SMART 评分 + 对齐分析结果，用户确认后才"发布"（保存/发送）

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-skill-1*
*Context gathered: 2026-04-21*
