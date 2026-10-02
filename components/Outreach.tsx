'use client';
import { useEffect, useMemo, useState } from 'react';
import { MessageCircle, Mail } from 'lucide-react';
import { rpc, searchRead } from '@/lib/odoo';
import { Modal, useToast } from './ui';

type Tpl = { id: number; name: string; body: string; channel: string };
const CC = process.env.NEXT_PUBLIC_DEFAULT_CC || '91'; // country code added to 10-digit numbers
const digits = (s: string) => (s || '').replace(/\D/g, '');
const intl = (s: string) => { const d = digits(s); return d.length === 10 ? CC + d : d; };

export default function Outreach({ rec, onDone }: { rec: any; onDone: () => void }) {
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [tpls, setTpls] = useState<Tpl[]>([]);
  const [services, setServices] = useState('');
  const [text, setText] = useState('');
  const [sel, setSel] = useState(0);
  const me = useMemo(() => {
    try { const m = document.cookie.split('; ').find((c) => c.startsWith('otm_user=')); return m ? JSON.parse(decodeURIComponent(m.split('=')[1])).name : ''; } catch { return ''; }
  }, []);

  useEffect(() => {
    if (!open) return;
    searchRead('otm.message.template', [], ['name', 'body', 'channel'], { order: 'sequence, name' }).then(setTpls).catch(() => setTpls([]));
    searchRead('otm.lead.service.line', [['lead_id', '=', rec.id]], ['service_id']).then((r) => setServices(r.map((x) => x.service_id?.[1]).filter(Boolean).join(', '))).catch(() => {});
  }, [open, rec.id]);

  const fill = (body: string) => body
    .replaceAll('{customer}', rec.customer_id?.[1] || rec.name || '')
    .replaceAll('{company}', rec.company_name || '')
    .replaceAll('{reference}', rec.reference || '')
    .replaceAll('{executive}', me)
    .replaceAll('{service}', services || 'our services');
  useEffect(() => { if (tpls[sel]) setText(fill(tpls[sel].body)); /* eslint-disable-next-line */ }, [tpls, sel, services]);

  const phone = intl(rec.whatsapp_number || rec.contact_number || '');
  async function send(channel: 'whatsapp' | 'email') {
    if (!text.trim()) return;
    const url = channel === 'whatsapp'
      ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
      : `mailto:${rec.email || ''}?subject=${encodeURIComponent('Otomater – ' + (rec.name || ''))}&body=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener');
    try { await rpc('otm.lead', 'action_log_outreach', [[rec.id], channel, text]); push('Message opened and logged on the lead'); onDone(); setOpen(false); }
    catch (e: any) { push(e.message, 'err'); }
  }
  return (
    <>
      <button className="btn ghost" onClick={() => setOpen(true)}><MessageCircle size={15} /> Message</button>
      {open && (
        <Modal title={`Message ${rec.customer_id?.[1] || rec.name}`} onClose={() => setOpen(false)}>
          <label className="field wide"><span>Template</span>
            <select value={sel} onChange={(e) => setSel(Number(e.target.value))}>
              {tpls.map((t, i) => <option key={t.id} value={i}>{t.name}</option>)}
              {!tpls.length && <option>No templates yet</option>}
            </select></label>
          <label className="field wide"><span>Message (you can edit before sending)</span>
            <textarea rows={6} value={text} onChange={(e) => setText(e.target.value)} /></label>
          <p className="muted" style={{ fontSize: '.8rem' }}>
            WhatsApp opens with the text ready in <b>your</b> WhatsApp; you press send there. {phone ? `To: +${phone}` : 'No phone number on this lead.'}
          </p>
          <div className="savebar">
            <button className="btn primary" disabled={!phone || !text.trim()} onClick={() => send('whatsapp')}><MessageCircle size={15} /> WhatsApp</button>
            <button className="btn" disabled={!rec.email || !text.trim()} onClick={() => send('email')}><Mail size={15} /> Email</button>
            <button className="btn ghost" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </Modal>
      )}
    </>
  );
}
