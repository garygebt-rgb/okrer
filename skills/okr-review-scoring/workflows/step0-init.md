# Step 0: 初始化 (Init)

**目标：** 用户通过 `init` 命令或 Skill 3 命令启动评审流程，完成认证验证、身份识别、OKR 目标获取。

**前置条件：** 用户已安装 lark-cli

**下一步：** Step 1 — 材料收集

## 输入

- 用户输入：`init` 或直接触发 okr-review-scoring Skill

## 执行步骤

### 1. 验证 lark-cli 认证

运行 `lark-cli auth status` 检查用户是否已认证。

- 若已认证：继续
- 若未认证：引导用户执行 `lark-cli auth login` 完成认证
- 验证所需 scope：`okr:okr.content:readonly`、`docs:doc:readonly`

### 2. 识别用户身份

运行 `lark-cli okr cycle-list --user-id {userId}` 获取用户的 OKR 周期列表，从中提取：
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

### 4. 获取评审周期

从周期列表中查找最近一个 `status = "completed"` 的周期作为评审周期。

- 若找到：记录 cycleId、周期名称、日期范围
- 若有多个已完成周期：让用户确认要评审的周期
- 若未找到：提示用户"当前无已完成的 OKR 周期可供评审"，停止初始化

### 5. 获取 OKR 目标

运行 `lark-cli okr cycle-detail --cycle-id {cycleId}` 获取完整 OKR 目标数据：
- 每个 Objective 的标题、描述、权重、得分
- 每个 KeyResult 的标题、描述、得分

### 6. 读取 Skill 2 周报快照

检查本地快照目录：`~/.claude/skills/okr-process-tracking/snapshots/{userId}-{cycleId}/`

- 若存在快照文件（`weekly-*.md`）：读取并展示最近的周报数据
- 若不存在：提示用户"未找到过程跟进周报快照，将仅基于自述文档进行评分"

### 7. 输出身份确认信息

```
## 初始化完成

| 项目 | 值 |
|------|-----|
| 姓名 | {userName} |
| 用户ID | {userId} |
| 岗位类型 | {jobCategory} |
| 评审周期 | {cycleName} |
| 周期日期 | {startDate} ~ {endDate} |
| OKR 目标数 | {objectiveCount} |
| 周报快照数 | {snapshotCount} |

身份确认无误，即将开始 OKR 期末评审。
```

### 8. 继续提示

> 初始化完成。是否继续到 Step 1（材料收集）？回复"继续"或提供你的自述文档链接。

## 数据类型引用

- `OKRCycle` — 周期结构（来自 `okr-types.ts`）
- `Objective` — 目标结构（来自 `okr-types.ts`）
- `KeyResult` — 关键结果结构（来自 `okr-types.ts`）
- `JobCategory` — 岗位类型枚举（来自 `okr-types.ts`）
- `CycleStatus` — 周期状态枚举（来自 `okr-types.ts`）

## 安全注意

- 仅展示当前用户数据，不展示其他用户信息
- `lark-cli` 输出可能为非法 JSON，必须使用 try/catch 包裹解析逻辑
