'use client';
import { money } from '@/lib/util';

type T = { team: string; target: number; achieved: number; percent: number };
export default function Targets({ rows, currency }: { rows: T[]; currency: string }) {
  if (!rows.length) return null;
  const R = 30, C = 2 * Math.PI * R;
  return (
    <section className="card targets">
      <h3>This month&apos;s target</h3>
      <div className="tg-grid">
        {rows.map((t) => {
          const pct = Math.min(100, t.percent);
          const col = t.percent >= 100 ? '#10b981' : t.percent >= 60 ? '#6366f1' : t.percent >= 30 ? '#f59e0b' : '#ef4444';
          return (
            <div key={t.team} className="tg-item">
              <svg viewBox="0 0 80 80" className="tg-ring">
                <circle cx="40" cy="40" r={R} fill="none" stroke="var(--line)" strokeWidth="9" />
                <circle cx="40" cy="40" r={R} fill="none" stroke={col} strokeWidth="9" strokeLinecap="round"
                  strokeDasharray={`${(pct / 100) * C} ${C}`} transform="rotate(-90 40 40)" style={{ transition: 'stroke-dasharray 1s ease' }} />
                <text x="40" y="45" textAnchor="middle" className="tg-pct">{t.percent >= 1000 ? "999+" : Math.round(t.percent)}%</text>
              </svg>
              <div><b>{t.team}</b>
                <div className="muted">{currency} {money(t.achieved)} of {currency} {money(t.target)}</div>
                {t.percent >= 100 ? <span className="tg-ok">🎉 Target achieved</span> : <span className="muted">{currency} {money(t.target - t.achieved)} to go</span>}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
