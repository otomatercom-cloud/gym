import { NextRequest, NextResponse } from 'next/server';
import { ODOO_URL } from '@/lib/server';

const ALLOWED = new Set(['otm.gym.member', 'otm.gym.trainer']);
// member / trainer photo through the logged-in Odoo session (Odoo's record rules still decide who may see it)
export async function GET(req: NextRequest) {
  const sid = req.cookies.get('odoo_sid')?.value;
  if (!sid) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  const q = req.nextUrl.searchParams;
  const model = q.get('model') || 'otm.gym.member', id = q.get('id') || '';
  if (!ALLOWED.has(model) || !/^\d+$/.test(id)) return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  const r = await fetch(`${ODOO_URL}/web/image/${model}/${id}/image_256`, { headers: { cookie: `session_id=${sid}` }, cache: 'no-store' });
  const type = r.headers.get('content-type') || '';
  if (!r.ok || !type.startsWith('image/')) return new NextResponse(null, { status: 404 });
  return new NextResponse(r.body, { headers: { 'content-type': type, 'cache-control': 'private, max-age=300' } });
}
