# CONVENTIONS.md — 代码规范分析

> 生成日期: 2026-04-23

## 编码风格

- **语言：** TypeScript
- **类型系统：** 严格模式，所有导出函数有显式参数和返回类型
- **错误处理：** try/catch 包裹 lark-cli 调用，失败时抛出带上下文的 Error
- **容错策略：** 证据采集类函数使用 `try { ... } catch { /* 继续 */ }` 模式

## 命名约定

| 类别 | 格式 | 示例 |
|------|------|------|
| 函数 | camelCase | `fetchCycles`, `searchDocuments` |
| 类型 | PascalCase | `OKRCycle`, `KeyResult` |
| 枚举 | PascalCase | `JobCategory`, `CycleStatus` |
| 常量 | UPPER_SNAKE_CASE | （少见） |
| 私有函数 | camelCase | `runLarkCommand`, `parseJsonOutput` |

## 错误处理模式

```typescript
// lark-cli 调用统一封装
function runLarkCommand(args: string): string {
  try {
    return execSync(`lark-cli ${args}`, { encoding: 'utf-8', timeout: 30000 });
  } catch (error) {
    throw new Error(`lark-cli 执行失败: ${msg}`);
  }
}

// JSON 解析统一封装
function parseJsonOutput<T>(output: string): T {
  const trimmed = output.trim();
  if (!trimmed) throw new Error('lark-cli 输出为空');
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    throw new Error(`lark-cli 输出不是有效的 JSON: ...`);
  }
}
```

## 工作流文档约定

- 每个 step*.md 文件包含：目标、输入、执行步骤、输出、错误处理、继续提示
- 步骤编号清晰，逻辑顺序明确
- 每步结束后有统一的"是否继续下一步？"提示
