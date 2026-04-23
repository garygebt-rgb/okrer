---
name: okr-process-tracking
description: >
  USE when: doing biweekly OKR progress check-ins, comparing current progress
    against baseline, identifying risk KRs, or generating reminders for employees
    and managers.
  DON'T USE when: setting new OKR goals (use okr-goal-setting) or doing
    end-of-period review scoring (use okr-review-scoring).
version: 1.1.0
---

# OKR Process Tracking — OKR过程跟进专家

实现双周OKR过程跟进，采集飞书+Git数据，对比上次进度，识别风险，生成提醒和辅导建议。不计算完整KPI评分，只负责过程跟进和风险识别。

## 适用场景

当用户需要以下帮助时使用本 Skill：

- 双周定期跟进OKR进度，自动采集数据无需手动补充
- 对比当前进度与上次基线，识别进展变化
- LLM综合判断各KR风险等级（有进展/无进展）
- 生成提醒消息推送员工（友好提醒）和主管（正式汇报）
- 建立OKR进度基线，持续跟踪里程碑推进情况

## 5步工作流

| 步骤 | 名称 | 说明 |
|------|------|------|
| Step 1 | 触发检查 | 验证认证状态，识别当前活跃OKR周期，智能跳过检查 |
| Step 2 | 数据采集 | 自动查询OKR系统数据（完成度、备注、KR进展记录） |
| Step 3 | 进展对比 | 与基线快照对比，计算各KR得分变化 |
| Step 4 | 风险识别 | LLM综合判断，输出 on_track（有进展）/no_progress（无进展） |
| Step 5 | 辅导建议 | 生成员工提醒（友好语气）+ 主管汇报（正式语气），预览确认后发送 |

## 交互模式

本工作流采用**用户主动逐步执行**模式。每步完成后，Skill 会输出当前步骤的结果并询问：

> "是否继续下一步？"

用户确认后才进入下一步。这样给用户充分的控制权，避免自动化跳过关键决策。

## 输出格式

所有输出均为**纯文本 + Markdown 表格**，可直接在飞书聊天/文档中阅读，不依赖飞书卡片模板。

## 依赖模块

本 Skill 依赖 `okr-shared` 共享模块：

### 类型定义（okr-types.ts）

- `OKRCycle` — OKR周期（包含目标列表）
- `Objective` — OKR目标（标题、描述、权重、得分、关键结果、对齐关系）
- `KeyResult` — 关键结果（标题、描述、权重、得分、指标）
- `ProgressSnapshot` — 进度快照（历史存储，含lastReminderTimestamp）
- `RiskLevel` — 风险等级枚举（on_track/no_progress）
- `CycleStatus` — OKR周期状态枚举

### 数据采集（data-collector.ts）

- `fetchCycles(userId, timeRange?)` — 获取OKR周期列表
- `fetchCycleDetail(cycleId)` — 获取周期详情（包含目标列表）

## 使用方法

1. 用户触发 Skill
2. Skill 自动识别当前用户和活跃OKR周期
3. 引导用户完成5步工作流

示例：
```
我需要用okr-process-tracking跟进本季度OKR进度
```

## 数据来源

| 数据源 | 获取方式 | 用途 |
|--------|----------|------|
| 飞书OKR | 平台OKR API | OKR周期/目标/关键结果/进度数据 |
| 本地快照 | `snapshots/` 目录 | 基线进度快照（JSON） |
| 飞书消息 | 平台消息API | 提醒消息发送 |

### 平台适配

| 平台 | 用户身份获取 | OKR数据获取 | 消息发送 |
|------|-------------|-------------|----------|
| Claude Code | 用户提供 userID + lark-cli | `lark-cli okr` | `lark-cli im` |
| OpenClaw（飞书） | 智能伙伴自动识别当前用户 | 智能伙伴执行（见 `openclaw-lark-instructions.md`） | 智能伙伴发送 |

### 环境检测

本 Skill 自动检测运行环境：
- 如果 `process.env.OPENCLAW=1` → 使用飞书智能伙伴模式
- 否则 → 使用 Claude Code + lark-cli 模式

在飞书智能伙伴模式下：
- 不需要安装 lark-cli
- 不需要用户提供 userID（智能伙伴自动识别）
- 所有飞书操作通过自然语言指令由智能伙伴完成
- 具体指令格式参考 `okr-shared/openclaw-lark-instructions.md`

## 配置

主管 ID 配置在 `config.json` 的 `managerId` 字段中。首次运行时如未配置，会提示用户填写；留空则跳过主管端消息发送。

## 范围说明

当前版本仅实现提醒跟进功能。客户端-服务端自动触发机制后续实现。

## 风险提醒模板

风险提醒消息使用 `templates/risk-alert-template.md` 模板，包含员工端（友好提醒）和主管端（正式汇报）两种格式。

## 权限要求

| 权限 | 用途 |
|------|------|
| `okr:okr.period:readonly` | 读取OKR周期列表 |
| `okr:okr.content:readonly` | 读取OKR目标、关键结果、进度数据 |
| `im:message` | 发送提醒消息给员工和主管 |
| `contact:user.base:readonly` | 获取用户基本信息 |
