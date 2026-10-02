'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell as BellIcon } from 'lucide-react';
import { rpc } from '@/lib/odoo';
import { BY_MODEL } from '@/lib/config';
import { GYM } from '@/lib/mode';
import { labelOf } from '@/lib/actions';

type N = { id: number; date: string; res_model: string; res_id: number; title: string; by: string; action: string; from: string; to: string; reason: string };
const KEY = 'otm.notif.seen';
const ago = (s: string) => {
  const m = Math.max(0, Math.round((Date.now() - new Date(s.replace(' ', 'T') + 'Z').getTime()) / 60000));
  return m < 1 ? 'just now' : m < 60 ? `${m}m ago` : m < 1440 ? `${Math.round(m / 60)}h ago` : `${Math.round(m / 1440)}d ago`;
};

export default function Bell() {
  const router = useRouter();
  const [items, setItems] = useState<N[]>([]);
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(0);
  const box = useRef<HTMLDivElement>(null);

  const load = useCallback(() => { rpc<N[]>(GYM ? 'otm.gym.dashboard' : 'otm.dashboard', 'get_notifications', [30]).then(setItems).catch(() => {}); }, []);
  useEffect(() => {
    try { setSeen(Number(localStorage.getItem(KEY) || 0)); } catch { /* ignore */ }
    const first = setTimeout(load, 2500); // let the page's own data load first
    const t = setInterval(load, 60000);
    const off = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', off);
    return () => { clearTimeout(first); clearInterval(t); document.removeEventListener('mousedown', off); };
  }, [load]);

  const unread = items.filter((n) => n.id > seen).length;
  function markAll() {
    const top = items.reduce((a, n) => Math.max(a, n.id), 0);
    setSeen(top); try { localStorage.setItem(KEY, String(top)); } catch { /* ignore */ }
  }
  function go(n: N) {
    const slug = BY_MODEL[n.res_model]?.slug;
    setOpen(false);
    if (slug) router.push(`/${slug}/${n.res_id}`);
  }
  return (
    <div className="bell" ref={box}>
      <button className="icon-btn" title="Notifications" onClick={() => { setOpen(!open); if (!open) load(); }}>
        <BellIcon size={16} />{unread > 0 && <i className="bell-dot">{unread > 9 ? '9+' : unread}</i>}
      </button>
      {open && (
        <div className="bell-pop">
          <div className="bell-head"><b>Notifications</b><button className="btn ghost sm" onClick={markAll} disabled={!unread}>Mark all read</button></div>
          <div className="bell-list">
            {!items.length && <p className="muted center" style={{ padding: '1.2rem' }}>Nothing new in the last 14 days.</p>}
            {items.map((n) => (
              <button key={n.id} className={`bell-item ${n.id > seen ? 'new' : ''}`} onClick={() => go(n)}>
                <span className="bi-t"><b>{n.by}</b> · {labelOf(n.action)}</span>
                <span className="bi-d">{n.title}{n.to ? ` → ${n.to}` : ''}</span>
                {n.reason && <span className="bi-r">“{n.reason}”</span>}
                <span className="bi-a">{ago(n.date)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
