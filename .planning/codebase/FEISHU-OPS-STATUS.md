# 飞书操作现状分析

> 分析日期: 2026-04-23
> 分析范围: 三个 OKR Skills 中所有飞书相关操作

---

## 一、当前飞书操作全景图

### 1.1 数据源依赖

三个 Skills 统一依赖 `okr-shared/data-collector.ts` 作为飞书数据入口：

| 数据类型 | CLI 命令 | 使用场景 |
|----------|----------|----------|
| OKR 周期列表 | `lark-cli okr cycle-list` | 所有 3 个 Skill |
| OKR 周期详情 | `lark-cli okr cycle-detail` | 所有 3 个 Skill |
| OKR 目标详情 | `lark-cli okr objectives get` | Skill 1 对齐检查 |
| OKR 关键结果 | `lark-cli okr key-results` | Skill 2 进展对比 |
| OKR 对齐关系 | `lark-cli okr alignments` | Skill 1 对齐检查 |
| OKR 指标数据 | `lark-cli okr indicators` | Skill 1/2/3 |
| 飞书文档 | `lark-cli docs search/fetch` | Skill 1/3 文档搜索 |
| 飞书消息 | `lark-cli im messages-search` | Skill 2 证据采集 |
| 飞书 Wiki | `lark-cli wiki nodes list` | Skill 3 质量数据 |
| 日历日程 | `lark-cli calendar agenda` | Skill 1/2 背景采集 |
| 飞书任务 | `lark-cli task tasks-list` | Skill 2/3 交付验证 |

### 1.2 调用链路

```
用户触发 Skill
    → 工作流文件 (step*.md) 定义步骤
    → data-collector.ts 封装 lark-cli 命令
    → execSync(`lark-cli ${args}`) 执行
    → 解析 JSON 输出返回结果
```

**关键文件：**
- `okr-shared/data-collector.ts` — 唯一飞书 CLI 封装层（590 行）
- `okr-shared/evidence-strategies/*.ts` — 4 类岗位证据采集策略
- 各 Skill 的 `workflows/step*.md` — 工作流步骤定义

### 1.3 当前权限状态

已授权权限（用户"葛榕"，open_id: `ou_d124a127a77e839fe7f0c8f96f707132`）：

| 权限 | 状态 | 用途 |
|------|------|------|
| `okr:okr.period:readonly` | 已授权 | OKR 周期读取 |
| `okr:okr.content:readonly` | 已授权 | OKR 内容读取 |
| `contact:user.base:readonly` | 已授权 | 用户基本信息 |
| `contact:user.employee_id:readonly` | 已授权 | 组织架构关系 |
| `im:message` | 已授权 | 消息发送 |
| `docs:document.*` | 已授权 | 文档读写 |
| `wiki:wiki:readonly` | 已授权 | Wiki 读取 |
| `task:task:read` | 已授权 | 任务读取 |
| `calendar:calendar.*` | 已授权 | 日历读写 |

**注意：** token 状态为 `needs_refresh`（过期时间 2026-04-22T23:04:48），需要重新登录。

---

## 二、存在的问题

### 2.1 无 CLI 安装自检逻辑

**现状：** `data-collector.ts:24-34` 直接调用 `execSync('lark-cli ...')`，没有任何前置检查：

```typescript
function runLarkCommand(args: string): string {
  try {
    return execSync(`lark-cli ${args}`, { encoding: 'utf-8', timeout: 30000 });
  } catch (error) {
    throw new Error(`lark-cli 执行失败: ${msg}`);
  }
}
```

**缺失：**
1. 不检查 `lark-cli` 是否已安装（命令是否存在）
2. 不检查 `lark-cli auth status` 是否已授权
3. 不检查 token 是否过期（needs_refresh 状态）
4. 不检查所需 scope 是否齐全
5. 没有自动安装/授权引导流程

### 2.2 平台适配表 vs 实际实现不匹配

三个 SKILL.md 都声明了"平台适配"表：

| 平台 | OKR 数据获取 |
|------|-------------|
| Claude Code | `lark-cli okr` |
| OpenClaw（飞书） | 飞书 OKR API 直调 |

**实际情况：**
- Claude Code 路径：✅ **已实现**（通过 lark-cli）
- OpenClaw 路径：❌ **未实现**（仅存在于 SKILL.md 表格中，无代码）

### 2.3 飞书智能伙伴（OpenClaw）场景未适配

OpenClaw 作为飞书云端 AI 伙伴的关键差异：

| 维度 | Claude Code 现状 | OpenClaw 需要 |
|------|-----------------|--------------|
| 用户身份 | 用户手动提供 userID | LLM 自动识别当前用户 open_id |
| CLI 依赖 | 需要安装 lark-cli | 飞书 API 直调（无需 CLI） |
| 认证 | `lark-cli auth login` 设备码 | 飞书智能伙伴自动授权 |
| 数据获取 | `execSync('lark-cli ...')` | 飞书开放平台 HTTP API |
| 权限声明 | SKILL.md 表格列出 | OpenClaw metadata 格式声明 |

### 2.4 证据策略依赖飞书搜索

`okr-shared/evidence-strategies/dev-evidence.ts` 等证据策略文件：
- 使用 `searchDocuments()` 搜索飞书文档（依赖 lark-cli docs search）
- 使用 `fetchTasks()` 获取飞书任务（依赖 lark-cli task）
- 这些在 OpenClaw 环境下需要改写为飞书 API 直调

---

## 三、OpenClaw 适配待办（已记录但未实施）

### 3.1 通用适配（2026-04-22-openclaw.md）
- 调研 OpenClaw 技能/插件机制
- 评估 lark-cli 在 OpenClaw 环境的可用性
- 列出改造清单

### 3.2 Skill 1 专项适配（2026-04-22-skill1-openclaw.md）
- SKILL.md 添加 OpenClaw 权限声明 metadata
- Step 1 改造：去掉"用户提供 userID"，改为 LLM 自动识别
- Step 3 改造：获取上级/平级同期 OKR，做关联纠偏
- Step 2 Relevant 维度改造：引入上级/平级目标对比结果

### 3.3 其他待办
- GitHub 仓库全面改造为 OpenClaw 格式
- Skill 1 OpenClaw 适配（自动识别用户/主管身份）

---

## 四、建议的改进方向

### 方向 A：增加 CLI 自检程序（Claude Code 路径）

在 `data-collector.ts` 入口增加 `checkLarkCli()` 函数：
1. `which lark-cli` — 检查是否安装
2. 未安装 → 引导用户通过"小龙虾"自动下载安装
3. `lark-cli auth status` — 检查是否授权
4. 未授权 → 引导 `lark-cli auth login`
5. `lark-cli auth check` — 检查所需 scope
6. 缺失 scope → 引导补充授权

### 方向 B：飞书智能伙伴路径适配（OpenClaw 路径）

当运行环境为 OpenClaw 时：
1. **用户身份**：通过飞书会话上下文自动获取 open_id，无需用户提供
2. **数据获取**：改用飞书开放平台 HTTP API 直调，不再依赖 lark-cli
3. **权限管理**：在 SKILL.md 中用 OpenClaw metadata 声明所需权限，由智能伙伴处理授权
4. **统一适配层**：在 `data-collector.ts` 增加环境检测，根据 `process.env.LARK_DATA_SOURCE` 选择 CLI 或 API 模式

### 方向 C：两种路径共存

`data-collector.ts` 增加数据源适配器：

```typescript
// 环境变量控制
// LARK_DATA_SOURCE='cli' (默认) | 'api'
// CLI 模式: execSync('lark-cli ...')
// API 模式: fetch('https://open.feishu.cn/open-apis/...')
```
