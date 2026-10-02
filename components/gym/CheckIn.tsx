'use client';
import { useEffect, useState } from 'react';
import { nameSearch, rpc } from '@/lib/odoo';
import { Modal, useToast } from '@/components/ui';

/** Reception check-in / check-out: search by name or member id, or scan / type a QR or RFID code. */
export default function CheckIn({ onClose, onDone }: { onClose: () => void; onDone?: () => void }) {
  const { push } = useToast();
  const [term, setTerm] = useState('');
  const [hits, setHits] = useState<[number, string][]>([]);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (term.trim().length < 2) { setHits([]); return; }
    const t = setTimeout(() => nameSearch('otm.gym.member', term).then(setHits).catch(() => setHits([])), 250);
    return () => clearTimeout(t);
  }, [term]);

  async function run(fn: () => Promise<any>, ok: string) {
    setBusy(true);
    try { await fn(); push(ok); onDone?.(); onClose(); } catch (e: any) { push(e.message, 'err'); } finally { setBusy(false); }
  }
  return (
    <Modal title="Member check-in" onClose={onClose}>
      <label className="field"><span>Find member (name, ID or phone)</span><input autoFocus value={term} onChange={(e) => setTerm(e.target.value)} placeholder="e.g. GT-0001" /></label>
      <ul className="g-hits">
        {hits.map(([id, name]) => (
          <li key={id}><span>{name}</span>
            <span><button className="btn primary sm" disabled={busy} onClick={() => run(() => rpc('otm.gym.attendance', 'check_in_member', [id]), `${name} checked in`)}>Check in</button>{' '}
              <button className="btn ghost sm" disabled={busy} onClick={() => run(() => rpc('otm.gym.attendance', 'check_out_member', [id]), `${name} checked out`)}>Check out</button></span></li>
        ))}
        {term.length >= 2 && !hits.length && <li className="muted">No member found</li>}
      </ul>
      <form onSubmit={(e) => { e.preventDefault(); if (code.trim()) run(() => rpc('otm.gym.attendance', 'check_in_by_code', [code.trim()]), 'Checked in'); }} className="g-code">
        <label className="field"><span>QR / RFID code</span><input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Scan or type code" /></label>
        <button className="btn ghost" disabled={busy || !code.trim()}>Check in by code</button>
      </form>
    </Modal>
  );
}
