# Step 2: 数据采集 (Data Collection)

**Inputs:** userId, cycleId（来自 step1）

## 步骤

### 1. 获取周期详情

- 调用 `~/.claude/skills/okr-shared/data-collector.ts` 中的 `fetchCycleDetail(cycleId)`
- 该函数执行 `lark-cli okr cycle-detail --cycle-id {cycleId}`
- 返回 OKRCycle 对象，包含 objectives 数组（每个 objective 包含 keyResults）

### 2. 提取 KR 数据

遍历周期中每个 Objective 中的每个 KeyResult，收集以下字段：

- `keyResultId`（KeyResult.keyResultId）
- KR 标题（KeyResult.title）
- 当前得分（KeyResult.score，0-1 范围）
- KR 描述（KeyResult.description）
- KR 更新时间（KeyResult.update_time）— 用于智能跳过检查（Resolved Q3）
- 所属目标标题（Objective.title）— 用于风险评估上下文

### 3. 构建当前状态映射

创建映射：`keyResultId → { title, score, description, update_time, objectiveTitle }`

这是"当前状态"，用于 step 3 的对比。

### 4. 展示采集的数据

输出 Markdown 表格展示所有 KR（遵循 D-18 纯文本 + Markdown 表格输出）：

| 所属目标 | 关键结果 | 当前得分 | 描述 |
|----------|----------|----------|------|
| {objectiveTitle} | {title} | {score} | {description} |

### 5. 用户确认

- 询问："是否继续下一步（进展对比）？"

## 说明

此步骤完全自动化（D-10, D-11）。不需要用户手动输入数据。所有数据来自 lark-cli OKR 查询。

## 输出

Map: `keyResultId → { title, score, description, update_time, objectiveTitle }`
