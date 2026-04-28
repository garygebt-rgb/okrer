# Step 4: 风险识别 (Risk Detection)

**Inputs:** 每个 KR 的对比数据（来自 step3）：`{ keyResultId, title, baseline, current, delta }`

## 步骤

### 1. 构建 LLM 评估 prompt

构造一个 prompt 发送给 Claude，包含：

**上下文：**
> 你正在评估 OKR 双周跟进中的关键结果进度。对于每个 Key Result，评估自上次基线以来是否有实质性进展。

**输入数据：** 来自 step3 的对比表格，包括 KR 标题、描述、基线得分、当前得分和变化量。

**指令：**
> 对于每个 KR，分类为 on_track（有进展）或 no_progress（无进展）。为每个分类提供简短理由。

### 2. LLM 评估标准（指导，非硬性规则）

LLM 应考虑以下因素：

- **得分变化**：得分是上升、下降还是持平？
- **变化幅度**：变化是有意义的还是微不足道的？
- **方向性**：KR 是在向目标靠近还是远离？
- **上下文**：KR 描述暗示了什么样的进展预期？
- **时间**：自上次更新以来是否经过了合理的时间？

**重要：依赖 LLM 综合判断，不依赖固定数值标准。**

### 3. 执行 LLM 评估

- 将所有 KR 数据呈现给 Claude
- 解析响应为每个 KR 的分类
- 每个 KR 得到：`{ keyResultId, riskLevel: 'on_track' | 'no_progress', reason: string }`

### 4. 构建风险表格

输出 Markdown 表格（遵循 D-18）：

| 关键结果 | 风险等级 | 判断理由 |
|----------|----------|----------|
| {title} | {有进展/无进展} | {reason} |

风险等级：
- "有进展" (on_track) — 🟢
- "无进展" (no_progress) — 🔴

### 5. 汇总

- KR 总数：N
- 有进展：X
- 无进展：Y

### 6. 用户确认

- 询问："是否继续下一步（辅导建议）？"

## 输出

数组：`[{ keyResultId, riskLevel: 'on_track' | 'no_progress', reason: string }]`
