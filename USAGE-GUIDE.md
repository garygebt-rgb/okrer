# OKRskill 使用指南

> v1.0 — 2026-04-22

## 快速开始

OKRskill 是 3 个 Claude Code Skills，覆盖 OKR 全生命周期。在 Claude Code 中直接调用即可使用。

### 前提条件

1. **安装 lark-cli** 并完成飞书授权：
   ```bash
   lark-cli auth login
   ```
2. **开通飞书 OKR 权限**（首次使用）：
   - 确保已开通 `okr:okr.period:readonly` 和 `okr:okr.content:readonly`
3. **配置主管 ID**（Skill 2 需要）：
   - 编辑 `~/.claude/skills/okr-process-tracking/config.json`，填入 `managerId`

---

## Skill 1: okr-goal-setting（目标设定专家）

**什么时候用：** 季度初设定 OKR 目标时，帮你检查目标是否符合 SMART 原则、是否与上级目标对齐。

**用法：** 在 Claude Code 中输入：

```
/okr-goal-setting
```

**工作流（5步）：**

| 步骤 | 做什么 | 你需要提供 |
|------|--------|------------|
| 1. 收集背景 | 自动拉取你历史 OKR | 你的飞书 userID |
| 2. SMART 验证 | 5维度检查你的目标草稿 | 目标标题+描述 |
| 3. 对齐检查 | 检查与上级/平级的对齐关系 | 无（自动检查） |
| 4. 修改建议 | 综合给出改写建议 | 无 |
| 5. 用户确认 | 你确认后再"发布" | 确认或修改 |

**示例对话：**
```
我需要用 okr-goal-setting 设定本季度 OKR
我的 userID 是: ou_d124a127a77e839fe7f0c8f96f707132

我的目标草稿：
标题：优化 CI/CD 流程
描述：提升构建速度和部署频率
```

**输出：** SMART 评分（如 3.5/5）+ 每个维度的"通过/问题/建议" + 具体改写示例

---

## Skill 2: okr-process-tracking（过程跟进专家）

**什么时候用：** 双周定期检查 OKR 进度，自动识别风险，给员工和主管发送提醒消息。

**用法：**

```
/okr-process-tracking
```

**工作流（5步）：**

| 步骤 | 做什么 | 你需要提供 |
|------|--------|------------|
| 1. 触发检查 | 验证认证，识别当前周期 | 飞书 userID |
| 2. 数据采集 | 自动拉取 OKR 系统数据 | 无 |
| 3. 进展对比 | 与上次基线对比 | 无 |
| 4. 风险识别 | LLM 判断各 KR 风险 | 无 |
| 5. 辅导建议 | 生成提醒消息，预览后发送 | 确认发送 |

**示例对话：**
```
我需要用 okr-process-tracking 跟进本季度 OKR 进度
我的 userID 是: ou_d124a127a77e839fe7f0c8f96f707132
```

**输出：** 每个 KR 的进展对比表 + 风险等级（🟢有进展 / 🔴无进展）+ 员工/主管提醒消息预览

---

## Skill 3: okr-review-scoring（评审评分专家）

**什么时候用：** 期末评审 OKR 完成情况，需要收集证据、验证数据、计算评分、生成评审报告。

**用法：**

```
/okr-review-scoring
```

**工作流（6步）：**

| 步骤 | 做什么 | 你需要提供 |
|------|--------|------------|
| 1. 材料收集 | 获取自述文档和案例链接 | 飞书文档链接 |
| 2. 数据验证 | 自动采集飞书/Git/人效数据 | 无（可补充链接） |
| 3. 证据匹配 | 验证链接有效性 | 无 |
| 4. 评分计算 | 难度40%+努力度40%+完成度20% | 无 |
| 5. 自述文档解析 | 深度解析文档和截图 | 无 |
| 6. 报告生成 | 输出完整评审报告 | 无 |

**示例对话：**
```
我需要对本期 OKR 进行期末评审
我的自述文档链接: https://xxx.feishu.cn/docx/xxxxx
我的 userID 是: ou_d124a127a77e839fe7f0c8f96f707132
```

**输出：**
- 评分结果（如：总分 52/100，难度65、努力度30、完成度70）
- 声称 vs 实际对比表
- 证据清单
- 优势与不足
- 往期对比
- 下季度建议

---

## 评分体系说明

**总分 = 难度×40% + 努力度×40% + 完成度×20%**

| 维度 | 权重 | 评估方式 |
|------|------|----------|
| 难度 | 40% | LLM 综合评估（技术复杂度、资源投入、创新性等） |
| 努力度 | 40% | 客观证据（证据数量、更新频率、Git 活跃度） |
| 完成度 | 20% | 飞书 OKR 系统 KR 最终 score 值（0-1 范围） |

> **重要：** 所有评分均为**建议评分**，最终评分由人类评审决定。

---

## 配置文件

### 主管 ID 配置（Skill 2 需要）

编辑 `~/.claude/skills/okr-process-tracking/config.json`：

```json
{
  "managerId": "主管的飞书 userID"
}
```

如未配置，Skill 2 会跳过主管端消息发送，仅发送员工端提醒。

### 快照存储位置

Skill 2 的进度快照存储在：`~/.claude/skills/okr-process-tracking/snapshots/`

格式：`{userId}-{cycleId}.json`

### 评审报告存储位置

Skill 3 的报告存储在：`~/.claude/skills/okr-review-scoring/reports/`

---

## 常见问题

### Q: lark-cli 认证失败怎么办？
```bash
lark-cli auth login --scope "okr:okr.period:readonly,okr:okr.content:readonly,im:message"
```

### Q: Git 数据获取不到？
Skill 会自动检测本地 IDE Git 配置。如果失败，会提示你提供 Git 仓库 URL。

### Q: 可以跳过某一步吗？
可以。每一步完成后都会问"是否继续下一步？"，你可以选择跳过。

### Q: 评分结果准确吗？
评分仅为建议，基于客观数据和 LLM 分析。最终评分应由人类评审决定。

### Q: 支持哪些岗位类型？
4类：研发、产品、测试、管理。Skill 会自动从 OKR 数据中识别。

---

## 技术架构

```
~/.claude/skills/
├── okr-shared/              # 共享模块
│   ├── okr-types.ts         # 类型定义
│   ├── data-collector.ts    # 数据采集
│   ├── scoring-engine.ts    # 评分引擎
│   ├── evidence-matcher.ts  # 证据匹配
│   ├── job-weights.ts       # 岗位权重
│   └── evidence-strategies/ # 岗位差异化策略
├── okr-goal-setting/        # Skill 1
│   ├── SKILL.md             # 入口
│   ├── workflows/           # 5步工作流
│   └── templates/           # 检查清单
├── okr-process-tracking/    # Skill 2
│   ├── SKILL.md
│   ├── workflows/           # 5步工作流
│   ├── config.json          # 配置
│   ├── snapshots/           # 快照存储
│   └── templates/           # 风险提醒模板
└── okr-review-scoring/      # Skill 3
    ├── SKILL.md
    ├── workflows/           # 6步工作流
    ├── modules/             # 解析模块
    ├── templates/           # 报告模板
    └── reports/             # 报告存储
```

---

## 数据来源

| 数据源 | 用途 | 获取方式 |
|--------|------|----------|
| 飞书 OKR | OKR 数据 | `lark-cli okr` |
| 飞书文档 | 自述文档 | `lark-cli docs +fetch` |
| Git | 代码提交 | 本地 IDE 配置检测 |
| 飞书 Wiki | 质量数据 | `lark-cli wiki` |
| 人效数据 | PMO 云文档 | `lark-cli docs +fetch` |

---

## 范围说明

- **OKR 占 KPI 的 20%**（主观任务部分），Skill 不计算完整 KPI 评分
- **价值观评分**由人类主管直接评分
- **岗位**简化为 4 类（研发/产品/测试/管理）
- **风险分级**仅 2 级（有进展🟢 / 无进展🔴）
