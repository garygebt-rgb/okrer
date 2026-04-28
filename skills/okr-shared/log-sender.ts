// OKR 技能执行日志发送模块
// 统一记录技能执行情况，发送飞书邮件至 ITPMO@homeinns.com

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// 日志存储目录
const LOG_DIR = path.join(os.homedir(), '.claude', 'skills', 'okr-shared', 'logs');

// 收件人邮箱
const ITPMO_EMAIL = 'ITPMO@homeinns.com';

/** 技能执行日志记录 */
export interface SkillExecutionLog {
  /** 技能名称 */
  skillName: 'okr-goal-setting' | 'okr-process-tracking' | 'okr-review-scoring';
  /** 用户 ID */
  userId: string;
  /** 用户姓名 */
  userName: string;
  /** 执行时间 */
  timestamp: string;
  /** 触发方式 */
  triggerType: 'manual' | 'cron';
  /** OKR 周期 ID（如有） */
  cycleId?: string;
  /** 各步骤结果摘要 */
  stepResults: {
    step: number;
    stepName: string;
    status: 'success' | 'skipped' | 'error';
    summary: string;
  }[];
  /** 最终结果摘要 */
  finalSummary: string;
}

/**
 * 将执行日志保存到本地文件
 */
export function saveLogToFile(log: SkillExecutionLog): string {
  // 确保日志目录存在
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }

  const date = new Date(log.timestamp).toISOString().slice(0, 10);
  const fileName = `${log.skillName}-${log.userId}-${date}-${log.timestamp.slice(11, 19).replace(/:/g, '')}.md`;
  const filePath = path.join(LOG_DIR, fileName);

  const content = formatLogAsMarkdown(log);
  fs.writeFileSync(filePath, content, 'utf-8');

  return filePath;
}

/**
 * 将执行日志格式化为飞书邮件内容
 */
export function formatLogAsMarkdown(log: SkillExecutionLog): string {
  const lines: string[] = [];

  lines.push(`# 执行日志 — ${log.skillName}`);
  lines.push('');
  lines.push(`| 项目 | 值 |`);
  lines.push(`|------|-----|`);
  lines.push(`| 用户 | ${log.userName} (${log.userId}) |`);
  lines.push(`| 执行时间 | ${log.timestamp} |`);
  lines.push(`| 触发方式 | ${log.triggerType === 'cron' ? '定时任务' : '手动执行'} |`);
  if (log.cycleId) {
    lines.push(`| OKR周期 | ${log.cycleId} |`);
  }
  lines.push('');

  lines.push('## 步骤执行详情');
  lines.push('');
  lines.push(`| 步骤 | 名称 | 状态 | 摘要 |`);
  lines.push(`|------|------|------|------|`);

  for (const step of log.stepResults) {
    const statusText = step.status === 'success' ? '✅ 完成' : step.status === 'skipped' ? '⏭️ 跳过' : '❌ 错误';
    lines.push(`| Step ${step.step}: ${step.stepName} | ${statusText} | ${step.summary} |`);
  }

  lines.push('');
  lines.push('## 最终结果摘要');
  lines.push('');
  lines.push(log.finalSummary);
  lines.push('');
  lines.push(`---`);
  lines.push(`*本日志由 ${log.skillName} 自动生成*`);

  return lines.join('\n');
}

/**
 * 发送执行日志邮件至 ITPMO@homeinns.com
 * 通过 lark-cli 或飞书 API 发送邮件
 */
export function sendLogEmail(log: SkillExecutionLog): { success: boolean; message: string } {
  try {
    // 保存本地日志
    const logPath = saveLogToFile(log);

    // 构建邮件内容
    const subject = `[OKR日志] ${log.skillName} — ${log.userName} — ${new Date(log.timestamp).toLocaleDateString('zh-CN')}`;
    const body = formatLogAsMarkdown(log);

    // 尝试通过 lark-cli 发送邮件
    // 注意：lark-cli 需要支持邮件发送功能，如不支持则降级为记录日志
    try {
      const escapedBody = body.replace(/'/g, "'\\''");
      execSync(
        `lark-cli mail send --to "${ITPMO_EMAIL}" --subject "${subject}" --body '${escapedBody}'`,
        { encoding: 'utf-8', timeout: 30000 }
      );
      return { success: true, message: `日志已保存至 ${logPath} 并发送邮件至 ${ITPMO_EMAIL}` };
    } catch (mailError) {
      // lark-cli 邮件发送失败，降级为本地日志
      const errMsg = mailError instanceof Error ? mailError.message : String(mailError);
      return {
        success: false,
        message: `日志已保存至 ${logPath}，但邮件发送失败: ${errMsg}。请手动发送至 ${ITPMO_EMAIL}`
      };
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, message: `日志保存失败: ${msg}` };
  }
}

/**
 * 创建执行日志的便捷函数
 */
export function createLog(
  skillName: SkillExecutionLog['skillName'],
  userId: string,
  userName: string,
  triggerType: SkillExecutionLog['triggerType'] = 'manual'
): SkillExecutionLog {
  return {
    skillName,
    userId,
    userName,
    timestamp: new Date().toISOString(),
    triggerType,
    stepResults: [],
    finalSummary: '',
  };
}

/**
 * 添加步骤结果到日志
 */
export function addStepResult(
  log: SkillExecutionLog,
  step: number,
  stepName: string,
  status: SkillExecutionLog['stepResults'][0]['status'],
  summary: string
): void {
  log.stepResults.push({ step, stepName, status, summary });
}
