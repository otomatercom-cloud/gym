'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { rpc } from '@/lib/odoo';
import { imgUrl, logoUrl, resetSite, Site } from '@/lib/site';
import { Spinner, useToast } from '@/components/ui';

const TEXT: [string, string, boolean?][] = [
  ['name', 'Gym name'], ['tagline', 'Tagline'], ['hero_title', 'Front page headline'], ['hero_subtitle', 'Front page sub-headline'],
  ['features', 'Highlights (one per line)', true], ['about_text', 'About text', true],
  ['phone', 'Phone'], ['email', 'Email'], ['opening_hours', 'Opening hours'], ['address', 'Address', true],
];

/** shrink a picked picture in the browser (max side px) and return base64 without the data: prefix */
function shrink(file: File, max: number, type = 'image/jpeg'): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL(type, 0.86).split(',')[1]);
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => reject(new Error('This file is not a picture'));
    img.src = URL.createObjectURL(file);
  });
}

export default function SiteAdmin() {
  const { push } = useToast();
  const [id, setId] = useState(0);
  const [vals, setVals] = useState<Record<string, string>>({});
  const [pub, setPub] = useState<Site>({});
  const [busy, setBusy] = useState(false);
  const [denied, setDenied] = useState(false);
  const logoIn = useRef<HTMLInputElement>(null);
  const picIn = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const sid = await rpc<number>('otm.gym.site', 'admin_state', []);
      const [rec] = await rpc<any[]>('otm.gym.site', 'read', [[sid], TEXT.map((t) => t[0])]);
      setId(sid); setVals(Object.fromEntries(TEXT.map(([k]) => [k, rec[k] || ''])));
      setPub(await rpc<Site>('otm.gym.site', 'public_payload', []));
    } catch (e: any) { if (/not allowed|access/i.test(e.message)) setDenied(true); else push(e.message, 'err'); }
  }, [push]);
  useEffect(() => { load(); }, [load]);

  async function run(fn: () => Promise<any>, ok: string) {
    setBusy(true);
    try { await fn(); resetSite(); await load(); push(ok); } catch (e: any) { push(e.message, 'err'); } finally { setBusy(false); }
  }
  const save = () => run(() => rpc('otm.gym.site', 'write', [[id], vals]), 'Saved. The login page now shows your changes.');
  const upLogo = (f?: File) => f && run(async () => rpc('otm.gym.site', 'write', [[id], { logo: await shrink(f, 600, 'image/png') }]), 'Logo updated');
  const addPics = (files: FileList | null) => files && run(async () => {
    for (const f of Array.from(files)) {
      await rpc('otm.gym.site.image', 'create', [[{ site_id: id, name: f.name.replace(/\.[^.]+$/, ''), sequence: (pub.images?.length || 0) * 10 + 10, image: await shrink(f, 1920) }]]);
    }
  }, 'Pictures added');
  const del = (pid: number) => confirm('Remove this picture?') && run(() => rpc('otm.gym.site.image', 'unlink', [[pid]]), 'Picture removed');
  const cap = (pid: number, name: string) => rpc('otm.gym.site.image', 'write', [[pid], { name }]).then(() => resetSite()).catch((e) => push(e.message, 'err'));
  async function move(i: number, d: number) {
    const imgs = pub.images || []; const j = i + d;
    if (j < 0 || j >= imgs.length) return;
    const order = imgs.map((x) => x.id); [order[i], order[j]] = [order[j], order[i]];
    run(async () => { for (let k = 0; k < order.length; k++) await rpc('otm.gym.site.image', 'write', [[order[k]], { sequence: (k + 1) * 10 }]); }, 'Order saved');
  }

  if (denied) return <p>Only a Gym Manager or Admin can edit the website content.</p>;
  if (!id) return <Spinner />;
  return (
    <div>
      <div className="page-head"><h1>Website and logo</h1><button className="btn primary" disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save text'}</button>
        <a className="btn ghost" href="/login" target="_blank" rel="noreferrer">Preview login page</a></div>
      <div className="cards2">
        <section className="card">
          <h3>Logo</h3>
          <div className="s-logo">{logoUrl(pub) ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={logoUrl(pub)} alt="Logo" /> : <span className="muted">No logo yet</span>}</div>
          <input ref={logoIn} type="file" accept="image/*" hidden onChange={(e) => { upLogo(e.target.files?.[0]); e.target.value = ''; }} />
          <button className="btn ghost" disabled={busy} onClick={() => logoIn.current?.click()}>Upload logo</button>
          <p className="muted">PNG with a transparent background works best. It appears in the sidebar and on the login page.</p>
        </section>
        <section className="card">
          <h3>Front page content</h3>
          <div className="grid">
            {TEXT.map(([k, label, area]) => (
              <label key={k} className={`field ${area ? 'wide' : ''}`}><span>{label}</span>
                {area ? <textarea rows={3} value={vals[k]} onChange={(e) => setVals({ ...vals, [k]: e.target.value })} />
                  : <input value={vals[k]} onChange={(e) => setVals({ ...vals, [k]: e.target.value })} />}</label>
            ))}
          </div>
        </section>
        <section className="card wide">
          <div className="g-head"><h3>Front page pictures <span className="g-count">{pub.images?.length || 0}</span></h3>
            <span><input ref={picIn} type="file" accept="image/*" multiple hidden onChange={(e) => { addPics(e.target.files); e.target.value = ''; }} />
              <button className="btn primary" disabled={busy} onClick={() => picIn.current?.click()}>Add pictures</button></span></div>
          {!pub.images?.length ? <p className="muted">No pictures yet. Add gym photos: they play as a slideshow on the login page.</p> : (
            <div className="s-gallery">
              {pub.images.map((im, i) => (
                <figure key={im.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imgUrl(im)} alt={im.caption} />
                  <input defaultValue={im.caption} placeholder="Caption" onBlur={(e) => e.target.value !== im.caption && cap(im.id, e.target.value)} />
                  <div className="s-act"><button className="btn ghost sm" disabled={i === 0 || busy} onClick={() => move(i, -1)}>←</button>
                    <button className="btn ghost sm" disabled={i === pub.images!.length - 1 || busy} onClick={() => move(i, 1)}>→</button>
                    <button className="btn danger sm" disabled={busy} onClick={() => del(im.id)}>Remove</button></div>
                </figure>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
