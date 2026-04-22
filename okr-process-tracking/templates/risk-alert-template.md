# 风险提醒消息模板

## 员工端提醒消息模板（友好语气）

```
你好，{employeeName}！

你的 OKR 双周提醒（周期：{cycleName}）。系统检测到以下进展：

{krTable}
| 关键结果 | 上次得分 | 当前得分 | 状态 |
|----------|----------|----------|------|
{krList}

{progressSummary}

建议：花 5 分钟记录近期进展。如有任何困难，请及时与主管沟通。
```

## 主管端汇报消息模板（正式语气）

```
{employeeName} OKR 双周进度汇报

周期：{cycleName}
统计：{progressSummary}

详细进展：
{krList}

{riskSummary}

建议：{suggestions}
```

## 占位符定义

| 占位符 | 说明 |
|--------|------|
| `{employeeName}` | 员工显示名称 |
| `{cycleName}` | OKR 周期名称（如 "2026 Q2"） |
| `{krTable}` | Markdown 表格表头 |
| `{krList}` | 每 KR 行的表格内容 |
| `{progressSummary}` | "KR 总数 N | 有进展 X | 无进展 Y" |
| `{riskSummary}` | 无进展 KR 列表及理由 |
| `{suggestions}` | AI 生成的辅导建议 |

## 状态显示

- `on_track` → "有进展 🟢"
- `no_progress` → "无进展 🔴"
