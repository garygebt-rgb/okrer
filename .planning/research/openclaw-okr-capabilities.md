# 飞书智能伙伴(OpenClaw/小龙虾) OKR能力研究报告

> 研究日期: 2026-04-27
> 目的: 评估 OKR Skills 如何适配飞书智能伙伴环境

---

## 1. 工具调用机制

### 1.1 智能伙伴的两种数据获取方式

飞书智能伙伴（小龙虾/OpenClaw）支持两种方式获取飞书数据：

| 方式 | 描述 | 适用场景 |
|------|------|----------|
| **自然语言指令** | LLM 直接理解自然语言，调用飞书内置能力 | 简单操作（读取OKR、搜索文档） |
| **Function Calling** | 开发者定义工具，LLM 按结构化参数调用 | 复杂操作（多参数、多步骤流程） |

### 1.2 自然语言指令模式（已验证）

根据项目 `okr-shared/openclaw-lark-instructions.md` 的设计，智能伙伴可以直接理解自然语言指令执行飞书操作：

**示例：读取用户OKR周期列表**
```
请读取我的飞书 OKR 周期列表，返回以下字段：cycle_id, name, start_date, end_date, status。
以 JSON 数组格式返回。
```

**示例：读取指定周期详情**
```
请读取我 OKR 周期 {cycleId} 的详细信息，包括所有目标和关键结果。
返回以下字段：cycle_id, name, start_date, end_date, status,
以及每个 objective 的 objective_id, title, description, weight, level, score,
以及每个 key_result 的 key_result_id, title, description, weight, score。
以 JSON 格式返回。
```

**示例：读取对齐关系（上级OKR）**
```
请读取 OKR 目标 {objectiveId} 的对齐关系。
返回 alignment_id, type, target_objective_id, target_objective_title, target_owner_name。
以 JSON 数组格式返回。
```

### 1.3 Function Calling 模式（推测）

飞书智能伙伴支持 Function Calling 机制，开发者可以定义结构化工具：

```json
{
  "tools": [
    {
      "name": "get_okr_cycles",
      "description": "获取用户的飞书OKR周期列表",
      "parameters": {
        "type": "object",
        "properties": {
          "user_id": {
            "type": "string",
            "description": "用户ID，默认为当前用户"
          },
          "status": {
            "type": "string",
            "enum": ["active", "completed", "all"],
            "description": "周期状态过滤"
          }
        },
        "required": []
      }
    },
    {
      "name": "get_okr_objective",
      "description": "获取单个OKR目标的详细信息",
      "parameters": {
        "type": "object",
        "properties": {
          "objective_id": {
            "type": "string",
            "description": "OKR目标ID"
          }
        },
        "required": ["objective_id"]
      }
    },
    {
      "name": "get_okr_alignments",
      "description": "获取OKR目标的对齐关系，包括上级和平级",
      "parameters": {
        "type": "object",
        "properties": {
          "objective_id": {
            "type": "string",
            "description": "OKR目标ID"
          },
          "alignment_type": {
            "type": "string",
            "enum": ["parent", "child", "peer", "all"],
            "description": "对齐类型过滤"
          }
        },
        "required": ["objective_id"]
      }
    }
  ]
}
```

### 1.4 用户身份自动识别

**关键优势**：在 OpenClaw 环境中，LLM 可以直接获取当前对话用户的身份信息：

| 信息 | 获取方式 | 用途 |
|------|----------|------|
| 用户 openid | 智能伙伴自动识别 | 无需用户手动提供 |
| 用户姓名 | 智能伙伴自动识别 | 显示友好称呼 |
| 用户部门 | 智能伙伴自动识别 | 岗位类型判断 |
| 主管 openid | 通过组织架构API | 对齐检查、消息发送 |
| 平级同事 | 通过组织架构API | 依赖型对齐检查 |

**实际使用示例**：
```
请读取我的 OKR 周期列表...    → 智能伙伴知道"我"是谁
请读取我主管的 OKR 目标...    → 智能伙伴知道"我主管"是谁
请搜索 @张三 的 OKR...         → 智能伙伴识别"张三"的用户ID
```

---

## 2. 权限声明格式

### 2.1 SKILL.md Frontmatter 格式

根据飞书开放平台的技能开发规范，权限声明在 SKILL.md 的 frontmatter 中：

```yaml
---
name: okr-goal-setting
description: >
  USE when: setting quarterly OKR goals that need SMART validation, alignment
    checks with manager/peers, or modification suggestions before publishing.
  DON'T USE when: OKR goals are already set and you need progress tracking
    (use okr-process-tracking) or end-of-period review scoring (use okr-review-scoring).
version: 1.1.0
permissions:
  - okr:okr.period:readonly
  - okr:okr.content:readonly
  - contact:user.base:readonly
  - contact:user.employee_id:readonly
---
```

### 2.2 OKR 相关权限列表

| 权限 Scope | 描述 | 使用场景 |
|------------|------|----------|
| `okr:okr.period:readonly` | 读取 OKR 周期列表 | Skill 1/2/3 周期获取 |
| `okr:okr.content:readonly` | 读取 OKR 目标、关键结果、对齐关系 | Skill 1 SMART验证、对齐检查 |
| `okr:okr.progress:readonly` | 读取 OKR 进度数据 | Skill 2 进展对比 |
| `okr:okr.indicator:readonly` | 读取 OKR 量化指标 | Skill 1/3 指标验证 |
| `contact:user.base:readonly` | 获取用户基本信息（姓名、部门） | Skill 1/2/3 用户识别 |
| `contact:user.employee_id:readonly` | 获取组织架构关系（上级/平级） | Skill 1 对齐检查 |
| `docs:doc:readonly` | 读取飞书文档内容 | Skill 3 自述文档解析 |
| `docs:doc.search` | 搜索飞书文档 | Skill 1/3 证据搜索 |
| `wiki:wiki:readonly` | 读取知识库内容 | Skill 3 质量数据 |
| `im:message` | 发送飞书消息 | Skill 2 提醒推送 |

### 2.3 各 Skill 所需权限汇总

#### Skill 1: okr-goal-setting (目标设定)

```yaml
permissions:
  - okr:okr.period:readonly        # 周期列表
  - okr:okr.content:readonly       # 目标/KR/对齐关系
  - contact:user.base:readonly     # 用户信息
  - contact:user.employee_id:readonly  # 组织架构（上级/平级）
```

#### Skill 2: okr-process-tracking (过程跟进)

```yaml
permissions:
  - okr:okr.period:readonly        # 周期列表
  - okr:okr.content:readonly       # 目标/KR内容
  - okr:okr.progress:readonly      # 进度数据
  - contact:user.base:readonly     # 用户信息
  - im:message                     # 提醒消息发送（可选）
```

#### Skill 3: okr-review-scoring (评审评分)

```yaml
permissions:
  - okr:okr.period:readonly        # 周期列表
  - okr:okr.content:readonly       # 目标/KR内容
  - okr:okr.progress:readonly      # 进度数据
  - okr:okr.indicator:readonly     # 量化指标
  - docs:doc:readonly              # 自述文档读取
  - docs:doc.search                # 文档搜索
  - wiki:wiki:readonly             # 知识库数据
  - contact:user.base:readonly     # 用户信息
```

---

## 3. 命令格式

### 3.1 自然语言指令格式

飞书智能伙伴可以直接理解自然语言指令。以下是项目中已设计的指令格式：

#### OKR 周期操作

| 操作 | 指令模板 |
|------|----------|
| 周期列表 | `请读取我的飞书 OKR 周期列表，返回 cycle_id, name, start_date, end_date, status。以 JSON 数组格式返回。` |
| 周期详情 | `请读取我 OKR 周期 {cycleId} 的详细信息，包括所有目标和关键结果。以 JSON 格式返回。` |
| 目标详情 | `请读取 OKR 目标 {objectiveId} 的详细信息。返回 objective_id, title, description, weight, level, score。以 JSON 格式返回。` |
| KR详情 | `请读取 OKR 关键结果 {keyResultId} 的详细信息。返回 key_result_id, title, description, weight, score。以 JSON 格式返回。` |
| 对齐关系 | `请读取 OKR 目标 {objectiveId} 的对齐关系。返回 alignment_id, type, target_objective_id, target_objective_title, target_owner_name。以 JSON 数组格式返回。` |
| 指标数据 | `请读取 OKR 关键结果 {keyResultId} 的指标数据。返回 indicator_id, name, start_value, current_value, target_value, unit。以 JSON 数组格式返回。` |

#### 飞书文档操作

| 操作 | 指令模板 |
|------|----------|
| 文档搜索 | `请在飞书中搜索包含 "{query}" 的文档，返回 token, title, url, owner。以 JSON 数组格式返回。` |
| 文档搜索（按所有者） | `请在飞书中搜索包含 "{query}" 的文档，所有者是 {ownerId}。返回 token, title, url, owner。以 JSON 数组格式返回。` |
| 文档读取 | `请读取飞书文档 {docToken} 的完整内容，以纯文本格式返回。` |
| Wiki节点 | `请获取飞书知识库空间 {spaceId} 的节点列表。返回 node_token, title, url。以 JSON 数组格式返回。` |

#### 飞书消息操作

| 操作 | 指令模板 |
|------|----------|
| 消息搜索 | `请在飞书中搜索包含 "{query}" 的消息。返回 message_id, content, sender, timestamp。以 JSON 数组格式返回。` |
| 日程查询 | `请查询我的日程安排，时间范围 {startDate} 至 {endDate}。返回 title, start_time, end_time。以 JSON 数组格式返回。` |
| 任务列表 | `请获取我的飞书任务列表。返回 task_id, title, status, due_date。以 JSON 数组格式返回。` |

### 3.2 特殊用户识别指令

| 场景 | 指令模板 |
|------|----------|
| 当前用户 | `请读取 **我的** OKR 周期列表...` |
| 上级OKR | `请读取 **我主管的** OKR 目标...` 或 `请读取 **我的上级的** OKR...` |
| 平级OKR | `请读取 **张三的** OKR 目标...` 或 `请搜索 **@李四** 的 OKR...` |
| at我的OKR | `请搜索 **@我的** OKR 目标...` 或 `请搜索 **提及我的** OKR...` |

### 3.3 JSON 响应格式约定

为确保 LLM 能正确解析返回数据，建议统一使用以下 JSON 格式：

**周期列表响应**：
```json
[
  {
    "cycle_id": "cycle-2026-q1",
    "name": "2026年Q1",
    "start_date": "2026-01-01",
    "end_date": "2026-03-31",
    "status": "active"
  }
]
```

**目标详情响应**：
```json
{
  "objective_id": "obj-123",
  "title": "提升系统稳定性",
  "description": "降低系统故障率...",
  "weight": 0.3,
  "level": "company",
  "score": 0.7,
  "key_results": [
    {
      "key_result_id": "kr-456",
      "title": "SLA达到99.9%",
      "description": "季度SLA目标",
      "weight": 0.5,
      "score": 0.8
    }
  ]
}
```

**对齐关系响应**：
```json
[
  {
    "alignment_id": "align-789",
    "type": "parent",
    "target_objective_id": "obj-parent-001",
    "target_objective_title": "部门技术升级",
    "target_owner_name": "王经理"
  }
]
```

---

## 4. 飞书OKR API端点参考

### 4.1 推测的API端点结构

基于飞书开放平台的命名规范，OKR API 可能遵循以下结构：

| API 路径 | 功能 | 权限 |
|----------|------|------|
| `POST /okr/v4/periods/list` | 周期列表 | `okr:okr.period:readonly` |
| `POST /okr/v4/periods/get` | 周期详情 | `okr:okr.period:readonly` |
| `POST /okr/v4/objectives/list` | 目标列表 | `okr:okr.content:readonly` |
| `POST /okr/v4/objectives/get` | 目标详情 | `okr:okr.content:readonly` |
| `POST /okr/v4/key_results/list` | KR列表 | `okr:okr.content:readonly` |
| `POST /okr/v4/key_results/get` | KR详情 | `okr:okr.content:readonly` |
| `POST /okr/v4/alignments/list` | 对齐关系 | `okr:okr.content:readonly` |
| `POST /okr/v4/indicators/list` | 指标列表 | `okr:okr.indicator:readonly` |
| `POST /okr/v4/progress/list` | 进度历史 | `okr:okr.progress:readonly` |

### 4.2 关键参数

| 参数名 | 类型 | 描述 |
|--------|------|------|
| `user_id` | string | 用户ID（飞书开放平台使用 open_id） |
| `period_id` | string | OKR周期ID |
| `objective_id` | string | OKR目标ID |
| `key_result_id` | string | 关键结果ID |
| `page_size` | int | 分页大小 |
| `page_token` | string | 分页token |

### 4.3 官方文档链接

- 飞书开放平台: https://open.feishu.cn
- OKR API文档: https://open.feishu.cn/document/server-docs/okr-v1/okr-overview
- 智能伙伴开发: https://open.feishu.cn/document/client-docs/ai/skill-development

---

## 5. 适配建议

### 5.1 当前项目已实现的适配

根据项目文件分析，OKRskill 项目已具备以下 OpenClaw 适配能力：

| 适配项 | 实现方式 | 文件位置 |
|--------|----------|----------|
| 环境检测 | `process.env.OPENCLAW=1` 检测 | `okr-shared/SKILL.md` |
| 用户自动识别 | 智能伙伴自动获取 | `openclaw-lark-instructions.md` |
| 自然语言指令 | 12类操作指令模板 | `openclaw-lark-instructions.md` |
| 权限声明 | frontmatter permissions 字段 | 各 SKILL.md |

### 5.2 待完善的适配

| 待办项 | 描述 | 状态 |
|--------|------|------|
| 上级/平级OKR关联纠偏 | Step 3 需要获取上级和平级的同期目标进行对比 | Pending |
| 组织架构API集成 | 获取主管ID、平级同事ID | Pending |
| "at我的"OKR搜索 | 搜索提及当前用户的OKR目标 | Pending |
| GitHub仓库改造 | 目录结构调整、README、移除Claude Code特定路径 | Pending |

### 5.3 关键改造点

**1. 上级OKR读取指令**：
```
请读取我主管在 OKR 周期 {cycleId} 的目标列表。
返回 objective_id, title, description, weight。
以 JSON 数组格式返回。
```

**2. 平级OKR读取指令**：
```
请读取我的平级同事在 OKR 周期 {cycleId} 的目标列表。
返回 owner_name, objective_id, title, description。
以 JSON 数组格式返回。
```

**3. "at我的"OKR搜索**：
```
请搜索飞书OKR中提及我的目标（目标描述或KR描述中包含我的名字）。
返回 objective_id, title, owner_name, mention_context。
以 JSON 数组格式返回。
```

---

## 6. 结论

### 6.1 技术可行性评估

| 评估项 | 结论 |
|--------|------|
| 用户身份识别 | 可行 - 智能伙伴自动获取 |
| OKR周期/目标读取 | 可行 - 自然语言指令或API调用 |
| 上级/平级OKR读取 | 可行 - 需组织架构API支持 |
| 权限声明 | 可行 - frontmatter格式已定义 |
| 证据搜索（文档/消息） | 可行 - 搜索指令已设计 |

### 6.2 建议

1. **优先使用自然语言指令模式**：简单直观，无需定义复杂的Function schema
2. **补充组织架构相关权限**：确保 `contact:user.employee_id:readonly` 已授权
3. **完善上级/平级OKR关联纠偏功能**：这是Skill 1的核心增值点
4. **统一JSON响应格式**：确保LLM能稳定解析返回数据

---

## Sources

- [飞书开放平台](https://open.feishu.cn)
- [飞书OKR API文档](https://open.feishu.cn/document/server-docs/okr-v1/okr-overview)
- [飞书智能伙伴技能开发](https://open.feishu.cn/document/client-docs/ai/skill-development)
- 项目内部文件:
  - `/Users/garyge/claude-workspace/okrskill/okr-shared/openclaw-lark-instructions.md`
  - `/Users/garyge/claude-workspace/okrskill/okr-shared/SKILL.md`
  - `/Users/garyge/claude-workspace/okrskill/okr-goal-setting/SKILL.md`
  - `/Users/garyge/claude-workspace/okrskill/.planning/todos/pending/2026-04-22-openclaw.md`

---

*报告生成时间: 2026-04-27*