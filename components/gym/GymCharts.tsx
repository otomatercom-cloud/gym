'use client';
import { useState } from 'react';

type S = { key: string; label: string; values: number[] };
const COL = ['#E5C21A', '#8a8f98', '#f5f5f0', '#c9a400', '#5d6169'];

/** Multi-series line chart (attendance, growth, weight progress). Pure SVG, tooltips on hover. */
export function LineChart({ labels, series, height = 190 }: { labels: string[]; series: S[]; height?: number }) {
  const [hov, setHov] = useState<number | null>(null);
  const n = labels.length;
  if (!n || series.every((s) => s.values.every((v) => !v))) return <p className="muted">No data for this period</p>;
  const W = 520, H = height, px = 34, py = 16;
  const max = Math.max(1, ...series.flatMap((s) => s.values.filter((v) => v != null) as number[]));
  const x = (i: number) => px + (n === 1 ? (W - px * 2) / 2 : (i * (W - px * 2)) / (n - 1));
  const y = (v: number) => H - py - (v / max) * (H - py * 2);
  const every = Math.ceil(n / 8);
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H + 22}`} className="g-line" onMouseLeave={() => setHov(null)}>
        {[0, .5, 1].map((g) => <g key={g}><line x1={px} x2={W - px} y1={y(max * g)} y2={y(max * g)} className="grid" /><text x={px - 6} y={y(max * g) + 3} textAnchor="end" className="ax">{Math.round(max * g * 10) / 10}</text></g>)}
        {series.map((s, si) => {
          const pts = s.values.map((v, i) => (v == null ? null : [x(i), y(v)])).filter(Boolean) as number[][];
          return <g key={s.key}>
            <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke={COL[si % COL.length]} strokeWidth={si === 0 ? 2.6 : 1.8} strokeLinejoin="round" />
            {pts.length < 40 && pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={si === 0 ? 3 : 2} fill={COL[si % COL.length]} />)}
          </g>;
        })}
        {labels.map((l, i) => (
          <g key={i}>
            <rect x={x(i) - (W - px * 2) / Math.max(n - 1, 1) / 2} y={0} width={(W - px * 2) / Math.max(n - 1, 1)} height={H} fill="transparent" onMouseEnter={() => setHov(i)} />
            {i % every === 0 && <text x={x(i)} y={H + 12} textAnchor="middle" className="ax">{l}</text>}
          </g>
        ))}
        {hov !== null && <line x1={x(hov)} x2={x(hov)} y1={py} y2={H - py} className="cursor" />}
      </svg>
      <div className="g-legend">
        {series.map((s, si) => <span key={s.key}><i style={{ background: COL[si % COL.length] }} />{s.label}{hov !== null && <b> {s.values[hov] ?? '—'}</b>}</span>)}
        {hov !== null && <span className="muted">{labels[hov]}</span>}
      </div>
    </div>
  );
}

/** Horizontal bars (plan distribution, trainer workload, expiry buckets). */
export function Bars({ rows, unit = '' }: { rows: { key: string; label: string; value: number }[]; unit?: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (!rows.length) return <p className="muted">No data</p>;
  return (
    <div className="g-bars">
      {rows.map((r) => (
        <div key={r.key} className="g-bar"><span className="lbl">{r.label}</span>
          <span className="track"><i style={{ width: `${(r.value / max) * 100}%` }} /></span><b>{unit}{Math.round(r.value * 100) / 100}</b></div>
      ))}
    </div>
  );
}
