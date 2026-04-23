# STRUCTURE.md — 目录结构分析

> 生成日期: 2026-04-23

## 根目录

```
okrskill/
├── CLAUDE.md                      # 项目入口文档
├── README.md                      # 项目 README
├── USAGE-GUIDE.md                 # 使用指南
├── .planning/                     # 规划目录
│   ├── STATE.md                   # 当前状态
│   ├── ROADMAP.md                 # 路线图
│   ├── REQUIREMENTS.md            # 需求
│   ├── PROJECT.md                 # 项目上下文
│   ├── phases/                    # Phase 规划
│   ├── todos/pending/             # 待办事项
│   ├── codebase/                  # 代码映射 (本次生成)
│   └── research/                  # 研究文档
├── okr-shared/                    # 共享模块
├── okr-goal-setting/              # Skill 1
├── okr-process-tracking/          # Skill 2
└── okr-review-scoring/            # Skill 3
```

## 每个 Skill 的内部结构

```
<skill-name>/
├── SKILL.md                       # 入口定义（描述/场景/工作流/依赖/权限）
├── workflows/                     # 工作流步骤定义
│   ├── step1-*.md
│   ├── step2-*.md
│   └── ...
├── templates/                     # 输出模板
│   └── *-template.md
└── test-cases/                    # E2E 测试日志
    └── skill*-e2e-test-log.md
```

## 飞书操作相关的关键文件

| 文件 | 职责 | 飞书操作覆盖 |
|------|------|-------------|
| `okr-shared/data-collector.ts` | CLI 封装 | OKR/文档/消息/Wiki/日历/任务 |
| `okr-shared/evidence-strategies/dev-evidence.ts` | 研发证据 | 文档搜索 + 任务列表 |
| `okr-shared/evidence-strategies/pm-evidence.ts` | 产品证据 | 文档搜索 + 消息搜索 |
| `okr-shared/evidence-strategies/qa-evidence.ts` | 测试证据 | 文档搜索 |
| `okr-shared/evidence-strategies/mgmt-evidence.ts` | 管理证据 | 文档搜索 |
| 各 Skill 的 `workflows/step*.md` | 工作流步骤 | 描述如何调用 data-collector |
