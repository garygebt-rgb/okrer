// 证据匹配器
// 验证材料与 KR 的相关性：链接可访问性、创建者、时间范围、关键词、数据一致性

import { Evidence, EvidenceMatchResult } from './okr-types';

/** 匹配配置 */
export interface MatchConfig {
  /** KR 描述 */
  krDescription: string;
  /** KR 标题 */
  krTitle: string;
  /** 时间范围 */
  timeRange: { start: string; end: string };
  /** 期望的创建者 */
  expectedCreator: string;
  /** 关键词列表 */
  keywords?: string[];
}

/**
 * 证据匹配器
 * 验证用户提供的材料链接与 KR 的相关性
 */
export class EvidenceMatcher {
  /**
   * 验证单条证据
   */
  matchEvidence(evidence: Evidence, config: MatchConfig): EvidenceMatchResult {
    const failureReasons: string[] = [];
    let score = 0.5; // 基准分

    // 1. 验证创建者匹配
    if (evidence.creator !== config.expectedCreator) {
      failureReasons.push(
        `创建者不匹配: 期望 ${config.expectedCreator}，实际 ${evidence.creator}`
      );
      score -= 0.2;
    } else {
      score += 0.15;
    }

    // 2. 验证时间范围
    if (evidence.createdAt) {
      const created = new Date(evidence.createdAt);
      const start = new Date(config.timeRange.start);
      const end = new Date(config.timeRange.end);
      if (created < start || created > end) {
        failureReasons.push(
          `时间不在范围内: 证据时间 ${evidence.createdAt}，范围 ${config.timeRange.start} ~ ${config.timeRange.end}`
        );
        score -= 0.15;
      } else {
        score += 0.1;
      }
    }

    // 3. 验证关键词相关性
    const content = `${evidence.title} ${evidence.description}`.toLowerCase();
    const krContent = `${config.krTitle} ${config.krDescription}`.toLowerCase();

    let keywordMatchCount = 0;
    const allKeywords = [
      ...(config.keywords || []),
      ...config.krTitle.split(/\s+/),
      ...config.krDescription.split(/\s+/).filter((w) => w.length > 2),
    ];

    for (const kw of allKeywords) {
      const lowerKw = kw.toLowerCase();
      if (lowerKw.length > 1 && content.includes(lowerKw)) {
        keywordMatchCount++;
      }
    }

    const keywordDensity =
      allKeywords.length > 0 ? keywordMatchCount / allKeywords.length : 0;
    score += keywordDensity * 0.3;

    if (keywordMatchCount === 0 && allKeywords.length > 0) {
      failureReasons.push('未找到任何关键词匹配');
    }

    // 4. 验证链接有效性（URL 非空）
    if (!evidence.url || evidence.url.trim() === '') {
      failureReasons.push('证据 URL 为空');
      score -= 0.1;
    } else {
      score += 0.05;
    }

    // 5. 数据一致性：已验证的证据加分
    if (evidence.verified) {
      score += 0.1;
    } else if (evidence.mismatchReason) {
      failureReasons.push(evidence.mismatchReason);
    }

    // 归一化分数到 0-1
    const matchScore = Math.max(0, Math.min(1, score));

    // 确定验证状态
    let verificationStatus: 'pass' | 'fail' | 'pending';
    if (matchScore >= 0.6 && failureReasons.length === 0) {
      verificationStatus = 'pass';
    } else if (matchScore < 0.3) {
      verificationStatus = 'fail';
    } else {
      verificationStatus = 'pending';
    }

    return {
      evidence,
      matchScore: Math.round(matchScore * 100) / 100,
      verificationStatus,
      failureReasons,
    };
  }

  /**
   * 批量验证证据
   */
  matchAll(
    evidenceList: Evidence[],
    config: MatchConfig
  ): EvidenceMatchResult[] {
    return evidenceList.map((e) => this.matchEvidence(e, config));
  }

  /**
   * 获取匹配度最高的证据
   */
  getTopMatches(
    evidenceList: Evidence[],
    config: MatchConfig,
    topN: number = 5
  ): EvidenceMatchResult[] {
    const results = this.matchAll(evidenceList, config);
    return results
      .filter((r) => r.matchScore >= 0.3)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, topN);
  }

  /**
   * 获取验证通过的证据
   */
  getPassedMatches(
    evidenceList: Evidence[],
    config: MatchConfig
  ): EvidenceMatchResult[] {
    return this.matchAll(evidenceList, config).filter(
      (r) => r.verificationStatus === 'pass'
    );
  }
}
