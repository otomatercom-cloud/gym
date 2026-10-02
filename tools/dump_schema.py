import json, re, glob
out = {}
for m in env.registry.models.values() if False else []: pass
src = {}
for f in glob.glob('/home/claude/addons/sales_project_lifecycle/models/*.py'):
    txt = open(f).read()
    # split on class definitions
    parts = re.split(r'\nclass ', txt)
    for part in parts[1:]:
        mm = re.search(r"_name = '([\w.]+)'", part) or re.search(r"_inherit = '([\w.]+)'", part)
        if not mm: continue
        model = mm.group(1)
        acts = {}
        for dm in re.finditer(r"    def (action_\w+)\(self[^)]*\):(.*?)(?=\n    def |\Z)", part, re.S):
            k = re.search(r"_otm_do_transition\(\s*'(\w+)'", dm.group(2))
            if k: acts[dm.group(1)] = k.group(1)
        if acts: src.setdefault(model, {}).update(acts)
for model, acts in src.items():
    M = env[model]
    mat = getattr(M, '_otm_matrix', {})
    sf = M._otm_state_field
    sel = dict(M._fields[sf]._description_selection(env))
    out[model] = {'state_field': sf, 'states': sel, 'reason_methods': list(M._otm_reason_methods),
        'actions': {meth: {'key': k, 'from': list(mat[k]['from']), 'to': mat[k]['to'], 'system': bool(mat[k].get('system'))} for meth, k in acts.items() if k in mat}}
open('schema_dump.json','w').write(json.dumps(out, indent=1))
print({m: len(v['actions']) for m, v in out.items()})
