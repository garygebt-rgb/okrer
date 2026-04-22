# Step 5: 辅导建议 (Coaching Advice & Notifications)

**Inputs:** 风险评估数据（来自 step4）：`[{ keyResultId, riskLevel, reason }]`，userId, cycleId, isFirstRun

## 步骤

### 1. 首次运行检查

- 如果 isFirstRun 为 true：输出"基线已建立。首次运行不发送提醒消息。"并停止。
- 保存初始 ProgressSnapshot（来自 step3），结束。

### 2. 解析主管 ID（D-15, Resolved Q1）

- 读取 `~/.claude/skills/okr-process-tracking/config.json`
- 提取 `managerId` 字段
- 如果 managerId 为空或未配置：
  - 提示用户："主管 ID 未配置。请在 `~/.claude/skills/okr-process-tracking/config.json` 中填入 managerId 字段（主管的飞书 userID），或跳过主管端消息发送。"
  - 如果用户选择跳过：记录警告"主管 ID 未配置，跳过主管端消息发送"，并在输出中明确提示用户：
    > ⚠️ 注意：主管端消息未发送。如需主管收到双周汇报，请在 `~/.claude/skills/okr-process-tracking/config.json` 中配置 managerId。继续仅发送员工端消息。
  - 如果用户填写：保存到 config.json 并继续
- 如果 managerId 已配置：用于主管端消息投递

### 3. 生成员工端消息（友好语气，D-16）

使用 risk-alert-template.md 生成类似以下内容的消息：

```
你好！你的 OKR 已经两周没更新了。系统检测到以下情况：

- 「KR 标题」完成度从 X% 变为 Y% — [有进展/无进展]
- 「KR 标题」完成度从 A% 变为 B% — [有进展/无进展]

建议花 5 分钟记录近期进展。如有任何困难，请及时与主管沟通。
```

### 4. 生成主管端消息（正式语气，D-16）

```
[员工姓名] 的 OKR 双周跟进报告：

周期：{cycle name}
KR 总数：N | 有进展：X | 无进展：Y

详细进度：
- 「KR 标题」：基线 X% → 当前 Y% — [有进展/无进展]，[判断理由]

建议关注无进展的 KR，建议与员工沟通了解情况。
```

### 5. 预览消息（lark-im 安全约束）

向用户展示两条消息：

```
=== 员工端消息（将发送给: {userId}）===
[message text]

=== 主管端消息（将发送给: {managerId}）===
[message text]
```

### 6. 用户确认

- 询问："确认发送以上消息？"
- 如果确认：继续发送
- 如果取消：中止消息发送

### 7. 发送消息（如果已确认）

- 员工端：`lark-cli im +messages-send --user-id {userId} --text '{escapedMessage}' --as bot`
- 主管端（仅当 managerId 已配置时）：`lark-cli im +messages-send --user-id {managerId} --text '{escapedMessage}' --as user`

### 8. 保存更新后的快照

创建新的 ProgressSnapshot，包含：
- `snapshotId`: 生成新的 UUID
- `cycleId`, `userId`: 同之前
- `timestamp`: 当前 ISO 时间戳
- `keyResultScores`: 当前 KR 得分
- `lastReminderTimestamp`: 当前 ISO 时间戳（用于下次智能跳过）

保存到：`~/.claude/skills/okr-process-tracking/snapshots/{userId}-{cycleId}.json`
