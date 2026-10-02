'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BY_MODEL } from '@/lib/config';
import { money } from '@/lib/util';
import { rpc } from '@/lib/odoo';
import { Badge, Spinner, useToast } from '@/components/ui';
import { Donut } from '@/components/Charts';
import Welcome from '@/components/Welcome';
import Avatar from './Avatar';
import { Bars, LineChart } from './GymCharts';
import CheckIn from './CheckIn';
import CustomerHome from './CustomerHome';

const RANGES = [['today', 'Today'], ['7d', '7 days'], ['30d', '30 days'], ['90d', '90 days']];

export default function GymDashboard() {
  const router = useRouter();
  const { push } = useToast();
  const [d, setD] = useState<any>(null);
  const [range, setRange] = useState('7d');
  const [growth, setGrowth] = useState('daily');
  const [win, setWin] = useState(30);
  const [checkin, setCheckin] = useState(false);

  const load = useCallback(() => {
    rpc('otm.gym.dashboard', 'get_dashboard', [{ range, growth, expiry_window: win }]).then(setD).catch((e) => push(e.message, 'err'));
  }, [range, growth, win, push]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { const t = setInterval(load, 60000); return () => clearInterval(t); }, [load]);

  if (!d) return <Spinner />;
  if (d.role === 'customer') return <CustomerHome data={d} />;
  const cur = d.currency || '';
  const fmt = (k: any) => (k.kind === 'sum' ? `${cur} ${money(k.value)}` : Number(k.value).toLocaleString());
  const open = (k: any) => {
    const slug = BY_MODEL[k.action?.res_model]?.slug;
    if (slug) router.push(`/${slug}?domain=${encodeURIComponent(JSON.stringify(k.action.domain || []))}&title=${encodeURIComponent(k.action.name || '')}`);
  };
  const att = d.attendance;
  const ch = d.charts || {};
  return (
    <div className="g-dash">
      <Welcome subtitle={d.summary?.length ? d.summary.map((x: any) => `${x.value} ${x.label}`).join(' · ') : 'Here is what is happening at the gym today.'} />
      {d.quick_actions?.length > 0 && (
        <div className="g-quick g-quickbar">
          {d.quick_actions.map((q: any) => q.href === '#checkin'
            ? <button key={q.key} className="btn primary" onClick={() => setCheckin(true)}>{q.label}</button>
            : <Link key={q.key} href={q.href} className="btn ghost">{q.label}</Link>)}
        </div>
      )}

      <div className="kpis">
        {d.kpis.map((k: any) => (
          <button key={k.key} className={`kpi g-${k.tone}`} onClick={() => open(k)}>
            <span className="kpi-label">{k.label}</span><span className="kpi-value">{fmt(k)}</span>
          </button>
        ))}
      </div>

      {d.today_panel && (
        <section className="card g-today">
          <h3>Today</h3>
          <div className="g-today-grid">
            {d.today_panel.map((t: any) => <div key={t.key}><b>{t.kind === 'sum' ? `${cur} ${money(t.value)}` : t.value}</b><span>{t.label}</span></div>)}
          </div>
        </section>
      )}

      <div className="cards2">
        {att && (
          <section className="card wide">
            <div className="g-head"><h3>Attendance</h3>
              <div className="g-seg">{RANGES.map(([k, l]) => <button key={k} className={range === k ? 'on' : ''} onClick={() => setRange(k)}>{l}</button>)}</div></div>
            <LineChart labels={att.labels} series={att.series.filter((s: any) => s.key !== 'percent' && s.key !== 'expected')} />
          </section>
        )}
        {d.currently_inside && (
          <section className="card">
            <h3>Currently inside <span className="g-count">{d.currently_inside.count}</span></h3>
            <PeopleList rows={d.currently_inside.rows} empty="Nobody inside right now" right={(r: any) => `${r.minutes} min`} />
          </section>
        )}
        {d.members_present && (
          <section className="card">
            <h3>Members present today</h3>
            <PeopleList rows={d.members_present} empty="No check-ins yet" right={(r: any) => `${r.check_in}${r.check_out ? ' → ' + r.check_out : ''}`} />
          </section>
        )}
        {d.sessions && (
          <section className="card">
            <h3>Today&apos;s sessions</h3>
            {!d.sessions.length ? <p className="muted">No sessions today</p> : (
              <table className="tbl"><tbody>{d.sessions.map((s: any) => (
                <tr key={s.id} className="click" onClick={() => router.push(`/appointments/${s.id}`)}>
                  <td>{s.time12 || s.time}</td><td>{s.member}</td><td className="muted">{s.type}</td><td><Badge state={s.state} /></td></tr>))}</tbody></table>
            )}
          </section>
        )}
        {d.expiring_memberships && (
          <section className="card">
            <div className="g-head"><h3>Expiring memberships</h3>
              <div className="g-seg">{[7, 15, 30].map((w) => <button key={w} className={win === w ? 'on' : ''} onClick={() => setWin(w)}>{w}d <em>{d.expiring_memberships.counts[String(w)]}</em></button>)}</div></div>
            {!d.expiring_memberships.rows.length ? <p className="muted">Nothing expiring</p> : (
              <ul className="g-people">{d.expiring_memberships.rows.map((r: any) => (
                <li key={r.id} onClick={() => router.push(`/members/${r.member_id}`)}>
                  <Avatar name={r.name} id={r.member_id} photo={r.photo} size={34} />
                  <span><b>{r.name}</b><small>{r.plan} · {r.end_date}</small></span>
                  <Badge state={r.days_left <= 3 ? 'expired' : r.days_left <= 7 ? 'due' : 'idle'} label={`${r.days_left}d left`} /></li>))}</ul>
            )}
          </section>
        )}
        {ch.member_growth && (
          <section className="card">
            <div className="g-head"><h3>Member growth</h3>
              <div className="g-seg">{['daily', 'weekly', 'monthly'].map((g) => <button key={g} className={growth === g ? 'on' : ''} onClick={() => setGrowth(g)}>{g}</button>)}</div></div>
            <LineChart labels={ch.member_growth.labels} series={ch.member_growth.series} />
          </section>
        )}
        {ch.revenue && <section className="card"><h3>Revenue</h3><Bars rows={ch.revenue} unit={cur + ' '} /></section>}
        {ch.membership_distribution && <section className="card"><h3>Membership plans</h3><Donut rows={ch.membership_distribution} /></section>}
        {ch.membership_expiry && <section className="card"><h3>Expiry buckets</h3><Bars rows={ch.membership_expiry} /></section>}
        {ch.trainer_workload && (
          <section className="card"><h3>Trainer workload</h3>
            <Bars rows={ch.trainer_workload.map((t: any) => ({ key: String(t.id), label: t.trainer, value: t.members }))} /></section>
        )}
        {d.role_panels?.my_members && (
          <section className="card"><h3>My members <span className="g-count">{d.role_panels.my_members.count}</span></h3>
            <ul className="g-people">{d.role_panels.my_members.rows.map((m: any) => (
              <li key={m.id} onClick={() => router.push(`/members/${m.id}`)}><Avatar name={m.name} id={m.id} photo={m.photo} size={34} />
                <span><b>{m.name}</b><small>{m.member_code}{m.membership_expiry ? ` · until ${m.membership_expiry}` : ''}</small></span></li>))}</ul></section>
        )}
        {d.role_panels?.assessments_due && (
          <section className="card"><h3>Assessments due <span className="g-count">{d.role_panels.assessments_due.count}</span></h3>
            <ul className="g-people">{d.role_panels.assessments_due.rows.map((m: any) => (
              <li key={m.id} onClick={() => router.push(`/members/${m.id}`)}><Avatar name={m.name} id={m.id} photo={m.photo} size={34} /><span><b>{m.name}</b><small>{m.member_code}</small></span></li>))}</ul></section>
        )}
        {d.role_panels?.upcoming && (
          <section className="card"><h3>Upcoming (7 days)</h3>
            {!d.role_panels.upcoming.length ? <p className="muted">Nothing scheduled</p> : <table className="tbl"><tbody>{d.role_panels.upcoming.map((u: any) => (
              <tr key={u.id} className="click" onClick={() => router.push(`/appointments/${u.id}`)}><td>{u.when}</td><td>{u.member}</td><td className="muted">{u.type}</td></tr>))}</tbody></table>}</section>
        )}
        {d.role_panels?.progress && (
          <section className="card"><h3>Member progress (weight)</h3>
            <ul className="g-people">{d.role_panels.progress.map((p: any) => (
              <li key={p.member_id} onClick={() => router.push(`/members/${p.member_id}`)}><Avatar name={p.name} id={p.member_id} photo={p.photo} size={34} />
                <span><b>{p.name}</b><small>{p.from ?? '—'} → {p.to ?? '—'} kg</small></span>
                {p.delta !== null && <Badge state={p.delta <= 0 ? 'good' : 'due'} label={`${p.delta > 0 ? '+' : ''}${p.delta} kg`} />}</li>))}</ul></section>
        )}
        {d.role_panels?.recent_assessments && (
          <section className="card"><h3>Recent assessments</h3>
            <table className="tbl"><tbody>{d.role_panels.recent_assessments.map((a: any) => (
              <tr key={a.id} className="click" onClick={() => router.push(`/assessments/${a.id}`)}><td>{a.date}</td><td>{a.member}</td><td><Badge state={a.state} /></td></tr>))}</tbody></table></section>
        )}
        {d.notifications?.length > 0 && (
          <section className="card"><h3>Alerts</h3>
            <ul className="g-notes">{d.notifications.map((n: any) => (
              <li key={n.id}><b>{n.title}</b><small>{n.by} · {n.date.slice(0, 16)}</small></li>))}</ul></section>
        )}
      </div>
      {checkin && <CheckIn onClose={() => setCheckin(false)} onDone={load} />}
    </div>
  );
}

function PeopleList({ rows, empty, right }: { rows: any[]; empty: string; right: (r: any) => string }) {
  const router = useRouter();
  if (!rows.length) return <p className="muted">{empty}</p>;
  return (
    <ul className="g-people">{rows.map((r) => (
      <li key={r.id} onClick={() => router.push(`/members/${r.member_id}`)}>
        <Avatar name={r.name} id={r.member_id} photo={r.photo} size={34} />
        <span><b>{r.name}</b><small>{r.code}{r.trainer ? ` · ${r.trainer}` : ''}</small></span><em>{right(r)}</em></li>))}</ul>
  );
}
