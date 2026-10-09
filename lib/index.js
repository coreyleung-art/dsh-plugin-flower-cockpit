import { readFileSync, existsSync, writeFileSync, appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
// 插件化标准第4项：dsh 版本自适应
// ★ 2026-10-09 迁移（最后变动人 session-b250bf9d · 授权 AUTH-20261009-dea67d017d9f）：
//   原为 `const adapt = require('../lib/adapt.js')`（CJS）⇒ package.json 加 type:module 后
//   ESM 下无 require ⇒ 改为静态 import（lib/adapt.js 同步转 ESM）。
import * as adapt from '../lib/adapt.js';
// 插件化标准第7项：统一文件日志（CLD stdout 不可见，落盘 ~/.dsh/flower-cockpit.log）
const PLUGIN_LOG = join(process.env.HOME || '', '.dsh', 'flower-cockpit.log');
function fileLog(level, msg) {
    try {
        mkdirSync(join(process.env.HOME || '', '.dsh'), { recursive: true });
        appendFileSync(PLUGIN_LOG, JSON.stringify({ ts: new Date().toISOString(), level, plugin: 'flower-cockpit', msg }) + '\n');
    }
    catch { /* 日志失败不阻塞 */ }
}
// dsh-plugin-flower-cockpit — cordis 标准命名导出（对齐 mcp-station 模式）
export const name = 'flower-cockpit';
export const inject = ['webServer'];
const DATA_DIR = join(process.env.HOME || '', '.dsh', 'flower-cockpit', 'data');
const PREFIX = '/flower-cockpit';
function readData(file) {
    const p = join(DATA_DIR, file);
    try {
        return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null;
    }
    catch {
        return null;
    }
}
function json(res, code, body) {
    const data = JSON.stringify(body);
    res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'content-length': Buffer.byteLength(data) });
    res.end(data);
}
function hostAllowed(req) {
    const host = req.headers.host || '';
    return host.startsWith('127.0.0.1') || host.startsWith('localhost') || host.startsWith('10.') || host.startsWith('192.168.');
}
function readBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        req.on('data', (c) => chunks.push(c));
        req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        req.on('error', reject);
    });
}
// D1/D2 产物契约校验（双 agent 回传）
const VALID_TYPES = ['report', 'promo', 'dashboard', 'generic'];
function validateArtifact(a) {
    const errors = [];
    if (!a || typeof a !== 'object')
        return { ok: false, errors: ['产物为空'] };
    if (!a.type || !VALID_TYPES.includes(a.type))
        errors.push('type 非法: ' + a.type);
    if (a.data === undefined)
        errors.push('data 缺失');
    if (typeof a.editable !== 'boolean')
        errors.push('editable 需为 boolean');
    return { ok: errors.length === 0, errors };
}
// 8 卡数据聚合（数据契约 v0.3）
function buildDashboard(providers) {
    const report = providers['report']?.data || null;
    const events = providers['events-revenue']?.data?.stores || [];
    const review = providers['review']?.data || null;
    const traffic = providers['traffic']?.data || null;
    const keywords = providers['keywords']?.data || null;
    const roi = providers['roi']?.data?.flow || [];
    const totalOrders = report && typeof report === 'object' ? report.totalOrders || 0 : 0;
    const pendingReplies = review?.pendingReplies || 0;
    const alerts = providers['alerts']?.data || 0;
    return {
        top: [
            { id: 'orders', label: '周订单', value: totalOrders, unit: '单', tone: 'primary' },
            { id: 'revenue', label: '销售额', value: events.reduce((s, e) => s + (e.revenue || 0), 0), unit: '¥', tone: 'success' },
            { id: 'replies', label: '待回复', value: pendingReplies, unit: '条', tone: 'warn' },
            { id: 'alerts', label: '告警', value: alerts, unit: '', tone: 'danger' },
        ],
        middle: {
            review: review || { note: '待 waimai_review_daily 接入' },
            traffic: traffic || { note: '待 waimai_traffic 接入' },
        },
        bottom: {
            trend: events,
            roi: roi,
            keywords: keywords || { note: '待 waimai_keywords 接入' },
        },
    };
}
export function apply(ctx, _config) {
    const logger = ctx?.logger?.info ? ctx.logger : console;
    logger.info('[flower-cockpit] host ready');
    fileLog('info', 'host ready');
    // 插件化标准第4项：版本指纹记录
    try {
        adapt.startAdaptGuard(ctx, 'flower-cockpit');
    }
    catch (e) {
        fileLog('warn', 'adapt guard: ' + String(e).slice(0, 80));
    }
    const ws = ctx.get('webServer', false);
    if (ws === undefined) {
        logger.info('[flower-cockpit] webServer 不可用，跳过 API 注册');
        return;
    }
    if (typeof ws.register !== 'function') {
        logger.info('[flower-cockpit] webServer.register 不存在，跳过 API 注册');
        return;
    }
    ws.register({
        kind: 'prefix',
        path: PREFIX,
        handler: async (req, res) => {
            if (!hostAllowed(req)) {
                json(res, 403, { ok: false, error: 'forbidden: untrusted host' });
                return;
            }
            const url = new URL(req.url ?? '/', 'http://localhost');
            const p = url.pathname;
            if (p === PREFIX + '/api/state' && req.method === 'GET') {
                const template = readData('report-template.json');
                const skeleton = readData('report-skeleton.json');
                const promos = readData('promos.json');
                const cockpit = readData('cockpit-export.json');
                const providers = cockpit?.providers || {};
                json(res, 200, {
                    ok: true,
                    report: { template, skeleton },
                    promos: promos?.promos || [],
                    dashboard: buildDashboard(providers),
                    dataDir: DATA_DIR
                });
                return;
            }
            if (p === PREFIX + '/api/artifacts' && req.method === 'GET') {
                const artifacts = readData('artifacts.json');
                json(res, 200, { ok: true, artifacts: artifacts?.artifacts || [], contract: '{type,data,editable,confirm_required,audit}' });
                return;
            }
            if (p === PREFIX + '/api/artifacts' && req.method === 'POST') {
                let body;
                try {
                    body = JSON.parse(await readBody(req));
                }
                catch {
                    json(res, 400, { ok: false, error: 'invalid json body' });
                    return;
                }
                const v = validateArtifact(body);
                if (!v.ok) {
                    json(res, 400, { ok: false, errors: v.errors });
                    return;
                }
                const existing = readData('artifacts.json') || { artifacts: [] };
                existing.artifacts.push({ id: 'artifact-' + Date.now().toString(36), ...body, createdAt: new Date().toISOString() });
                try {
                    writeFileSync(join(DATA_DIR, 'artifacts.json'), JSON.stringify(existing, null, 2));
                }
                catch (e) {
                    json(res, 500, { ok: false, error: String(e) });
                    return;
                }
                json(res, 200, { ok: true, id: existing.artifacts[existing.artifacts.length - 1].id });
                return;
            }
            json(res, 404, { ok: false, error: 'not found: ' + p });
        },
    });
    logger.info('[flower-cockpit] API 路由注册完成: ' + PREFIX);
    fileLog('info', 'API routes registered: ' + PREFIX);
}
