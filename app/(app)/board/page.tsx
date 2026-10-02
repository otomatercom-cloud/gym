'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { rpc } from '@/lib/odoo';
import { Spinner, useToast } from '@/components/ui';

export default function Board() {
  const router = useRouter();
  const { push } = useToast();
  const [cols, setCols] = useState<any[] | null>(null);
  useEffect(() => { rpc('otm.dashboard', 'get_project_board', [{}]).then((d) => setCols(d.columns)).catch((e) => push(e.message, 'err')); }, [push]);
  if (!cols) return <Spinner />;
  return (
    <div>
      <div className="page-head"><h1>Project board</h1></div>
      <div className="board">
        {cols.map((c) => (
          <div key={c.key} className="col">
            <h4>{c.label} <span className="count">{c.count}</span></h4>
            {c.cards.map((p: any) => (
              <div key={p.id} className="pcard" onClick={() => router.push(`/projects/${p.id}`)}>
                <b>{p.name}</b>
                <div className="muted">{p.customer}</div>
                <div className="bar"><div style={{ width: `${p.progress}%` }} /></div>
                <div className="meta"><span>{p.progress}%</span>{p.delay_days > 0 && <span className="late">{p.delay_days}d late</span>}</div>
                <div className="meta muted"><span>{p.project_head || 'No project head'}</span>{p.deadline && <span>{p.deadline}</span>}</div>
                <div className="tags">{p.payment && <em>{p.payment}</em>}{p.qc && <em>{p.qc}</em>}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
