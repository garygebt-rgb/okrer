# Step 1: 收集背景

**目标：** 获取用户身份信息、岗位类型、往期OKR分析数据，为后续SMART验证和对齐检查提供上下文。

**前置条件：** 运行环境检测 + 用户身份识别

**下一步：** Step 2 — SMART验证

## 环境检测

本步骤首先检测运行环境：
- 如果 `process.env.OPENCLAW=1` → 进入 **OpenClaw 路径**（飞书智能伙伴模式）
- 否则 → 进入 **CLI 路径**（Claude Code + lark-cli 模式）

## 输入

- `userID` — 用户的飞书用户ID（CLI 路径必须，OpenClaw 路径不需要）

## CLI 自检（仅 CLI 路径）

在执行数据采集前，`okr-shared/data-collector.ts` 自动执行以下检查：
1. 检查 `lark-cli` 是否已安装
2. 检查授权状态和 token 有效性
3. 检查所需 scope 是否齐全

检查失败时会输出用户友好的引导信息，而非原始错误。

### OpenClaw 路径（飞书智能伙伴）

本步骤在 OpenClaw 环境下不执行代码调用，而是向智能伙伴发出以下指令：
> "请读取我的飞书 OKR 周期列表，返回以下字段：cycle_id, name, start_date, end_date, status。以 JSON 数组格式返回。"

智能伙伴自动识别当前用户身份，返回结果后继续后续步骤。

## 执行步骤

### 1. 获取用户OKR周期列表

调用 `lark-cli okr cycle-list --user-id {userID}` 获取用户的所有OKR周期。

```
执行命令：lark-cli okr cycle-list --user-id "{userID}"
```

**预期输出：** JSON 数组，包含周期ID、名称、起止日期、状态。

**错误处理：**
- 若命令执行失败（返回非JSON或报错），显示：
  > 未能获取OKR周期数据。请确认你的 userID 是否正确，或联系管理员确认你有OKR权限。
- 若返回空数组，显示：
  > 你在飞书OKR系统中暂无任何周期记录。这可能是首次设定OKR，我们将跳过历史分析。

### 2. 识别岗位类型

从 OKR 系统响应中提取用户的部门/岗位信息。根据部门名称映射到4类岗位之一：

| 部门关键词 | 岗位类型 | JobCategory |
|-----------|---------|-------------|
| 研发、开发、后端、前端、架构、运维 | 研发 | `JobCategory.DEV` |
| 产品、PM、产品经理 | 产品 | `JobCategory.PRODUCT` |
| 测试、QA、质量 | 测试 | `JobCategory.QA` |
| 管理、总监、经理、主管、部门负责人 | 管理 | `JobCategory.MANAGEMENT` |

**识别规则：**
1. 优先从 `lark-cli okr cycle-list` 返回的用户信息中提取部门字段
2. 若部门名称包含上述关键词，映射到对应岗位
3. 若无法自动判断，询问用户：
   > 未能自动识别你的岗位类型。请从以下选项中选择：研发 / 产品 / 测试 / 管理

**加载岗位权重：** 识别岗位后，引用 `okr-shared/job-weights.ts` 中的 `getJobWeights()` 函数获取该岗位的权重配置，用于后续展示。

### 3. 获取历史周期详情

对于每个**已完成（completed）或已归档（archived）**的周期，调用 `lark-cli okr cycle-detail --cycle-id {cycleId}` 获取完整的目标数据。

```
执行命令：lark-cli okr cycle-detail --cycle-id "{cycleId}"
```

**注意：** 跳过 `draft` 和 `published` 状态的周期（这些是当前或未来周期，没有历史得分数据）。

### 4. 分析往期OKR模式

基于历史周期数据，计算以下3个维度的分析结果：

#### 4.1 未完成目标（得分 < 0.7）

遍历所有历史目标，筛选 `score < 0.7` 的目标，按周期分组展示：

| 目标标题 | 周期名称 | 最终得分 |
|---------|---------|---------|
| {objective.title} | {cycle.name} | {objective.score} |

#### 4.2 重复目标（跨周期出现）

按目标标题的相似度分组（完全相同或高度相似的标题），统计出现次数：

| 目标标题 | 出现次数 | 涉及周期 |
|---------|---------|---------|
| {title} | {count} | {cycle1}, {cycle2}, ... |

**相似度判断规则：**
- 标题完全相同视为重复
- 标题仅差少量修饰词（如"优化"vs"提升"、"系统"vs"平台"）视为重复
- 由 LLM 判断语义相似度

#### 4.3 目标设定习惯

计算所有历史目标的平均得分：

| 指标 | 值 |
|------|-----|
| 平均得分 | {averageScore} |
| 设定习惯 | {tendency} |

**判定标准：**
- `avg > 0.8` → "目标设定偏容易"（overestimate）— 目标设定较低，容易达成
- `avg < 0.5` → "目标设定偏保守"（underestimate）— 目标设定较高，难以达成
- `0.5 <= avg <= 0.8` → "目标设定合理"（balanced）— 目标设定具有挑战性但可达成

### 5. 汇总展示

输出以下汇总表：

```
## 历史OKR分析报告

| 指标 | 值 |
|------|-----|
| 历史周期数 | {completedCycles.length} |
| 未完成目标数 | {incompleteObjectives.length} |
| 重复目标数 | {repeatedObjectives.length} |
| 平均得分 | {averageScore.toFixed(2)} |
| 设定习惯 | {tendency} |
| 岗位类型 | {jobCategory} |
| 岗位权重 | {jobWeightsSummary} |
```

若有未完成目标，附加展示：

```
### 未完成目标详情

| 目标标题 | 周期名称 | 最终得分 |
|---------|---------|---------|
| ... | ... | ... |
```

若有重复目标，附加展示：

```
### 重复目标提示

以下目标在多个周期中出现，请关注是否真正推动了改进：

| 目标标题 | 出现次数 |
|---------|---------|
| ... | ... |
```

### 6. 数据不完整时的补充提示

若 `lark-cli` 返回的数据不完整或某些步骤失败，显示：

```
### 数据补充提示

未能从飞书系统获取完整数据。请手动补充以下信息：
- [列出缺失的具体项目，如"2025 Q4 周期数据"、"岗位类型确认"]
```

继续进行后续步骤，使用已获取的数据。

## 数据类型引用

本步骤使用以下 `okr-shared` 类型：

- `OKRCycle` — 周期结构（来自 `okr-types.ts`）
- `Objective` — 目标结构（来自 `okr-types.ts`）
- `JobCategory` — 岗位类型枚举（来自 `okr-types.ts`）
- `PreviousOKRAnalysis` — 分析结果结构（来自 `okr-types.ts`）
- `getJobWeights()` — 岗位权重函数（来自 `job-weights.ts`）

## 安全注意

- 仅展示当前 userID 对应的用户数据，不展示其他用户信息（T-02-01）
- `lark-cli` 输出可能为非法 JSON，必须使用 try/catch 包裹解析逻辑（T-02-02）

## 继续提示

> Step 1 完成。你是否继续到 Step 2 (SMART验证)？回复"继续"或提供你要验证的目标。
