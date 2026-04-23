# CONCERNS.md — 技术债务与风险

> 生成日期: 2026-04-23

## HIGH — CLI 依赖无自检

**描述：** `data-collector.ts` 直接调用 `execSync('lark-cli ...')`，没有任何前置检查。如果 lark-cli 未安装、未授权、token 过期或 scope 缺失，用户会得到原始错误信息。

**影响：** 新用户首次使用时会直接报错，没有引导流程。

**文件：** `okr-shared/data-collector.ts:24-34`

## HIGH — OpenClaw 路径未实现

**描述：** 三个 SKILL.md 都声明了"平台适配"表，列出了 Claude Code 和 OpenClaw 两条路径。但 OpenClaw 路径（飞书 API 直调）仅有文档声明，没有任何代码实现。

**影响：** 如果用户在飞书智能伙伴（OpenClaw/小龙虾）环境中使用，当前 Skills 无法工作，因为 lark-cli 在云端环境不可用。

**文件：** 三个 `SKILL.md` 中的"平台适配"表

## MEDIUM — Token 过期无自动刷新

**描述：** 当前 token 状态为 `needs_refresh`（过期时间 2026-04-22），需要用户手动 `lark-cli auth login` 重新授权。系统没有自动检测 token 状态并提示刷新的逻辑。

**影响：** 用户长时间不使用后重新打开 Skill，第一次操作会失败。

## MEDIUM — 岗位证据策略仅 dev-evidence.ts 有实现

**描述：** `okr-shared/evidence-strategies/` 目录下应该有 4 个文件（pm/qa/mgmt/dev），但只找到了 `dev-evidence.ts`。

**影响：** 产品经理、测试、管理岗位的证据采集功能不完整。

## LOW — Git 采集会切换进程目录

**描述：** `fetchGitCommits()` 使用 `process.chdir(repo)` 切换工作目录，虽然有 finally 恢复，但在并发场景下可能导致竞态条件。

**文件：** `okr-shared/data-collector.ts:487`

## LOW — 无测试框架

**描述：** 项目没有任何自动化测试。测试仅靠 E2E 手动执行记录。

**影响：** 代码变更无法自动验证正确性。
