import { SCHEMA } from './schema';
import { BY_MODEL, Extra } from './config';
import { GYM } from './mode';

export type Act = { method: string; label: string; reason: boolean; tone: 'primary' | 'danger' | 'ghost' };

const LABELS: Record<string, string> = {
  action_contact: 'Mark contacted', action_collect_requirement: 'Requirement collected', action_demo: 'Move to demo',
  action_estimate: 'Move to estimate', action_negotiate: 'Start negotiation', action_mark_lost: 'Mark lost', action_reopen: 'Reopen',
  action_confirm: 'Confirm', action_complete: 'Complete', action_cancel: 'Cancel', action_no_show: 'No show',
  action_submit: 'Submit', action_reset_draft: 'Back to draft', action_send: 'Send to customer', action_approve: 'Approve',
  action_reject: 'Reject', action_revise: 'Revise', action_request_discount: 'Request discount approval',
  action_approve_discount: 'Approve discount', action_reject_discount: 'Reject discount', action_relock: 'Re-lock deal',
  action_generate: 'Generate agreement', action_accept: 'Customer accepted', action_sign: 'Mark signed',
  action_request: 'Request payment', action_earn: 'Mark earned', action_pay: 'Pay out', action_reverse: 'Reverse',
  action_otm_start: 'Start', action_start: 'Start', action_otm_submit: 'Submit for review', action_return: 'Return to developer',
  action_otm_complete: 'Complete', action_final_delivery: 'Final delivery', action_close: 'Close project', action_hold: 'Put on hold',
  action_otm_resume: 'Resume', action_skip: 'Skip', action_pass: 'Pass', action_fail: 'Fail', action_assign: 'Assign',
  action_fix: 'Mark fixed', action_deploy: 'Deploy', action_verify: 'Verify', action_report_issue: 'Report issue',
  action_rollback: 'Roll back', action_send_estimate: 'Send renewal estimate', action_confirm_payment: 'Confirm payment',
  action_renew: 'Renew', action_publish: 'Publish', action_unpublish: 'Unpublish',
};
const DANGER = new Set(['action_cancel', 'action_mark_lost', 'action_reject', 'action_reject_discount', 'action_rollback', 'action_reverse', 'action_fail', 'action_no_show', 'action_report_issue']);
const GHOST = new Set(['action_reopen', 'action_reset_draft', 'action_skip', 'action_return', 'action_revise', 'action_hold']);
// estimate discount actions follow the discount workflow, not the estimate status
const FIELD_OVERRIDE: Record<string, string> = {
  action_request_discount: 'discount_state', action_approve_discount: 'discount_state', action_reject_discount: 'discount_state',
};
// these need no reason even though the backend accepts one
const OPTIONAL_REASON = new Set(['action_lock_deal']);

export function labelOf(method: string) {
  return LABELS[method] || method.replace(/^action_(otm_)?/, '').replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
}

/** Buttons the current record state allows. The server still enforces roles + prerequisites. */
export function actionsFor(model: string, rec: any): Act[] {
  const s = SCHEMA[model];
  const out: Act[] = [];
  if (s) {
    for (const [method, spec] of Object.entries(s.actions)) {
      const field = FIELD_OVERRIDE[method] && model === 'otm.estimate' ? FIELD_OVERRIDE[method] : s.stateField;
      if (!spec.from.includes(rec[field]) || (GYM && spec.system)) continue;
      if (rec._hide?.includes(method)) continue; // hidden by a page-level rule (e.g. required stage cannot be skipped)
      out.push({ method, label: labelOf(method), reason: s.reason.includes(method), tone: DANGER.has(method) ? 'danger' : GHOST.has(method) ? 'ghost' : 'primary' });
    }
  }
  const extras: Extra[] = BY_MODEL[model]?.extra || [];
  for (const e of extras) {
    if (e.when(rec)) out.push({ method: e.method, label: e.label, reason: !!e.reason && !OPTIONAL_REASON.has(e.method), tone: e.tone || 'primary' });
  }
  return out;
}

/** fields the action buttons depend on, so lists/tabs read enough to decide */
export function stateFieldsFor(model: string): string[] {
  const cfg = BY_MODEL[model];
  const s = SCHEMA[model];
  const f = new Set<string>();
  if (s) f.add(s.stateField);
  if (model === 'otm.estimate') f.add('discount_state');
  if (model === 'otm.lead') { f.add('customer_id'); }
  if (model === 'otm.deal') { f.add('project_id'); f.add('project_start_allowed'); }
  if (model === 'otm.customer.review') { f.add('published'); }
  if (model === 'otm.project.stage.line') { f.add('required'); f.add('sequence'); }
  if (cfg?.stateField) f.add(cfg.stateField);
  return [...f];
}
export const stateFieldOf = (model: string) => BY_MODEL[model]?.stateField || SCHEMA[model]?.stateField || 'status';
