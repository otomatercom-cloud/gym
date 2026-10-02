'use client';
import { useEffect, useState } from 'react';
import { money } from '@/lib/util';

type Row = { name: string; leads: number; won: number; value: number };
const METRICS = [
  { k: 'value', label: 'Won value' },
  { k: 'leads', label: 'Leads' },
  { k: 'won', label: 'Deals won' },
  { k: 'conv', label: 'Conversion %' },
] as const;
const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444', '#14b8a6'];

export default function Performance({ title, who, rows, currency }: { title: string; who: string; rows: Row[]; currency: string }) {
  const [metric, setMetric] = useState<(typeof METRICS)[number]['k']>('value');
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0; const t0 = performance.now();
    setP(0);
    const step = (t: number) => { const x = Math.min(1, (t - t0) / 800); setP(1 - Math.pow(1 - x, 3)); if (x < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [metric, rows]);
  if (!rows.length) return null;
  const val = (r: Row) => (metric === 'conv' ? (r.leads ? (r.won * 100) / r.leads : 0) : (r as any)[metric] as number);
  const fmt = (v: number) => (metric === 'value' ? `${currency} ${money(v)}` : metric === 'conv' ? `${v.toFixed(1)}%` : String(v));
  const sorted = [...rows].sort((a, b) => val(b) - val(a));
  const max = Math.max(1, ...sorted.map(val));
  const tot = rows.reduce((a, r) => ({ leads: a.leads + r.leads, won: a.won + r.won, value: a.value + r.value }), { leads: 0, won: 0, value: 0 });
  return (
    <section className="card perf">
      <div className="perf-head">
        <h3>{title}</h3>
        <div className="seg">
          {METRICS.map((m) => <button key={m.k} className={metric === m.k ? 'on' : ''} onClick={() => setMetric(m.k)}>{m.label}</button>)}
        </div>
      </div>
      <div className="perf-sum">
        <div><span>Total leads</span><b>{tot.leads}</b></div>
        <div><span>Deals won</span><b>{tot.won}</b></div>
        <div><span>Won value</span><b>{currency} {money(tot.value)}</b></div>
        <div><span>Conversion</span><b>{tot.leads ? ((tot.won * 100) / tot.leads).toFixed(1) : '0.0'}%</b></div>
      </div>
      <div className="perf-bars">
        {sorted.map((r, i) => (
          <div key={r.name + i} className="perf-row">
            <span className="rank">{i + 1}</span>
            <span className="pname" title={r.name}>{who === 'Team' ? '🏆 ' : ''}{r.name}</span>
            <div className="ptrack"><i style={{ width: `${(val(r) / max) * 100 * p}%`, background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]}, ${COLORS[i % COLORS.length]}bb)` }} /></div>
            <b>{fmt(val(r))}</b>
          </div>
        ))}
      </div>
    </section>
  );
}
