# ARCHITECTURE.md — 架构分析

> 生成日期: 2026-04-23

## 架构模式

**分层架构 + 工作流驱动**

```
┌─────────────────────────────────────────────┐
│  Skills (okr-goal-setting / process-tracking / review-scoring) │
│  SKILL.md + workflows/step*.md               │
├─────────────────────────────────────────────┤
│  Shared Layer (okr-shared)                   │
│  ├── okr-types.ts      (类型层)               │
│  ├── data-collector.ts (数据采集层)           │
│  ├── job-weights.ts    (配置层)               │
│  ├── scoring-engine.ts (业务逻辑层)           │
│  ├── evidence-matcher.ts (业务逻辑层)         │
│  └── evidence-strategies/*.ts (策略层)        │
├─────────────────────────────────────────────┤
│  External Systems                            │
│  ├── lark-cli (飞书开放平台 CLI)              │
│  ├── git (本地版本控制)                       │
│  └── GitLab API (远程代码托管)                │
└─────────────────────────────────────────────┘
```

## 数据流

```
用户触发 Skill
    │
    ▼
工作流编排 (step*.md)
    │
    ▼
数据采集 (data-collector.ts → lark-cli / git)
    │
    ▼
数据处理 (scoring-engine / evidence-matcher / evidence-strategies)
    │
    ▼
输出 (纯文本 + Markdown 表格)
```

## 关键设计决策

1. **用户主动逐步执行模式**：每步完成后询问用户是否继续
2. **纯文本 + Markdown 输出**：不依赖飞书卡片模板
3. **评分仅为建议**：最终评分由人类评审决定
4. **岗位差异化**：4 类岗位（研发/产品/测试/管理）有不同的证据采集策略和权重
5. **数据降级策略**：某个数据源不可用时继续执行，标注为"不可用"
