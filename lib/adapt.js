// 插件化标准第4项：dsh 版本自适应（CJS 版，对齐 agent-bus 逻辑）
// 用途：采集宿主关键包版本指纹 + 能力探测，宿主升级时记录（能力探测优先于版本判断）
'use strict';
const { readFileSync, mkdirSync, appendFileSync } = require('node:fs');
const { homedir } = require('node:os');
const { join } = require('node:path');
const { createRequire } = require('node:module');

const HOME = homedir();
const ADAPT_DIR = join(HOME, '.dsh', 'plugin-adapt');
const LOG_FILE = join(ADAPT_DIR, 'adapt-log.jsonl');

const KEY_PACKAGES = [
  '@deepseek-ai/dsh',
  '@deepseek-ai/dsh-tools',
  '@deepseek-ai/dsh-agent',
  '@deepseek-ai/cordis',
];

const HOST_NM_CANDIDATES = [
  process.env.DSH_RUNTIME_NODE_MODULES,
  '/Applications/CLD.app/Contents/Resources/dsh-runtime/runtime/node_modules',
  'C:\\Program Files\\CLD\\resources\\dsh-runtime\\runtime\\node_modules',
  'E:\\Program Files\\CLD\\resources\\dsh-runtime\\runtime\\node_modules',
];

function findHostNodeModules() {
  for (const c of HOST_NM_CANDIDATES) {
    if (c && typeof c === 'string' && c.length > 0) return c;
  }
  return null;
}

function readHostVersion(pkg) {
  try {
    const nm = findHostNodeModules();
    if (nm) {
      const raw = readFileSync(join(nm, pkg, 'package.json'), 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version) return parsed.version;
    }
  } catch { /* 回退 require */ }
  try {
    return require(pkg + '/package.json').version || '?';
  } catch {
    return null;
  }
}

function collectFingerprint() {
  const versions = {};
  let missing = 0;
  for (const p of KEY_PACKAGES) {
    const v = readHostVersion(p);
    if (v === null) { missing++; versions[p] = 'MISSING'; }
    else versions[p] = v;
  }
  const raw = KEY_PACKAGES.map((p) => p + '@' + versions[p]).join('|');
  return { versions, fingerprint: raw, missing, ts: Date.now() };
}

function probeCapabilities(ctx) {
  return {
    agents: typeof ctx.get('agents', false) !== 'undefined' ? 'present' : 'absent',
    tools: typeof ctx.get('tools', false) !== 'undefined' ? 'present' : 'absent',
    webServer: typeof ctx.get('webServer', false) !== 'undefined' ? 'present' : 'absent',
  };
}

function logAdapt(entry) {
  try {
    mkdirSync(ADAPT_DIR, { recursive: true });
    appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n');
  } catch { /* 日志失败不阻塞 */ }
}

function startAdaptGuard(ctx, pluginName) {
  try {
    const fp = collectFingerprint();
    const caps = probeCapabilities(ctx);
    logAdapt({ plugin: pluginName, type: 'boot-fingerprint', ...fp, caps });
    return fp;
  } catch (e) {
    logAdapt({ plugin: pluginName, type: 'adapt-error', error: String(e).slice(0, 100) });
    return null;
  }
}

module.exports = { startAdaptGuard, collectFingerprint, probeCapabilities, logAdapt };
