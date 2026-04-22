# Step 3: 进展对比 (Progress Comparison)

**Inputs:** 当前 KR 数据（来自 step2），ProgressSnapshot（来自 step1，可能为 null）

## 步骤

### 1. 首次运行检查

- 如果 snapshot 为 null（来自 step1 的 isFirstRun 标志）：
  - 输出："首次运行，建立基线快照。本次不进行风险识别。"
  - 创建初始快照，包含当前 KR 得分
  - 保存到：`~/.claude/skills/okr-process-tracking/snapshots/{userId}-{cycleId}.json`
  - 跳过 step 4（风险识别）— 直接到 step 5，携带"基线已建立"消息
  - 在此停止工作流

### 2. 得分对比（常规运行）

遍历当前数据中的每个 KR：

- `baseline` = snapshot.keyResultScores[keyResultId] ?? 0（如果 KR 是基线后新增的，视为 0）
- `current` = 当前 KR score
- `delta` = current - baseline
- 记录：`{ keyResultId, title, baseline, current, delta }`

### 3. 构建对比表格

输出 Markdown 表格（遵循 D-18）：

| 关键结果 | 基线得分 | 当前得分 | 变化 | 趋势 |
|----------|----------|----------|------|------|
| {title} | {baseline} | {current} | {delta} | {trend} |

趋势列：
- delta > 0: "上升 ↑"
- delta = 0: "持平 —"
- delta < 0: "下降 ↓"

### 4. 汇总统计

- KR 总数：N
- 上升：X
- 持平：Y
- 下降：Z

### 5. 为 step 4 准备数据

将对比结果（每 KR 的 delta）传递给 step 4，供 LLM 风险评估使用。

### 6. 用户确认

- 询问："是否继续下一步（风险识别）？"

## 输出

数组：`[{ keyResultId, title, baseline, current, delta }]` 每个 KR 一条记录
