'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { actionsFor, Act } from '@/lib/actions';
import { BY_MODEL } from '@/lib/config';
import { rpc } from '@/lib/odoo';
import { Modal, useToast } from './ui';

/** Runs one workflow action. Role checks, prerequisites and state rules are enforced by Odoo; its message is shown as is. */
export async function runAction(model: string, id: number, act: Act, reason: string | undefined, router: ReturnType<typeof useRouter>, push: (m: string, k?: 'ok' | 'err') => void) {
  const res = await rpc<any>(model, act.method, [[id]], act.reason || reason ? { reason: reason || undefined } : {});
  if (res && typeof res === 'object' && res.res_model && res.res_id && BY_MODEL[res.res_model]) {
    push(`${act.label} done`);
    router.push(`/${BY_MODEL[res.res_model].slug}/${res.res_id}`);
    return true;
  }
  push(`${act.label} done`);
  return false;
}

export function ActionButtons({ model, rec, onDone, dirty, small }: { model: string; rec: any; onDone: () => void; dirty?: boolean; small?: boolean }) {
  const router = useRouter();
  const { push } = useToast();
  const [ask, setAsk] = useState<Act | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const acts = actionsFor(model, rec);
  if (!acts.length) return null;
  const nextIdx = small ? -1 : acts.findIndex((a) => a.tone === 'primary');

  async function go(act: Act, why?: string) {
    if (dirty) { push('Save or discard your changes first.', 'err'); return; }
    setBusy(true);
    try {
      const moved = await runAction(model, rec.id, act, why, router, push);
      if (!moved) onDone();
    } catch (e: any) { push(e.message, 'err'); } finally { setBusy(false); setAsk(null); setReason(''); }
  }

  return (
    <>
      <span className="actions">
        {acts.map((a, i) => (
          <button key={a.method} disabled={busy} className={`btn ${a.tone} ${small ? 'sm' : ''} ${i === nextIdx ? 'next' : ''}`} title={i === nextIdx ? 'Suggested next step' : undefined}
            onClick={(e) => { e.stopPropagation(); a.reason ? setAsk(a) : go(a); }}>{i === nextIdx ? `Next: ${a.label} →` : a.label}</button>
        ))}
      </span>
      {ask && (
        <Modal title={ask.label} onClose={() => setAsk(null)}>
          <label className="field wide"><span>Reason</span>
            <textarea autoFocus rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="A reason is required for this action" />
          </label>
          <div className="savebar">
            <button className={`btn ${ask.tone}`} disabled={busy || !reason.trim()} onClick={() => go(ask, reason.trim())}>{ask.label}</button>
            <button className="btn ghost" onClick={() => setAsk(null)}>Back</button>
          </div>
        </Modal>
      )}
    </>
  );
}
