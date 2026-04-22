# OKRskill — OKR 绩效管理 Skill 系统

一套覆盖 OKR 全生命周期的 Claude Code / OpenClaw Skills，服务于约 150 人技术部门（产品、研发、测试、管理）。

## 架构

```
okrskill/
├── okr-shared/              # 共享数据层（类型定义、数据采集、评分引擎、证据匹配）
├── okr-goal-setting/        # Skill 1: 目标设定（5步工作流）
├── okr-process-tracking/    # Skill 2: 过程跟进（5步工作流）
└── okr-review-scoring/      # Skill 3: 评审评分（6步工作流）
```

## Skills 概览

| Skill | 用途 | 工作流 |
|-------|------|--------|
| okr-goal-setting | 新一季度 OKR 目标设定，SMART 验证，上下级对齐检查 | 5步 |
| okr-process-tracking | 双周 OKR 过程跟进，进度对比，风险识别，提醒生成 | 5步 |
| okr-review-scoring | 期末 OKR 评审评分，证据验证，评分计算，报告生成 | 6步 |

## 评分体系

技术中心标准：**难度 40% + 努力度 40% + 完成度 20%**

> 所有评分均为建议评分，最终评分由人类评审决定。

## 平台兼容

本 Skills 系统同时支持两个运行平台：

| 平台 | 安装方式 | 身份识别 | 数据获取 |
|------|----------|----------|----------|
| Claude Code（本地） | 安装到 `~/.claude/skills/` | 用户提供 userID | `lark-cli` 命令 |
| OpenClaw（飞书云端） | 从 GitHub 安装 / ClawHub | 自动识别 open_id | 飞书 API 直调 |

## 飞书权限要求

| 权限 | 用途 | 所需 Skills |
|------|------|-------------|
| `okr:okr.period:readonly` | 读取 OKR 周期列表 | 全部 |
| `okr:okr.content:readonly` | 读取 OKR 内容（目标、关键结果、对齐） | 全部 |
| `contact:user.base:readonly` | 获取用户基本信息 | Goal Setting, Review |
| `contact:user.employee_id:readonly` | 获取组织架构关系（上级/平级识别） | Goal Setting |
| `docs:doc:readonly` | 读取用户自述文档 | Review |
| `wiki:wiki:readonly` | 读取知识库质量数据 | Review |
| `im:message` | 发送提醒消息 | Process Tracking |

## 安装

### Claude Code（本地）

```bash
# 克隆仓库
git clone https://github.com/garygebt-rgb/okrer.git

# 复制 Skills 到本地
cp -r okrskill/okr-shared ~/.claude/skills/
cp -r okrskill/okr-goal-setting ~/.claude/skills/
cp -r okrskill/okr-process-tracking ~/.claude/skills/
cp -r okrskill/okr-review-scoring ~/.claude/skills/

# 配置主管 ID（可选）
echo '{"managerId": "your_manager_open_id"}' > ~/.claude/skills/okr-process-tracking/config.json
```

### OpenClaw（飞书云端）

从 GitHub 仓库直接安装，或由管理员在 OpenClaw 管理面板中添加技能源：

```
https://github.com/garygebt-rgb/okrer
```

所需飞书权限已在各 Skill 的 SKILL.md `权限要求` 部分声明。

## 4类岗位证据策略

| 岗位 | 证据类型 |
|------|----------|
| 产品经理 | PRD + 会议纪要 + 聊天记录 |
| 研发 | 技术文档 + Git 提交 + 任务交付 |
| 测试 | 测试用例 + Bug 统计 + 测试结果 |
| 管理 | 会议决策 + 周报 |

## 设计原则

- **评分仅为建议**：最终评分由人类评审决定
- **OKR 占 KPI 20%**：只管理主观任务部分，不计算完整 KPI
- **用户主动逐步执行**：每步确认后继续，避免自动化跳过关键决策
- **纯文本 + Markdown 输出**：可直接在飞书聊天/文档中阅读
