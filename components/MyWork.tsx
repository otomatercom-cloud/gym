'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarClock, CreditCard, FileText, Flame, ShieldCheck, GraduationCap, RefreshCw, CheckCircle2, Hourglass, PhoneCall } from 'lucide-react';
import { searchCount } from '@/lib/odoo';

const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

type Item = { key: string; label: string; slug: string; model: string; domain: any[]; icon: any; tone: string };
const ITEMS = (): Item[] => [
  { key: 'fu', label: 'Follow-ups due', slug: 'leads', model: 'otm.lead', domain: [['followup_date', '<=', today()], ['stage', 'not in', ['won', 'lost']]], icon: PhoneCall, tone: 'bad' },
  { key: 'demo', label: 'Demos today', slug: 'demos', model: 'otm.demo', domain: [['demo_date', '=', today()], ['status', 'in', ['scheduled', 'confirmed']]], icon: CalendarClock, tone: 'info' },
  { key: 'hot', label: 'Hot leads open', slug: 'leads', model: 'otm.lead', domain: [['lead_quality', '=', 'hot'], ['stage', 'not in', ['won', 'lost']]], icon: Flame, tone: 'bad' },
  { key: 'est', label: 'Estimates in progress', slug: 'estimates', model: 'otm.estimate', domain: [['status', 'in', ['draft', 'internal_review', 'sent', 'negotiation']]], icon: FileText, tone: 'warn' },
  { key: 'adv', label: 'Advance pending', slug: 'leads', model: 'otm.lead', domain: [['stage', '=', 'advance_pending']], icon: Hourglass, tone: 'warn' },
  { key: 'pay', label: 'Payments to collect', slug: 'payments', model: 'otm.deal.payment', domain: [['status', 'in', ['due', 'requested']]], icon: CreditCard, tone: 'bad' },
  { key: 'qc', label: 'QC waiting', slug: 'qc', model: 'otm.qc', domain: [['status', 'in', ['pending', 'testing']]], icon: ShieldCheck, tone: 'warn' },
  { key: 'tr', label: 'Training to run', slug: 'trainings', model: 'otm.training', domain: [['status', 'in', ['scheduled', 'in_progress']]], icon: GraduationCap, tone: 'info' },
  { key: 'ren', label: 'Services expiring', slug: 'services', model: 'otm.client.service', domain: [['status', 'in', ['expiring', 'expired']]], icon: RefreshCw, tone: 'bad' },
];

export default function MyWork() {
  const [rows, setRows] = useState<(Item & { n: number })[] | null>(null);
  useEffect(() => {
    let live = true;
    Promise.all(ITEMS().map(async (i) => {
      try { return { ...i, n: await searchCount(i.model, i.domain) }; } catch { return null; } // no access → hidden
    })).then((r) => live && setRows(r.filter(Boolean) as any));
    return () => { live = false; };
  }, []);
  if (!rows || !rows.length) return null;
  const open = rows.filter((r) => r.n > 0);
  return (
    <section className="card mywork">
      <div className="mw-head"><h3>My work today</h3>
        <span className="muted">{open.length ? `${open.reduce((a, r) => a + r.n, 0)} item(s) need attention` : 'You are all caught up'}</span></div>
      {!open.length ? <p className="mw-clear"><CheckCircle2 size={18} /> Nothing waiting for you right now.</p> : (
        <div className="mw-grid">
          {open.map((r) => {
            const I = r.icon;
            return (
              <Link key={r.key} className={`mw-item ${r.tone}`} href={`/${r.slug}?domain=${encodeURIComponent(JSON.stringify(r.domain))}&title=${encodeURIComponent(r.label)}`}>
                <span className="mw-ico"><I size={18} /></span>
                <span className="mw-n">{r.n}</span>
                <span className="mw-l">{r.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
