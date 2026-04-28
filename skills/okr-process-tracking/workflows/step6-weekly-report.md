# Step 6: 周报生成 (Weekly Report)

**目标：** 围绕每个 O 和 KR 总结本周进展，生成 MD 格式周报并保存到本地快照目录。

**前置条件：** Step 5（辅导建议）已完成

**下一步：** 工作流结束，记录执行日志并发送飞书邮件

## 输入

- Step 2 采集的多渠道数据（OKR系统、群聊、文档、会议、邮件、Git）
- Step 3 的进展对比数据（每个 KR 的 baseline、current、delta、趋势）
- Step 4 的风险识别结果（每个 KR 的 on_track/no_progress + 判断理由）
- Step 5 的辅导建议（员工提醒 + 主管汇报）
- 用户信息（姓名、岗位、周期信息）

## 执行步骤

### 1. 按 O/KR 组织本周进展

对周期中的每个 Objective，整理其下所有 KeyResult 的本周情况：

对于每个 KR：
- 标题和描述
- 基线得分 → 当前得分（变化量、趋势箭头）
- 风险等级（有进展🟢/无进展🔴）
- 判断理由
- 本周相关活动（从多渠道数据中提取与 KR 相关的事件：群聊讨论、文档编辑、会议参与、邮件往来、Git提交）

### 2. 生成周报 MD 内容

使用以下模板结构生成周报：

```markdown
# OKR 周报 — {cycleName}

**用户：** {userName}（{jobCategory}）
**日期范围：** {startDate} ~ {endDate}
**生成时间：** {currentTimestamp}

---

## 总览

| 指标 | 值 |
|------|-----|
| Objective 数量 | {objectiveCount} |
| KeyResult 总数 | {krCount} |
| 有进展 KR | {onTrackCount} 🟢 |
| 无进展 KR | {noProgressCount} 🔴 |

---

## 目标进展详情

### O{序号}: {objectiveTitle}

**本周进展摘要：** {LLM 综合归纳的 O 级别进展，1-2句话}

#### KR{序号}: {krTitle}

| 项目 | 值 |
|------|-----|
| 基线得分 | {baseline}% |
| 当前得分 | {current}% |
| 变化 | {delta} ({trend}) |
| 风险等级 | {riskLevel} |

**本周相关活动：**
- [群聊] {相关讨论摘要}
- [文档] {相关编辑/阅读记录}
- [会议] {相关参会记录}
- [邮件] {相关邮件往来}
- [Git] {相关提交记录}（如有）

**判断理由：** {risk reason}

---

（重复以上结构，覆盖所有 O/KR）

---

## 辅导建议

### 员工提醒
{友好语气的提醒，列出无进展的 KR，建议及时更新}

### 主管汇报
{正式语气的汇报，列出整体情况和需要关注的 KR}

---

*本周报由 okr-process-tracking Skill 自动生成*
```

### 3. 保存周报

保存路径：
```
~/.claude/skills/okr-process-tracking/snapshots/{userId}-{cycleId}/weekly-{YYYY-MM-DD}.md
```

确保目录存在（如不存在则创建）。

### 4. 同步更新 JSON 快照

更新原有的 JSON 快照文件：
```
~/.claude/skills/okr-process-tracking/snapshots/{userId}-{cycleId}.json
```

更新 `lastReminderTimestamp` 为当前时间戳。

### 5. 输出确认

```
## 周报已生成

周报已保存至：
`~/.claude/skills/okr-process-tracking/snapshots/{userId}-{cycleId}/weekly-{YYYY-MM-DD}.md`

内容概览：{objectiveCount} 个目标、{krCount} 个关键结果、{onTrackCount} 个有进展、{noProgressCount} 个无进展。
```

### 6. 执行日志记录

记录本次 Skill 执行日志：
- 用户信息
- 执行时间
- 触发方式（手动/定时）
- 各步骤结果摘要
- 周报文件路径

通过 `okr-shared/log-sender.ts` 发送至 `ITPMO@homeinns.com`。

## 输出

- MD 格式周报文件，保存至快照目录
- 更新后的 JSON 快照
- 执行日志邮件发送至 ITPMO@homeinns.com
