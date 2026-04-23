// 飞书CLI 自检程序
// 检测 lark-cli 安装状态、授权状态、token 有效性和所需 scope 齐全性

import { execSync } from 'child_process';

/** CLI 自检结果 */
export interface CliCheckResult {
  /** lark-cli 是否已安装 */
  installed: boolean;
  /** 是否已登录授权 */
  authorized: boolean;
  /** token 是否有效（未过期） */
  tokenValid: boolean;
  /** 所需 scope 是否齐全 */
  scopesOk: boolean;
  /** 当前用户名称 */
  userName: string;
  /** 当前用户 open_id */
  userOpenId: string;
  /** 缺失的 scope 列表 */
  missingScopes: string[];
  /** 错误信息 */
  errors: string[];
  /** 原始 auth status JSON（供调试） */
  rawStatus?: Record<string, unknown>;
}

/** 所需 scope 列表 */
export const REQUIRED_SCOPES = [
  'okr:okr.period:readonly',
  'okr:okr.content:readonly',
  'contact:user.base:readonly',
  'contact:user.employee_id:readonly',
  'im:message',
  'wiki:wiki:readonly',
];

/** 缓存检查结果，避免重复检测 */
let cachedResult: CliCheckResult | null = null;

/**
 * 执行完整的 CLI 自检
 * 首次调用执行四步检查，结果缓存
 * 后续调用直接返回缓存结果
 */
export function checkLarkCli(force = false): CliCheckResult {
  if (cachedResult && !force) {
    return cachedResult;
  }

  const result: CliCheckResult = {
    installed: false,
    authorized: false,
    tokenValid: false,
    scopesOk: false,
    userName: '',
    userOpenId: '',
    missingScopes: [],
    errors: [],
  };

  // Step 1: 检查安装
  try {
    execSync('which lark-cli', { encoding: 'utf-8' });
    result.installed = true;
  } catch {
    result.errors.push(
      'lark-cli 未安装。请通过以下方式安装：\n' +
      '1. 在飞书智能伙伴（小龙虾）中，发送："请帮我安装 lark-cli"\n' +
      '2. 或手动执行：npm install -g lark-cli'
    );
    cachedResult = result;
    return result;
  }

  // Step 2: 检查授权状态
  let authStatusJson: Record<string, unknown>;
  try {
    const output = execSync('lark-cli auth status', {
      encoding: 'utf-8',
      timeout: 10000,
    });
    // 跳过可能的非 JSON 前缀行（如 "OAuth credentials and authorization management"）
    const jsonStart = output.indexOf('{');
    if (jsonStart === -1) {
      throw new Error('auth status 输出不包含 JSON');
    }
    authStatusJson = JSON.parse(output.slice(jsonStart));
    result.rawStatus = authStatusJson;
    result.authorized = true;
    result.userName = (authStatusJson.userName as string) || '';
    result.userOpenId = (authStatusJson.userOpenId as string) || '';
  } catch {
    result.errors.push(
      'lark-cli 未授权或授权已失效。请重新登录：\n' +
      '执行命令：lark-cli auth login --recommend\n' +
      '然后在浏览器中完成授权流程。'
    );
    cachedResult = result;
    return result;
  }

  // Step 3: 检查 token 有效性
  const tokenStatus = authStatusJson.tokenStatus as string;
  if (tokenStatus === 'valid') {
    result.tokenValid = true;
  } else if (tokenStatus === 'needs_refresh') {
    const refreshExpiresAt = authStatusJson.refreshExpiresAt as string;
    if (refreshExpiresAt) {
      const refreshExpiry = new Date(refreshExpiresAt);
      const now = new Date();
      if (now < refreshExpiry) {
        // refresh token 仍有效，可以自动刷新
        result.tokenValid = true;
        result.errors.push(
          `Access token 已过期但 refresh token 有效（有效期至 ${refreshExpiresAt}）。\n` +
          '下次 lark-cli 调用会自动刷新，或手动执行：lark-cli auth login --recommend'
        );
      } else {
        result.errors.push(
          `Token 和 refresh token 均已过期（过期时间 ${refreshExpiresAt}）。\n` +
          '请重新执行：lark-cli auth login --recommend'
        );
      }
    } else {
      result.errors.push(
        'Token 状态为 needs_refresh 但无 refreshExpiresAt 信息。\n' +
        '请重新执行：lark-cli auth login --recommend'
      );
    }
  } else {
    result.errors.push(
      `未知的 token 状态: ${tokenStatus}。请重新执行：lark-cli auth login --recommend`
    );
  }

  // Step 4: 检查 scope 齐全性
  try {
    const scopesOutput = execSync('lark-cli auth scopes', {
      encoding: 'utf-8',
      timeout: 10000,
    });
    const scopesJsonStart = scopesOutput.indexOf('{');
    if (scopesJsonStart !== -1) {
      const scopesJson = JSON.parse(scopesOutput.slice(scopesJsonStart));
      const userScopes = (scopesJson.userScopes as string[]) || [];
      const missingScopes = REQUIRED_SCOPES.filter(
        (scope) => !userScopes.includes(scope)
      );
      if (missingScopes.length > 0) {
        result.scopesOk = false;
        result.missingScopes = missingScopes;
        result.errors.push(
          `缺少以下必需权限: ${missingScopes.join(', ')}\n` +
          '请执行：lark-cli auth login --recommend 以重新授权获取更多权限'
        );
      } else {
        result.scopesOk = true;
      }
    }
  } catch {
    // scopes 检查失败不影响核心功能，仅记录警告
    result.errors.push(
      '无法获取 scope 列表，跳过 scope 检查。'
    );
  }

  cachedResult = result;
  return result;
}

/**
 * 确保 CLI 可用。如果自检失败，抛出带引导信息的错误。
 */
export function ensureLarkCli(): void {
  const result = checkLarkCli();
  if (result.errors.length > 0) {
    const guide = generateGuide(result);
    throw new Error(guide);
  }
}

/**
 * 根据自检结果生成用户友好的引导信息
 */
function generateGuide(result: CliCheckResult): string {
  const lines: string[] = ['\n===== 飞书CLI 检查失败 =====\n'];

  if (!result.installed) {
    lines.push('❌ lark-cli 未安装');
    lines.push('');
    lines.push('解决方式：');
    lines.push('1. 飞书智能伙伴（小龙虾）环境：发送"请帮我安装 lark-cli"');
    lines.push('2. 本地环境：执行 npm install -g lark-cli');
    lines.push('');
    return lines.join('\n');
  }

  if (!result.authorized) {
    lines.push('❌ lark-cli 未授权');
    lines.push('');
    lines.push('解决方式：');
    lines.push('执行：lark-cli auth login --recommend');
    lines.push('然后在浏览器中完成授权流程');
    lines.push('');
    return lines.join('\n');
  }

  if (!result.tokenValid) {
    lines.push('❌ Token 已过期');
    lines.push('');
    lines.push('解决方式：');
    lines.push('执行：lark-cli auth login --recommend');
    lines.push('');
    return lines.join('\n');
  }

  if (!result.scopesOk && result.missingScopes.length > 0) {
    lines.push('⚠️ 缺少以下权限 scope:');
    lines.push(result.missingScopes.map((s) => `  - ${s}`).join('\n'));
    lines.push('');
    lines.push('解决方式：');
    lines.push('执行：lark-cli auth login --recommend');
    lines.push('');
    return lines.join('\n');
  }

  // 有其他非致命错误
  lines.push('⚠️ 飞书CLI 存在以下警告:');
  lines.push(result.errors.map((e) => `  - ${e}`).join('\n'));
  lines.push('');
  return lines.join('\n');
}

/**
 * 清除缓存，下次调用时重新检测
 */
export function clearCache(): void {
  cachedResult = null;
}
