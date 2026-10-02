'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { rpc } from '@/lib/odoo';

export default function Customers() {
  const router = useRouter();
  const [term, setTerm] = useState('');
  const [res, setRes] = useState<{ id: number; name: string }[]>([]);
  useEffect(() => {
    const h = setTimeout(() => rpc('otm.dashboard', 'search_customers', [term]).then(setRes).catch(() => setRes([])), 250);
    return () => clearTimeout(h);
  }, [term]);
  return (
    <div>
      <div className="page-head"><h1>Customer 360</h1></div>
      <input className="search" autoFocus placeholder="Search a customer…" value={term} onChange={(e) => setTerm(e.target.value)} />
      <div className="results">
        {res.map((r) => <div key={r.id} className="result" onClick={() => router.push(`/customers/${r.id}`)}>{r.name}</div>)}
        {!res.length && <p className="muted">No customer found</p>}
      </div>
    </div>
  );
}
