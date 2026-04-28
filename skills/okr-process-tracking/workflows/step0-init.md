# Step 0: 初始化 (Init)

**目标：** 用户通过 `init` 命令启动 Skill 2，完成认证验证、身份识别、OKR目标获取，设定定时任务（每周五 17:00），并立即执行一次周报任务。

**前置条件：** 用户已安装 lark-cli

**下一步：** Step 1 — 立即执行一次数据采集任务

## 输入

- 用户输入：`init`

## 执行步骤

### 1. 验证 lark-cli 认证

运行 `lark-cli auth status` 检查用户是否已认证。

- 若已认证：继续
- 若未认证：引导用户执行 `lark-cli auth login` 完成认证
- 验证所需 scope：`okr:okr.content:readonly`、`im:message`、`im:chat:readonly`、`docs:doc:readonly`、`calendar:calendar:readonly`

### 2. 识别用户身份

运行 `lark-cli okr cycle-list` 获取用户的 OKR 周期列表，从中提取：
- 用户姓名
- 用户飞书 userID
- 部门信息

### 3. 识别岗位类型

从 OKR 系统响应中提取部门信息，映射到 4 类岗位：

| 部门关键词 | 岗位类型 |
|-----------|---------|
| 研发、开发、后端、前端、架构、运维 | 研发 |
| 产品、PM、产品经理 | 产品 |
| 测试、QA、质量 | 测试 |
| 管理、总监、经理、主管、部门负责人 | 管理 |

若无法自动判断，提示用户确认岗位。

### 4. 获取当前活跃 OKR 目标

从周期列表中查找第一个 `status = "published"` 的周期。

- 若找到：运行 `lark-cli okr cycle-detail --cycle-id {cycleId}` 获取完整 OKR 目标数据
  - 记录每个 Objective 的标题、描述、权重
  - 记录每个 KeyResult 的标题、描述、当前 score
- 若未找到：提示用户"当前无活跃 OKR 周期"，停止初始化

### 5. 设定定时任务

设定每周五 17:00 自动执行周报任务：

- 使用 CronCreate 工具创建定时任务：
  - cron: `"0 17 * * 5"`（每周五 17:00）
  - prompt: `"执行 okr-process-tracking 周报任务，用户ID: {userId}，周期ID: {cycleId}"`
  - durable: true
- 记录 cron job ID 供后续管理

若定时任务已存在（检查已有 cron jobs），提示用户"已有定时任务在运行中"。

### 6. 创建快照目录

确保本地快照存储目录存在：
```
~/.claude/skills/okr-process-tracking/snapshots/{userId}-{cycleId}/
```

### 7. 输出身份确认信息

```
## 初始化完成

| 项目 | 值 |
|------|-----|
| 姓名 | {userName} |
| 用户ID | {userId} |
| 岗位类型 | {jobCategory} |
| 当前周期 | {cycleName} |
| 周期日期 | {startDate} ~ {endDate} |
| 定时任务 | 已设定（每周五 17:00） |
| 快照目录 | ~/.claude/skills/okr-process-tracking/snapshots/{userId}-{cycleId}/ |

即将立即执行第一次周报任务...
```

### 8. 立即执行

> 初始化完成。现在立即执行第一次周报任务，进入 Step 1（数据采集）。

## 数据类型引用

- `OKRCycle` — 周期结构（来自 `okr-types.ts`）
- `Objective` — 目标结构（来自 `okr-types.ts`）
- `KeyResult` — 关键结果结构（来自 `okr-types.ts`）
- `JobCategory` — 岗位类型枚举（来自 `okr-types.ts`）
- `CycleStatus` — 周期状态枚举（来自 `okr-types.ts`）

## 安全注意

- 仅展示当前用户数据，不展示其他用户信息
- `lark-cli` 输出可能为非法 JSON，必须使用 try/catch 包裹解析逻辑
