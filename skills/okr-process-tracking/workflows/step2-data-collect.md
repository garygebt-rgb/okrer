# Step 2: 多渠道数据采集 (Multi-Channel Data Collection)

**Inputs:** userId, cycleId（来自 step1），周期时间范围

## 说明

此步骤完全自动化。不需要用户手动输入数据。从多个渠道采集与 OKR 相关的本周活动数据。

## 步骤

### 1. 获取周期详情

- 调用 `~/.claude/skills/okr-shared/data-collector.ts` 中的 `fetchCycleDetail(cycleId)`
- 该函数执行 `lark-cli okr cycle-detail --cycle-id {cycleId}`
- 返回 OKRCycle 对象，包含 objectives 数组（每个 objective 包含 keyResults）

### 2. 提取 KR 数据（OKR 系统）

遍历周期中每个 Objective 中的每个 KeyResult，收集以下字段：

- `keyResultId`（KeyResult.keyResultId）
- KR 标题（KeyResult.title）
- 当前得分（KeyResult.score，0-1 范围）
- KR 描述（KeyResult.description）
- KR 更新时间（KeyResult.update_time）— 用于智能跳过检查
- 所属目标标题（Objective.title）— 用于风险评估上下文

### 3. 采集群聊消息

基于本周日期范围，使用 KR 标题/描述中的关键词搜索群聊消息：

```
lark-cli im messages-search --query "{KR关键词}" --user-id "{userId}"
```

- 提取与 KR 相关的讨论记录
- 记录消息时间、发送人、内容摘要
- 按 KR 分类整理

### 4. 采集文档变更

查询本周用户阅读或编辑过的文档：

```
lark-cli docs search --query "{KR关键词}" --owner "{userId}"
```

- 提取文档标题、最后修改时间、变更摘要
- 按 KR 分类整理

### 5. 采集会议/日程记录

获取本周用户参与的会议：

```
lark-cli calendar agenda --user-id "{userId}" --start "{startDate}" --end "{endDate}"
```

- 提取会议标题、时间、参与人
- 基于会议标题/描述判断与 KR 的相关性

### 6. 采集邮件往来

获取本周用户相关的邮件：

```
lark-cli im messages-search --query "{KR相关关键词}" --user-id "{userId}"
```

- 提取邮件主题、发送人、时间
- 按 KR 分类整理

### 7. 采集 Git 提交（如有 Git 配置）

通过 `okr-shared/data-collector.ts` 中的 Git 数据采集：

- 检测本地 IDE Git 配置
- 分析本周内的提交活动
- 统计：提交次数、代码变更行数、文件类型分布
- 按提交消息关键词评估与 KR 的相关性

### 8. 构建多渠道活动映射

创建结构：

```
{
  keyResultId: {
    okrData: { title, score, description, update_time, objectiveTitle },
    chatMessages: [ { time, sender, summary } ],
    documents: [ { title, modifiedAt, changeSummary } ],
    meetings: [ { title, time, participants } ],
    emails: [ { subject, sender, time } ],
    gitCommits: [ { message, date, linesChanged } ]
  }
}
```

### 9. 展示采集的数据

输出 Markdown 表格展示所有 KR 及多渠道数据：

| 所属目标 | 关键结果 | 当前得分 | 群聊 | 文档 | 会议 | 邮件 | Git |
|----------|----------|----------|------|------|------|------|-----|
| {O} | {KR} | {score} | N条 | N篇 | N场 | N封 | N次 |

### 10. 用户确认

- 询问："是否继续下一步（进展对比）？"

## 输出

结构化数据：每个 KR 对应一个对象，包含 OKR 数据 + 多渠道活动记录
