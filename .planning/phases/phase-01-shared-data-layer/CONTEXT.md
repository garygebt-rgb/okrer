# Phase 1 Context: 共享数据层

## 关键决策

1. **数据采集通过 lark-cli 执行** — 不直接调用飞书API，而是通过 `lark-cli` CLI工具执行命令并解析输出
2. **TypeScript 实现** — Skills 使用 TypeScript，运行在 Node.js 环境
3. **证据策略独立文件** — 每个岗位的证据采集策略放在独立的 `evidence-strategies/` 子目录中
4. **数据汇总引擎不做最终评分** — 只提供评分建议供人类参考，最终评分由人类完成

## 技术约束

- `lark-cli` 命令返回的是结构化 JSON/文本，需要解析
- 飞书OKR API 返回 score(0-1) 而不是 progress 百分比
- Git配置需要从本地IDE配置文件读取（VS Code .vscode/settings.json, JetBrains .idea/）
- 截图解析需要视觉模型能力（不在Phase 1范围）

## 已有参考

- 现有 `okr-shared/` 模块骨架已在之前会话中创建：
  - `~/.claude/skills/okr-shared/SKILL.md`
  - `~/.claude/skills/okr-shared/okr-types.ts`
  - `~/.claude/skills/okr-shared/data-collector.ts`
  - `~/.claude/skills/okr-shared/job-weights.ts`

这些文件需要基于本计划扩展和完善。

## 验证方法

- 每个 data-collector 函数可通过 `lark-cli` 实际命令测试
- job-weights 通过权重总和=100% 单元测试验证
- scoring-engine 通过模拟输入数据验证输出格式

---
*Created: 2026-04-21*
