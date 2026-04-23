# STACK.md — 技术栈分析

> 生成日期: 2026-04-23

## 语言与运行时

| 项目 | 值 |
|------|-----|
| 语言 | TypeScript |
| 运行时 | Node.js |
| 模块系统 | ES Modules |
| 类型检查 | TypeScript 严格模式 |

## 核心依赖

| 依赖 | 用途 |
|------|------|
| `child_process` (Node.js 内置) | 执行 `lark-cli` 命令 |
| `fs`, `path`, `os` (Node.js 内置) | 文件/路径/系统操作 |
| `fetch` (Node.js 内置) | GitLab API HTTP 请求 |

## 项目结构

```
okrskill/
├── okr-shared/                    # 共享数据层
│   ├── okr-types.ts               # 类型定义
│   ├── data-collector.ts          # 飞书CLI + Git 数据采集
│   ├── job-weights.ts             # 岗位权重配置
│   ├── scoring-engine.ts          # 评分引擎
│   ├── evidence-matcher.ts        # 证据匹配器
│   └── evidence-strategies/       # 4类岗位证据策略
├── okr-goal-setting/              # Skill 1: 目标设定
│   ├── SKILL.md                   # 入口定义
│   ├── workflows/                 # 5步工作流
│   └── templates/                 # SMART检查清单
├── okr-process-tracking/          # Skill 2: 过程跟进
│   ├── SKILL.md                   # 入口定义
│   ├── workflows/                 # 5步工作流
│   └── templates/                 # 风险提醒模板
└── okr-review-scoring/            # Skill 3: 评审评分
    ├── SKILL.md                   # 入口定义
    ├── workflows/                 # 6步工作流
    └── templates/                 # 评审报告模板
```

## 外部工具依赖

| 工具 | 用途 | 安装方式 |
|------|------|----------|
| `lark-cli` | 飞书开放平台 CLI | npm 全局安装 |
| `git` | 本地代码提交分析 | 系统自带 |

## 已安装位置

Skills 实际安装在 `~/.claude/skills/` 目录下，当前仓库 `/Users/garyge/okrskill` 是源码仓库。
