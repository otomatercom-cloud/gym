'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tab } from '@/lib/config';
import { stateFieldOf, stateFieldsFor } from '@/lib/actions';
import { FieldDef, fieldsGet, searchRead, withM2MNames } from '@/lib/odoo';
import { fmt } from '@/lib/util';
import { ActionButtons } from './ActionBar';
import { RecordForm } from './RecordForm';
import { Badge, Modal, Spinner, useToast } from './ui';

export function Cell({ name, def, value, stateField }: { name: string; def?: FieldDef; value: any; stateField: string }) {
  if (name === stateField && def?.type === 'selection') return value ? <Badge state={value} label={fmt(value, def)} /> : null;
  return <>{fmt(value, def)}</>;
}

export function Related({ tab, parentId, parent, onChange }: { tab: Tab; parentId: number; parent: any; onChange?: () => void }) {
  const router = useRouter();
  const { push } = useToast();
  const [rows, setRows] = useState<any[] | null>(null);
  const [defs, setDefs] = useState<Record<string, FieldDef>>({});
  const [adding, setAdding] = useState(false);
  const value = tab.parentField ? parent?.[tab.parentField]?.[0] : parentId;
  const sf = stateFieldOf(tab.model);
  const isStage = tab.model === 'otm.project.stage.line';

  const load = useCallback(async () => {
    if (!value) { setRows([]); return; }
    try {
      const d = await fieldsGet(tab.model);
      setDefs(d);
      const fields = [...new Set([...tab.columns.filter((c) => d[c]), ...stateFieldsFor(tab.model).filter((c) => d[c])])];
      let list = await withM2MNames(await searchRead(tab.model, [[tab.field, '=', value]], fields, { order: tab.model === 'otm.project.stage.line' ? 'sequence, id' : 'id', limit: 100 }), d, tab.columns);
      if (tab.model === 'otm.project.stage.line') {
        // same rules as Odoo: a required stage cannot be skipped; only the next stage can start, and only one at a time
        const busy = list.some((r) => r.state === 'in_progress');
        const ps = parent?.otm_state;
        let blockedBefore = false;
        list = list.map((r) => {
          const hide: string[] = [];
          if (ps !== 'in_progress') hide.push('action_start', 'action_complete', 'action_skip');
          if (ps === 'closed' || ps === 'cancelled') hide.push('action_reopen');
          if (r.required) hide.push('action_skip');
          if (busy || blockedBefore) hide.push('action_start');
          if (r.required && !['done', 'skipped'].includes(r.state)) blockedBefore = true;
          return { ...r, _hide: hide };
        });
      }
      setRows(list);
    } catch (e: any) { push(e.message, 'err'); setRows([]); }
  }, [tab, value, push]);
  useEffect(() => { load(); }, [load]);

  if (!rows) return <Spinner />;
  const cols = tab.columns.filter((c) => defs[c]);
  return (
    <div>
      {tab.model === 'otm.project.stage.line' && (
        <p className="hint">Stages are ticked <b>automatically</b> as the real work is finished (tasks, QC, deployment, training, payments, review, closure). The buttons are only for manual corrections.</p>
      )}
      <div className="tab-head">
        <span className="muted">{rows.length} record(s)</span>
        {tab.create && !tab.parentField && <button className="btn primary sm" onClick={() => setAdding(true)}>+ Add</button>}
      </div>
      <div className="table-wrap">
        <table className="tbl">
          <thead><tr>{cols.map((c) => <th key={c}>{c === 'sequence' && isStage ? 'Stage' : defs[c].string}</th>)}{tab.rowActions && <th />}</tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} className={tab.link ? 'click' : ''} onClick={() => tab.link && router.push(`/${tab.link}/${r.id}`)}>
                {cols.map((c) => <td key={c}>{c === 'sequence' && isStage ? <b className="stage-no">{i + 1}</b> : <Cell name={c} def={defs[c]} value={r[c]} stateField={sf} />}</td>)}
                {tab.rowActions && <td className="right"><ActionButtons model={tab.model} rec={r} onDone={() => { load(); onChange?.(); }} small /></td>}
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={cols.length + 1} className="muted center">Nothing here yet</td></tr>}
          </tbody>
        </table>
      </div>
      {adding && tab.create && (
        <Modal title={`New ${tab.title.replace(/s$/, '')}`} onClose={() => setAdding(false)}>
          <RecordForm model={tab.model} mode="create" sections={[{ title: 'Details', fields: tab.create }]}
            defaults={{ [tab.field]: value }} onSaved={() => { setAdding(false); load(); onChange?.(); }} />
        </Modal>
      )}
    </div>
  );
}
