'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BY_MODEL } from '@/lib/config';
import { money } from '@/lib/util';
import { rpc } from '@/lib/odoo';
import { Spinner, useToast } from '@/components/ui';
import Welcome from '@/components/Welcome';
import { Columns, Donut } from '@/components/Charts';
import Performance from '@/components/Performance';
import MyWork from '@/components/MyWork';
import Trends from '@/components/Trends';
import Targets from '@/components/Targets';

type Opt = { id: number; name: string };

import { GYM } from '@/lib/mode';
import GymDashboard from '@/components/gym/GymDashboard';

export default function Page() { return GYM ? <GymDashboard /> : <Dashboard />; }

function Dashboard() {
  const router = useRouter();
  const { push } = useToast();
  const [data, setData] = useState<any>(null);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [trends, setTrends] = useState<any>(null);
  const [targets, setTargets] = useState<any[]>([]);
  useEffect(() => {
    rpc('otm.dashboard', 'get_trends', [6]).then(setTrends).catch(() => {});
    rpc<any[]>('otm.dashboard', 'get_targets', []).then(setTargets).catch(() => {});
  }, []);

  const load = useCallback(() => {
    rpc('otm.dashboard', 'get_dashboard', [filters]).then(setData).catch((e) => push(e.message, 'err'));
  }, [filters, push]);
  useEffect(() => { load(); }, [load]);

  function open(k: any) {
    const slug = BY_MODEL[k.action?.res_model]?.slug;
    if (!slug) return;
    router.push(`/${slug}?domain=${encodeURIComponent(JSON.stringify(k.action.domain || []))}&title=${encodeURIComponent(k.action.name || '')}`);
  }
  if (!data) return <Spinner />;
  const sel = (key: string, label: string, opts: Opt[]) => (
    <select value={filters[key] || ''} onChange={(e) => setFilters({ ...filters, [key]: e.target.value ? Number(e.target.value) : undefined })}>
      <option value="">{label}</option>{opts.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
    </select>
  );
  const fmtKpi = (k: any) => (k.kind === 'sum' ? `${data.currency} ${money(k.value)}` : Number(k.value).toLocaleString());
  return (
    <div>
      <Welcome subtitle={data.title} />
      <MyWork />
      <div className="page-head"><h1>{data.title}</h1></div>
      {(data.role === 'admin' || data.role === 'head') && (
        <div className="filters">
          {data.role === 'admin' && <>
            {sel('team_id', 'All teams', data.options.teams || [])}
            {sel('head_id', 'All heads', data.options.heads || [])}
            {sel('executive_id', 'All executives', data.options.executives || [])}
            {sel('project_head_id', 'All project heads', data.options.project_heads || [])}
          </>}
          <input type="date" value={filters.date_from || ''} onChange={(e) => setFilters({ ...filters, date_from: e.target.value || undefined })} />
          <input type="date" value={filters.date_to || ''} onChange={(e) => setFilters({ ...filters, date_to: e.target.value || undefined })} />
          <button className="btn ghost sm" onClick={() => setFilters({})}>Reset</button>
        </div>
      )}
      <div className="kpis">
        {data.kpis.map((k: any) => (
          <button key={k.key} className={`kpi ${k.tone}`} onClick={() => open(k)}>
            <span className="kpi-label">{k.label}</span>
            <span className="kpi-value">{fmtKpi(k)}</span>
          </button>
        ))}
      </div>
      {(data.role === 'head' || data.role === 'admin') && (() => {
        const t = data.tables.find((x: any) => x.rows?.length && x.columns?.length === 4);
        if (!t) return null;
        const rows = t.rows.map((r: any) => { const v = Object.values(r) as any[]; return { name: String(v[0]), leads: Number(v[1]), won: Number(v[2]), value: Number(v[3]) }; });
        return <Performance title={data.role === 'admin' ? 'Team performance — all teams' : 'My team performance'} who={data.role === 'admin' ? 'Team' : 'Exec'} rows={rows} currency={data.currency} />;
      })()}
      <Targets rows={targets} currency={data.currency} />
      {trends && <Trends data={trends} />}
      <div className="cards2">
        {data.charts.map((c: any, idx: number) => (
          <section key={c.title} className="card">
            <h3>{c.title}</h3>
            {idx % 2 === 0 && c.rows.length <= 8 ? <Donut rows={c.rows} /> : <Columns rows={c.rows} />}
          </section>
        ))}
        {data.tables.map((t: any) => (
          <section key={t.title} className="card">
            <h3>{t.title}</h3>
            <table className="tbl"><thead><tr>{t.columns.map((c: string) => <th key={c}>{c}</th>)}</tr></thead>
              <tbody>{t.rows.map((r: any, i: number) => (
                <tr key={i}>{Object.values(r).map((v: any, j) => <td key={j}>{j === t.money_col ? `${data.currency} ${money(v)}` : v}</td>)}</tr>
              ))}</tbody></table>
          </section>
        ))}
      </div>
    </div>
  );
}
