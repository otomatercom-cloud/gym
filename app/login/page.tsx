'use client';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import { GYM } from '@/lib/mode';
import { imgUrl, useSite } from '@/lib/site';

export default function Login() {
  const router = useRouter();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const site = useSite();
  const pics = GYM ? site.images || [] : [];
  const [slide, setSlide] = useState(0);
  useEffect(() => { if (pics.length < 2) return; const t = setInterval(() => setSlide((x) => (x + 1) % pics.length), 5000); return () => clearInterval(t); }, [pics.length]);
  useEffect(() => { if (new URLSearchParams(location.search).get('idle')) setErr('You were signed out after a period of inactivity. Please sign in again.'); }, []);

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    const r = await fetch('/api/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ login, password }) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) return setErr(j.error || 'Login failed');
    router.replace('/');
  }
  return (
    <main className="login">
      <section className="login-hero">
        {pics.length > 0 && <div className="login-slides">{pics.map((p, i) => /* eslint-disable-next-line @next/next/no-img-element */ <img key={p.id} src={imgUrl(p)} alt={p.caption} className={i === slide % pics.length ? 'on' : ''} />)}</div>}
        <div className="brand-lg"><Logo height={50} name={process.env.NEXT_PUBLIC_APP_NAME || (GYM ? 'Gym Town' : 'otomater')} /></div>
        <h2>{GYM ? (site.hero_title || 'Train smarter. Run your gym in one place.') : 'From first lead to final delivery — in one place.'}</h2>
        {GYM && site.hero_subtitle && <p className="login-sub">{site.hero_subtitle}</p>}
        <ul>
          {(GYM ? (site.features?.length ? site.features : ['Members, memberships and renewals', 'Attendance, QR and RFID check-in', 'Workout, diet and health assessments', 'Payments, receipts and reports']) : ['Leads, demos, estimates and deals', 'Agreements, payments and commissions', 'Projects, QC, deployment and training', 'Renewals, servers and integrations']).map((t) => <li key={t}>{t}</li>)}
        </ul>
        <small>{GYM ? `© ${site.name || 'Gym Town'}${site.phone ? ' · ' + site.phone : ''}${site.opening_hours ? ' · ' + site.opening_hours : ''}` : '© Otomater · Sales & Project Lifecycle'}</small>
      </section>
      <section className="login-panel">
        <form onSubmit={submit} className="login-card">
          <div className="login-logo-mobile"><Logo height={44} /></div>
          <h1>Welcome back</h1>
          <p className="muted">Sign in with your Odoo account</p>
          <label className="field"><span>Login</span><input autoFocus autoComplete="username" value={login} onChange={(e) => setLogin(e.target.value)} /></label>
          <label className="field"><span>Password</span><input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
          {err && <div className="alert">{err}</div>}
          <button className="btn primary full" disabled={busy || !login || !password}>{busy ? 'Signing in…' : 'Sign in'}</button>
        </form>
      </section>
    </main>
  );
}
