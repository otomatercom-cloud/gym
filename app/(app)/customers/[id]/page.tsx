'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { rpc } from '@/lib/odoo';
import { money } from '@/lib/util';
import { Badge, Spinner, useToast } from '@/components/ui';

export default function Customer360() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { push } = useToast();
  const [d, setD] = useState<any>(null);
  useEffect(() => { rpc('otm.dashboard', 'get_customer_360', [Number(id)]).then(setD).catch((e) => push(e.message, 'err')); }, [id, push]);
  if (!d) return <Spinner />;
  const c = d.currency;
  const pairs = (rows: [string, any][]) => rows.map(([k, v]) => <div key={k} className="pair"><span>{k}</span><b>{v}</b></div>);
  const R = (v: any) => (v && v.restricted ? <p className="muted">Restricted for your role</p> : null);
  return (
    <div>
      <div className="page-head">
        <button className="btn ghost sm" onClick={() => router.push('/customers')}>← Search</button>
        <h1>{d.partner.name}</h1>
        <span className="muted">{[d.partner.email, d.partner.phone, d.partner.city, d.partner.country].filter((x: any) => x).join(' · ')}</span>
      </div>
      <div className="cards2">
        <section className="card"><h3>Sales</h3>{R(d.sales) || pairs([['Leads', d.sales.leads], ['Estimates', d.sales.estimates], ['Deals', d.sales.deals], ...(d.sales.deal_value == null ? [] : [['Deal value', `${c} ${money(d.sales.deal_value)}`] as [string, any]]), ['Teams', d.sales.teams.join(', ')], ['Sales heads', d.sales.heads.join(', ')], ['Executives', d.sales.executives.join(', ')]])}</section>
        <section className="card"><h3>Payments</h3>{R(d.payments) || pairs([['Total', `${c} ${money(d.payments.total)}`], ['Received', `${c} ${money(d.payments.received)}`], ['Outstanding', `${c} ${money(d.payments.outstanding)}`]])}</section>
        <section className="card"><h3>Projects</h3>{R(d.projects) || <>
          {pairs([['Active', d.projects.active], ['Completed', d.projects.completed], ['Delayed', d.projects.delayed]])}
          {d.projects.items.map((p: any) => <div key={p.id} className="result" onClick={() => router.push(`/projects/${p.id}`)}>{p.name} <span className="muted">{p.state} · {p.progress}%</span></div>)}</>}</section>
        <section className="card"><h3>Services</h3>{R(d.services) || <>
          {pairs([['Active', d.services.active], ['Expiring', d.services.expiring], ['Expired', d.services.expired]])}
          {d.services.items.map((s: any) => <div key={s.id} className="result" onClick={() => router.push(`/services/${s.id}`)}>{s.name} <Badge state={s.status} /> <span className="muted">{s.expiry}</span></div>)}</>}</section>
        <section className="card"><h3>Servers</h3>{R(d.servers) || d.servers.items.map((s: any) => <div key={s.id} className="result" onClick={() => router.push(`/servers/${s.id}`)}>{s.name} <span className="muted">hosting {s.hosting_expiry || '—'} · SSL {s.ssl_expiry || '—'}</span></div>)}</section>
        <section className="card"><h3>Integrations</h3>{R(d.integrations) || d.integrations.items.map((s: any) => <div key={s.id} className="result" onClick={() => router.push(`/integrations/${s.id}`)}>{s.name} <span className="muted">expires {s.expiry || '—'}</span></div>)}</section>
        <section className="card"><h3>Reviews</h3>{R(d.reviews) || <>{pairs([['Reviews', d.reviews.count], ['Average rating', d.reviews.rating]])}{d.reviews.items.map((r: any) => <p key={r.id} className="muted">“{r.comments}” — {r.rating}★</p>)}</>}</section>
      </div>
    </div>
  );
}
