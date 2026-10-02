'use client';
import { useCallback, useEffect, useState } from 'react';
import { rpc } from '@/lib/odoo';
import { money } from '@/lib/util';
import { Spinner, useToast } from '@/components/ui';

const csv = (v: any) => { const t = String(v ?? '').replace(/\r?\n/g, ' '); return /[",]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t; };

export default function Reports() {
  const { push } = useToast();
  const [list, setList] = useState<{ code: string; title: string }[] | null>(null);
  const [code, setCode] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [rep, setRep] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { rpc<any[]>('otm.gym.reports', 'list_reports', []).then((l) => { setList(l); if (l[0]) setCode(l[0].code); }).catch((e) => push(e.message, 'err')); }, [push]);
  const run = useCallback(() => {
    if (!code) return;
    setBusy(true);
    rpc('otm.gym.reports', 'get_report', [code, from || false, to || false]).then(setRep).catch((e) => { push(e.message, 'err'); setRep(null); }).finally(() => setBusy(false));
  }, [code, from, to, push]);
  useEffect(() => { run(); }, [code]); // eslint-disable-line react-hooks/exhaustive-deps

  function download() {
    if (!rep) return;
    const lines = [rep.columns.map((c: any) => csv(c.label)).join(','), ...rep.rows.map((r: any[]) => r.map(csv).join(','))];
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }));
    a.download = `${rep.code}_${rep.date_from}_${rep.date_to}.csv`; a.click();
  }
  if (!list) return <Spinner />;
  return (
    <div>
      <div className="page-head"><h1>Reports</h1></div>
      <div className="filters">
        <select value={code} onChange={(e) => setCode(e.target.value)}>{list.map((r) => <option key={r.code} value={r.code}>{r.title}</option>)}</select>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /><input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <button className="btn primary sm" disabled={busy} onClick={run}>{busy ? 'Running…' : 'Run'}</button>
        <button className="btn ghost sm" disabled={!rep?.rows?.length} onClick={download}>Export CSV</button>
        <button className="btn ghost sm noprint" onClick={() => window.print()}>Print</button>
      </div>
      {rep && (
        <section className="card">
          <h3>{rep.title} <small className="muted">{rep.date_from} → {rep.date_to} · {rep.rows.length} rows</small></h3>
          {!rep.rows.length ? <p className="muted">No records in this period.</p> : (
            <div className="table-wrap"><table className="tbl"><thead><tr>{rep.columns.map((c: any) => <th key={c.key}>{c.label}</th>)}</tr></thead>
              <tbody>{rep.rows.map((r: any[], i: number) => <tr key={i}>{r.map((v, j) => <td key={j} className={rep.columns[j].type === 'money' ? 'right' : ''}>{typeof v === 'number' && rep.columns[j].type !== 'int' ? money(v) : String(v ?? '')}</td>)}</tr>)}</tbody></table></div>
          )}
        </section>
      )}
    </div>
  );
}
