// dsh-plugin-flower-cockpit — Client half v1
// 花店驾驶舱 UI：可编辑经营周报（A3）+ 促销方案卡（B3）+ 8 卡驾驶舱（C 预留）
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button, Pill, StateDot, Toast, } from '@deepseek-ai/dsh-client-ui-primitives';
// ── diagnostics badge ──
function showBadge(text) {
    try {
        let el = document.getElementById('fc-error-badge');
        if (!el) {
            el = document.createElement('div');
            el.id = 'fc-error-badge';
            el.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:999999;max-width:70vw;background:#7f1d1d;color:#fff;padding:10px 14px;border-radius:10px;font:12px/1.6 ui-monospace,Menlo,monospace;white-space:pre-wrap;box-shadow:0 4px 16px rgba(0,0,0,.45);cursor:pointer';
            el.addEventListener('click', () => el?.remove());
            document.body.appendChild(el);
        }
        el.textContent = '[驾驶舱] ' + text;
    }
    catch { /* ignore */ }
}
if (typeof window !== 'undefined') {
    window.addEventListener('error', (e) => showBadge('error: ' + String(e.error?.message ?? e.message)));
    window.addEventListener('unhandledrejection', (e) => showBadge('rejection: ' + String(e.reason?.message ?? e.reason)));
}
// 简单包装：渲染错误由全局 error 监听兜底（showBadge）
function FcErrorBoundary({ children }) {
    return React.createElement(React.Fragment, null, children);
}
const CSS_ID = 'dsh-plugin-flower-cockpit';
const css = `
#${CSS_ID}-drawer { position: fixed; top: 0; right: 0; bottom: 0; width: 440px; z-index: 999998; background: var(--dsw-surface, #1c1c1e); border-left: 1px solid var(--dsw-border, #333); box-shadow: -8px 0 32px rgba(0,0,0,.4); display: flex; flex-direction: column; font-family: -apple-system, 'PingFang SC', sans-serif; }
#${CSS_ID}-drawer .fc-head { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid var(--dsw-border, #333); }
#${CSS_ID}-drawer .fc-head h3 { margin: 0; font-size: 14px; font-weight: 600; color: var(--dsw-text, #eee); }
#${CSS_ID}-drawer .fc-body { flex: 1; overflow-y: auto; padding: 14px 16px; }
#${CSS_ID}-drawer .fc-section { margin-bottom: 18px; }
#${CSS_ID}-drawer .fc-section h4 { margin: 0 0 8px; font-size: 12px; font-weight: 600; color: var(--dsw-text-secondary, #aaa); text-transform: uppercase; letter-spacing: .4px; }
#${CSS_ID}-drawer .fc-card { background: var(--dsw-surface-raised, #26262a); border: 1px solid var(--dsw-border, #333); border-radius: 10px; padding: 12px; margin-bottom: 8px; }
#${CSS_ID}-drawer .fc-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
#${CSS_ID}-drawer .fc-muted { color: var(--dsw-text-secondary, #999); font-size: 11px; }
#${CSS_ID}-drawer .fc-status { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; }
`;
if (typeof document !== 'undefined' && !document.getElementById(CSS_ID)) {
    const el = document.createElement('style');
    el.id = CSS_ID;
    el.textContent = css;
    document.head.appendChild(el);
}
async function api(path) {
    const res = await fetch(path);
    return res.json();
}
function CockpitDrawer({ onClose }) {
    const [state, setState] = useState({});
    const [tab, setTab] = useState('dashboard');
    const [busy, setBusy] = useState(false);
    const [toast, setToast] = useState(null);
    const load = async () => {
        setBusy(true);
        try {
            const s = await api('/flower-cockpit/api/state');
            setState(s);
        }
        catch (e) {
            setState({ error: String(e?.message ?? e) });
        }
        finally {
            setBusy(false);
        }
    };
    useEffect(() => { load(); }, []);
    const showToast = (t) => { setToast(t); setTimeout(() => setToast(null), 2500); };
    return (React.createElement("div", { id: CSS_ID + '-drawer', onClick: (e) => e.stopPropagation() },
        React.createElement("div", { className: "fc-head" },
            React.createElement("h3", null, "\uD83C\uDFEA \u82B1\u5E97\u9A7E\u9A76\u8231"),
            React.createElement("div", { className: "fc-row" },
                React.createElement(Button, { small: true, icon: busy ? undefined : 'refresh', onClick: load }, "\u5237\u65B0"),
                React.createElement(Button, { small: true, icon: "close", onClick: onClose }, "\u5173\u95ED"))),
        React.createElement("div", { className: "fc-body" },
            state.error && React.createElement(Pill, { tone: "danger" }, state.error),
            !state.error && (React.createElement("div", { className: "fc-row", style: { marginBottom: 12 } },
                React.createElement(Button, { small: true, tone: tab === 'dashboard' ? 'primary' : 'ghost', onClick: () => setTab('dashboard') }, "\u9A7E\u9A76\u8231"),
                React.createElement(Button, { small: true, tone: tab === 'report' ? 'primary' : 'ghost', onClick: () => setTab('report') }, "\u7ECF\u8425\u5468\u62A5"),
                React.createElement(Button, { small: true, tone: tab === 'promo' ? 'primary' : 'ghost', onClick: () => setTab('promo') }, "\u4FC3\u9500\u65B9\u6848"))),
            tab === 'dashboard' && (React.createElement("div", { className: "fc-section" },
                React.createElement("h4", null, "\u9A7E\u9A76\u8231 8 \u5361"),
                state.dashboard ? (React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "fc-card" },
                        React.createElement("h4", { style: { margin: '0 0 8px', fontSize: 12, color: 'var(--dsw-text-secondary)' } }, "\u9876\u90E8\u6307\u6807"),
                        React.createElement("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 } }, state.dashboard.top.map((c) => (React.createElement("div", { key: c.id, style: { background: 'var(--dsw-surface, #222)', border: '1px solid var(--dsw-border, #333)', borderRadius: 8, padding: '10px 12px' } },
                            React.createElement("div", { className: "fc-muted" }, c.label),
                            React.createElement("div", { style: { fontSize: 18, fontWeight: 600, color: c.tone === 'danger' ? '#f87171' : c.tone === 'success' ? '#4ade80' : c.tone === 'warn' ? '#fbbf24' : 'var(--dsw-text,#eee)' } },
                                c.value,
                                c.unit)))))),
                    React.createElement("div", { className: "fc-card" },
                        React.createElement("h4", { style: { margin: '0 0 8px', fontSize: 12, color: 'var(--dsw-text-secondary)' } }, "\u4E2D\u90E8 \u00B7 \u8BC4\u4EF7/\u6D41\u91CF"),
                        React.createElement("div", { className: "fc-muted" }, state.dashboard.middle?.review?.note || '评价数据已接入'),
                        React.createElement("div", { className: "fc-muted" }, state.dashboard.middle?.traffic?.note || '流量数据已接入')),
                    React.createElement("div", { className: "fc-card" },
                        React.createElement("h4", { style: { margin: '0 0 8px', fontSize: 12, color: 'var(--dsw-text-secondary)' } }, "\u4E0B\u90E8 \u00B7 7 \u5929\u8D8B\u52BF/\u8425\u9500"),
                        React.createElement("div", { className: "fc-muted" },
                            "\u8D8B\u52BF\u5E97\u6570: ",
                            state.dashboard.bottom?.trend?.length || 0,
                            " | ROI \u5468\u671F: ",
                            state.dashboard.bottom?.roi?.length || 0,
                            " | ",
                            state.dashboard.bottom?.keywords?.note || '关键词已接入')))) : React.createElement("div", { className: "fc-muted" }, "\u9A7E\u9A76\u8231\u6570\u636E\u5F85\u63A5\u5165\uFF08\u5148\u8DD1 data-provider refresh-all\uFF09"))),
            tab === 'report' && (React.createElement("div", { className: "fc-section" },
                React.createElement("h4", null, "\u53EF\u7F16\u8F91\u7ECF\u8425\u5468\u62A5\uFF08A3\uFF09"),
                state.report?.template ? (React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "fc-card" },
                        React.createElement("div", { className: "fc-row", style: { marginBottom: 8 } },
                            React.createElement("strong", { style: { fontSize: 13 } }, state.report.template.store),
                            React.createElement(Pill, null, state.report.template.period || '本周'),
                            React.createElement(Pill, { tone: "success" }, "\u53EF\u7F16\u8F91")),
                        state.report.template.placeholders && Object.keys(state.report.template.placeholders).length > 0 && (React.createElement("div", { className: "fc-row", style: { marginBottom: 8 } }, Object.entries(state.report.template.placeholders).map(([k, v]) => (React.createElement(Pill, { key: k, tone: "accent" },
                            v,
                            " ",
                            React.createElement("span", { className: "fc-muted" }, k)))))),
                        state.report.template.charts && state.report.template.charts.length > 0 && (React.createElement("div", { className: "fc-row" }, state.report.template.charts.map((c) => React.createElement(Pill, { key: c.id }, c.label))))),
                    state.report.skeleton?.diagnosis && state.report.skeleton.diagnosis.length > 0 && (React.createElement("div", { className: "fc-card" },
                        React.createElement("h4", { style: { margin: '0 0 8px', fontSize: 12, color: 'var(--dsw-text-secondary)' } }, "\u77ED\u677F\u8BCA\u65AD"),
                        state.report.skeleton.diagnosis.map((d, i) => (React.createElement("div", { key: i, style: { marginBottom: 8, fontSize: 12 } },
                            React.createElement("strong", null, d.metric),
                            d.score && React.createElement("div", { className: "fc-muted" },
                                "\u5F97\u5206: ",
                                d.score),
                            d.impact && React.createElement("div", { className: "fc-muted", style: { marginTop: 2 } }, d.impact)))))),
                    state.report.skeleton?.actions && (React.createElement("div", { className: "fc-card" },
                        React.createElement("h4", { style: { margin: '0 0 8px', fontSize: 12, color: 'var(--dsw-text-secondary)' } }, "\u884C\u52A8\u5EFA\u8BAE"),
                        React.createElement("div", { style: { fontSize: 12 } }, state.report.skeleton.actions))))) : React.createElement("div", { className: "fc-muted" }, "\u6682\u65E0\u5468\u62A5\u6A21\u677F\uFF08\u5148\u8DD1 A1/A2 \u91C7\u96C6\u5668\uFF09"))),
            tab === 'promo' && (React.createElement("div", { className: "fc-section" },
                React.createElement("h4", null, "\u4FC3\u9500\u65B9\u6848\u5361\uFF08B3\uFF09"),
                state.promos && state.promos.length > 0 ? (state.promos.map((p) => (React.createElement("div", { className: "fc-card", key: p.id },
                    React.createElement("div", { className: "fc-row", style: { marginBottom: 6 } },
                        React.createElement("strong", { style: { fontSize: 13 } }, p.name),
                        React.createElement("span", { className: 'fc-status' },
                            React.createElement(StateDot, { state: p.status === 'done' ? 'done' : p.status === 'executing' ? 'ongoing' : p.status === 'rejected' || p.status === 'cancelled' ? 'error' : 'warning' }),
                            p.status)),
                    React.createElement("div", { className: "fc-muted", style: { marginBottom: 4 } },
                        p.product,
                        " \u00B7 ",
                        p.mode,
                        "=",
                        p.value,
                        " \u00B7 risk=",
                        p.risk),
                    p.dryRun && React.createElement(Pill, { tone: "warn" }, "dry-run"))))) : React.createElement("div", { className: "fc-muted" }, "\u6682\u65E0\u65B9\u6848\u5361\uFF08\u5148\u8DD1 B1 promo.js \u521B\u5EFA\uFF09"))),
            toast && React.createElement(Toast, { text: toast, onDone: () => setToast(null) }))));
}
function CockpitEntry() {
    const [open, setOpen] = useState(false);
    const [badge, setBadge] = useState(null);
    useEffect(() => {
        const onOpen = () => setOpen(true);
        window.addEventListener('flower-cockpit:open', onOpen);
        // 诊断徽标
        const t = setTimeout(() => {
            fetch('/flower-cockpit/api/state').then(r => r.json()).then((s) => {
                if (!s.ok && !s.error)
                    setBadge('API 无响应（host 未挂载?）');
            }).catch(() => setBadge('API 不可达'));
        }, 3000);
        return () => { window.removeEventListener('flower-cockpit:open', onOpen); clearTimeout(t); };
    }, []);
    return (React.createElement(React.Fragment, null,
        open && createPortal(React.createElement(FcErrorBoundary, null,
            React.createElement(CockpitDrawer, { onClose: () => setOpen(false) })), document.body),
        badge && (React.createElement("div", { style: { position: 'fixed', right: 12, bottom: 12, zIndex: 999999, background: '#7f1d1d', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer' }, onClick: () => setBadge(null) },
            "[\u9A7E\u9A76\u8231] ",
            badge))));
}
// ── cordis slot 注册（对齐 workflow-capture 模式）──
const inject = ['slots'];
function apply(ctx) {
    console.info('[flower-cockpit] client loaded');
    if (typeof document !== 'undefined' && !document.getElementById(CSS_ID)) {
        const el = document.createElement('style');
        el.id = CSS_ID;
        el.textContent = css;
        document.head.appendChild(el);
    }
    ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
        name: 'sidebar.footer.action',
        id: 'flower-cockpit',
        order: 8,
        label: () => '驾驶舱',
    }, CockpitEntry));
}
export { apply, inject };
