---
created: "2026-04-22T11:41:09.226Z"
title: "Skill 1 OpenClaw适配：自动识别用户+上级平级目标关联纠偏"
area: general
files:
  - ~/.claude/skills/okr-goal-setting/SKILL.md
  - ~/.claude/skills/okr-goal-setting/workflows/step1-collect-context.md
  - ~/.claude/skills/okr-goal-setting/workflows/step2-smart-validate.md
  - ~/.claude/skills/okr-goal-setting/workflows/step3-alignment-check.md
---

## Problem

两项重要调整需要在 Skill 1（目标设定）的 OpenClaw 适配中实现：

1. **安装环境默认是飞书智能伙伴版小龙虾**：
   - LLM 可以直接找到用户是谁、用户的 openid、用户主管的 openid 等
   - 不需要用户安装飞书 CLI
   - 需要什么飞书权限直接写在 SKILL.md 里，让智能伙伴去授权即可

2. **上级/平级同期目标关联纠偏（必须做）**：
   - Step 3 对齐检查中，需要找到上级、平级的同期目标
   - 如果上级/平级目标中提到需要用户完成或协同的目标，要在 SMART 验证的 Relevant（相关性）维度里提及和纠偏
   - 例如：主管的 OKR 里写了"张三负责 XX 项目"，但张三自己的目标里没有这个，就需要提醒对齐

## Solution

1. SKILL.md 中添加权限声明（OpenClaw metadata 格式），列出所需飞书权限：
   - `okr:okr.period:readonly` — 读取 OKR 周期
   - `okr:okr.content:readonly` — 读取 OKR 内容
   - `contact:user.base:readonly` — 获取用户信息（识别主管）
   - `contact:user.employee_id:readonly` — 获取组织架构关系

2. Step 1（收集背景）改造：
   - 去掉"用户提供 userID"的要求
   - 改为 LLM 通过飞书 API 自动识别当前用户身份
   - 自动获取主管 openid（通过组织架构）

3. Step 3（对齐检查）改造：
   - 获取上级的同期 OKR 目标
   - 获取平级同事的同期 OKR 目标
   - 对比检查：上级/平级目标中提到需要该用户完成或协同的内容，是否出现在用户自己的目标中
   - 输出纠偏建议

4. Step 2（SMART 验证）的 Relevant 维度改造：
   - 在相关性评估中引入上级/平级目标的对比结果
   - 如果上级目标中分配了任务但该用户目标中没有，标记为"问题"并给出改写示例
