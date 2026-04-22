// 测试证据采集策略
// 测试用例文档 + 测试结果 + Bug提交文档

import { searchDocuments, searchMessages } from '../data-collector';
import { Evidence, EvidenceType } from '../okr-types';

/** 测试证据输出 */
export interface QAEvidence {
  /** 测试用例列表 */
  testCases: Evidence[];
  /** Bug 统计 */
  bugStats: {
    total: number;
    critical: number;
    major: number;
    minor: number;
    resolved: number;
  };
  /** Bug 提交文档 */
  bugDocuments: Evidence[];
  /** 测试结果摘要 */
  testResults: Evidence[];
}

/**
 * 采集测试岗位的证据
 */
export async function collectQAEvidence(
  userId: string,
  timeRange: { start: string; end: string }
): Promise<QAEvidence> {
  // 1. 搜索测试用例文档
  const testCases = await searchTestCases(userId);

  // 2. 搜索 Bug 提交文档
  const bugDocuments = await searchBugDocuments(userId, timeRange);

  // 3. 搜索结果文档
  const testResults = await searchTestResults(userId, timeRange);

  // 4. Bug 统计（从文档中提取）
  const bugStats = calculateBugStats(bugDocuments);

  return {
    testCases,
    bugStats,
    bugDocuments,
    testResults,
  };
}

/**
 * 搜索测试用例文档
 * 关键词：测试用例、Test Case
 */
async function searchTestCases(userId: string): Promise<Evidence[]> {
  const results: Evidence[] = [];
  const keywords = ['测试用例', 'Test Case', '用例文档', 'TC'];

  for (const kw of keywords) {
    try {
      const docs = await searchDocuments(kw, { owner: userId });
      for (const doc of docs) {
        results.push({
          evidenceId: `tc-${doc.token}`,
          type: EvidenceType.DOCUMENT,
          title: doc.title,
          url: doc.url,
          creator: doc.owner,
          createdAt: '',
          updatedAt: '',
          description: `测试用例: ${doc.title}`,
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
 * 搜索 Bug 提交文档
 */
async function searchBugDocuments(
  userId: string,
  timeRange: { start: string; end: string }
): Promise<Evidence[]> {
  const results: Evidence[] = [];
  const keywords = ['Bug', '缺陷', '缺陷报告', 'Bug Report'];

  for (const kw of keywords) {
    try {
      const docs = await searchDocuments(kw, { owner: userId });
      for (const doc of docs) {
        results.push({
          evidenceId: `bug-${doc.token}`,
          type: EvidenceType.DOCUMENT,
          title: doc.title,
          url: doc.url,
          creator: doc.owner,
          createdAt: '',
          updatedAt: '',
          description: `Bug文档: ${doc.title}`,
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
 * 搜索结果文档
 */
async function searchTestResults(
  userId: string,
  timeRange: { start: string; end: string }
): Promise<Evidence[]> {
  const results: Evidence[] = [];
  const keywords = ['测试结果', 'Test Result', '测试报告', '测试总结'];

  for (const kw of keywords) {
    try {
      const docs = await searchDocuments(kw, { owner: userId });
      for (const doc of docs) {
        results.push({
          evidenceId: `result-${doc.token}`,
          type: EvidenceType.DOCUMENT,
          title: doc.title,
          url: doc.url,
          creator: doc.owner,
          createdAt: '',
          updatedAt: '',
          description: `测试结果: ${doc.title}`,
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
 * 计算 Bug 统计信息
 */
function calculateBugStats(
  bugDocuments: Evidence[]
): {
  total: number;
  critical: number;
  major: number;
  minor: number;
  resolved: number;
} {
  let critical = 0;
  let major = 0;
  let minor = 0;
  let resolved = 0;

  for (const doc of bugDocuments) {
    const title = doc.title.toLowerCase();
    const desc = doc.description.toLowerCase();
    const content = `${title} ${desc}`;

    if (content.includes('critical') || content.includes('严重')) critical++;
    else if (content.includes('major') || content.includes('重要')) major++;
    else minor++;

    if (content.includes('resolved') || content.includes('已修复') || content.includes('已解决')) {
      resolved++;
    }
  }

  return {
    total: bugDocuments.length,
    critical,
    major,
    minor,
    resolved,
  };
}
