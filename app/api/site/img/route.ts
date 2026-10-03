import { NextRequest, NextResponse } from 'next/server';
import { ODOO_DB, ODOO_URL } from '@/lib/server';

// public logo / front-page picture (k=logo or k=<image id>)
export async function GET(req: NextRequest) {
  const k = req.nextUrl.searchParams.get('k') || '';
  if (k !== 'logo' && !/^\d+$/.test(k)) return new NextResponse(null, { status: 400 });
  const path = k === 'logo' ? 'logo' : `image/${k}`;
  try {
    const r = await fetch(`${ODOO_URL}/otm_gym/site/${path}`, { headers: ODOO_DB ? { 'X-Odoo-Database': ODOO_DB } : {}, cache: 'no-store' });
    const type = r.headers.get('content-type') || '';
    if (!r.ok || !type.startsWith('image/')) return new NextResponse(null, { status: 404 });
    return new NextResponse(r.body, { headers: { 'content-type': type, 'cache-control': 'public, max-age=300' } });
  } catch { return new NextResponse(null, { status: 502 }); }
}
