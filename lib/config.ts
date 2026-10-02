// One entry per business object of the lifecycle. Labels / types / selections come from Odoo (fields_get),
// state buttons come from the module's transition matrices (schema.generated.ts) - nothing is hard-coded twice.
import { GYM } from './mode';
import { GYM_CONFIG, GYM_GROUPS } from './gym.config';
export type Tab = {
  title: string; model: string; field: string; columns: string[]; create?: string[];
  rowActions?: boolean; top?: boolean; link?: string; parentField?: string; // parentField: read this field of the parent (many2one) instead of its id
};
export type Extra = { method: string; label: string; when: (r: any) => boolean; tone?: 'primary' | 'danger' | 'ghost'; reason?: boolean };
export type Cfg = {
  slug: string; model: string; title: string; singular: string; group: string;
  columns: string[]; search: string[]; sections: { title: string; fields: string[] }[];
  create?: string[]; tabs?: Tab[]; tracker?: boolean; extra?: Extra[]; order?: string; stateField?: string;
  prefillToday?: string[]; // date fields suggested as today when empty (user still presses Save)
  domain?: any[]; // always applied: keeps Odoo's own (non-sales) records out of the list
};

const OTM_CONFIG: Cfg[] = [
  {
    slug: 'leads', model: 'otm.lead', title: 'Leads', singular: 'Lead', group: 'Sales', tracker: true,
    columns: ['reference', 'name', 'customer_id', 'sales_team_id', 'salesperson_id', 'lead_quality', 'expected_budget', 'followup_date', 'stage'],
    search: ['name', 'reference', 'company_name', 'contact_number'], order: 'id desc',
    create: ['name', 'customer_id', 'company_name', 'contact_number', 'whatsapp_number', 'email', 'location', 'lead_source_id',
      'sales_team_id', 'salesperson_id', 'requirement_description', 'expected_budget', 'lead_quality', 'priority', 'followup_date', 'followup_note'],
    sections: [
      { title: 'Customer', fields: ['name', 'customer_id', 'company_name', 'contact_number', 'whatsapp_number', 'email', 'location'] },
      { title: 'Sales', fields: ['lead_source_id', 'sales_team_id', 'sales_head_id', 'salesperson_id', 'lead_quality', 'priority', 'expected_budget', 'base_total', 'followup_date', 'followup_note'] },
      { title: 'Requirement', fields: ['requirement_description'] },
      { title: 'Lost', fields: ['lost_reason', 'lost_description', 'lost_date', 'lost_by_id'] },
    ],
    tabs: [
      { title: 'Services', model: 'otm.lead.service.line', field: 'lead_id', columns: ['service_id', 'quantity', 'base_unit_price', 'base_subtotal', 'requirement_description'], create: ['service_id', 'quantity', 'base_unit_price', 'requirement_description'] },
      { title: 'Demos', model: 'otm.demo', field: 'lead_id', columns: ['name', 'demo_date', 'start_time', 'demo_person_id', 'status'], create: ['demo_date', 'start_time', 'end_time', 'demo_person_id', 'notes'], link: 'demos', rowActions: true },
      { title: 'Estimates', model: 'otm.estimate', field: 'lead_id', columns: ['estimate_number', 'revision_number', 'total_amount', 'status'], link: 'estimates' },
      { title: 'Deals', model: 'otm.deal', field: 'lead_id', columns: ['name', 'total_amount', 'status'], link: 'deals' },
    ],
    extra: [
      { method: 'action_create_customer', label: 'Create customer', when: (r) => !r.customer_id && !['won', 'lost'].includes(r.stage), tone: 'ghost' },
      { method: 'action_create_estimate', label: 'Create estimate', when: (r) => ['estimate', 'negotiation'].includes(r.stage) },
    ],
  },
  {
    slug: 'demos', model: 'otm.demo', title: 'Demos', singular: 'Demo', group: 'Sales',
    columns: ['name', 'lead_id', 'demo_date', 'start_time', 'demo_person_id', 'sales_team_id', 'status'], search: ['name', 'lead_id'], order: 'demo_date desc',
    create: ['lead_id', 'demo_date', 'start_time', 'end_time', 'demo_person_id', 'notes'],
    sections: [
      { title: 'Demo', fields: ['lead_id', 'demo_date', 'start_time', 'end_time', 'demo_person_id', 'customer_confirmation', 'notes'] },
      { title: 'Outcome', fields: ['outcome_reason', 'completed_date', 'completed_by_id'] },
    ],
  },
  {
    slug: 'estimates', model: 'otm.estimate', title: 'Estimates', singular: 'Estimate', group: 'Sales',
    columns: ['estimate_number', 'revision_number', 'lead_id', 'customer_id', 'salesperson_id', 'total_amount', 'validity_date', 'status'],
    search: ['estimate_number', 'lead_id'], order: 'id desc',
    sections: [
      { title: 'Estimate', fields: ['lead_id', 'customer_id', 'estimate_date', 'validity_date', 'revision_number', 'sales_team_id', 'salesperson_id'] },
      { title: 'Amounts', fields: ['base_amount', 'additional_amount', 'customization_amount', 'subtotal', 'discount_type', 'discount_value', 'discount_amount', 'tax_percent', 'tax_amount', 'total_amount'] },
      { title: 'Discount approval', fields: ['discount_reason', 'discount_state', 'discount_required_level', 'discount_approved_by_id'] },
      { title: 'Notes', fields: ['notes'] },
    ],
    tabs: [
      { title: 'Services', model: 'otm.estimate.line', field: 'estimate_id', columns: ['service_id', 'description', 'quantity', 'base_unit_price', 'additional_amount', 'selling_unit_price', 'subtotal'], create: ['service_id', 'description', 'quantity', 'base_unit_price', 'additional_amount'] },
      { title: 'Customizations', model: 'otm.estimate.customization', field: 'estimate_id', columns: ['customization_type', 'description', 'percentage', 'fixed_amount', 'calculated_amount'], create: ['customization_type', 'description', 'percentage', 'fixed_amount'] },
    ],
    extra: [
      { method: 'action_recalculate', label: 'Recalculate', when: (r) => r.status === 'draft', tone: 'ghost' },
      { method: 'action_lock_deal', label: 'Lock deal', when: (r) => r.status === 'approved', reason: true },
    ],
  },
  {
    slug: 'deals', model: 'otm.deal', title: 'Deals', singular: 'Deal', group: 'Sales',
    columns: ['name', 'lead_id', 'customer_id', 'sales_team_id', 'total_amount', 'amount_received', 'balance_due', 'status'], search: ['name', 'lead_id'], order: 'id desc',
    sections: [
      { title: 'Deal', fields: ['lead_id', 'estimate_id', 'estimate_revision', 'customer_id', 'sales_team_id', 'sales_head_id', 'salesperson_id', 'locked_date', 'revision_count'] },
      { title: 'Amounts', fields: ['base_total', 'additional_total', 'customization_amount', 'discount_amount', 'tax_amount', 'total_amount', 'commission_total', 'amount_received', 'balance_due'] },
      { title: 'Project', fields: ['project_id', 'project_start_message'] },
    ],
    tabs: [
      { title: 'Agreements', model: 'otm.customer.agreement', field: 'deal_id', columns: ['agreement_number', 'final_amount', 'timeline_days', 'status'], link: 'agreements' },
      { title: 'Payments', model: 'otm.deal.payment', field: 'deal_id', columns: ['name', 'percentage', 'amount', 'due_date', 'status'], link: 'payments', rowActions: true },
      { title: 'Commissions', model: 'otm.sales.commission', field: 'deal_id', columns: ['name', 'trigger', 'commission_amount', 'status'], link: 'commissions' },
    ],
    extra: [
      { method: 'action_create_agreement', label: 'Create agreement', when: (r) => r.status === 'locked' },
      { method: 'action_create_project', label: 'Create project', when: (r) => r.status === 'locked' && !r.project_id && r.project_start_allowed },
    ],
  },
  {
    slug: 'agreements', model: 'otm.customer.agreement', title: 'Agreements', singular: 'Agreement', group: 'Sales',
    columns: ['agreement_number', 'deal_id', 'customer_id', 'final_amount', 'timeline_days', 'signed_date', 'status'], search: ['agreement_number'], order: 'id desc',
    sections: [
      { title: 'Agreement', fields: ['deal_id', 'customer_id', 'final_amount', 'timeline_days', 'payment_schedule_id', 'agreement_date', 'sent_date', 'accepted_date', 'signed_date', 'completed_date'] },
      { title: 'Content', fields: ['scope', 'deliverables', 'terms', 'approved_services', 'approved_customizations', 'customer_acceptance', 'signed_document', 'notes'] },
    ],
    tabs: [{ title: 'Payments', model: 'otm.deal.payment', field: 'agreement_id', columns: ['name', 'percentage', 'amount', 'due_date', 'status'], link: 'payments', rowActions: true }],
  },
  {
    slug: 'payments', model: 'otm.deal.payment', title: 'Payments', singular: 'Payment', group: 'Finance', prefillToday: ['paid_date'],
    columns: ['name', 'deal_id', 'customer_id', 'trigger', 'percentage', 'amount', 'due_date', 'paid_date', 'status'], search: ['name', 'deal_id'], order: 'id desc',
    sections: [
      { title: 'Payment', fields: ['deal_id', 'agreement_id', 'customer_id', 'trigger', 'percentage', 'amount', 'due_date'] },
      { title: 'Receipt (fill before confirming)', fields: ['paid_date', 'payment_method', 'payment_reference', 'proof', 'notes'] },
      { title: 'Confirmation', fields: ['confirmed_by_id', 'confirmed_date'] },
    ],
  },
  {
    slug: 'commissions', model: 'otm.sales.commission', title: 'Commissions', singular: 'Commission', group: 'Finance',
    columns: ['name', 'deal_id', 'sales_head_id', 'trigger', 'commission_amount', 'earned_date', 'status'], search: ['name', 'deal_id'], order: 'id desc',
    sections: [
      { title: 'Commission', fields: ['deal_id', 'sales_head_id', 'sales_team_id', 'customer_id', 'service_id', 'trigger', 'approval_required'] },
      { title: 'Amounts', fields: ['base_amount', 'additional_amount', 'commission_percentage', 'commission_amount'] },
      { title: 'Dates', fields: ['earned_date', 'approved_date', 'paid_date', 'notes'] },
    ],
  },
  {
    slug: 'wallets', model: 'otm.sales.wallet', title: 'Wallets', singular: 'Wallet', group: 'Finance',
    columns: ['sales_head_id', 'balance', 'total_credited', 'total_paid', 'total_reversed'], search: ['sales_head_id'],
    sections: [{ title: 'Wallet', fields: ['sales_head_id', 'balance', 'total_credited', 'total_paid', 'total_reversed'] }],
    tabs: [{ title: 'Transactions', model: 'otm.sales.wallet.transaction', field: 'wallet_id', columns: ['date', 'transaction_type', 'amount', 'signed_amount', 'commission_id'] }],
  },
  {
    slug: 'projects', model: 'project.project', title: 'Projects', singular: 'Project', group: 'Projects', tracker: true, stateField: 'otm_state',
    domain: [['otm_is_lifecycle', '=', true]],
    columns: ['name', 'partner_id', 'user_id', 'otm_sales_team_id', 'otm_progress', 'otm_delay_days', 'date', 'otm_state'], search: ['name'], order: 'id desc',
    sections: [
      { title: 'Project', fields: ['name', 'partner_id', 'user_id', 'otm_state', 'otm_start_date', 'date', 'otm_planned_end', 'otm_progress', 'otm_delay_days'] },
      { title: 'Team', fields: ['otm_developer_ids', 'otm_qc_user_id', 'otm_deploy_user_id', 'otm_trainer_id', 'otm_sales_team_id', 'otm_sales_head_id', 'otm_salesperson_id'] },
      { title: 'Scope', fields: ['otm_scope', 'otm_deliverables', 'otm_requirements', 'otm_services', 'otm_customizations', 'otm_technical_requirements'] },
      { title: 'Links', fields: ['otm_deal_id', 'otm_lead_id', 'otm_agreement_id', 'otm_estimate_id', 'otm_qc_state', 'otm_open_issue_count'] },
    ],
    tabs: [
      { title: 'Stages', top: true, model: 'otm.project.stage.line', field: 'project_id', columns: ['sequence', 'name', 'responsible_role', 'responsible_user_id', 'planned_start', 'planned_deadline', 'delay_days', 'state'], rowActions: true },
      { title: 'Tasks', model: 'project.task', field: 'project_id', columns: ['name', 'user_ids', 'date_deadline', 'allocated_hours', 'otm_dev_status'], create: ['name', 'user_ids', 'date_deadline', 'allocated_hours', 'otm_acceptance_criteria'], link: 'tasks', rowActions: true },
      { title: 'QC', model: 'otm.qc', field: 'project_id', columns: ['name', 'round_number', 'submitted_date', 'issue_count', 'status'], link: 'qc', rowActions: true },
      { title: 'Issues', model: 'otm.qc.issue', field: 'project_id', columns: ['name', 'title', 'severity', 'assigned_developer_id', 'status'], create: ['title', 'description', 'severity', 'assigned_developer_id'], link: 'issues', rowActions: true },
      { title: 'Deployments', model: 'otm.deployment', field: 'project_id', columns: ['name', 'environment', 'version', 'deployment_date', 'status'], create: ['server_id', 'environment', 'version', 'deployment_notes', 'backup_confirmed', 'rollback_available'], link: 'deployments', rowActions: true },
      { title: 'Training', model: 'otm.training', field: 'project_id', columns: ['name', 'training_type', 'trainer_id', 'date', 'status'], create: ['training_type', 'trainer_id', 'date', 'start_time', 'end_time', 'participants', 'topics', 'required'], link: 'trainings', rowActions: true },
      { title: 'Payments', model: 'otm.deal.payment', field: 'deal_id', parentField: 'otm_deal_id', columns: ['name', 'percentage', 'amount', 'due_date', 'status'], link: 'payments', rowActions: true },
      { title: 'Reviews', model: 'otm.customer.review', field: 'project_id', columns: ['name', 'average_rating', 'status'], link: 'reviews', rowActions: true },
    ],
    extra: [{ method: 'action_submit_qc', label: 'Send to QC', when: (r) => r.otm_state === 'in_progress' }],
  },
  {
    slug: 'tasks', model: 'project.task', title: 'Tasks', singular: 'Task', group: 'Projects', stateField: 'otm_dev_status',
    domain: [['otm_lifecycle', '=', true]],
    columns: ['name', 'project_id', 'user_ids', 'date_deadline', 'otm_progress', 'otm_dev_status'], search: ['name'], order: 'id desc',
    create: ['project_id', 'name', 'user_ids', 'date_deadline', 'allocated_hours', 'otm_acceptance_criteria'],
    sections: [
      { title: 'Task', fields: ['name', 'project_id', 'user_ids', 'date_deadline', 'allocated_hours', 'otm_progress'] },
      { title: 'Development', fields: ['otm_acceptance_criteria', 'otm_technical_notes', 'description'] },
    ],
  },
  {
    slug: 'qc', model: 'otm.qc', title: 'QC Rounds', singular: 'QC round', group: 'Projects',
    columns: ['name', 'project_id', 'round_number', 'submitted_date', 'tester_id', 'issue_count', 'status'], search: ['name', 'project_id'], order: 'id desc',
    sections: [
      { title: 'QC', fields: ['project_id', 'round_number', 'submitted_by_id', 'submitted_date', 'tester_id', 'started_date', 'finished_date', 'notes'] },
    ],
    tabs: [{ title: 'Issues', model: 'otm.qc.issue', field: 'qc_id', columns: ['name', 'title', 'severity', 'assigned_developer_id', 'status'], link: 'issues', rowActions: true }],
  },
  {
    slug: 'issues', model: 'otm.qc.issue', title: 'QC Issues', singular: 'Issue', group: 'Projects',
    columns: ['name', 'title', 'project_id', 'severity', 'assigned_developer_id', 'status'], search: ['name', 'title'], order: 'id desc',
    create: ['project_id', 'title', 'description', 'severity', 'assigned_developer_id'],
    sections: [
      { title: 'Issue', fields: ['title', 'project_id', 'qc_id', 'severity', 'assigned_developer_id', 'description'] },
      { title: 'Resolution', fields: ['resolution_notes', 'resolved_date'] },
    ],
  },
  {
    slug: 'deployments', model: 'otm.deployment', title: 'Deployments', singular: 'Deployment', group: 'Projects',
    columns: ['name', 'project_id', 'customer_id', 'environment', 'version', 'deployment_date', 'status'], search: ['name', 'project_id'], order: 'id desc',
    create: ['project_id', 'server_id', 'environment', 'version', 'deployment_notes', 'backup_confirmed', 'rollback_available'],
    sections: [
      { title: 'Deployment', fields: ['project_id', 'server_id', 'environment', 'version', 'backup_confirmed', 'rollback_available', 'deployment_notes'] },
      { title: 'Verification', fields: ['verification_date', 'verified_by', 'customer_confirmation', 'verification_notes', 'verification_issues'] },
    ],
  },
  {
    slug: 'trainings', model: 'otm.training', title: 'Training', singular: 'Training', group: 'Projects',
    columns: ['name', 'project_id', 'training_type', 'trainer_id', 'date', 'required', 'status'], search: ['name', 'project_id'], order: 'date desc',
    create: ['project_id', 'training_type', 'trainer_id', 'date', 'start_time', 'end_time', 'participants', 'topics', 'required'],
    sections: [
      { title: 'Training', fields: ['project_id', 'training_type', 'trainer_id', 'date', 'start_time', 'end_time', 'required', 'customer_confirmation'] },
      { title: 'Content', fields: ['participants', 'topics', 'notes', 'materials', 'recording'] },
    ],
  },
  {
    slug: 'reviews', model: 'otm.customer.review', title: 'Reviews', singular: 'Review', group: 'Projects',
    columns: ['name', 'project_id', 'customer_id', 'average_rating', 'recommendation', 'status'], search: ['name', 'project_id'], order: 'id desc',
    sections: [
      { title: 'Review', fields: ['project_id', 'customer_id', 'requested_date'] },
      { title: 'Ratings (recorded on the customer\'s behalf)', fields: ['rating', 'service_rating', 'quality_rating', 'support_rating', 'recommendation', 'comments', 'testimonial_permission'] },
    ],
    extra: [
      { method: 'action_publish', label: 'Publish', when: (r) => r.status === 'submitted' && !r.published },
      { method: 'action_unpublish', label: 'Unpublish', when: (r) => !!r.published, tone: 'ghost' },
    ],
  },
  {
    slug: 'services', model: 'otm.client.service', title: 'Client Services', singular: 'Service', group: 'Clients',
    columns: ['name', 'customer_id', 'service_kind', 'amount', 'expiry_date', 'days_to_expiry', 'status'], search: ['name', 'service_name'], order: 'expiry_date',
    create: ['customer_id', 'service_name', 'service_kind', 'billing_type', 'amount', 'start_date', 'expiry_date', 'renewal_period', 'renewal_amount', 'responsible_user_id', 'sales_team_id', 'project_id', 'server_id', 'notes'],
    sections: [
      { title: 'Service', fields: ['customer_id', 'service_name', 'service_kind', 'project_id', 'server_id', 'sales_team_id', 'responsible_user_id'] },
      { title: 'Billing & renewal', fields: ['billing_type', 'amount', 'start_date', 'expiry_date', 'days_to_expiry', 'renewal_period', 'renewal_amount', 'last_renewed_date'] },
      { title: 'Notes', fields: ['notes'] },
    ],
    tabs: [{ title: 'Renewals', model: 'otm.service.renewal', field: 'service_id', columns: ['name', 'renewal_period', 'amount', 'old_expiry_date', 'new_expiry_date', 'status'], link: 'renewals', rowActions: true }],
    extra: [
      { method: 'action_send_expiry_notice', label: 'Send expiry notice', when: (r) => ['expiring', 'expired'].includes(r.status), tone: 'ghost' },
      { method: 'action_start_renewal', label: 'Start renewal', when: (r) => r.status !== 'cancelled' && r.status !== 'renewed' },
    ],
  },
  {
    slug: 'renewals', model: 'otm.service.renewal', title: 'Renewals', singular: 'Renewal', group: 'Clients', prefillToday: ['paid_date'],
    columns: ['name', 'service_id', 'customer_id', 'amount', 'old_expiry_date', 'new_expiry_date', 'status'], search: ['name'], order: 'id desc',
    sections: [
      { title: 'Renewal', fields: ['service_id', 'customer_id', 'renewal_period', 'amount', 'old_expiry_date', 'new_expiry_date', 'estimate_note'] },
      { title: 'Approval & payment', fields: ['approval_reference', 'payment_method', 'payment_reference', 'paid_date', 'proof'] },
    ],
  },
  {
    slug: 'servers', model: 'otm.client.server', title: 'Servers', singular: 'Server', group: 'Clients', stateField: 'status',
    columns: ['name', 'customer_id', 'provider', 'ip_address', 'domain', 'hosting_expiry_date', 'ssl_expiry_date', 'status'], search: ['name', 'domain', 'ip_address'], order: 'id desc',
    create: ['name', 'customer_id', 'provider', 'server_type', 'ip_address', 'hostname', 'operating_system', 'cpu', 'ram', 'storage', 'database', 'domain', 'hosting_start_date', 'hosting_expiry_date', 'backup_schedule', 'ssl_expiry_date', 'responsible_id', 'notes'],
    sections: [
      { title: 'Server', fields: ['name', 'customer_id', 'provider', 'server_type', 'ip_address', 'hostname', 'domain', 'status', 'responsible_id'] },
      { title: 'Specs', fields: ['operating_system', 'cpu', 'ram', 'storage', 'database', 'backup_schedule'] },
      { title: 'Expiry', fields: ['hosting_start_date', 'hosting_expiry_date', 'ssl_expiry_date', 'credential_reference', 'notes'] },
    ],
  },
  {
    slug: 'integrations', model: 'otm.client.integration', title: 'Integrations', singular: 'Integration', group: 'Clients',
    columns: ['name', 'customer_id', 'integration_type', 'provider', 'recurring_amount', 'expiry_date', 'status'], search: ['name', 'provider'], order: 'id desc',
    create: ['name', 'customer_id', 'integration_type', 'provider', 'description', 'setup_amount', 'recurring_amount', 'start_date', 'expiry_date', 'renewal_date', 'responsible_developer_id', 'sales_team_id', 'project_id'],
    sections: [
      { title: 'Integration', fields: ['name', 'customer_id', 'integration_type', 'provider', 'project_id', 'sales_team_id', 'responsible_developer_id', 'description'] },
      { title: 'Billing', fields: ['setup_amount', 'recurring_amount', 'start_date', 'expiry_date', 'renewal_date', 'documentation', 'notes'] },
    ],
  },
];

export const CONFIG: Cfg[] = GYM ? GYM_CONFIG : OTM_CONFIG;
export const GROUPS: readonly string[] = GYM ? GYM_GROUPS : ['Sales', 'Finance', 'Projects', 'Clients'];
export const BY_SLUG = Object.fromEntries(CONFIG.map((c) => [c.slug, c]));
export const BY_MODEL = Object.fromEntries(CONFIG.map((c) => [c.model, c]));

