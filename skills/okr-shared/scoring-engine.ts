// 数据汇总引擎
// 接收多源数据，按岗位权重计算各维度得分，输出评分建议（供人类参考）

import {
  JobCategory,
  ScoringBreakdown,
  ScoringReport,
  Evidence,
  ProgressSnapshot,
  GitActivity,
} from './okr-types';
import { getJobWeights, JobWeightConfig } from './job-weights';

/** 评分引擎输入数据 */
export interface ScoringInput {
  /** 用户ID */
  userId: string;
  /** 岗位类型 */
  jobCategory: JobCategory;
  /** OKR周期ID */
  cycleId: string;
  /** 进度数据 */
  progressData: {
    objectiveId: string;
    keyResultScores: Record<string, number>;
    overallScore: number;
  }[];
  /** 人效数据（可选） */
  efficiencyData?: Record<string, number>;
  /** 质量数据（可选） */
  qualityData?: Record<string, number>;
  /** Git活动（可选） */
  gitActivity?: GitActivity;
  /** 证据清单 */
  evidenceList: Evidence[];
  /** 历史快照（可选） */
  historySnapshots?: ProgressSnapshot[];
}

/**
 * 数据汇总引擎
 * 处理多源数据并输出结构化的汇总报告（含评分建议）
 */
export class ScoringEngine {
  /**
   * 生成评分报告
   */
  generateReport(input: ScoringInput): ScoringReport {
    const jobWeights = getJobWeights(input.jobCategory);

    // 计算各 Objective 的评分
    const objectiveScores: Record<string, ScoringBreakdown> = {};
    for (const pd of input.progressData) {
      objectiveScores[pd.objectiveId] = this.calculateBreakdown(
        pd,
        jobWeights,
        input
      );
    }

    // 计算整体评分
    const overallScore = this.calculateOverallScore(objectiveScores);

    // 生成评分建议
    const recommendations = this.generateRecommendations(
      input,
      jobWeights,
      overallScore
    );

    return {
      jobId: input.userId,
      jobCategory: input.jobCategory,
      cycleId: input.cycleId,
      objectiveScores,
      overallScore,
      evidenceList: input.evidenceList,
      recommendations,
    };
  }

  /**
   * 计算单个 Objective 的评分分解
   */
  private calculateBreakdown(
    progressData: {
      objectiveId: string;
      keyResultScores: Record<string, number>;
      overallScore: number;
    },
    _jobWeights: JobWeightConfig,
    input: ScoringInput
  ): ScoringBreakdown {
    const krScores = Object.values(progressData.keyResultScores);
    const completion =
      krScores.length > 0
        ? (krScores.reduce((s, v) => s + v, 0) / krScores.length) * 100
        : progressData.overallScore * 100;

    const difficulty = this.estimateDifficulty(input);
    const effort = this.estimateEffort(input);
    const total = difficulty * 0.4 + effort * 0.4 + completion * 0.2;

    return {
      difficulty: Math.round(difficulty * 100) / 100,
      effort: Math.round(effort * 100) / 100,
      completion: Math.round(completion * 100) / 100,
      total: Math.round(total * 100) / 100,
      zeroToOne: Math.round(total) / 100,
    };
  }

  /**
   * 估算难度分数（基于证据数量和质量）
   */
  private estimateDifficulty(input: ScoringInput): number {
    let score = 50;
    const evidenceCount = input.evidenceList.length;
    if (evidenceCount >= 5) score += 10;
    if (evidenceCount >= 10) score += 5;
    const verifiedCount = input.evidenceList.filter((e) => e.verified).length;
    if (evidenceCount > 0) {
      score += (verifiedCount / evidenceCount) * 10;
    }
    if (input.qualityData) {
      const qualityScore =
        Object.values(input.qualityData).reduce((s, v) => s + v, 0) /
        Object.keys(input.qualityData).length;
      score += qualityScore * 10;
    }
    return Math.min(100, Math.max(0, score));
  }

  /**
   * 估算努力度分数（基于 Git 活动、任务完成情况）
   */
  private estimateEffort(input: ScoringInput): number {
    let score = 50;
    if (input.gitActivity) {
      const git = input.gitActivity;
      if (git.commitsPerDay >= 1) score += 10;
      if (git.commitsPerDay >= 3) score += 5;
      if (git.prCount >= 2) score += 5;
      if (git.prCount >= 5) score += 5;
    }
    const completedTasks = input.progressData.filter(
      (p) => p.overallScore >= 0.8
    ).length;
    const totalTasks = input.progressData.length;
    if (totalTasks > 0) {
      score += (completedTasks / totalTasks) * 20;
    }
    if (input.efficiencyData) {
      const efficiencyScore =
        Object.values(input.efficiencyData).reduce((s, v) => s + v, 0) /
        Object.keys(input.efficiencyData).length;
      score += efficiencyScore * 10;
    }
    return Math.min(100, Math.max(0, score));
  }

  /**
   * 计算整体评分（各 Objective 的平均）
   */
  private calculateOverallScore(
    objectiveScores: Record<string, ScoringBreakdown>
  ): ScoringBreakdown {
    const scores = Object.values(objectiveScores);
    if (scores.length === 0) {
      return { difficulty: 0, effort: 0, completion: 0, total: 0, zeroToOne: 0 };
    }
    const avg = (values: number[]) =>
      values.reduce((s, v) => s + v, 0) / values.length;
    const difficulty = avg(scores.map((s) => s.difficulty));
    const effort = avg(scores.map((s) => s.effort));
    const completion = avg(scores.map((s) => s.completion));
    const total = difficulty * 0.4 + effort * 0.4 + completion * 0.2;
    return {
      difficulty: Math.round(difficulty * 100) / 100,
      effort: Math.round(effort * 100) / 100,
      completion: Math.round(completion * 100) / 100,
      total: Math.round(total * 100) / 100,
      zeroToOne: Math.round(total) / 100,
    };
  }

  /**
   * 生成评分建议
   */
  private generateRecommendations(
    input: ScoringInput,
    jobWeights: JobWeightConfig,
    overallScore: ScoringBreakdown
  ): string[] {
    const recommendations: string[] = [];

    if (overallScore.completion < 60) {
      recommendations.push(
        `完成度偏低 (${overallScore.completion.toFixed(1)}分)，建议关注未完成的 KR`
      );
    }
    if (overallScore.effort < 40) {
      recommendations.push(
        `努力度偏低 (${overallScore.effort.toFixed(1)}分)，建议增加任务参与度`
      );
    }
    if (input.historySnapshots && input.historySnapshots.length >= 2) {
      const latest = input.historySnapshots[input.historySnapshots.length - 1];
      const previous =
        input.historySnapshots[input.historySnapshots.length - 2];
      const latestAvg =
        Object.values(latest.keyResultScores).reduce((s, v) => s + v, 0) /
        Math.max(1, Object.keys(latest.keyResultScores).length);
      const previousAvg =
        Object.values(previous.keyResultScores).reduce((s, v) => s + v, 0) /
        Math.max(1, Object.keys(previous.keyResultScores).length);
      if (latestAvg < previousAvg) {
        recommendations.push(
          `进度环比下降（上次 ${previousAvg.toFixed(2)}，本次 ${latestAvg.toFixed(2)}），需关注`
        );
      }
    }

    const weights = [...jobWeights.weights].sort((a, b) => b.weight - a.weight);
    const topItem = weights[0];
    recommendations.push(
      `岗位权重最高项：${topItem.name} (${topItem.weight}%)，请重点关注`
    );

    return recommendations;
  }
}
