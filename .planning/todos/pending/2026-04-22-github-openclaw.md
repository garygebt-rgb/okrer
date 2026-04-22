---
created: "2026-04-22T11:45:00.000Z"
title: "全面改造 GitHub 仓库为 OpenClaw 格式"
area: general
files:
  - https://github.com/garygebt-rgb/okrer
---

## Problem

GitHub 仓库 (https://github.com/garygebt-rgb/okrer) 当前是 Claude Code Skills 格式，需要全面改造为 OpenClaw（飞书智能伙伴小龙虾）格式，使其可以直接从 GitHub URL 安装使用。

## Solution

改造内容：
1. 三个 SKILL.md 的 description 改写为 OpenClaw 风格（包含 USE when / DON'T USE when）
2. 添加 metadata.openclaw 字段（声明权限、emoji 标识）
3. 目录结构调整为 OpenClaw 约定：scripts/、references/、assets/
4. 工作流 .md 文件移到 references/ 目录（作为参考文档加载）
5. 创建根目录 README.md 说明如何安装使用
6. 移除 Claude Code 特定的引用（如 ~/.claude/skills/ 路径）
7. 添加所需的待办 items 中的能力：
   - 自动识别用户/主管身份
   - 上级平级目标关联纠偏
   - 飞书权限声明
