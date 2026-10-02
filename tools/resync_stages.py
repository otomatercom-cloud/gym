# One-off: tick stage lines for projects that were worked BEFORE automatic stage sync existed.
# Run:  odoo-bin shell -d <db> < tools/resync_stages.py
Project = env['project.project'].sudo()
for p in Project.search([('otm_is_lifecycle', '=', True)]):
    steps = []
    if p.task_ids.filtered('otm_lifecycle') and all(t.otm_dev_status == 'completed' for t in p.task_ids.filtered('otm_lifecycle')):
        steps.append('development')
    if p.otm_qc_ids:
        steps.append('testing')
    if p.otm_qc_ids.filtered(lambda q: q.status == 'passed'):
        steps.append('qc')
    if p.otm_deployment_ids.filtered(lambda d: d.status in ('deployed', 'verification', 'completed')):
        steps.append('deployment')
    if p.otm_deployment_ids.filtered(lambda d: d.status == 'completed'):
        steps.append('verification')
    if p.otm_training_ids and p.otm_training_done:
        steps.append('training')
    pays = p.otm_deal_id.payment_ids
    if pays.filtered(lambda x: x.trigger == 'after_training' and x.status == 'received'):
        steps.append('pay30')
    if p.otm_state in ('delivered', 'closed'):
        steps.append('delivery')
    if pays.filtered(lambda x: x.trigger == 'final_delivery' and x.status == 'received'):
        steps.append('pay20')
    if p.otm_review_ids.filtered(lambda r: r.status == 'submitted'):
        steps.append('review')
    if p.otm_state == 'closed':
        steps.append('closed')
    for m in steps:
        p._otm_sync_stages(m)
    print(p.name, steps)
env.cr.commit()
