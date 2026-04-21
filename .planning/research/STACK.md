# OKRskill 技术栈研究

## Claude Code Skills 架构

**目录结构模式：**
```
~/.claude/skills/
├── okr-shared/          # 共享模块
│   ├── SKILL.md         # 模块描述和使用说明
│   ├── okr-types.ts     # TypeScript类型定义
│   ├── data-collector.ts # 数据采集逻辑
│   ├── job-weights.ts   # 岗位权重配置
│   └── scoring-engine.ts # 数据汇总引擎
├── okr-goal-setting/    # Skill 1
│   ├── SKILL.md
│   ├── workflows/       # 工作流程步骤
│   └── templates/       # 输出模板
```

**最佳实践：**
- SKILL.md 是Skill的核心入口，描述触发词、步骤、输出格式
- workflows/ 目录存放每个步骤的详细指令
- templates/ 存放输出模板文件
- 跨Skill共享通过 `okr-shared/` 模块实现

## Lark CLI 集成

**已验证命令：**
- `lark-cli okr +cycle-list` - OKR周期列表
- `lark-cli okr +cycle-detail` - OKR详情
- `lark-cli okr objectives get` - 目标详情
- `lark-cli okr key_results` - KR详情
- `lark-cli okr alignments` - 对齐关系
- `lark-cli okr indicators` - 量化指标
- `lark-cli docs +fetch` - 文档内容
- `lark-cli wiki nodes list` - 知识库节点

**注意事项：**
- 需要正确的飞书权限配置
- OKR数据返回score(0-1)而非progress百分比
- 文档可能是非结构化内容（含截图、表格）

## 证据匹配模式

**挑战：** 用户自述文档是非结构化的（文字+截图+表格）
**策略：**
1. 提取结构化数据（嵌入的OKR卡片score/weight）
2. 关键词匹配（与KR描述的关键词相关性）
3. 截图内容通过视觉模型解析
4. 时间范围验证（材料必须在OKR周期内）

## 数据汇总模式

scoring-engine提供数据汇总（非最终评分）：
- 聚合多源数据（OKR进度、人效指标、质量数据、Git活动）
- 生成评分建议供人类参考
- 按岗位差异化权重（研发/产品/测试/管理）
