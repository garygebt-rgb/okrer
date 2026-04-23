# INTEGRATIONS.md — 外部集成分析

> 生成日期: 2026-04-23

## 飞书开放平台（核心集成）

**集成方式：** 通过 `lark-cli` CLI 工具间接调用

**覆盖的飞书 API：**

| API | 用途 | 调用的 lark-cli 命令 |
|-----|------|---------------------|
| OKR API | 周期/目标/KR/指标/对齐 | `lark-cli okr *` |
| 文档 API | 文档搜索、内容获取 | `lark-cli docs *` |
| 消息 API | 消息搜索、发送 | `lark-cli im *` |
| Wiki API | 知识库节点读取 | `lark-cli wiki *` |
| 日历 API | 日程查询 | `lark-cli calendar *` |
| 任务 API | 任务列表查询 | `lark-cli task *` |
| 通讯录 API | 用户信息、组织架构 | `lark-cli contact *` (隐含) |

**当前授权状态：**
- 应用 ID: `cli_a9408f4bd03a9bda`
- 用户: 葛榕 (open_id: `ou_d124a127a77e839fe7f0c8f96f707132`)
- Token 状态: `needs_refresh` (需要重新登录)
- 权限范围: 包含 OKR/文档/消息/Wiki/日历/任务/通讯录等 80+ 个 scope

**权限缺口：**
- 无 CLI 安装自检
- 无 token 过期检测和自动刷新
- 无 scope 缺失检测和引导

## Git / GitLab

**集成方式：** 混合模式

| 数据源 | 方式 | 代码位置 |
|--------|------|----------|
| 本地 Git | `execSync('git log ...')` | `data-collector.ts:481-544` |
| GitLab API | `fetch()` HTTP 请求 | `data-collector.ts:549-589` |
| IDE 配置 | 读取 `.vscode/` / `.idea/` | `data-collector.ts:376-442` |

## 平台适配（未实现）

| 平台 | 状态 | 描述 |
|------|------|------|
| Claude Code + lark-cli | ✅ 已实现 | 通过 CLI 间接调用飞书 API |
| OpenClaw（飞书智能伙伴） | ❌ 未实现 | SKILL.md 中有声明，无代码实现 |
