// 管理证据采集策略
// 会议决策文档 + 周报

import { searchDocuments } from '../data-collector';
import { Evidence, EvidenceType } from '../okr-types';

/** 管理证据输出 */
export interface MgmtEvidence {
  /** 会议决策列表 */
  decisions: Evidence[];
  /** 周报摘要 */
  weeklyReports: Evidence[];
}

/**
 * 采集管理岗位的证据
 */
export async function collectMgmtEvidence(
  userId: string,
  timeRange: { start: string; end: string }
): Promise<MgmtEvidence> {
  // 1. 搜索会议决策文档
  const decisions = await searchDecisionDocuments(userId, timeRange);

  // 2. 搜索周报
  const weeklyReports = await searchWeeklyReports(userId, timeRange);

  return { decisions, weeklyReports };
}

/**
 * 搜索会议决策文档
 * 关键词：决策、决议
 */
async function searchDecisionDocuments(
  userId: string,
  timeRange: { start: string; end: string }
): Promise<Evidence[]> {
  const results: Evidence[] = [];
  const keywords = ['决策', '决议', 'Decision', '会议决议'];

  for (const kw of keywords) {
    try {
      const docs = await searchDocuments(kw, { owner: userId });
      for (const doc of docs) {
        results.push({
          evidenceId: `decision-${doc.token}`,
          type: EvidenceType.DOCUMENT,
          title: doc.title,
          url: doc.url,
          creator: doc.owner,
          createdAt: '',
          updatedAt: '',
          description: `会议决策: ${doc.title}`,
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

/**
 * 搜索周报
 * 关键词：周报、Weekly Report
 */
async function searchWeeklyReports(
  userId: string,
  timeRange: { start: string; end: string }
): Promise<Evidence[]> {
  const results: Evidence[] = [];
  const keywords = ['周报', 'Weekly Report', '周报总结', '本周工作'];

  for (const kw of keywords) {
    try {
      const docs = await searchDocuments(kw, { owner: userId });
      for (const doc of docs) {
        results.push({
          evidenceId: `weekly-${doc.token}`,
          type: EvidenceType.DOCUMENT,
          title: doc.title,
          url: doc.url,
          creator: doc.owner,
          createdAt: '',
          updatedAt: '',
          description: `周报: ${doc.title}`,
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

/**
 * 从周报中提取工作摘要
 */
export function extractWeeklySummary(
  report: Evidence
): {
  completedItems: string[];
  inProgressItems: string[];
  risks: string[];
} {
  const content = `${report.title} ${report.description}`.toLowerCase();
  const completedItems: string[] = [];
  const inProgressItems: string[] = [];
  const risks: string[] = [];

  // 简单的关键词匹配提取
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.includes('完成') || line.includes('done') || line.includes('已完成')) {
      completedItems.push(line.trim());
    }
    if (line.includes('进行中') || line.includes('in progress') || line.includes('处理中')) {
      inProgressItems.push(line.trim());
    }
    if (line.includes('风险') || line.includes('risk') || line.includes('阻塞')) {
      risks.push(line.trim());
    }
  }

  return { completedItems, inProgressItems, risks };
}
