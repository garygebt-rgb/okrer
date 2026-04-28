---
name: okr-process-tracking
description: OKR过程跟进专家 — 5步工作流实现双周OKR过程跟进，采集飞书+Git数据，对比上次进度，识别风险，生成提醒和辅导建议
version: 1.0.0
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

## 使用方法

### 启动命令

用户通过 `init` 命令启动：
- `init` — 初始化并立即执行第一次周报任务

### 7步工作流

| 步骤 | 名称 | 说明 | 工作流文件 |
|------|------|------|------|
| Step 0 | 初始化 | 验证认证，识别身份，获取OKR目标，设定定时任务（每周五17:00） | `workflows/step0-init.md` |
| Step 1 | 触发检查 | 验证lark-cli认证，识别当前活跃OKR周期，智能跳过检查（D-17） | `workflows/step1-trigger.md` |
| Step 2 | 多渠道数据采集 | 采集OKR系统+群聊+文档+会议+邮件+Git数据，无需用户手动补充 | `workflows/step2-data-collect.md` |
| Step 3 | 进展对比 | 与本地基线快照对比，计算各KR得分变化（D-13） | `workflows/step3-progress-compare.md` |
| Step 4 | 风险识别 | LLM综合判断，输出on_track（有进展）/no_progress（无进展）（D-14） | `workflows/step4-risk-detect.md` |
| Step 5 | 辅导建议 | 生成员工提醒（友好语气）+ 主管汇报（正式语气），预览确认后发送（D-15, D-16） | `workflows/step5-coaching-advice.md` |
| Step 6 | 周报生成 | 围绕每个O/KR总结本周进展，MD格式保存本地快照 | `workflows/step6-weekly-report.md` |

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

1. 用户提供自己的飞书 userID
2. Skill 自动验证认证状态，识别当前活跃周期
3. 引导用户完成5步工作流

示例：
```
我需要用okr-process-tracking跟进本季度OKR进度
我的userID是: user-123456
```

## 数据来源

| 数据源 | 获取方式 | 用途 |
|--------|----------|------|
| 飞书OKR | `lark-cli okr` | OKR周期/目标/关键结果/进度数据 |
| 本地快照 | `~/.claude/skills/okr-process-tracking/snapshots/` | 基线进度快照（JSON） |
| 飞书消息 | `lark-cli im` | 提醒消息发送 |

## 配置

主管 ID 配置在 `~/.claude/skills/okr-process-tracking/config.json` 的 `managerId` 字段中。首次运行时如未配置，会提示用户填写；留空则跳过主管端消息发送。

## 范围说明

Phase 3 仅实现提醒跟进功能。客户端-服务端自动触发机制（D-09）预留接口，后续实现。

## 风险提醒模板

风险提醒消息使用 `~/.claude/skills/okr-process-tracking/templates/risk-alert-template.md` 模板，包含员工端（友好提醒）和主管端（正式汇报）两种格式。

## 周报快照存储

周报快照以 **MD 格式** 保存在本地目录：

```
~/.claude/skills/okr-process-tracking/snapshots/{userId}-{cycleId}/weekly-{YYYY-MM-DD}.md
```

每周生成一份周报，包含：
- 周期信息、日期范围
- 每个 O 的本周进展
- 每个 KR 的得分变化、趋势（上升↑/持平—/下降↓）
- 风险识别结果（有进展🟢/无进展🔴）
- 辅导建议摘要

同时保留 JSON 格式快照（`~/.claude/skills/okr-process-tracking/snapshots/{userId}-{cycleId}.json`）用于增量对比。

## 定时任务

init 时自动设定每周五 17:00 的定时任务，自动执行周报生成。用户也可手动触发。

## 执行日志邮件

本 Skill 执行完成后，自动记录执行日志并发送至 `ITPMO@homeinns.com`。

日志内容包括：
- 谁执行了技能（用户姓名、userID）
- 执行时间（手动/定时触发）
- 各步骤执行结果（采集数据源数、KR变化、风险识别结果、周报文件路径）

日志模块位于 `okr-shared/log-sender.ts`。
