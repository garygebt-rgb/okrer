# Step 1: 触发检查 (Trigger & Auth Check)

**Inputs:** 用户的飞书 userID（可从 `lark-cli auth` 自动检测或用户提供）

## 步骤

### 1. 验证 lark-cli 认证

- 运行 `lark-cli auth status` 检查用户是否已认证
- 如果未认证：引导用户执行 `lark-cli auth login` 完成认证
- 验证所需 scope：`okr:okr.content:readonly`

### 2. 识别当前 OKR 周期

- 运行 `lark-cli okr cycle-list --user-id {userId}` 或通过 data-collector 的 `fetchCycles()` 获取
- 查找第一个 status = "published" 且非 "completed" 的周期
- 如果未找到活跃周期：报告错误并停止
- 记录 cycleId 供后续步骤使用

### 3. 加载现有快照（如有）

- 检查文件：`~/.claude/skills/okr-process-tracking/snapshots/{userId}-{cycleId}.json`
- 如果文件存在：解析为 ProgressSnapshot
- 如果文件不存在：标记为首次运行，snapshot = null

### 4. 智能跳过检查（D-17, Resolved Q3）

- 如果 snapshot 存在 **且** snapshot.lastReminderTimestamp 存在：
  - 获取当前各 KR 的 update_time 值（从 cycle detail 中，每个 KR 都有 update_time 字段）
  - 如果**任意** KR 的 update_time > lastReminderTimestamp：输出"智能跳过：用户在上次提醒后已更新 OKR"并停止工作流
    - 原因（Resolved Q3）：即使分数没变，用户更新了笔记/内容也说明有参与度 — 无需提醒
  - 否则（自上次提醒后无任何 KR 更新）：继续到第 2 步
- 如果 snapshot 为 null（首次运行）：跳过此检查，继续到第 2 步

### 5. 首次运行检测

- 如果无快照存在：输出"首次运行，将建立基线快照" — 本次不生成风险提醒
- 记录 isFirstRun = true，传递给后续步骤

### 6. 用户确认

- 输出当前周期信息（名称、日期范围、目标数量）
- 输出快照状态（首次运行 或 上次提醒日期）
- 询问："是否继续下一步（数据采集）？"

## 输出

- `userId`: string
- `cycleId`: string
- `snapshot`: ProgressSnapshot | null
- `isFirstRun`: boolean
