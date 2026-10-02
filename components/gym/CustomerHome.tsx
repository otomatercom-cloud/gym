'use client';
import { Badge } from '@/components/ui';
import { money } from '@/lib/util';
import Avatar from './Avatar';
import { LineChart } from './GymCharts';

/** Customer portal home: only the signed-in member's own data (Odoo record rules enforce this server side). */
export default function CustomerHome({ data }: { data: any }) {
  const c = data.customer;
  if (!c?.found) return <div className="card"><h3>Welcome</h3><p className="muted">Your login is not linked to a member profile yet. Please contact the front desk.</p></div>;
  const m = c.member, ms = c.membership, w = c.workout, di = c.diet, p = c.progress?.series;
  return (
    <div className="g-dash">
      <section className="g-hero">
        <div className="g-me"><Avatar name={m.name} id={m.id} photo={m.photo} size={64} />
          <div><small>{data.greeting}</small><h1>{m.name}</h1><p>{m.code}{m.goal ? ` · ${m.goal}` : ''}{m.trainer ? ` · Trainer ${m.trainer}` : ''}</p></div></div>
      </section>
      <div className="kpis">
        <div className="kpi g-good"><span className="kpi-label">Membership</span><span className="kpi-value">{ms?.plan || '—'}</span>{ms && <Badge state={ms.state} />}</div>
        <div className="kpi g-warn"><span className="kpi-label">Valid until</span><span className="kpi-value">{ms?.valid_until || '—'}</span>{ms?.days_left != null && <small>{ms.days_left} days left</small>}</div>
        <div className="kpi"><span className="kpi-label">Visits this month</span><span className="kpi-value">{c.attendance?.visits_month ?? 0}</span>{c.attendance?.inside && <Badge state="active" label="Inside now" />}</div>
        <div className="kpi g-bad"><span className="kpi-label">Outstanding</span><span className="kpi-value">{c.currency} {money(c.outstanding)}</span></div>
      </div>
      <div className="cards2">
        <section className="card"><h3>Today&apos;s workout{w?.title ? ` — ${w.title}` : ''}</h3>
          {!w ? <p className="muted">No active workout plan yet.</p> : w.rest_day ? <p className="muted">Rest day. Recover well.</p> : (
            <table className="tbl"><thead><tr><th>Exercise</th><th>Sets</th><th>Reps</th><th>Rest</th></tr></thead>
              <tbody>{w.exercises.map((e: any, i: number) => <tr key={i}><td>{e.name}</td><td>{e.sets}</td><td>{e.reps}</td><td>{e.rest}s</td></tr>)}</tbody></table>)}</section>
        <section className="card"><h3>Diet plan{di ? ` — ${di.calories}/${di.target} kcal` : ''}</h3>
          {!di ? <p className="muted">No active diet plan yet.</p> : di.meals.map((ml: any) => (
            <div key={ml.meal} className="g-meal"><b>{ml.meal}</b><span>{ml.items.map((i: any) => `${i.food} (${i.qty})`).join(', ')}</span></div>))}</section>
        {c.next_session && <section className="card"><h3>Next session</h3><p><b>{c.next_session.type}</b> · {c.next_session.when}{c.next_session.trainer ? ` · ${c.next_session.trainer}` : ''}</p></section>}
        {p?.labels?.length > 1 && (
          <section className="card wide"><h3>My progress</h3>
            <LineChart labels={p.labels} series={Object.entries(p.series || {}).filter(([k]) => ['weight', 'body_fat'].includes(k)).map(([k, v]: any) => ({ key: k, label: k === 'weight' ? 'Weight (kg)' : 'Body fat %', values: v }))} /></section>
        )}
      </div>
    </div>
  );
}
