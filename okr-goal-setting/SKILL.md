---
name: okr-goal-setting
description: OKR目标设定专家 — 5步工作流辅助用户设定符合SMART原则的OKR目标，检查上下级对齐，给出修改建议
version: 1.0.0
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

1. 用户提供自己的飞书 userID
2. Skill 自动从飞书OKR系统拉取用户历史OKR数据
3. 自动识别用户的岗位类型（研发/产品/测试/管理）
4. 引导用户完成5步工作流

示例：
```
我需要用okr-goal-setting设定本季度OKR
我的userID是: user-123456
```

## 数据来源

| 数据源 | 获取方式 | 用途 |
|--------|----------|------|
| 飞书OKR | `lark-cli okr` | OKR周期/目标/关键结果/对齐关系 |
| 飞书文档 | `lark-cli docs` | 用户自述文档（Step 1背景收集） |

### 历史OKR自动拉取

用户只需提供 userID，Skill 会通过 `lark-cli okr cycle-list --user-id` 自动拉取历史OKR数据，包括：
- 历史周期数和完成状态
- 未完成目标（得分 < 0.7）
- 重复目标（相似标题跨周期出现）
- 目标设定习惯（平均得分趋势：偏容易/偏保守/合理）

若系统返回数据不完整，Skill 会提示用户手动补充。

### 岗位自动识别

用户身份和岗位类型从飞书OKR系统自动识别，无需用户手动选择。Skill 会从 OKR 响应中提取部门/岗位信息，映射到4类岗位权重（研发/产品/测试/管理）。若无法自动判断，会提示用户确认。
