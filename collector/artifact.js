#!/usr/bin/env node
/**
 * D1 双 agent 回传产物契约（花店驾驶舱 P3-④）
 *
 * 契约：{ type, data, editable, confirm_required, audit }
 *   type: 'report' | 'promo' | 'dashboard' | 'generic'
 *   data: 结构化内容
 *   editable: 是否可编辑
 *   confirm_required: high 风险动作需确认
 *   audit: 审计日志
 *
 * 用途：驾驶舱产物（周报/方案卡/8卡）跨 agent 回传时校验契约完整
 * 用法：
 *   node artifact.js validate <file.json>        # 校验产物契约
 *   node artifact.js wrap --type report --data '{...}' --editable true   # 包装产物
 *   node artifact.js list                        # 列出已回传产物
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.env.HOME, '.dsh', 'flower-cockpit', 'data');
const ARTIFACTS_FILE = path.join(DATA_DIR, 'artifacts.json');

const VALID_TYPES = ['report', 'promo', 'dashboard', 'generic'];

function load() { try { return JSON.parse(fs.readFileSync(ARTIFACTS_FILE, 'utf8')); } catch { return { artifacts: [] }; } }
function save(doc) { fs.mkdirSync(DATA_DIR, { recursive: true }); fs.writeFileSync(ARTIFACTS_FILE, JSON.stringify(doc, null, 2)); }

// 契约校验
function validate(artifact) {
  const errors = [];
  if (!artifact || typeof artifact !== 'object') return { ok: false, errors: ['产物为空'] };
  if (!artifact.type || !VALID_TYPES.includes(artifact.type)) errors.push('type 缺失或非法: ' + artifact.type + '（允许: ' + VALID_TYPES.join(',') + '）');
  if (artifact.data === undefined) errors.push('data 缺失');
  if (typeof artifact.editable !== 'boolean') errors.push('editable 需为 boolean');
  if (artifact.confirm_required !== undefined && typeof artifact.confirm_required !== 'boolean') errors.push('confirm_required 需为 boolean');
  if (artifact.audit !== undefined && !Array.isArray(artifact.audit)) errors.push('audit 需为数组');
  return { ok: errors.length === 0, errors };
}

function wrap(type, data, editable, confirmRequired) {
  const artifact = {
    id: 'artifact-' + Date.now().toString(36),
    type,
    data: JSON.parse(data),
    editable: editable === 'true',
    confirm_required: confirmRequired === 'true' || undefined,
    audit: [{ at: new Date().toISOString(), action: 'WRAP', note: '产物包装回传' }],
    createdAt: new Date().toISOString()
  };
  const v = validate(artifact);
  if (!v.ok) return { error: v.errors.join('; ') };
  const doc = load();
  doc.artifacts.push(artifact);
  save(doc);
  return artifact;
}

function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];
  const kv = {};
  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith('--')) kv[args[i].slice(2)] = args[i + 1];
  }
  const doc = load();

  switch (cmd) {
    case 'validate': {
      const file = kv.file;
      if (!file) { console.error('用法: artifact.js validate --file <x.json>'); process.exit(1); }
      const artifact = JSON.parse(fs.readFileSync(file, 'utf8'));
      const v = validate(artifact);
      console.log(v.ok ? '✅ 契约有效: ' + artifact.type : '❌ 契约无效: ' + v.errors.join('; '));
      break;
    }
    case 'wrap': {
      const r = wrap(kv.type, kv.data, kv.editable, kv['confirm-required']);
      if (r.error) { console.error('⛔ ' + r.error); process.exit(1); }
      console.log('✅ 产物包装: ' + r.id + ' [' + r.type + '] editable=' + r.editable + (r.confirm_required ? ' confirm_required' : ''));
      break;
    }
    case 'list':
      console.log('=== 已回传产物 (' + doc.artifacts.length + ') ===');
      doc.artifacts.forEach(a => console.log('  [' + a.type.padEnd(10) + '] ' + a.id + ' editable=' + a.editable + (a.confirm_required ? ' ⚠️confirm' : '')));
      break;
    default:
      console.log('用法: artifact.js validate|wrap|list');
  }
}

main();
