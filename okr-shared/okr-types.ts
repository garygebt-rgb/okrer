// OKR 数据类型定义

/** 岗位类型（简化为4类） */
export enum JobCategory {
  DEV = '研发',
  PRODUCT = '产品',
  QA = '测试',
  MANAGEMENT = '管理',
}

/** OKR 周期状态 */
export enum CycleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

/** OKR 目标分类 */
export enum ObjectiveLevel {
  A = 'A', // 最高优先级，权重40%
  B = 'B', // 普通优先级，权重30%
}

/** 对齐类型 */
export enum AlignmentType {
  CONTRIBUTING = 'contributing', // 贡献型：我的产出直接贡献到上级目标
  DEPENDENT = 'dependent',       // 依赖型：上级目标依赖我的产出
}

/** 证据类型 */
export enum EvidenceType {
  // 一级证据：定量
  OKR_SCORE = 'okr_score',
  EFFICIENCY_DATA = 'efficiency_data',
  // 二级证据：定性
  MEETING = 'meeting',
  DOCUMENT = 'document',
  GIT_COMMIT = 'git_commit',
  // 三级证据：需验证
  SELF_REPORT = 'self_report',
  MANAGER_EVAL = 'manager_evaluation',
}

/** 风险等级 */
export enum RiskLevel {
  ON_TRACK = 'on_track',     // 有进展
  NO_PROGRESS = 'no_progress', // 无进展
}

/** SMART 维度 */
export enum SmartDimension {
  SPECIFIC = 'specific',
  MEASURABLE = 'measurable',
  ACHIEVABLE = 'achievable',
  RELEVANT = 'relevant',
  TIME_BOUND = 'time_bound',
}

/** 评分维度（技术中心标准） */
export enum ScoringDimension {
  DIFFICULTY = 'difficulty',   // 难度 40%
  EFFORT = 'effort',           // 努力度 40%
  COMPLETION = 'completion',   // 完成度 20%
}

/** OKR 周期 */
export interface OKRCycle {
  cycleId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: CycleStatus;
  objectives: Objective[];
}

/** OKR 目标 */
export interface Objective {
  objectiveId: string;
  title: string;
  description: string;
  weight: number;        // 40% 或 30%
  level: ObjectiveLevel; // A 或 B
  score: number;         // 0-1 体系
  keyResults: KeyResult[];
  alignments: Alignment[];
}

/** OKR 关键结果 */
export interface KeyResult {
  keyResultId: string;
  title: string;
  description: string;
  weight: number;        // KR 在 O 中的权重
  score: number;         // 0-1 体系
  indicators: Indicator[];
}

/** 量化指标 */
export interface Indicator {
  indicatorId: string;
  name: string;
  startValue: number;
  currentValue: number;
  targetValue: number;
  unit: string;
}

/** 对齐关系 */
export interface Alignment {
  alignmentId: string;
  type: AlignmentType;
  targetObjectiveId: string;
  targetObjectiveTitle: string;
  targetOwnerName: string;
}

/** 证据 */
export interface Evidence {
  evidenceId: string;
  type: EvidenceType;
  title: string;
  url: string;
  creator: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  /** 证据与 KR 的相关性分数 (0-1) */
  relevanceScore: number;
  /** 验证状态 */
  verified: boolean;
  /** 不匹配原因 */
  mismatchReason?: string;
}

/** 证据来源 */
export interface EvidenceSource {
  source: string;       // 'lark-cli' | 'git' | 'user_input'
  command: string;      // 执行的 CLI 命令
  rawOutput?: string;   // 原始输出
}

/** 评分分解（技术中心标准） */
export interface ScoringBreakdown {
  difficulty: number;   // 0-100 分
  effort: number;       // 0-100 分
  completion: number;   // 0-100 分
  total: number;        // 难度*40% + 努力度*40% + 完成度*20%
  zeroToOne: number;    // 转换为 0-1 体系 (total/100)
}

/** 评分报告 */
export interface ScoringReport {
  jobId: string;
  jobCategory: JobCategory;
  cycleId: string;
  /** 各 Objective 的评分 */
  objectiveScores: Record<string, ScoringBreakdown>;
  /** 整体评分 */
  overallScore: ScoringBreakdown;
  /** 证据清单 */
  evidenceList: Evidence[];
  /** 评分建议（供人类参考） */
  recommendations: string[];
}

/** 进度快照（历史存储） */
export interface ProgressSnapshot {
  snapshotId: string;
  cycleId: string;
  userId: string;
  timestamp: string;
  /** 各 KR 的 score 值 */
  keyResultScores: Record<string, number>;
  /** 上次提醒时间戳，用于智能跳过逻辑（D-17, Resolved Q3） */
  lastReminderTimestamp?: string;
}

/** 提醒注册信息（客户端-服务端注册预留接口，D-09，Resolved Q2） */
export interface ReminderRegistration {
  /** 用户 ID */
  userId: string;
  /** OKR 周期 ID */
  cycleId: string;
  /** 主管用户 ID（可选，从 config.json managerId 读取） */
  managerId?: string;
  /** 提醒频率 */
  frequency: 'biweekly';
  /** 注册创建时间 */
  createdAt: string;
  /** 最后更新时间 */
  updatedAt: string;
}

/** 证据匹配结果 */
export interface EvidenceMatchResult {
  evidence: Evidence;
  /** 匹配度 (0-1) */
  matchScore: number;
  /** 验证状态 */
  verificationStatus: 'pass' | 'fail' | 'pending';
  /** 不匹配原因列表 */
  failureReasons: string[];
}

/** 往期 OKR 分析 */
export interface PreviousOKRAnalysis {
  /** 往期周期列表 */
  previousCycles: OKRCycle[];
  /** 未完成目标 */
  incompleteObjectives: Array<{
    title: string;
    cycleName: string;
    finalScore: number;
  }>;
  /** 重复目标 */
  repeatedObjectives: Array<{
    title: string;
    occurrences: number;
  }>;
  /** 目标设定习惯 */
  settingPatterns: {
    tendency: 'overestimate' | 'underestimate' | 'balanced';
    averageScore: number;
  };
}

/** 数据采集过滤器 */
export interface DataFilter {
  userId?: string;
  cycleId?: string;
  timeRange?: { start: string; end: string };
  keywords?: string[];
}

/** Git 活动数据 */
export interface GitActivity {
  author: string;
  repo: string;
  timeRange: { start: string; end: string };
  /** 提交次数 */
  commitCount: number;
  /** PR/MR 数量 */
  prCount: number;
  /** 代码行数变化 */
  linesAdded: number;
  linesDeleted: number;
  /** 涉及的文件类型分布 */
  fileTypeDistribution: Record<string, number>;
  /** 提交频率（每天平均） */
  commitsPerDay: number;
}
