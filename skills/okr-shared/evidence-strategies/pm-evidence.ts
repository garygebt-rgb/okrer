// 产品经理证据采集策略
// 搜索 PRD 文档、会议纪要、项目关键词聊天记录

import { searchDocuments, searchMessages } from '../data-collector';
import { Evidence, EvidenceType } from '../okr-types';

/** 产品经理证据输出 */
export interface PMEvidence {
  /** PRD 文档列表 */
  prdDocuments: Evidence[];
  /** 会议纪要列表 */
  meetingMinutes: Evidence[];
  /** 聊天记录摘要 */
  chatSummaries: Evidence[];
}

/**
 * 采集产品经理岗位的证据
 */
export async function collectPMEvidence(
  userId: string,
  projectKeywords: string[],
  timeRange: { start: string; end: string }
): Promise<PMEvidence> {
  // 1. 搜索 PRD 文档
  const prdDocuments = await searchPRDDocuments(userId);

  // 2. 搜索会议纪要文档
  const meetingMinutes = await searchMeetingMinutes(userId, timeRange);

  // 3. 按项目关键词搜索聊天记录
  const chatSummaries: Evidence[] = [];
  for (const keyword of projectKeywords) {
    const messages = await searchMessages(keyword, userId);
    for (const msg of messages) {
      chatSummaries.push({
        evidenceId: `chat-${msg.messageId}`,
        type: EvidenceType.MEETING,
        title: `聊天记录: ${msg.content.slice(0, 50)}...`,
        url: ``,
        creator: msg.sender,
        createdAt: msg.timestamp,
        updatedAt: msg.timestamp,
        description: msg.content,
        relevanceScore: 0,
        verified: false,
      });
    }
  }

  return { prdDocuments, meetingMinutes, chatSummaries };
}

/**
 * 搜索 PRD 文档
 * 识别包含"产品需求文档"或"PRD"标志的文档
 */
async function searchPRDDocuments(userId: string): Promise<Evidence[]> {
  const results: Evidence[] = [];

  // 搜索包含 PRD 关键词的文档
  const keywords = ['PRD', '产品需求文档', '需求文档'];
  for (const kw of keywords) {
    try {
      const docs = await searchDocuments(kw, { owner: userId });
      for (const doc of docs) {
        results.push({
          evidenceId: `prd-${doc.token}`,
          type: EvidenceType.DOCUMENT,
          title: doc.title,
          url: doc.url,
          creator: doc.owner,
          createdAt: '',
          updatedAt: '',
          description: `PRD文档: ${doc.title}`,
          relevanceScore: 0,
          verified: false,
        });
      }
    } catch {
      // 搜索失败，继续下一个关键词
    }
  }

  return results;
}

/**
 * 搜索会议纪要文档
 */
async function searchMeetingMinutes(
  userId: string,
  timeRange: { start: string; end: string }
): Promise<Evidence[]> {
  const results: Evidence[] = [];

  const keywords = ['会议纪要', 'Meeting Minutes', '会议记录'];
  for (const kw of keywords) {
    try {
      const docs = await searchDocuments(kw, { owner: userId });
      for (const doc of docs) {
        results.push({
          evidenceId: `meeting-${doc.token}`,
          type: EvidenceType.MEETING,
          title: doc.title,
          url: doc.url,
          creator: doc.owner,
          createdAt: '',
          updatedAt: '',
          description: `会议纪要: ${doc.title}`,
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
