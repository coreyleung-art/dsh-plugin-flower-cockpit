// dsh-plugin-flower-cockpit — Client half v1
// 花店驾驶舱 UI：可编辑经营周报（A3）+ 促销方案卡（B3）+ 8 卡驾驶舱（C 预留）
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Button, Input, Pill, StateDot, Toast,
  IconCloseOutline16, IconRefreshOutline16, IconSparkle16, IconPlayOutline16,
} from '@deepseek-ai/dsh-client-ui-primitives';

// ── diagnostics badge ──
function showBadge(text: string): void {
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
  } catch { /* ignore */ }
}
if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => showBadge('error: ' + String((e.error as Error)?.message ?? e.message)));
  window.addEventListener('unhandledrejection', (e) => showBadge('rejection: ' + String((e.reason as Error)?.message ?? e.reason)));
}

// 简单包装：渲染错误由全局 error 监听兜底（showBadge）
function FcErrorBoundary({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
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

interface ReportView {
  template?: { store?: string; period?: string; sections?: Record<string, { title: string; content: string[] }>; placeholders?: Record<string, string>; charts?: { id: string; label: string }[] };
  skeleton?: { overview?: string; diagnosis?: { metric: string; score?: string; impact?: string }[]; linkages?: string[]; actions?: string };
}
interface PromoView { id: string; name: string; product: string; mode: string; value: number; status: string; risk: string; dryRun: boolean; target?: string }

interface State {
  ok?: boolean; error?: string;
  report?: ReportView;
  promos?: PromoView[];
  dashboard?: { top: { id: string; label: string; value: number; unit: string; tone: string }[]; middle: any; bottom: any };
  dataDir?: string;
}

async function api<T>(path: string): Promise<T> {
  const res = await fetch(path);
  return res.json() as Promise<T>;
}

function CockpitDrawer({ onClose }: { onClose: () => void }) {
  const [state, setState] = useState<State>({});
  const [tab, setTab] = useState<'dashboard' | 'report' | 'promo'>('dashboard');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const load = async () => {
    setBusy(true);
    try {
      const s = await api<State>('/flower-cockpit/api/state');
      setState(s);
    } catch (e) {
      setState({ error: String((e as Error)?.message ?? e) });
    } finally { setBusy(false); }
  };
  useEffect(() => { load(); }, []);

  const showToast = (t: string) => { setToast(t); setTimeout(() => setToast(null), 2500); };

  return (
    <div id={CSS_ID + '-drawer'} onClick={(e) => e.stopPropagation()}>
      <div className="fc-head">
        <h3>🏪 花店驾驶舱</h3>
        <div className="fc-row">
          <Button small icon={busy ? undefined : 'refresh'} onClick={load}>刷新</Button>
          <Button small icon="close" onClick={onClose}>关闭</Button>
        </div>
      </div>
      <div className="fc-body">
        {state.error && <Pill tone="danger">{state.error}</Pill>}
        {!state.error && (
          <div className="fc-row" style={{ marginBottom: 12 }}>
            <Button small tone={tab === 'dashboard' ? 'primary' : 'ghost'} onClick={() => setTab('dashboard')}>驾驶舱</Button>
            <Button small tone={tab === 'report' ? 'primary' : 'ghost'} onClick={() => setTab('report')}>经营周报</Button>
            <Button small tone={tab === 'promo' ? 'primary' : 'ghost'} onClick={() => setTab('promo')}>促销方案</Button>
          </div>
        )}


        {tab === 'dashboard' && (
          <div className="fc-section">
            <h4>驾驶舱 8 卡</h4>
            {state.dashboard ? (
              <>
                <div className="fc-card">
                  <h4 style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--dsw-text-secondary)' }}>顶部指标</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {state.dashboard.top.map((c: any) => (
                      <div key={c.id} style={{ background: 'var(--dsw-surface, #222)', border: '1px solid var(--dsw-border, #333)', borderRadius: 8, padding: '10px 12px' }}>
                        <div className="fc-muted">{c.label}</div>
                        <div style={{ fontSize: 18, fontWeight: 600, color: c.tone === 'danger' ? '#f87171' : c.tone === 'success' ? '#4ade80' : c.tone === 'warn' ? '#fbbf24' : 'var(--dsw-text,#eee)' }}>
                          {c.value}{c.unit}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="fc-card">
                  <h4 style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--dsw-text-secondary)' }}>中部 · 评价/流量</h4>
                  <div className="fc-muted">{state.dashboard.middle?.review?.note || '评价数据已接入'}</div>
                  <div className="fc-muted">{state.dashboard.middle?.traffic?.note || '流量数据已接入'}</div>
                </div>
                <div className="fc-card">
                  <h4 style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--dsw-text-secondary)' }}>下部 · 7 天趋势/营销</h4>
                  <div className="fc-muted">
                    趋势店数: {state.dashboard.bottom?.trend?.length || 0} | ROI 周期: {state.dashboard.bottom?.roi?.length || 0} | {state.dashboard.bottom?.keywords?.note || '关键词已接入'}
                  </div>
                </div>
              </>
            ) : <div className="fc-muted">驾驶舱数据待接入（先跑 data-provider refresh-all）</div>}
          </div>
        )}

        {tab === 'report' && (
          <div className="fc-section">
            <h4>可编辑经营周报（A3）</h4>
            {state.report?.template ? (
              <>
                <div className="fc-card">
                  <div className="fc-row" style={{ marginBottom: 8 }}>
                    <strong style={{ fontSize: 13 }}>{state.report.template.store}</strong>
                    <Pill>{state.report.template.period || '本周'}</Pill>
                    <Pill tone="success">可编辑</Pill>
                  </div>
                  {state.report.template.placeholders && Object.keys(state.report.template.placeholders).length > 0 && (
                    <div className="fc-row" style={{ marginBottom: 8 }}>
                      {Object.entries(state.report.template.placeholders).map(([k, v]) => (
                        <Pill key={k} tone="accent">{v} <span className="fc-muted">{k}</span></Pill>
                      ))}
                    </div>
                  )}
                  {state.report.template.charts && state.report.template.charts.length > 0 && (
                    <div className="fc-row">
                      {state.report.template.charts.map((c) => <Pill key={c.id}>{c.label}</Pill>)}
                    </div>
                  )}
                </div>
                {state.report.skeleton?.diagnosis && state.report.skeleton.diagnosis.length > 0 && (
                  <div className="fc-card">
                    <h4 style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--dsw-text-secondary)' }}>短板诊断</h4>
                    {state.report.skeleton.diagnosis.map((d, i) => (
                      <div key={i} style={{ marginBottom: 8, fontSize: 12 }}>
                        <strong>{d.metric}</strong>
                        {d.score && <div className="fc-muted">得分: {d.score}</div>}
                        {d.impact && <div className="fc-muted" style={{ marginTop: 2 }}>{d.impact}</div>}
                      </div>
                    ))}
                  </div>
                )}
                {state.report.skeleton?.actions && (
                  <div className="fc-card">
                    <h4 style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--dsw-text-secondary)' }}>行动建议</h4>
                    <div style={{ fontSize: 12 }}>{state.report.skeleton.actions}</div>
                  </div>
                )}
              </>
            ) : <div className="fc-muted">暂无周报模板（先跑 A1/A2 采集器）</div>}
          </div>
        )}

        {tab === 'promo' && (
          <div className="fc-section">
            <h4>促销方案卡（B3）</h4>
            {state.promos && state.promos.length > 0 ? (
              state.promos.map((p) => (
                <div className="fc-card" key={p.id}>
                  <div className="fc-row" style={{ marginBottom: 6 }}>
                    <strong style={{ fontSize: 13 }}>{p.name}</strong>
                    <span className={'fc-status'}>
                      <StateDot state={p.status === 'done' ? 'done' : p.status === 'executing' ? 'ongoing' : p.status === 'rejected' || p.status === 'cancelled' ? 'error' : 'warning'} />
                      {p.status}
                    </span>
                  </div>
                  <div className="fc-muted" style={{ marginBottom: 4 }}>{p.product} · {p.mode}={p.value} · risk={p.risk}</div>
                  {p.dryRun && <Pill tone="warn">dry-run</Pill>}
                </div>
              ))
            ) : <div className="fc-muted">暂无方案卡（先跑 B1 promo.js 创建）</div>}
          </div>
        )}

        {toast && <Toast text={toast} onDone={() => setToast(null)} />}
      </div>
    </div>
  );
}

function CockpitEntry() {
  const [open, setOpen] = useState(false);
  const [badge, setBadge] = useState<string | null>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener('flower-cockpit:open', onOpen);
    // 诊断徽标
    const t = setTimeout(() => {
      fetch('/flower-cockpit/api/state').then(r => r.json()).then((s: State) => {
        if (!s.ok && !s.error) setBadge('API 无响应（host 未挂载?）');
      }).catch(() => setBadge('API 不可达'));
    }, 3000);
    return () => { window.removeEventListener('flower-cockpit:open', onOpen); clearTimeout(t); };
  }, []);

  return (
    <>
      {open && createPortal(
        <FcErrorBoundary><CockpitDrawer onClose={() => setOpen(false)} /></FcErrorBoundary>,
        document.body
      )}
      {badge && (
        <div style={{ position: 'fixed', right: 12, bottom: 12, zIndex: 999999, background: '#7f1d1d', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer' }} onClick={() => setBadge(null)}>
          [驾驶舱] {badge}
        </div>
      )}
    </>
  );
}

// ── cordis slot 注册（对齐 workflow-capture 模式）──
const inject = ['slots'];

function apply(ctx: { slots: any }) {
  console.info('[flower-cockpit] client loaded');
  if (typeof document !== 'undefined' && !document.getElementById(CSS_ID)) {
    const el = document.createElement('style');
    el.id = CSS_ID;
    el.textContent = css;
    document.head.appendChild(el);
  }
  ctx.slots.inject('sidebar.footer.action', () =>
    ctx.slots.register(
      {
        name: 'sidebar.footer.action',
        id: 'flower-cockpit',
        order: 8,
        label: () => '驾驶舱',
      },
      CockpitEntry,
    ),
  );
}

export { apply, inject };
