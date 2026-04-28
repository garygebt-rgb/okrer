// 4类岗位权重配置
// 技术中心标准：不同岗位的绩效评估权重不同

import { JobCategory } from './okr-types';

/** 岗位权重配置项 */
export interface WeightItem {
  /** 权重项名称 */
  name: string;
  /** 权重百分比 (0-100) */
  weight: number;
  /** 说明 */
  description: string;
}

/** 岗位权重配置 */
export interface JobWeightConfig {
  /** 岗位类型 */
  category: JobCategory;
  /** 权重项列表 */
  weights: WeightItem[];
}

/** 研发岗位权重 */
const DEV_WEIGHTS: JobWeightConfig = {
  category: JobCategory.DEV,
  weights: [
    {
      name: '线上bug',
      weight: 30,
      description: '线上事故和Bug数量及严重程度',
    },
    {
      name: '代码评审',
      weight: 30,
      description: 'Code Review参与度与质量',
    },
    {
      name: '饱和度',
      weight: 20,
      description: '工作负载饱和度（任务完成率）',
    },
    {
      name: 'SIT bug',
      weight: 20,
      description: 'SIT测试阶段发现的Bug数量',
    },
  ],
};

/** 产品岗位权重 */
const PRODUCT_WEIGHTS: JobWeightConfig = {
  category: JobCategory.PRODUCT,
  weights: [
    {
      name: '需求交付周期',
      weight: 30,
      description: '从需求提出到交付的周期时间',
    },
    {
      name: '需求完整性',
      weight: 30,
      description: 'PRD文档的完整度和质量',
    },
    {
      name: '工作量',
      weight: 20,
      description: '需求数量和复杂度',
    },
    {
      name: '初审通过率',
      weight: 20,
      description: '需求评审一次性通过率',
    },
  ],
};

/** 测试岗位权重 */
const QA_WEIGHTS: JobWeightConfig = {
  category: JobCategory.QA,
  weights: [
    {
      name: '逃逸率',
      weight: 60,
      description: '线上缺陷逃逸率（漏测率）',
    },
    {
      name: '缺陷发现率',
      weight: 40,
      description: '测试阶段发现的缺陷数量和有效性',
    },
  ],
};

/** 管理岗位权重 */
const MANAGEMENT_WEIGHTS: JobWeightConfig = {
  category: JobCategory.MANAGEMENT,
  weights: [
    {
      name: '会议决策',
      weight: 50,
      description: '会议决策的数量和质量',
    },
    {
      name: '周报',
      weight: 30,
      description: '周报的完整性和及时性',
    },
    {
      name: '文档',
      weight: 20,
      description: '管理文档的产出质量',
    },
  ],
};

/** 所有岗位权重配置映射 */
const WEIGHT_MAP: Record<JobCategory, JobWeightConfig> = {
  [JobCategory.DEV]: DEV_WEIGHTS,
  [JobCategory.PRODUCT]: PRODUCT_WEIGHTS,
  [JobCategory.QA]: QA_WEIGHTS,
  [JobCategory.MANAGEMENT]: MANAGEMENT_WEIGHTS,
};

/**
 * 获取指定岗位的权重配置
 */
export function getJobWeights(category: JobCategory): JobWeightConfig {
  const config = WEIGHT_MAP[category];
  if (!config) {
    throw new Error(`未知的岗位类型: ${category}`);
  }
  validateWeights(config);
  return config;
}

/**
 * 获取所有岗位权重配置
 */
export function getAllJobWeights(): JobWeightConfig[] {
  return Object.values(WEIGHT_MAP).map((config) => {
    validateWeights(config);
    return config;
  });
}

/**
 * 验证权重配置总和是否为100%
 */
export function validateWeights(config: JobWeightConfig): void {
  const total = config.weights.reduce((sum, w) => sum + w.weight, 0);
  if (total !== 100) {
    throw new Error(
      `${config.category} 岗位权重总和为 ${total}%，必须等于 100%`
    );
  }
}

/**
 * 获取岗位权重的简要描述（用于UI展示）
 */
export function getJobWeightsSummary(category: JobCategory): string {
  const config = getJobWeights(category);
  return config.weights.map((w) => `${w.name} ${w.weight}%`).join('、');
}
