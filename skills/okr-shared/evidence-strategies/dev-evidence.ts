// 研发证据采集策略
// 技术文档 + Git代码相关性 + 迭代表排期任务

import { searchDocuments, fetchTasks, fetchGitCommits, GitConfig } from '../data-collector';
import { Evidence, EvidenceType, GitActivity } from '../okr-types';

/** 研发证据输出 */
export interface DevEvidence {
  /** 技术文档列表 */
  techDocuments: Evidence[];
  /** Git 活动统计 */
  gitActivity: GitActivity | null;
  /** 交付完成率 */
  deliveryRate: number;
  /** 排期任务列表 */
  scheduledTasks: Array<{ taskId: string; title: string; status: string }>;
}

/**
 * 采集研发岗位的证据
 */
export async function collectDevEvidence(
  userId: string,
  authorEmail: string,
  repoPath: string,
  timeRange: { start: string; end: string },
  gitConfig: GitConfig | null
): Promise<DevEvidence> {
  // 1. 搜索技术文档
  const techDocuments = await searchTechDocuments(userId, timeRange);

  // 2. Git 代码相关性分析
  let gitActivity: GitActivity | null = null;
  try {
    if (repoPath && authorEmail) {
      gitActivity = fetchGitCommits(authorEmail, repoPath, timeRange);
    }
  } catch {
    // Git 数据获取失败，继续
  }

  // 3. 迭代表排期任务交付情况
  const tasks = await fetchTasks(userId, { status: 'done' });
  const allTasks = await fetchTasks(userId);
  const deliveryRate =
    allTasks.length > 0 ? tasks.length / allTasks.length : 0;

  const scheduledTasks = allTasks.map((t) => ({
    taskId: t.taskId,
    title: t.title,
    status: t.status,
  }));

  return {
    techDocuments,
    gitActivity,
    deliveryRate,
    scheduledTasks,
  };
}

/**
 * 搜索技术文档
 * 通过关键词和创建者过滤
 */
async function searchTechDocuments(
  userId: string,
  timeRange: { start: string; end: string }
): Promise<Evidence[]> {
  const results: Evidence[] = [];
  const keywords = [
    '技术设计',
    '技术方案',
    '架构设计',
    'Technical Design',
    'API 文档',
    '接口文档',
  ];

  for (const kw of keywords) {
    try {
      const docs = await searchDocuments(kw, { owner: userId });
      for (const doc of docs) {
        results.push({
          evidenceId: `tech-${doc.token}`,
          type: EvidenceType.DOCUMENT,
          title: doc.title,
          url: doc.url,
          creator: doc.owner,
          createdAt: '',
          updatedAt: '',
          description: `技术文档: ${doc.title}`,
          relevanceScore: 0,
          verified: false,
        });
      }
    } catch {
      // 搜索失败，继续
    }
  }

  return results;
}
