import { NextResponse } from 'next/server';
import { ODOO_DB, ODOO_URL } from '@/lib/server';

// public front-page content (logo, texts, picture list) - no login needed, no member data
export async function GET() {
  try {
    const r = await fetch(`${ODOO_URL}/otm_gym/site`, { headers: ODOO_DB ? { 'X-Odoo-Database': ODOO_DB } : {}, next: { revalidate: 30 } });
    if (!r.ok) return NextResponse.json({}, { status: 200 });
    return NextResponse.json(await r.json());
  } catch { return NextResponse.json({}, { status: 200 }); }
}
