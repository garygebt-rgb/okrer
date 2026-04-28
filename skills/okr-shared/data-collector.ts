// 数据采集模块
// 封装飞书CLI (lark-cli) 和 Git 数据源为统一的 TypeScript 接口

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  OKRCycle,
  Objective,
  KeyResult,
  Alignment,
  Indicator,
  GitActivity,
  DataFilter,
  CycleStatus,
} from './okr-types';

// ============================================================
// 飞书CLI 数据采集团装
// ============================================================

/** 飞书CLI命令执行器 */
function runLarkCommand(args: string): string {
  try {
    return execSync(`lark-cli ${args}`, {
      encoding: 'utf-8',
      timeout: 30000,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    throw new Error(`lark-cli 执行失败: ${msg}`);
  }
}

/** 解析JSON输出 */
function parseJsonOutput<T>(output: string): T {
  const trimmed = output.trim();
  if (!trimmed) {
    throw new Error('lark-cli 输出为空');
  }
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    throw new Error(`lark-cli 输出不是有效的 JSON: ${trimmed.slice(0, 200)}`);
  }
}

/**
 * 获取OKR周期列表
 */
export async function fetchCycles(
  userId: string,
  timeRange?: { start: string; end: string }
): Promise<OKRCycle[]> {
  const args = ['okr', 'cycle-list'];
  if (userId) args.push('--user-id', userId);
  if (timeRange) {
    args.push('--start', timeRange.start, '--end', timeRange.end);
  }

  const raw = runLarkCommand(args.join(' '));
  const cycles = parseJsonOutput<Array<{
    cycle_id: string;
    name: string;
    start_date: string;
    end_date: string;
    status: string;
  }>>(raw);

  return cycles.map((c) => ({
    cycleId: c.cycle_id,
    name: c.name,
    startDate: c.start_date,
    endDate: c.end_date,
    status: mapCycleStatus(c.status),
    objectives: [],
  }));
}

/**
 * 获取OKR周期详情（包含目标列表）
 */
export async function fetchCycleDetail(cycleId: string): Promise<OKRCycle> {
  const raw = runLarkCommand(`okr cycle-detail --cycle-id "${cycleId}"`);
  const detail = parseJsonOutput<{
    cycle_id: string;
    name: string;
    start_date: string;
    end_date: string;
    status: string;
    objectives: Array<{
      objective_id: string;
      title: string;
      description: string;
      weight: number;
      level: string;
      score: number;
    }>;
  }>(raw);

  return {
    cycleId: detail.cycle_id,
    name: detail.name,
    startDate: detail.start_date,
    endDate: detail.end_date,
    status: mapCycleStatus(detail.status),
    objectives: detail.objectives.map((o) => ({
      objectiveId: o.objective_id,
      title: o.title,
      description: o.description,
      weight: o.weight,
      level: o.level as 'A' | 'B',
      score: o.score,
      keyResults: [],
      alignments: [],
    })),
  };
}

/**
 * 获取目标详情
 */
export async function fetchObjectives(
  objectiveId: string
): Promise<Objective> {
  const raw = runLarkCommand(`okr objectives get --id "${objectiveId}"`);
  const obj = parseJsonOutput<{
    objective_id: string;
    title: string;
    description: string;
    weight: number;
    level: string;
    score: number;
  }>(raw);

  return {
    objectiveId: obj.objective_id,
    title: obj.title,
    description: obj.description,
    weight: obj.weight,
    level: obj.level as 'A' | 'B',
    score: obj.score,
    keyResults: [],
    alignments: [],
  };
}

/**
 * 获取关键结果
 */
export async function fetchKeyResults(
  keyResultId: string
): Promise<KeyResult> {
  const raw = runLarkCommand(`okr key_results --id "${keyResultId}"`);
  const kr = parseJsonOutput<{
    key_result_id: string;
    title: string;
    description: string;
    weight: number;
    score: number;
  }>(raw);

  return {
    keyResultId: kr.key_result_id,
    title: kr.title,
    description: kr.description,
    weight: kr.weight,
    score: kr.score,
    indicators: [],
  };
}

/**
 * 获取对齐关系
 */
export async function fetchAlignments(
  objectiveId: string
): Promise<Alignment[]> {
  const raw = runLarkCommand(`okr alignments --objective-id "${objectiveId}"`);
  const alignments = parseJsonOutput<Array<{
    alignment_id: string;
    type: string;
    target_objective_id: string;
    target_objective_title: string;
    target_owner_name: string;
  }>>(raw);

  return alignments.map((a) => ({
    alignmentId: a.alignment_id,
    type: a.type as 'contributing' | 'dependent',
    targetObjectiveId: a.target_objective_id,
    targetObjectiveTitle: a.target_objective_title,
    targetOwnerName: a.target_owner_name,
  }));
}

/**
 * 获取指标数据
 */
export async function fetchIndicators(
  keyResultId: string
): Promise<Indicator[]> {
  const raw = runLarkCommand(`okr indicators --key-result-id "${keyResultId}"`);
  const indicators = parseJsonOutput<Array<{
    indicator_id: string;
    name: string;
    start_value: number;
    current_value: number;
    target_value: number;
    unit: string;
  }>>(raw);

  return indicators.map((i) => ({
    indicatorId: i.indicator_id,
    name: i.name,
    startValue: i.start_value,
    currentValue: i.current_value,
    targetValue: i.target_value,
    unit: i.unit,
  }));
}

/**
 * 获取飞书文档内容
 */
export async function fetchDocument(docToken: string): Promise<string> {
  const raw = runLarkCommand(`docs fetch --token "${docToken}"`);
  return raw.trim();
}

/**
 * 搜索飞书文档
 */
export async function searchDocuments(
  query: string,
  filters?: { owner?: string; type?: string }
): Promise<Array<{ token: string; title: string; url: string; owner: string }>> {
  const args = ['docs', 'search', '--query', `"${query}"`];
  if (filters?.owner) args.push('--owner', filters.owner);
  if (filters?.type) args.push('--type', filters.type);

  const raw = runLarkCommand(args.join(' '));
  return parseJsonOutput<Array<{
    token: string;
    title: string;
    url: string;
    owner: string;
  }>>(raw);
}

/**
 * 获取Wiki节点列表
 */
export async function fetchWikiNodes(
  spaceId: string,
  parentNodeToken?: string
): Promise<Array<{ nodeToken: string; title: string; url: string }>> {
  const args = ['wiki', 'nodes', 'list', '--space-id', spaceId];
  if (parentNodeToken) args.push('--parent-token', parentNodeToken);

  const raw = runLarkCommand(args.join(' '));
  return parseJsonOutput<Array<{
    node_token: string;
    title: string;
    url: string;
  }>>(raw).map((n) => ({
    nodeToken: n.node_token,
    title: n.title,
    url: n.url,
  }));
}

/**
 * 搜索飞书消息
 */
export async function searchMessages(
  query: string,
  userId: string
): Promise<Array<{ messageId: string; content: string; sender: string; timestamp: string }>> {
  const raw = runLarkCommand(
    `im messages-search --query "${query}" --user-id "${userId}"`
  );
  return parseJsonOutput<Array<{
    message_id: string;
    content: string;
    sender: string;
    timestamp: string;
  }>>(raw).map((m) => ({
    messageId: m.message_id,
    content: m.content,
    sender: m.sender,
    timestamp: m.timestamp,
  }));
}

/**
 * 获取日历日程
 */
export async function fetchCalendarAgenda(
  userId: string,
  timeRange: { start: string; end: string }
): Promise<Array<{ title: string; startTime: string; endTime: string }>> {
  const raw = runLarkCommand(
    `calendar agenda --user-id "${userId}" --start "${timeRange.start}" --end "${timeRange.end}"`
  );
  return parseJsonOutput<Array<{
    title: string;
    start_time: string;
    end_time: string;
  }>>(raw).map((e) => ({
    title: e.title,
    startTime: e.start_time,
    endTime: e.end_time,
  }));
}

/**
 * 获取任务列表
 */
export async function fetchTasks(
  userId: string,
  filters?: { status?: string; projectId?: string }
): Promise<Array<{ taskId: string; title: string; status: string; dueDate?: string }>> {
  const args = ['task', 'tasks-list', '--user-id', userId];
  if (filters?.status) args.push('--status', filters.status);
  if (filters?.projectId) args.push('--project-id', filters.projectId);

  const raw = runLarkCommand(args.join(' '));
  return parseJsonOutput<Array<{
    task_id: string;
    title: string;
    status: string;
    due_date?: string;
  }>>(raw).map((t) => ({
    taskId: t.task_id,
    title: t.title,
    status: t.status,
    dueDate: t.due_date,
  }));
}

/** 映射周期状态 */
function mapCycleStatus(status: string): CycleStatus {
  const map: Record<string, CycleStatus> = {
    draft: CycleStatus.DRAFT,
    published: CycleStatus.PUBLISHED,
    completed: CycleStatus.COMPLETED,
    archived: CycleStatus.ARCHIVED,
  };
  return map[status] || CycleStatus.DRAFT;
}

// ============================================================
// Git 数据采集模块
// ============================================================

/** IDE Git 配置 */
export interface GitConfig {
  /** GitLab URL */
  gitlabUrl: string;
  /** GitLab Token */
  gitlabToken: string;
  /** 用户名 */
  username: string;
  /** 邮箱 */
  email: string;
  /** 配置来源 */
  source: string;
}

/**
 * 从本地 IDE 配置中提取 Git 配置
 * 支持 VS Code 和 JetBrains IDE
 */
export function detectGitConfig(): GitConfig | null {
  // 1. 从 Git 全局配置读取
  try {
    const email = execSync('git config --global user.email', {
      encoding: 'utf-8',
    }).trim();
    const username = execSync('git config --global user.name', {
      encoding: 'utf-8',
    }).trim();
    if (email) {
      return {
        gitlabUrl: '',
        gitlabToken: '',
        username,
        email,
        source: 'git global config',
      };
    }
  } catch {
    // Git 全局配置不存在
  }

  // 2. 尝试从 VS Code 配置读取
  const vscodeSettings = findVscodeSettings();
  if (vscodeSettings) {
    try {
      const content = JSON.parse(fs.readFileSync(vscodeSettings, 'utf-8'));
      const email =
        content['git.authorEmail'] ||
        content['git.defaultCommitMessageAuthorEmail'] ||
        '';
      if (email) {
        return {
          gitlabUrl: content['gitlab.instanceUrl'] || '',
          gitlabToken: '',
          username: '',
          email,
          source: `.vscode/settings.json`,
        };
      }
    } catch {
      // VS Code settings 解析失败
    }
  }

  // 3. 尝试从 JetBrains .idea 配置读取
  const ideaVcs = findIdeaVcsConfig();
  if (ideaVcs) {
    try {
      const content = fs.readFileSync(ideaVcs, 'utf-8');
      const emailMatch = content.match(/option name="PROJECT_EMAIL" value="([^"]+)"/);
      if (emailMatch) {
        return {
          gitlabUrl: '',
          gitlabToken: '',
          username: '',
          email: emailMatch[1],
          source: '.idea/vcs.xml',
        };
      }
    } catch {
      // .idea 配置解析失败
    }
  }

  return null;
}

/** 查找 .vscode/settings.json */
function findVscodeSettings(): string | null {
  const candidates = [
    path.join(process.cwd(), '.vscode', 'settings.json'),
    path.join(os.homedir(), '.vscode', 'settings.json'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

/** 查找 .idea/vcs.xml */
function findIdeaVcsConfig(): string | null {
  const p = path.join(process.cwd(), '.idea', 'vcs.xml');
  return fs.existsSync(p) ? p : null;
}

/**
 * 提示用户输入 Git 配置（当自动检测失败时）
 * 返回配置对象，调用者需要将其存储或缓存
 */
export function promptGitConfig(): GitConfig {
  // 注意：在非交互环境中，这里会抛出异常
  // 调用者应该 catch 并提供替代方案
  throw new Error(
    '无法自动检测 Git 配置。请手动提供：\n' +
    '1. GitLab URL\n' +
    '2. GitLab Token（Private Token）\n' +
    '3. 用户名\n' +
    '4. 邮箱'
  );
}

/**
 * 获取 Git 提交活动
 */
export function fetchGitCommits(
  author: string,
  repo: string,
  timeRange: { start: string; end: string }
): GitActivity {
  // 切换到目标仓库
  const originalCwd = process.cwd();
  try {
    process.chdir(repo);

    // 获取提交次数
    const commitCount = parseInt(
      execSync(
        `git log --author="${author}" --since="${timeRange.start}" --until="${timeRange.end}" --oneline | wc -l`,
        { encoding: 'utf-8' }
      ).trim(),
      10
    ) || 0;

    // 获取代码行数变化
    const diffStat = execSync(
      `git log --author="${author}" --since="${timeRange.start}" --until="${timeRange.end}" --numstat --format="" | awk '{added+=$1; deleted+=$2} END {print added+0, deleted+0}'`,
      { encoding: 'utf-8' }
    ).trim();
    const [added, deleted] = diffStat.split(' ').map(Number);

    // 获取文件类型分布
    const fileTypeRaw = execSync(
      `git log --author="${author}" --since="${timeRange.start}" --until="${timeRange.end}" --name-only --format="" | sed 's/.*\\.//' | sort | uniq -c | sort -rn`,
      { encoding: 'utf-8' }
    ).trim();
    const fileTypeDistribution: Record<string, number> = {};
    if (fileTypeRaw) {
      for (const line of fileTypeRaw.split('\n')) {
        const match = line.trim().match(/^(\d+)\s+(.+)$/);
        if (match) {
          fileTypeDistribution[match[2]] = parseInt(match[1], 10);
        }
      }
    }

    // 计算天数
    const start = new Date(timeRange.start);
    const end = new Date(timeRange.end);
    const days = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    );

    return {
      author,
      repo,
      timeRange,
      commitCount,
      prCount: 0, // 需要通过 GitLab API 获取
      linesAdded: added || 0,
      linesDeleted: deleted || 0,
      fileTypeDistribution,
      commitsPerDay: parseFloat((commitCount / days).toFixed(2)),
    };
  } finally {
    process.chdir(originalCwd);
  }
}

/**
 * 通过 GitLab API 获取 PR/MR 列表
 */
export async function fetchGitLabMRs(
  config: GitConfig,
  projectId: string,
  authorEmail: string,
  timeRange: { start: string; end: string }
): Promise<Array<{ id: number; title: string; state: string; createdAt: string }>> {
  if (!config.gitlabUrl || !config.gitlabToken) {
    throw new Error('GitLab URL 或 Token 未配置');
  }

  const url = `${config.gitlabUrl}/api/v4/projects/${encodeURIComponent(projectId)}/merge_requests?author_username=${encodeURIComponent(authorEmail)}&created_after=${timeRange.start}&created_before=${timeRange.end}`;

  try {
    const response = await fetch(url, {
      headers: {
        'PRIVATE-TOKEN': config.gitlabToken,
      },
    });

    if (!response.ok) {
      throw new Error(`GitLab API 请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as Array<{
      iid: number;
      title: string;
      state: string;
      created_at: string;
    }>;

    return data.map((mr) => ({
      id: mr.iid,
      title: mr.title,
      state: mr.state,
      createdAt: mr.created_at,
    }));
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    throw new Error(`GitLab API 请求失败: ${msg}`);
  }
}
