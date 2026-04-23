---
name: okr-goal-setting
description: >
  USE when: setting quarterly OKR goals that need SMART validation, alignment
    checks with manager/peers, or modification suggestions before publishing.
  DON'T USE when: OKR goals are already set and you need progress tracking
    (use okr-process-tracking) or end-of-period review scoring (use okr-review-scoring).
version: 1.1.0
---

# OKR Goal Setting — OKR目标设定专家

辅助管理者确保OKR目标设定合理、上下级对齐清晰、符合SMART原则。不计算完整KPI评分，只辅助20%季度任务目标部分的目标设定。

## 适用场景

当用户需要以下帮助时使用本 Skill：

- 设定新一季度的OKR目标，需要验证是否符合SMART原则
- 检查个人目标与直属上级OKR的贡献型对齐
- 识别跨团队/平级OKR的依赖型对齐关系
- 获取往期OKR完成度分析，了解目标设定习惯
- 生成修改建议并确认后再发布

## 5步工作流

| 步骤 | 名称 | 说明 |
|------|------|------|
| Step 1 | 收集背景 | 自动获取用户身份、岗位类型、往期OKR分析（完成度、重复目标、设定习惯） |
| Step 2 | SMART验证 | 5维度检查（Specific/Measurable/Achievable/Relevant/Time-bound），输出"通过/问题/建议" + 具体改写示例 |
| Step 3 | 对齐检查 | 检查直属上级OKR + 平级OKR依赖关系，标注"贡献型"vs"依赖型"对齐 |
| Step 4 | 修改建议 | 综合SMART评分和对齐分析，生成修改建议 |
| Step 5 | 用户确认 | 输出完整SMART评分 + 对齐分析，用户确认后才"发布"（保存/发送） |

## 交互模式

本工作流采用**用户主动逐步执行**模式。每步完成后，Skill 会输出当前步骤的结果并询问：

> "是否继续下一步？"

用户确认后才进入下一步。这样给用户充分的控制权，避免自动化跳过关键决策。

## 输出格式

所有输出均为**纯文本 + Markdown 表格**，可直接在飞书聊天/文档中阅读，不依赖飞书卡片模板。

## 依赖模块

本 Skill 依赖 `okr-shared` 共享模块：

### 类型定义（okr-types.ts）

- `OKRCycle` — OKR周期（包含目标列表）
- `Objective` — OKR目标（标题、描述、权重、得分、关键结果、对齐关系）
- `KeyResult` — 关键结果（标题、描述、权重、得分、指标）
- `Alignment` — 对齐关系（类型、目标OKR、目标负责人）
- `JobCategory` — 岗位类型枚举（研发/产品/测试/管理）
- `SmartDimension` — SMART维度枚举（Specific/Measurable/Achievable/Relevant/Time-bound）
- `PreviousOKRAnalysis` — 往期OKR分析（历史周期、未完成目标、重复目标、设定习惯）

### 数据采集（data-collector.ts）

- `fetchCycles(userId, timeRange?)` — 获取OKR周期列表
- `fetchCycleDetail(cycleId)` — 获取周期详情（包含目标列表）
- `fetchObjectives(objectiveId)` — 获取目标详情
- `fetchAlignments(objectiveId)` — 获取对齐关系
- `fetchKeyResults(keyResultId)` — 获取关键结果

### 岗位权重（job-weights.ts）

- `getJobWeights(category)` — 获取4类岗位权重配置

## 使用方法

1. 用户触发 Skill（Claude Code: 输入技能名；OpenClaw: 从技能面板选择）
2. Skill 自动获取当前用户身份和岗位类型
3. 引导用户完成5步工作流

示例：
```
我需要用okr-goal-setting设定本季度OKR
```

## 数据来源

| 数据源 | 获取方式 | 用途 |
|--------|----------|------|
| 飞书OKR | 平台OKR API | OKR周期/目标/关键结果/对齐关系 |
| 飞书文档 | 平台文档API | 用户自述文档（Step 1背景收集） |

### 平台适配

| 平台 | 用户身份获取 | OKR数据获取 |
|------|-------------|-------------|
| Claude Code | 用户提供 userID + lark-cli | `lark-cli okr` |
| OpenClaw（飞书） | 智能伙伴自动识别当前用户 | 智能伙伴执行（见 `openclaw-lark-instructions.md`） |

### 环境检测

本 Skill 自动检测运行环境：
- 如果 `process.env.OPENCLAW=1` → 使用飞书智能伙伴模式
- 否则 → 使用 Claude Code + lark-cli 模式

在飞书智能伙伴模式下：
- 不需要安装 lark-cli
- 不需要用户提供 userID（智能伙伴自动识别）
- 所有飞书操作通过自然语言指令由智能伙伴完成
- 具体指令格式参考 `okr-shared/openclaw-lark-instructions.md`

### 历史OKR自动拉取

Skill 会自动拉取用户历史OKR数据，包括：
- 历史周期数和完成状态
- 未完成目标（得分 < 0.7）
- 重复目标（相似标题跨周期出现）
- 目标设定习惯（平均得分趋势：偏容易/偏保守/合理）

若系统返回数据不完整，Skill 会提示用户手动补充。

### 岗位自动识别

用户身份和岗位类型从飞书OKR系统自动识别，无需用户手动选择。Skill 会从 OKR 响应中提取部门/岗位信息，映射到4类岗位权重（研发/产品/测试/管理）。若无法自动判断，会提示用户确认。

## 权限要求

使用本 Skill 需要以下飞书权限：

| 权限 | 用途 |
|------|------|
| `okr:okr.period:readonly` | 读取OKR周期列表 |
| `okr:okr.content:readonly` | 读取OKR目标、关键结果、对齐关系 |
| `contact:user.base:readonly` | 获取用户基本信息（岗位识别） |
| `contact:user.employee_id:readonly` | 获取组织架构关系（上级/平级识别） |
