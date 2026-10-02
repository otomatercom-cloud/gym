'use client';
import { useState } from 'react';

/** Member photo (authenticated proxy) with an initials fallback - also when no photo exists. */
export default function Avatar({ name, id, photo, size = 40, model = 'otm.gym.member' }: { name: string; id?: number; photo?: any; size?: number; model?: string }) {
  const [bad, setBad] = useState(false);
  const ini = (name || '?').split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const st = { width: size, height: size, fontSize: Math.max(11, size * 0.38) };
  if (!photo || !id || bad) return <span className="g-avatar" style={st}>{ini}</span>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="g-avatar img" style={st} alt={name} loading="lazy" src={`/api/photo?model=${model}&id=${id}&v=${encodeURIComponent(String(photo))}`} onError={() => setBad(true)} />;
}
