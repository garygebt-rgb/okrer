# OKRskill 集成测试 Bug Fix 列表

**来源:** Phase 5 Plan 01 集成测试执行
**日期:** 2026-04-22

---

## Bug 列表

| Bug ID | Skill | 步骤 | Severity | 描述 | Fix Priority | Suggested Fix |
|--------|-------|------|----------|------|--------------|---------------|
| BUG-01 | All | Step 1 | ~~HIGH~~ FIXED | lark-cli 缺少 `okr:okr.period:readonly` 权限 | ✅ 已授权 | 用户在飞书开放平台开通权限 |
| BUG-02 | Skill 2 | Step 5 | ~~MEDIUM~~ FIXED | managerId 未配置时提示不明显 | ✅ 已修复 | 添加明确的主管端消息未发送提示和配置引导 |
| BUG-03 | Skill 3 | Step 2 | ~~LOW~~ FIXED | 人效/质量数据不可用无引导 | ✅ 已修复 | 添加数据补充建议和引导提示 |
| BUG-04 | Skill 1 | Step 2 | ~~LOW~~ FIXED | SMART 评分精度丢失 | ✅ 已修复 | 改为 `toFixed(1)` 保留一位小数 |

---

## 严重程度汇总

| Severity | 数量 |
|----------|------|
| CRITICAL | 0 |
| HIGH | 1 |
| MEDIUM | 1 |
| LOW | 2 |

**总计:** 4 个 Bug

---

## 修复工作量估算

### 快速修复 (< 30min)
- BUG-04: SMART 评分显示精度 — 修改工作流文件中的分数展示逻辑

### 中等修复 (< 2h)
- BUG-02: managerId 未配置提示 — 修改 step5-coaching-advice.md 中的用户提示
- BUG-03: 数据不可用引导 — 修改 step2-data-validate.md 中的降级提示

### 外部依赖
- BUG-01: lark-cli 授权 — 非代码问题，需要用户在飞书开放平台配置权限

---

## 修复执行计划

**建议修复顺序:**

1. **BUG-01 (外部)** — 首先修复 lark-cli 授权，这是其他所有测试的前提
   - 依赖: 飞书开放平台权限配置
   - 预计时间: 取决于授权流程

2. **BUG-02 (Medium)** — 修复 managerId 未配置时的用户提示
   - 文件: `okr-process-tracking/workflows/step5-coaching-advice.md`
   - 修改: 添加明确的主管端消息未发送提示

3. **BUG-03 (Low)** — 添加数据不可用引导提示
   - 文件: `okr-review-scoring/workflows/step2-data-validate.md`
   - 修改: 在"不可用"记录后添加引导提示

4. **BUG-04 (Low)** — 修复 SMART 评分显示精度
   - 文件: `okr-goal-setting/workflows/step2-smart-validate.md`
   - 修改: 将 `round(score)` 改为保留一位小数

**注意:** BUG-02、03、04 可以并行修复。BUG-01 修复后需要重新执行完整测试验证。
