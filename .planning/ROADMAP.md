# OKRskill Roadmap

> 创建时间: 2026-04-21
> 粒度: Coarse (5 phases)
> 模式: YOLO + 并行执行

## 总览

| # | Phase | 目标 | 需求映射 | 成功标准数 |
|---|-------|------|----------|-----------|
| 1 | 共享数据层 | 1/1 | Complete    | 2026-04-21 |
| 2 | Skill 1 目标设定 | 3/3 | Complete    | 2026-04-21 |
| 3 | Skill 2 过程跟进 | 3/3 | Complete | 2026-04-21 |
| 4 | Skill 3 评审评分 | 实现期末评审+用户自述文档解析+评分计算+报告生成 | REVIEW-01~06, INTEG-01~02 | 4 |
| 5 | 集成测试 | 端到端流程验证，3个Skill联调 | INTEG-03 | 3 |

---

## Phase 1: 共享数据层

**Goal:** 建立 `okr-shared/` 共享模块，为3个Skill提供统一的数据采集、类型定义、岗位权重配置、数据汇总能力，以及**岗位差异化证据采集**策略。

**需求映射:** SHARED-01 ~ SHARED-10

**成功标准:**
1. `lark-cli okr` 命令封装后能正确获取OKR周期、目标、关键结果、对齐关系数据
2. 4类岗位（研发/产品/测试/管理）权重配置正确加载，权重总和=100%
3. 数据汇总引擎能接收多源数据并输出结构化的汇总报告（含评分建议）
4. 产品经理证据采集能通过飞书CLI搜索PRD文档、会议纪要、项目关键词聊天记录
5. 研发证据采集能通过飞书CLI搜索技术文档+Git代码相关性+迭代表排期任务
6. 测试证据采集能通过飞书CLI搜索测试用例文档、测试结果、Bug提交文档

**交付物:**
- `~/.claude/skills/okr-shared/SKILL.md` — 共享模块描述
- `~/.claude/skills/okr-shared/okr-types.ts` — OKR数据类型定义
- `~/.claude/skills/okr-shared/data-collector.ts` — 飞书CLI + Git数据采集
- `~/.claude/skills/okr-shared/job-weights.ts` — 4类岗位权重配置
- `~/.claude/skills/okr-shared/scoring-engine.ts` — 数据汇总引擎
- `~/.claude/skills/okr-shared/evidence-matcher.ts` — 证据匹配器
- `~/.claude/skills/okr-shared/evidence-strategies/` — 岗位差异化证据采集策略
  - `pm-evidence.ts` — 产品经理：PRD文档识别、会议纪要、项目关键词聊天搜索
  - `dev-evidence.ts` — 研发：技术文档、Git代码相关性、迭代表排期任务
  - `qa-evidence.ts` — 测试：测试用例文档、测试结果、Bug提交文档
  - `mgmt-evidence.ts` — 管理：会议决策文档、周报

**UI hint:** no

---

## Phase 2: Skill 1 目标设定专家

**Goal:** 实现OKR目标设定专家，辅助用户设定符合SMART原则的OKR目标，检查上下级对齐，给出修改建议。

**需求映射:** GOAL-01, GOAL-02, GOAL-03, GOAL-04

**成功标准:**
1. 能获取用户往期OKR并分析（未完成目标识别、重复目标识别、设定习惯分析）
2. SMART 5维度验证输出"通过/问题/建议"格式，员工能看懂
3. 对齐检查能区分贡献型vs依赖型，并给出具体追问

**交付物:**
- `~/.claude/skills/okr-goal-setting/SKILL.md` — Skill入口文件
- `~/.claude/skills/okr-goal-setting/workflows/step1-collect-context.md` — 收集背景
- `~/.claude/skills/okr-goal-setting/workflows/step2-smart-validate.md` — SMART验证
- `~/.claude/skills/okr-goal-setting/workflows/step3-alignment-check.md` — 对齐检查
- `~/.claude/skills/okr-goal-setting/workflows/step4-generate-suggestions.md` — 修改建议
- `~/.claude/skills/okr-goal-setting/workflows/step5-user-confirm.md` — 用户确认
- `~/.claude/skills/okr-goal-setting/templates/smart-checklist.md` — SMART检查清单

**UI hint:** no

---

## Phase 3: Skill 2 过程跟进专家

**Goal:** 实现双周OKR过程跟进，采集飞书+Git数据，对比上次进度，识别风险，生成提醒和辅导建议。

**需求映射:** TRACK-01, TRACK-02, TRACK-03, TRACK-04

**成功标准:**
1. 飞书机器人定时触发机制能双周推送提醒
2. 风险识别能正确区分"有进展🟢"和"无进展🔴"两级
3. 生成的提醒消息包含进展对比、风险暴露、改进建议

**交付物:**
- `~/.claude/skills/okr-process-tracking/SKILL.md` — Skill入口文件
- `~/.claude/skills/okr-process-tracking/workflows/step1-trigger.md` — 定时触发机制
- `~/.claude/skills/okr-process-tracking/workflows/step2-data-collect.md` — 数据采集
- `~/.claude/skills/okr-process-tracking/workflows/step3-progress-compare.md` — 进展对比
- `~/.claude/skills/okr-process-tracking/workflows/step4-risk-detect.md` — 风险识别
- `~/.claude/skills/okr-process-tracking/workflows/step5-coaching-advice.md` — 辅导建议
- `~/.claude/skills/okr-process-tracking/templates/risk-alert-template.md` — 风险提醒模板

**Plans:** 3 plans

Plans:
- [ ] 03-01-PLAN.md — Skill entry (SKILL.md), type extensions (ProgressSnapshot + lastReminderTimestamp, ReminderRegistration stub), snapshot directory setup
- [ ] 03-02-PLAN.md — Workflow steps 1-3: trigger with smart skip, automated data collection, baseline comparison
- [ ] 03-03-PLAN.md — Workflow steps 4-5: LLM risk detection, dual-channel notifications, risk alert template

**UI hint:** no

---

## Phase 4: Skill 3 评审评分专家

**Goal:** 实现期末OKR评审评分，解析用户自述文档（含截图），验证证据，计算评分，生成评审报告。

**需求映射:** REVIEW-01, REVIEW-02, REVIEW-03, REVIEW-04, REVIEW-05, REVIEW-06, INTEG-01, INTEG-02

**成功标准:**
1. 能解析用户自述文档的非结构化内容（文字、表格、截图、OKR卡片）
2. 证据验证能通过链接有效性、创建者、时间范围、关键词相关性
3. 评分计算应用难度40%+努力度40%+完成度20%公式，输出分项得分
4. 评审报告包含评分结果、证据清单、优势不足、往期对比、下季度建议

**交付物:**
- `~/.claude/skills/okr-review-scoring/SKILL.md` — Skill入口文件
- `~/.claude/skills/okr-review-scoring/workflows/step1-material-collect.md` — 材料收集
- `~/.claude/skills/okr-review-scoring/workflows/step2-data-validate.md` — 数据验证
- `~/.claude/skills/okr-review-scoring/workflows/step3-evidence-match.md` — 证据匹配
- `~/.claude/skills/okr-review-scoring/workflows/step4-score-calc.md` — 评分计算
- `~/.claude/skills/okr-review-scoring/workflows/step5-doc-parse.md` — 自述文档解析
- `~/.claude/skills/okr-review-scoring/workflows/step6-report-gen.md` — 报告生成
- `~/.claude/skills/okr-review-scoring/templates/review-report-template.md` — 评审报告模板
- `~/.claude/skills/okr-review-scoring/modules/screenshot-parser.ts` — 截图解析模块
- `~/.claude/skills/okr-review-scoring/modules/doc-parser.ts` — 云文档解析模块

**UI hint:** no

---

## Phase 5: 集成测试与迭代

**Goal:** 端到端验证3个Skill的完整流程，确保数据采集、处理、输出正确。

**需求映射:** INTEG-03

**成功标准:**
1. 用真实OKR案例测试Skill 1的SMART评分准确性
2. 模拟周期数据变化，验证Skill 2的提醒生成
3. 用历史OKR数据验证Skill 3的评分合理性

**交付物:**
- 集成测试报告
- Bug修复清单
- 用户反馈收集

**UI hint:** no

---

## 需求覆盖验证

| 需求ID | Phase | 状态 |
|--------|-------|------|
| SHARED-01 | Phase 1 | ✓ |
| SHARED-02 | Phase 1 | ✓ |
| SHARED-03 | Phase 1 | ✓ |
| SHARED-04 | Phase 1 | ✓ |
| SHARED-05 | Phase 1 | ✓ |
| SHARED-06 | Phase 1 | ✓ |
| SHARED-07 | Phase 1 | ✓ |
| SHARED-08 | Phase 1 | ✓ |
| SHARED-09 | Phase 1 | ✓ |
| SHARED-10 | Phase 1 | ✓ |
| GOAL-01 | Phase 2 | ✓ |
| GOAL-02 | Phase 2 | ✓ |
| GOAL-03 | Phase 2 | ✓ |
| GOAL-04 | Phase 2 | ✓ |
| TRACK-01 | Phase 3 | ✓ |
| TRACK-02 | Phase 3 | ✓ |
| TRACK-03 | Phase 3 | ✓ |
| TRACK-04 | Phase 3 | ✓ |
| REVIEW-01 | Phase 4 | ✓ |
| REVIEW-02 | Phase 4 | ✓ |
| REVIEW-03 | Phase 4 | ✓ |
| REVIEW-04 | Phase 4 | ✓ |
| REVIEW-05 | Phase 4 | ✓ |
| REVIEW-06 | Phase 4 | ✓ |
| INTEG-01 | Phase 4 | ✓ |
| INTEG-02 | Phase 4 | ✓ |
| INTEG-03 | Phase 5 | ✓ |

**覆盖率: 27/27 = 100%**

---
*Last updated: 2026-04-21*
