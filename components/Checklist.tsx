'use client';
import { useState } from 'react';

type Step = { key: string; label: string; status: 'completed' | 'current' | 'pending' | 'blocked'; detail?: string };
const BADGE = { completed: 'Done', current: 'In progress', pending: 'Pending', blocked: 'Blocked' } as const;

export function Checklist({ steps }: { steps: Step[] | false }) {
  const [open, setOpen] = useState(true);
  if (!steps || !steps.length) return null;
  const done = steps.filter((s) => s.status === 'completed').length;
  const pct = Math.round((done * 100) / steps.length);
  const next = steps.find((s) => s.status === 'current' || s.status === 'blocked');
  return (
    <section className="checklist">
      <div className="cl-head" onClick={() => setOpen(!open)}>
        <strong>Lifecycle checklist</strong>
        <span className="muted">{done} / {steps.length} completed</span>
        {next
          ? <span className={`pill ${next.status}`}>{next.status === 'blocked' ? 'Blocked at' : 'Next'}: <b>{next.label}</b></span>
          : <span className="pill completed">All done 🏆</span>}
        <div className="bar"><div style={{ width: `${pct}%` }} /></div>
        <b className="pct">{pct}%</b>
        <span className="muted">{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div className="cl-grid">
          {steps.map((s, i) => (
            <div key={s.key} className={`cl-item ${s.status}`}>
              <span className="cl-icon">{s.status === 'completed' ? '✓' : s.status === 'blocked' ? '⛔' : s.status === 'current' ? '⏳' : i + 1}</span>
              <span className="cl-body"><b>{s.label}</b><small>{s.detail}</small></span>
              <span className="cl-badge">{BADGE[s.status]}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
