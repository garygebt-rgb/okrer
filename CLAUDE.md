# OKRskill - OKR绩效管理Skill系统

## Project

3个Claude Code Skills覆盖OKR全生命周期：目标设定 → 过程跟进 → 期末评审。服务于约150人技术部门。

## Quick Start

```bash
# 项目位置: .planning/
# Skills安装位置: ~/.claude/skills/
```

## Architecture

```
~/.claude/skills/
├── okr-shared/              # 共享模块 (Phase 1)
├── okr-goal-setting/        # Skill 1: 目标设定 (Phase 2)
├── okr-process-tracking/    # Skill 2: 过程跟进 (Phase 3)
└── okr-review-scoring/      # Skill 3: 评审评分 (Phase 4)
```

## Data Sources

| Source | Command | Purpose |
|--------|---------|---------|
| 飞书OKR | `lark-cli okr` | OKR周期/目标/对齐/指标 |
| 飞书文档 | `lark-cli docs +fetch` | 用户自述文档解析 |
| 飞书Wiki | `lark-cli wiki` | 质量管理数据 |
| Git | 本地IDE配置 | 代码提交记录 |
| 人效数据 | PMO云文档 | 效率指标参考 |

## Key Decisions

- OKR占KPI的20%，Skill不计算完整KPI评分
- 评分体系：难度40% + 努力度40% + 完成度20%
- 风险分级：2级（有进展🟢 / 无进展🔴）
- SMART：5维度，输出"通过/问题/建议"
- 岗位：4类（研发/产品/测试/管理）

## Development Workflow

1. `/gsd-plan-phase N` — 规划Phase N
2. `/gsd-execute-phase N` — 执行Phase N
3. `/gsd-verify-work N` — 验证Phase N交付

## Planning Files

- `.planning/ROADMAP.md` — 5阶段路线图
- `.planning/REQUIREMENTS.md` — 23条需求
- `.planning/PROJECT.md` — 项目上下文
- `.planning/STATE.md` — 当前状态
