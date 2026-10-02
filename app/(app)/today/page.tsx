'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { rpc } from '@/lib/odoo';
import { Spinner, useToast } from '@/components/ui';
import Avatar from '@/components/gym/Avatar';
import CheckIn from '@/components/gym/CheckIn';

/** Live attendance board for reception: who is inside, who came today, check-in / out. */
export default function Today() {
  const router = useRouter();
  const { push } = useToast();
  const [sum, setSum] = useState<any>(null);
  const [inside, setInside] = useState<any>(null);
  const [present, setPresent] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const load = useCallback(() => {
    Promise.all([rpc('otm.gym.dashboard', 'get_today_attendance', []), rpc('otm.gym.dashboard', 'get_currently_inside', []), rpc<any[]>('otm.gym.dashboard', 'get_members_present', [])])
      .then(([s, i, p]) => { setSum(s); setInside(i); setPresent(p); }).catch((e) => push(e.message, 'err'));
  }, [push]);
  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, [load]);
  if (!sum) return <Spinner />;
  const out = async (id: number) => { try { await rpc('otm.gym.attendance', 'check_out_member', [id]); load(); } catch (e: any) { push(e.message, 'err'); } };
  return (
    <div>
      <div className="page-head"><h1>Today&apos;s attendance</h1><button className="btn primary" onClick={() => setOpen(true)}>Check in member</button></div>
      <div className="kpis">
        <div className="kpi g-good"><span className="kpi-label">Present today</span><span className="kpi-value">{sum.present}</span></div>
        <div className="kpi g-accent"><span className="kpi-label">Currently inside</span><span className="kpi-value">{sum.inside}</span></div>
        <div className="kpi"><span className="kpi-label">Expected</span><span className="kpi-value">{sum.expected}</span></div>
      </div>
      <div className="cards2">
        <section className="card"><h3>Inside now</h3>
          {!inside?.rows.length ? <p className="muted">Nobody inside</p> : <ul className="g-people">{inside.rows.map((r: any) => (
            <li key={r.id}><span onClick={() => router.push(`/members/${r.member_id}`)} style={{ display: 'contents' }}><Avatar name={r.name} id={r.member_id} photo={r.photo} size={36} />
              <span><b>{r.name}</b><small>in {r.check_in} · {r.minutes} min{r.trainer ? ` · ${r.trainer}` : ''}</small></span></span>
              <button className="btn ghost sm" onClick={() => out(r.member_id)}>Check out</button></li>))}</ul>}</section>
        <section className="card"><h3>Visited today</h3>
          {!present.length ? <p className="muted">No check-ins yet</p> : <ul className="g-people">{present.map((r) => (
            <li key={r.id} onClick={() => router.push(`/members/${r.member_id}`)}><Avatar name={r.name} id={r.member_id} photo={r.photo} size={36} />
              <span><b>{r.name}</b><small>{r.code}</small></span><em>{r.check_in}{r.check_out ? ` → ${r.check_out}` : ''}</em></li>))}</ul>}</section>
      </div>
      {open && <CheckIn onClose={() => setOpen(false)} onDone={load} />}
    </div>
  );
}
