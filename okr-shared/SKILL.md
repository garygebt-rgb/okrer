---
name: okr-shared
description: >
  Shared data layer for OKR lifecycle skills — provides unified type definitions,
  data collection interfaces, job weight configurations, scoring engine, and
  evidence matching strategies. Not a standalone skill; used internally by
  okr-goal-setting, okr-process-tracking, and okr-review-scoring.
version: 1.1.0
---

# OKR Shared — 共享数据层

OKR 绩效管理系统的共享基础模块，提供统一的数据采集接口、类型系统、岗位权重配置和差异化证据采集策略。

## 模块结构

```
okr-shared/
├── SKILL.md                    # 本文件 - 入口文档
├── okr-types.ts                # 核心类型定义
├── data-collector.ts           # 数据采集接口
├── job-weights.ts              # 4类岗位权重配置
├── scoring-engine.ts           # 数据汇总引擎
├── evidence-matcher.ts         # 证据匹配器
└── evidence-strategies/
    ├── pm-evidence.ts          # 产品经理证据采集
    ├── dev-evidence.ts         # 研发证据采集
    ├── qa-evidence.ts          # 测试证据采集
    └── mgmt-evidence.ts        # 管理证据采集
```

## 核心 API

### 数据采集

```typescript
// 飞书 OKR 数据
import {
  fetchCycles,
  fetchCycleDetail,
  fetchObjectives,
  fetchKeyResults,
  fetchAlignments,
  fetchIndicators,
  searchDocuments,
  searchMessages,
} from './data-collector';

// Git 数据
import {
  detectGitConfig,
  fetchGitCommits,
  fetchGitLabMRs,
} from './data-collector';
```

### 岗位权重

```typescript
import { getJobWeights, getAllJobWeights } from './job-weights';
import { JobCategory } from './okr-types';

// 获取研发岗位权重
const devWeights = getJobWeights(JobCategory.DEV);
// 线上bug 30%、代码评审 30%、饱和度 20%、SIT bug 20%
```

### 数据汇总引擎

```typescript
import { ScoringEngine } from './scoring-engine';

const engine = new ScoringEngine();
const report = engine.generateReport({
  userId: 'user-123',
  jobCategory: JobCategory.DEV,
  cycleId: 'cycle-q1-2026',
  progressData: [...],
  evidenceList: [...],
});
// report.overallScore → 评分建议
```

### 证据匹配

```typescript
import { EvidenceMatcher } from './evidence-matcher';

const matcher = new EvidenceMatcher();
const result = matcher.matchEvidence(evidence, {
  krDescription: '提升系统稳定性...',
  krTitle: '稳定性提升',
  timeRange: { start: '2026-01-01', end: '2026-03-31' },
  expectedCreator: 'zhangsan',
  keywords: ['稳定性', 'SLA'],
});
// result.matchScore → 匹配度 0-1
// result.verificationStatus → 'pass' | 'fail' | 'pending'
```

### 岗位证据采集

```typescript
import { collectPMEvidence } from './evidence-strategies/pm-evidence';
import { collectDevEvidence } from './evidence-strategies/dev-evidence';
import { collectQAEvidence } from './evidence-strategies/qa-evidence';
import { collectMgmtEvidence } from './evidence-strategies/mgmt-evidence';
```

## 4类岗位证据策略

| 岗位 | 证据类型 | 采集策略 |
|------|----------|----------|
| 产品经理 | PRD + 会议纪要 + 聊天记录 | 搜索 PRD 文档、会议纪要、项目关键词聊天 |
| 研发 | 技术文档 + Git + 任务交付 | 技术文档搜索 + Git 提交分析 + 任务完成率 |
| 测试 | 测试用例 + Bug 统计 + 测试结果 | 测试用例文档 + Bug 提交文档 + 测试结果 |
| 管理 | 会议决策 + 周报 | 决策文档 + 周报摘要 |

## 评分体系

技术中心标准：难度 40% + 努力度 40% + 完成度 20%

注意：本模块只输出评分建议，最终评分由人类管理者完成。

## 数据来源

| 数据源 | 获取方式 | 用途 |
|--------|----------|------|
| 飞书OKR | 平台OKR API | OKR周期/目标/关键结果/对齐 |
| 飞书文档 | 平台文档API | PRD/技术文档/会议纪要 |
| 飞书消息 | 平台消息API | 项目关键词聊天记录 |
| 飞书Wiki | 平台Wiki API | 质量管理数据 |
| Git本地 | `git log` | 代码提交记录 |
| GitLab API | HTTP API | PR/MR 列表 |

### 平台适配

| 平台 | OKR数据 | 文档数据 | 消息数据 | Git分析 |
|------|---------|----------|----------|---------|
| Claude Code | `lark-cli okr` | `lark-cli docs` | `lark-cli im` | 本地 git log |
| OpenClaw（飞书） | 飞书 API 直调 | 飞书文档 API | 飞书消息 API | GitLab API |
