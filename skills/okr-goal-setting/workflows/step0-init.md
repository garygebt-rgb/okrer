# Step 0: 初始化 (Init)

**目标：** 用户通过 `init` 命令或技能名+辅助本期OKR目标的方式启动 Skill 1，完成认证验证、身份识别、周期获取，为后续 SMART 验证和对齐检查提供上下文。

**前置条件：** 用户已安装 lark-cli

**下一步：** Step 1 — 收集背景

## 输入

- 用户输入：`okr-goal-setting 辅助我本期OKR目标` 或直接使用 `init` 命令

## 执行步骤

### 1. 验证 lark-cli 认证

运行 `lark-cli auth status` 检查用户是否已认证。

- 若已认证：继续
- 若未认证：引导用户执行 `lark-cli auth login` 完成认证
- 验证所需 scope：`okr:okr.content:readonly`

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

### 4. 识别当前活跃周期

从周期列表中查找第一个 `status = "published"` 的周期。

- 若找到：记录 cycleId、周期名称、日期范围
- 若未找到：提示用户"当前无活跃 OKR 周期，请确认是否已开始新周期"

### 5. 输出身份确认信息

```
## 初始化完成

| 项目 | 值 |
|------|-----|
| 姓名 | {userName} |
| 用户ID | {userId} |
| 岗位类型 | {jobCategory} |
| 当前周期 | {cycleName} |
| 周期日期 | {startDate} ~ {endDate} |

身份确认无误，即将开始 OKR 目标设定辅助。
```

### 6. 继续提示

> 初始化完成。是否继续到 Step 1（收集背景）？回复"继续"。

## 数据类型引用

- `OKRCycle` — 周期结构（来自 `okr-types.ts`）
- `JobCategory` — 岗位类型枚举（来自 `okr-types.ts`）
- `CycleStatus` — 周期状态枚举（来自 `okr-types.ts`）

## 安全注意

- 仅展示当前用户数据，不展示其他用户信息
- `lark-cli` 输出可能为非法 JSON，必须使用 try/catch 包裹解析逻辑
