window.__ModuleLoader__.load({
  id: "dsh-plugin-flower-cockpit",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.tsx
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);
var import_react = __toESM(require("react"));
var import_react_dom = require("react-dom");
var import_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
function showBadge(text) {
  try {
    let el = document.getElementById("fc-error-badge");
    if (!el) {
      el = document.createElement("div");
      el.id = "fc-error-badge";
      el.style.cssText = "position:fixed;right:12px;bottom:12px;z-index:999999;max-width:70vw;background:#7f1d1d;color:#fff;padding:10px 14px;border-radius:10px;font:12px/1.6 ui-monospace,Menlo,monospace;white-space:pre-wrap;box-shadow:0 4px 16px rgba(0,0,0,.45);cursor:pointer";
      el.addEventListener("click", () => el?.remove());
      document.body.appendChild(el);
    }
    el.textContent = "[\u9A7E\u9A76\u8231] " + text;
  } catch {
  }
}
if (typeof window !== "undefined") {
  window.addEventListener("error", (e) => showBadge("error: " + String(e.error?.message ?? e.message)));
  window.addEventListener("unhandledrejection", (e) => showBadge("rejection: " + String(e.reason?.message ?? e.reason)));
}
function FcErrorBoundary({ children }) {
  return /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, children);
}
var CSS_ID = "dsh-plugin-flower-cockpit";
var css = `
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
if (typeof document !== "undefined" && !document.getElementById(CSS_ID)) {
  const el = document.createElement("style");
  el.id = CSS_ID;
  el.textContent = css;
  document.head.appendChild(el);
}
async function api(path) {
  const res = await fetch(path);
  return res.json();
}
function CockpitDrawer({ onClose }) {
  const [state, setState] = (0, import_react.useState)({});
  const [tab, setTab] = (0, import_react.useState)("dashboard");
  const [busy, setBusy] = (0, import_react.useState)(false);
  const [toast, setToast] = (0, import_react.useState)(null);
  const load = async () => {
    setBusy(true);
    try {
      const s = await api("/flower-cockpit/api/state");
      setState(s);
    } catch (e) {
      setState({ error: String(e?.message ?? e) });
    } finally {
      setBusy(false);
    }
  };
  (0, import_react.useEffect)(() => {
    load();
  }, []);
  const showToast = (t) => {
    setToast(t);
    setTimeout(() => setToast(null), 2500);
  };
  return /* @__PURE__ */ import_react.default.createElement("div", { id: CSS_ID + "-drawer", onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ import_react.default.createElement("div", { className: "fc-head" }, /* @__PURE__ */ import_react.default.createElement("h3", null, "\u{1F3EA} \u82B1\u5E97\u9A7E\u9A76\u8231"), /* @__PURE__ */ import_react.default.createElement("div", { className: "fc-row" }, /* @__PURE__ */ import_react.default.createElement(import_dsh_client_ui_primitives.Button, { small: true, icon: busy ? void 0 : "refresh", onClick: load }, "\u5237\u65B0"), /* @__PURE__ */ import_react.default.createElement(import_dsh_client_ui_primitives.Button, { small: true, icon: "close", onClick: onClose }, "\u5173\u95ED"))), /* @__PURE__ */ import_react.default.createElement("div", { className: "fc-body" }, state.error && /* @__PURE__ */ import_react.default.createElement(import_dsh_client_ui_primitives.Pill, { tone: "danger" }, state.error), !state.error && /* @__PURE__ */ import_react.default.createElement("div", { className: "fc-row", style: { marginBottom: 12 } }, /* @__PURE__ */ import_react.default.createElement(import_dsh_client_ui_primitives.Button, { small: true, tone: tab === "dashboard" ? "primary" : "ghost", onClick: () => setTab("dashboard") }, "\u9A7E\u9A76\u8231"), /* @__PURE__ */ import_react.default.createElement(import_dsh_client_ui_primitives.Button, { small: true, tone: tab === "report" ? "primary" : "ghost", onClick: () => setTab("report") }, "\u7ECF\u8425\u5468\u62A5"), /* @__PURE__ */ import_react.default.createElement(import_dsh_client_ui_primitives.Button, { small: true, tone: tab === "promo" ? "primary" : "ghost", onClick: () => setTab("promo") }, "\u4FC3\u9500\u65B9\u6848")), tab === "dashboard" && /* @__PURE__ */ import_react.default.createElement("div", { className: "fc-section" }, /* @__PURE__ */ import_react.default.createElement("h4", null, "\u9A7E\u9A76\u8231 8 \u5361"), state.dashboard ? /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("div", { className: "fc-card" }, /* @__PURE__ */ import_react.default.createElement("h4", { style: { margin: "0 0 8px", fontSize: 12, color: "var(--dsw-text-secondary)" } }, "\u9876\u90E8\u6307\u6807"), /* @__PURE__ */ import_react.default.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 } }, state.dashboard.top.map((c) => /* @__PURE__ */ import_react.default.createElement("div", { key: c.id, style: { background: "var(--dsw-surface, #222)", border: "1px solid var(--dsw-border, #333)", borderRadius: 8, padding: "10px 12px" } }, /* @__PURE__ */ import_react.default.createElement("div", { className: "fc-muted" }, c.label), /* @__PURE__ */ import_react.default.createElement("div", { style: { fontSize: 18, fontWeight: 600, color: c.tone === "danger" ? "#f87171" : c.tone === "success" ? "#4ade80" : c.tone === "warn" ? "#fbbf24" : "var(--dsw-text,#eee)" } }, c.value, c.unit))))), /* @__PURE__ */ import_react.default.createElement("div", { className: "fc-card" }, /* @__PURE__ */ import_react.default.createElement("h4", { style: { margin: "0 0 8px", fontSize: 12, color: "var(--dsw-text-secondary)" } }, "\u4E2D\u90E8 \xB7 \u8BC4\u4EF7/\u6D41\u91CF"), /* @__PURE__ */ import_react.default.createElement("div", { className: "fc-muted" }, state.dashboard.middle?.review?.note || "\u8BC4\u4EF7\u6570\u636E\u5DF2\u63A5\u5165"), /* @__PURE__ */ import_react.default.createElement("div", { className: "fc-muted" }, state.dashboard.middle?.traffic?.note || "\u6D41\u91CF\u6570\u636E\u5DF2\u63A5\u5165")), /* @__PURE__ */ import_react.default.createElement("div", { className: "fc-card" }, /* @__PURE__ */ import_react.default.createElement("h4", { style: { margin: "0 0 8px", fontSize: 12, color: "var(--dsw-text-secondary)" } }, "\u4E0B\u90E8 \xB7 7 \u5929\u8D8B\u52BF/\u8425\u9500"), /* @__PURE__ */ import_react.default.createElement("div", { className: "fc-muted" }, "\u8D8B\u52BF\u5E97\u6570: ", state.dashboard.bottom?.trend?.length || 0, " | ROI \u5468\u671F: ", state.dashboard.bottom?.roi?.length || 0, " | ", state.dashboard.bottom?.keywords?.note || "\u5173\u952E\u8BCD\u5DF2\u63A5\u5165"))) : /* @__PURE__ */ import_react.default.createElement("div", { className: "fc-muted" }, "\u9A7E\u9A76\u8231\u6570\u636E\u5F85\u63A5\u5165\uFF08\u5148\u8DD1 data-provider refresh-all\uFF09")), tab === "report" && /* @__PURE__ */ import_react.default.createElement("div", { className: "fc-section" }, /* @__PURE__ */ import_react.default.createElement("h4", null, "\u53EF\u7F16\u8F91\u7ECF\u8425\u5468\u62A5\uFF08A3\uFF09"), state.report?.template ? /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("div", { className: "fc-card" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "fc-row", style: { marginBottom: 8 } }, /* @__PURE__ */ import_react.default.createElement("strong", { style: { fontSize: 13 } }, state.report.template.store), /* @__PURE__ */ import_react.default.createElement(import_dsh_client_ui_primitives.Pill, null, state.report.template.period || "\u672C\u5468"), /* @__PURE__ */ import_react.default.createElement(import_dsh_client_ui_primitives.Pill, { tone: "success" }, "\u53EF\u7F16\u8F91")), state.report.template.placeholders && Object.keys(state.report.template.placeholders).length > 0 && /* @__PURE__ */ import_react.default.createElement("div", { className: "fc-row", style: { marginBottom: 8 } }, Object.entries(state.report.template.placeholders).map(([k, v]) => /* @__PURE__ */ import_react.default.createElement(import_dsh_client_ui_primitives.Pill, { key: k, tone: "accent" }, v, " ", /* @__PURE__ */ import_react.default.createElement("span", { className: "fc-muted" }, k)))), state.report.template.charts && state.report.template.charts.length > 0 && /* @__PURE__ */ import_react.default.createElement("div", { className: "fc-row" }, state.report.template.charts.map((c) => /* @__PURE__ */ import_react.default.createElement(import_dsh_client_ui_primitives.Pill, { key: c.id }, c.label)))), state.report.skeleton?.diagnosis && state.report.skeleton.diagnosis.length > 0 && /* @__PURE__ */ import_react.default.createElement("div", { className: "fc-card" }, /* @__PURE__ */ import_react.default.createElement("h4", { style: { margin: "0 0 8px", fontSize: 12, color: "var(--dsw-text-secondary)" } }, "\u77ED\u677F\u8BCA\u65AD"), state.report.skeleton.diagnosis.map((d, i) => /* @__PURE__ */ import_react.default.createElement("div", { key: i, style: { marginBottom: 8, fontSize: 12 } }, /* @__PURE__ */ import_react.default.createElement("strong", null, d.metric), d.score && /* @__PURE__ */ import_react.default.createElement("div", { className: "fc-muted" }, "\u5F97\u5206: ", d.score), d.impact && /* @__PURE__ */ import_react.default.createElement("div", { className: "fc-muted", style: { marginTop: 2 } }, d.impact)))), state.report.skeleton?.actions && /* @__PURE__ */ import_react.default.createElement("div", { className: "fc-card" }, /* @__PURE__ */ import_react.default.createElement("h4", { style: { margin: "0 0 8px", fontSize: 12, color: "var(--dsw-text-secondary)" } }, "\u884C\u52A8\u5EFA\u8BAE"), /* @__PURE__ */ import_react.default.createElement("div", { style: { fontSize: 12 } }, state.report.skeleton.actions))) : /* @__PURE__ */ import_react.default.createElement("div", { className: "fc-muted" }, "\u6682\u65E0\u5468\u62A5\u6A21\u677F\uFF08\u5148\u8DD1 A1/A2 \u91C7\u96C6\u5668\uFF09")), tab === "promo" && /* @__PURE__ */ import_react.default.createElement("div", { className: "fc-section" }, /* @__PURE__ */ import_react.default.createElement("h4", null, "\u4FC3\u9500\u65B9\u6848\u5361\uFF08B3\uFF09"), state.promos && state.promos.length > 0 ? state.promos.map((p) => /* @__PURE__ */ import_react.default.createElement("div", { className: "fc-card", key: p.id }, /* @__PURE__ */ import_react.default.createElement("div", { className: "fc-row", style: { marginBottom: 6 } }, /* @__PURE__ */ import_react.default.createElement("strong", { style: { fontSize: 13 } }, p.name), /* @__PURE__ */ import_react.default.createElement("span", { className: "fc-status" }, /* @__PURE__ */ import_react.default.createElement(import_dsh_client_ui_primitives.StateDot, { state: p.status === "done" ? "done" : p.status === "executing" ? "ongoing" : p.status === "rejected" || p.status === "cancelled" ? "error" : "warning" }), p.status)), /* @__PURE__ */ import_react.default.createElement("div", { className: "fc-muted", style: { marginBottom: 4 } }, p.product, " \xB7 ", p.mode, "=", p.value, " \xB7 risk=", p.risk), p.dryRun && /* @__PURE__ */ import_react.default.createElement(import_dsh_client_ui_primitives.Pill, { tone: "warn" }, "dry-run"))) : /* @__PURE__ */ import_react.default.createElement("div", { className: "fc-muted" }, "\u6682\u65E0\u65B9\u6848\u5361\uFF08\u5148\u8DD1 B1 promo.js \u521B\u5EFA\uFF09")), toast && /* @__PURE__ */ import_react.default.createElement(import_dsh_client_ui_primitives.Toast, { text: toast, onDone: () => setToast(null) })));
}
function CockpitEntry() {
  const [open, setOpen] = (0, import_react.useState)(false);
  const [badge, setBadge] = (0, import_react.useState)(null);
  (0, import_react.useEffect)(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("flower-cockpit:open", onOpen);
    const t = setTimeout(() => {
      fetch("/flower-cockpit/api/state").then((r) => r.json()).then((s) => {
        if (!s.ok && !s.error) setBadge("API \u65E0\u54CD\u5E94\uFF08host \u672A\u6302\u8F7D?\uFF09");
      }).catch(() => setBadge("API \u4E0D\u53EF\u8FBE"));
    }, 3e3);
    return () => {
      window.removeEventListener("flower-cockpit:open", onOpen);
      clearTimeout(t);
    };
  }, []);
  return /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, open && (0, import_react_dom.createPortal)(
    /* @__PURE__ */ import_react.default.createElement(FcErrorBoundary, null, /* @__PURE__ */ import_react.default.createElement(CockpitDrawer, { onClose: () => setOpen(false) })),
    document.body
  ), badge && /* @__PURE__ */ import_react.default.createElement("div", { style: { position: "fixed", right: 12, bottom: 12, zIndex: 999999, background: "#7f1d1d", color: "#fff", padding: "8px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer" }, onClick: () => setBadge(null) }, "[\u9A7E\u9A76\u8231] ", badge));
}
var inject = ["slots"];
function apply(ctx) {
  console.info("[flower-cockpit] client loaded");
  if (typeof document !== "undefined" && !document.getElementById(CSS_ID)) {
    const el = document.createElement("style");
    el.id = CSS_ID;
    el.textContent = css;
    document.head.appendChild(el);
  }
  ctx.slots.inject(
    "sidebar.footer.action",
    () => ctx.slots.register(
      {
        name: "sidebar.footer.action",
        id: "flower-cockpit",
        order: 8,
        label: () => "\u9A7E\u9A76\u8231"
      },
      CockpitEntry
    )
  );
}

    // 手动导出 apply/inject（esbuild 0.28 CJS 未自动生成）
    exports.apply = typeof apply !== 'undefined' ? apply : undefined;
    exports.inject = typeof inject !== 'undefined' ? inject : undefined;
    return module.exports;
  }
});
