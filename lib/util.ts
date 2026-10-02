import type { FieldDef } from './odoo';

export const stripHtml = (h: any) =>
  typeof h === 'string' ? h.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim() : '';

export const money = (v: number) =>
  new Intl.NumberFormat(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(v || 0);

const GOOD = ['done', 'completed', 'passed', 'received', 'paid', 'won', 'approved', 'active', 'locked', 'signed', 'renewed', 'published', 'deployed', 'submitted', 'earned', 'verified', 'customer_accepted', 'confirmed'];
const BAD = ['lost', 'failed', 'cancelled', 'rejected', 'expired', 'reversed', 'issue', 'rollback', 'no_show', 'on_hold'];
const WARN = ['due', 'requested', 'expiring', 'testing', 'in_progress', 'retest', 'revision', 'negotiation', 'verification', 'assigned', 'follow_up', 'estimate_sent', 'internal_review', 'sent', 'delivered'];
export const tone = (state: string) =>
  GOOD.includes(state) ? 'good' : BAD.includes(state) ? 'bad' : WARN.includes(state) ? 'warn' : 'idle';

export function fmt(value: any, def?: FieldDef): string {
  if (value === false || value === null || value === undefined) return def?.type === 'boolean' ? '✗' : '';
  if (!def) return String(value);
  switch (def.type) {
    case 'many2one': return Array.isArray(value) ? value[1] : '';
    case 'selection': return def.selection?.find(([k]) => k === value)?.[1] ?? String(value);
    case 'boolean': return value ? '✓' : '✗';
    case 'monetary': case 'float': return money(value);
    case 'html': return stripHtml(value);
    case 'datetime': return String(value).slice(0, 16).replace('T', ' ') + (String(value).length > 10 ? '' : '');
    case 'many2many': return value && typeof value === 'object' && 'names' in value ? value.names : Array.isArray(value) ? `${value.length}` : '';
    case 'one2many': return Array.isArray(value) ? `${value.length}` : '';
    case 'binary': return '(file)';
    default: return String(value);
  }
}
// Odoo returns datetimes in UTC without zone: show them in the browser's zone
export const localDt = (v: string) => (v ? new Date(v.replace(' ', 'T') + 'Z').toLocaleString() : '');
