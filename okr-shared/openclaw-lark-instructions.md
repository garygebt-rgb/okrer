# 飞书智能伙伴 OKR 操作指令

> 本文档定义了当 OKR Skills 运行在飞书智能伙伴（OpenClaw/小龙虾）环境时，
> 如何通过自然语言指令让智能伙伴代为执行飞书操作。
>
> **适用环境**：`process.env.OPENCLAW=1` 或工作目录包含 `~/.openclaw/`

---

## 环境标识

当检测到运行环境为飞书智能伙伴时，OKR Skills 不执行 `lark-cli` 命令，
而是向智能伙伴发出自然语言指令，等待返回结果后继续工作流。

## 用户身份

**OpenClaw 环境下，不需要用户提供 userID。**
智能伙伴自动识别当前正在对话的用户身份。
所有涉及用户 ID 的操作，直接使用"我"或"当前用户"即可。

---

## 操作指令映射

### 1. OKR 周期列表

**用途：** 获取用户的所有 OKR 周期（Skill 1/2/3）

**指令：**
```
请读取我的飞书 OKR 周期列表，返回以下字段：cycle_id, name, start_date, end_date, status。
以 JSON 数组格式返回。
```

**预期输出：** JSON 数组

### 2. OKR 周期详情

**用途：** 获取指定周期的完整目标和关键结果数据（Skill 1/2/3）

**指令：**
```
请读取我 OKR 周期 {cycleId} 的详细信息，包括所有目标和关键结果。
返回以下字段：cycle_id, name, start_date, end_date, status,
以及每个 objective 的 objective_id, title, description, weight, level, score,
以及每个 key_result 的 key_result_id, title, description, weight, score。
以 JSON 格式返回。
```

### 3. OKR 目标详情

**用途：** 获取单个目标详情（Skill 1 对齐检查）

**指令：**
```
请读取 OKR 目标 {objectiveId} 的详细信息。
返回 objective_id, title, description, weight, level, score。
以 JSON 格式返回。
```

### 4. OKR 关键结果

**用途：** 获取单个关键结果详情（Skill 2 进展对比）

**指令：**
```
请读取 OKR 关键结果 {keyResultId} 的详细信息。
返回 key_result_id, title, description, weight, score。
以 JSON 格式返回。
```

### 5. OKR 对齐关系

**用途：** 获取目标的上下级对齐关系（Skill 1 对齐检查）

**指令：**
```
请读取 OKR 目标 {objectiveId} 的对齐关系。
返回 alignment_id, type, target_objective_id, target_objective_title, target_owner_name。
以 JSON 数组格式返回。
```

### 6. OKR 指标数据

**用途：** 获取关键结果的指标数据（Skill 1/2/3）

**指令：**
```
请读取 OKR 关键结果 {keyResultId} 的指标数据。
返回 indicator_id, name, start_value, current_value, target_value, unit。
以 JSON 数组格式返回。
```

### 7. 飞书文档搜索

**用途：** 搜索技术文档/PRD/会议纪要等（Skill 1/3 证据采集）

**指令：**
```
请在飞书中搜索包含 "{query}" 的文档，返回以下字段：token, title, url, owner。
以 JSON 数组格式返回。
```

**可选过滤：**
```
请在飞书中搜索包含 "{query}" 的文档，所有者是 {ownerId}。
返回 token, title, url, owner。以 JSON 数组格式返回。
```

### 8. 飞书文档内容读取

**用途：** 读取文档内容（Skill 3 自述文档解析）

**指令：**
```
请读取飞书文档 {docToken} 的完整内容，以纯文本格式返回。
```

### 9. 飞书 Wiki 节点列表

**用途：** 获取知识库质量数据（Skill 3 质量管理）

**指令：**
```
请获取飞书知识库空间 {spaceId} 的节点列表。
返回 node_token, title, url。以 JSON 数组格式返回。
```

### 10. 飞书消息搜索

**用途：** 搜索项目关键词聊天记录（Skill 2 证据采集）

**指令：**
```
请在飞书中搜索包含 "{query}" 的消息。
返回 message_id, content, sender, timestamp。以 JSON 数组格式返回。
```

### 11. 飞书日历日程

**用途：** 查询用户日程安排（Skill 1/2 背景采集）

**指令：**
```
请查询我的日程安排，时间范围 {startDate} 至 {endDate}。
返回 title, start_time, end_time。以 JSON 数组格式返回。
```

### 12. 飞书任务列表

**用途：** 获取任务完成情况（Skill 2/3 交付验证）

**指令：**
```
请获取我的飞书任务列表。
返回 task_id, title, status, due_date。以 JSON 数组格式返回。
```

---

## 错误处理

如果智能伙伴返回错误或无法获取数据：
- OKR 数据不可用 → 提示用户确认 userID 和权限
- 文档不可用 → 提示用户提供正确的文档链接
- Wiki 不可用 → 提示用户配置知识库或提供文档链接
- 消息不可用 → 继续后续步骤，标注"消息数据不可用"
