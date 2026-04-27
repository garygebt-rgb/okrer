# OpenClaw Skills 改造指南

> 将 Claude Code Skills 改造为飞书智能伙伴(OpenClaw)可食用格式
> 日期: 2026-04-27

---

## 1. SKILL.md 格式对比

### Claude Code Skills 格式 (当前)

```yaml
---
name: okr-goal-setting
description: OKR目标设定专家 — 5步工作流辅助用户设定符合SMART原则的OKR目标
version: 1.0.0
---

# OKR Goal Setting

## 5步工作流

| 步骤 | 名称 | 说明 |
|------|------|------|
| Step 1 | 收集背景 | ... |
...

## 依赖模块

本 Skill 依赖 `okr-shared` 共享模块...
```

### OpenClaw Skills 格式 (目标)

```yaml
---
name: okr-goal-setting
description: "OKR目标设定专家 — 5步工作流辅助用户设定符合SMART原则的OKR目标，检查上下级对齐，给出修改建议"
metadata:
  openclaw:
    emoji: "🎯"
    requires:
      env: ["LARK_CLI_PATH"]
      bins: ["lark-cli"]
    install:
      - id: "brew"
        kind: "brew"
        formula: "lark-cli"
        bins: ["lark-cli"]
        label: "Install Lark CLI (brew)"
    primaryEnv: "LARK_CLI_PATH"
---

# OKR Goal Setting

使用 `lark-cli` 辅助用户设定符合SMART原则的OKR目标...

## When to Use

✅ **USE this skill when:**
- 设定新一季度的OKR目标
- 检查个人目标与直属上级OKR的贡献型对齐
...

## When NOT to Use

❌ **DON'T use this skill when:**
- 计算完整KPI评分 (OKR只占KPI的20%)
- 单纯查询OKR数据 (直接用 lark-cli okr 命令)
...

## Common Commands

### Step 1: 收集背景

获取用户历史OKR周期:

```bash
lark-cli okr cycle-list --user-id "{userID}"
lark-cli okr cycle-detail --cycle-id "{cycleId}"
```

### Step 2: SMART验证

...

## Templates

### SMART验证模板

...
```

---

## 2. Frontmatter 字段详解

| 字段 | Claude Code | OpenClaw | 说明 |
|------|-------------|----------|------|
| `name` | 必填 | 必填 | Skill 名称，唯一标识 |
| `description` | 必填 | 必填 | 描述，建议用双引号包裹长文本 |
| `version` | 可选 | 不使用 | OpenClaw 不使用 version 字段 |
| `homepage` | 不使用 | 可选 | 官方文档链接 |
| `metadata.openclaw` | 不使用 | **必填** | OpenClaw 特定配置 |

### metadata.openclaw 子字段

| 子字段 | 类型 | 说明 |
|--------|------|------|
| `emoji` | string | Skill 显示图标 (1个字符) |
| `requires` | object | 运行依赖 |
| `requires.bins` | array | 必需的 CLI 工具 |
| `requires.env` | array | 必需的环境变量 |
| `requires.anyBins` | array | 任选其一的 CLI 工具 |
| `install` | array | 安装指引列表 |
| `install[].id` | string | 安装方式ID |
| `install[].kind` | string | 安装类型: brew/apt/node/npm |
| `install[].formula/package` | string | 包名 |
| `install[].bins` | array | 安装后提供的工具 |
| `install[].label` | string | 用户可见的安装说明 |
| `primaryEnv` | string | 主要环境变量名 |

---

## 3. 工作流改写策略

### Claude Code 工作流文件结构

```
okr-goal-setting/
├── SKILL.md              # 主入口
├── workflows/
│   ├── step1-collect-context.md    # 详细步骤指令
│   ├── step2-smart-validate.md
│   ├── step3-alignment-check.md
│   ├── step4-generate-suggestions.md
│   └── step5-user-confirm.md
├── templates/
│   └── smart-checklist.md
└── test-cases/
    └── skill1-e2e-test-log.md
```

### OpenClaw Skills 结构 (目标)

```
openclaw-skills/
├── okr-goal-setting/
│   └── SKILL.md          # 所有内容合并到一个文件
│                        # 工作流步骤以 "## Step N" 形式内联
│                        # 命令示例直接嵌入
```

**关键差异：**
- OpenClaw 不使用 `workflows/` 目录
- 所有内容合并到单个 `SKILL.md`
- 使用 `## Common Commands` + `## Templates` 组织

---

## 4. 具体改写示例

### Step 1 改写: 从 step1-collect-context.md

**原始 Claude Code 格式：**

```markdown
# Step 1: 收集背景

**目标：** 获取用户身份信息、岗位类型、往期OKR分析数据

**执行步骤：**

### 1. 获取用户OKR周期列表

调用 `lark-cli okr cycle-list --user-id {userID}` 获取用户的所有OKR周期。

执行命令：lark-cli okr cycle-list --user-id "{userID}"

**预期输出：** JSON 数组，包含周期ID、名称、起止日期、状态。
```

**改写为 OpenClaw 格式：**

```markdown
## Step 1: 收集背景 (Collect Context)

自动获取用户历史OKR数据、岗位类型、往期分析，为后续SMART验证和对齐检查提供上下文。

### 获取OKR周期

```bash
# 获取用户所有OKR周期
lark-cli okr cycle-list --user-id "{userID}"

# 获取周期详情（包含目标列表）
lark-cli okr cycle-detail --cycle-id "{cycleId}"
```

**输出字段：**
- `cycleId` — 周期ID
- `name` — 周期名称
- `startDate` / `endDate` — 起止日期
- `status` — 周期状态 (draft/published/completed/archived)

**岗位识别规则：**

| 部门关键词 | 岗位类型 | JobCategory |
|-----------|---------|-------------|
| 研发、开发 | 研发 | `JobCategory.DEV` |
| 产品、PM | 产品 | `JobCategory.PRODUCT` |
| 测试、QA | 测试 | `JobCategory.QA` |
| 管理、总监 | 管理 | `JobCategory.MANAGEMENT` |

**错误处理：**
- 若返回空数组：提示用户"首次设定OKR，跳过历史分析"
- 若命令失败：提示确认 userID 正确性

完成后询问："是否继续到 Step 2 (SMART验证)？回复'继续'或提供你要验证的目标。"
```

### Step 5 改写: 用户确认流程

**改写要点：**
- OpenClaw 在飞书环境中可以直接调用飞书OKR API
- 需要使用 `openclaw message send` 发送完成通知

```markdown
## Step 5: 用户确认 (Confirm)

展示完整分析结果，获取用户明确确认后保存目标。

### 确认选项

向用户展示以下选择：

1. **确认保存** — 保存分析至本地参考
2. **修改** — 指定要改的 Objective 或 KR
3. **确认保存并更新我的OKR** — 保存本地并更新飞书线上OKR
4. **取消** — 放弃本次设定

### 更新飞书OKR (选项3)

使用飞书OKR API更新线上内容：

```bash
# OpenClaw 环境下使用飞书内置工具
# 直接调用飞书OKR写入API，无需额外CLI

# 更新目标标题和描述
openclaw feishu okr update-objective \
  --objective-id "{objectiveId}" \
  --title "{newTitle}" \
  --description "{newDescription}"
```

**降级处理：**
如API写入失败，保存本地分析报告并提示用户手动更新。

### 完成通知

工作流完成后发送通知：

```bash
openclaw message send \
  --channel feishu \
  --target "{userId}" \
  --message "OKR目标设定分析已完成。SMART评分: {score}/5"
```
```

---

## 5. 工具调用描述方式

### Claude Code: 程序化指令

```markdown
调用 `lark-cli okr cycle-list --user-id {userID}` 获取用户的所有OKR周期。

执行命令：lark-cli okr cycle-list --user-id "{userID}"

预期输出：JSON 数组
```

### OpenClaw: 自然语言 + 命令示例

```markdown
使用 `lark-cli okr cycle-list` 获取用户历史OKR周期：

```bash
lark-cli okr cycle-list --user-id "{userID}"
```

输出包含周期ID、名称、起止日期、状态等字段。
```

**差异总结：**
- Claude Code: "调用xxx命令，预期输出xxx，错误处理xxx"
- OpenClaw: "使用xxx命令获取数据，代码块展示命令，简要说明输出"

---

## 6. 飞书智能伙伴特殊配置

### 飞书Channel配置 (docs/channels/feishu.md)

```json5
{
  channels: {
    feishu: {
      dmPolicy: "pairing",      // DM策略: pairing/allowlist/open/disabled
      groupPolicy: "open",      // 群聊策略
      requireMention: true,     // 群聊需@提及
    },
  },
}
```

### 飞书OKR工具调用

OpenClaw 在飞书环境下可直接使用飞书内置工具，无需 `lark-cli`：

- 飞书OKR API (读/写目标、关键结果)
- 飞书文档API (解析用户自述文档)
- 飞书WikiAPI (获取质量管理数据)

---

## 7. 完整改写示例: okr-goal-setting SKILL.md

```yaml
---
name: okr-goal-setting
description: "OKR目标设定专家 — 5步工作流辅助用户设定符合SMART原则的OKR目标，检查上下级对齐，给出修改建议"
metadata:
  openclaw:
    emoji: "🎯"
    requires:
      env: ["FEISHU_OKR_ENABLED"]
    install: []
---

# OKR Goal Setting

辅助管理者确保OKR目标设定合理、上下级对齐清晰、符合SMART原则。

## When to Use

✅ **USE this skill when:**
- 设定新一季度的OKR目标，需要验证SMART原则
- 检查个人目标与直属上级OKR的贡献型对齐
- 识别跨团队/平级OKR的依赖型对齐关系
- 获取往期OKR完成度分析
- 生成修改建议并确认后发布

## When NOT to Use

❌ **DON'T use this skill when:**
- 计算完整KPI评分 (OKR只占KPI的20%)
- 单纯查询OKR数据 (直接使用飞书OKR功能)
- 查看他人OKR (仅处理用户自己的数据)

## Workflow Overview

| Step | Name | Description |
|------|------|-------------|
| 1 | 收集背景 | 自动获取历史OKR、岗位类型、往期分析 |
| 2 | SMART验证 | 5维度检查，输出通过/问题/建议 |
| 3 | 对齐检查 | 检查上下级+平级依赖关系 |
| 4 | 修改建议 | 综合SMART+对齐分析生成建议 |
| 5 | 用户确认 | 展示完整分析，获取确认后保存 |

## Step 1: 收集背景

自动获取用户历史OKR数据：

```bash
# 飞书智能伙伴环境下直接调用飞书OKR API
# 获取周期列表
feishu-okr cycle-list --user "{userId}"

# 获取周期详情
feishu-okr cycle-detail --cycle "{cycleId}"
```

**岗位识别：**

| 部门关键词 | 岗位类型 |
|-----------|---------|
| 研发、开发 | 研发 |
| 产品、PM | 产品 |
| 测试、QA | 测试 |
| 管理、总监 | 管理 |

**历史分析指标：**
- 未完成目标数 (得分 < 0.7)
- 重复目标数 (跨周期出现)
- 平均得分趋势 (偏容易/偏保守/合理)

完成后询问："是否继续到 Step 2？"

## Step 2: SMART验证

5维度检查每个目标：

| 维度 | 检查要点 |
|------|----------|
| Specific | 是否具体明确，不含模糊词 |
| Measurable | 是否有量化指标或明确完成标准 |
| Achievable | 是否考虑资源和时间可行性 |
| Relevant | 是否与团队/公司目标相关 |
| Time-bound | 是否有明确截止日期 |

**评分：** X/5，每个维度输出"通过/问题/建议"

## Step 3: 对齐检查

检查两类对齐关系：

**贡献型对齐：** 个人目标向上贡献上级OKR
```bash
feishu-okr alignments --objective "{objectiveId}" --type contributing
```

**依赖型对齐：** 个人目标依赖平级/跨团队OKR
```bash
feishu-okr alignments --objective "{objectiveId}" --type dependent
```

## Step 4: 修改建议

综合Step 1-3分析，生成修改建议：

- SMART改进建议表
- 对齐改进建议
- 基于历史模式的综合建议

## Step 5: 用户确认

展示完整分析报告，提供4个选项：

1. **确认保存** — 保存分析至本地
2. **修改** — 调整特定Objective或KR
3. **保存并更新飞书OKR** — 直接更新线上内容
4. **取消** — 放弃本次设定

### 更新飞书OKR (选项3)

```bash
# 使用飞书OKR写入API更新目标
feishu-okr update-objective \
  --id "{objectiveId}" \
  --title "{newTitle}" \
  --description "{newDescription}"
```

**安全要求：**
- 用户必须显式选择确认选项
- 不设默认值或超时自动保存
- 更新前展示完整建议目标供确认

## Templates

### SMART验证模板

```
## SMART验证结果

| 维度 | 结果 | 说明 |
|------|------|------|
| Specific | {通过/问题/建议} | {原因} |
| Measurable | {通过/问题/建议} | {原因} |
| Achievable | {通过/问题/建议} | {原因} |
| Relevant | {通过/问题/建议} | {原因} |
| Time-bound | {通过/问题/建议} | {原因} |

**SMART评分：{score}/5**

{改进建议}
```

### 对齐检查模板

```
## 对齐检查结果

| 类型 | 数量 | 涉及目标 |
|------|------|----------|
| 贡献型对齐 | {n} | {目标列表} |
| 依赖型对齐 | {n} | {目标列表} |
| 未覆盖上级 | {n} | {目标列表} |
```
```

---

## 8. 改造执行步骤

1. **创建新目录结构**
   ```
   openclaw-skills/
   ├── okr-goal-setting/
   │   └── SKILL.md
   ├── okr-process-tracking/
   │   └── SKILL.md
   └── okr-review-scoring/
   │   └── SKILL.md
   ```

2. **合并工作流文件**
   - 将 `workflows/step*.md` 内容合并到 SKILL.md
   - 转换为 `## Step N:` 格式

3. **改写Frontmatter**
   - 添加 `metadata.openclaw` 配置
   - 设置 `emoji`、`requires` 字段

4. **简化命令描述**
   - 移除"预期输出"、"错误处理"等程序化描述
   - 使用代码块 + 简要说明

5. **添加飞书工具调用**
   - 替换 `lark-cli` 为飞书内置工具调用描述
   - 添加 `openclaw message send` 完成通知

---

## 9. Sources

- [OpenClaw GitHub Repository](https://github.com/OpenClaw/openclaw)
- [OpenClaw Skills Repository](https://github.com/OpenClaw/skills)
- [OpenClaw Docs - Feishu Channel](https://github.com/OpenClaw/openclaw/blob/main/docs/channels/feishu.md)
- [OpenClaw Docs - Agent Runtime](https://github.com/OpenClaw/openclaw/blob/main/docs/concepts/agent.md)
- [GitHub Skill Example - github/SKILL.md](https://github.com/OpenClaw/openclaw/blob/main/skills/github/SKILL.md)
- [Coding Agent Skill Example](https://github.com/OpenClaw/openclaw/blob/main/skills/coding-agent/SKILL.md)