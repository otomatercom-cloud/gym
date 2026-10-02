'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { BY_SLUG } from '@/lib/config';
import { fieldsGet, readRecord, rpc } from '@/lib/odoo';
import { money } from '@/lib/util';
import { Badge, Spinner, useToast } from '@/components/ui';
import { RecordForm } from '@/components/RecordForm';
import { ActionButtons } from '@/components/ActionBar';
import { Chatter } from '@/components/Chatter';
import Avatar from '@/components/gym/Avatar';
import { LineChart } from '@/components/gym/GymCharts';

const TABS = ['overview', 'membership', 'attendance', 'health', 'assessment', 'workout', 'diet', 'appointments', 'payments', 'progress', 'documents', 'notes'] as const;
const LABEL: Record<string, string> = { overview: 'Overview', membership: 'Membership', attendance: 'Attendance', health: 'Health', assessment: 'Assessments', workout: 'Workout', diet: 'Diet', appointments: 'Appointments', payments: 'Payments', progress: 'Progress', documents: 'Documents', notes: 'Notes' };
const SLUG: Record<string, string> = { membership: 'memberships', assessment: 'assessments', workout: 'workouts', diet: 'diets', appointments: 'appointments', payments: 'payments' };

function Table({ rows, cols, slug }: { rows: any[]; cols: [string, string][]; slug?: string }) {
  const router = useRouter();
  if (!rows?.length) return <p className="muted">Nothing recorded yet.</p>;
  const cell = (v: any) => (Array.isArray(v) ? v[1] : typeof v === 'number' ? money(v) : v === false || v == null ? '' : String(v));
  return (
    <div className="table-wrap"><table className="tbl"><thead><tr>{cols.map(([, l]) => <th key={l}>{l}</th>)}</tr></thead>
      <tbody>{rows.map((r) => (
        <tr key={r.id} className={slug ? 'click' : ''} onClick={() => slug && router.push(`/${slug}/${r.id}`)}>
          {cols.map(([k]) => <td key={k}>{['state', 'status', 'payment_status'].includes(k) ? <Badge state={r[k]} /> : cell(r[k])}</td>)}</tr>))}</tbody></table></div>
  );
}
const Restricted = () => <p className="muted">🔒 You do not have access to this information.</p>;
const ok = (v: any) => v && !v.restricted;

export default function Member360() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { push } = useToast();
  const cfg = BY_SLUG['members'];
  const [d, setD] = useState<any>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]>('overview');
  const [edit, setEdit] = useState<any>(null);
  const [selDef, setSelDef] = useState<any>(null);
  const isNew = id === 'new';
  const rid = Number(id);

  const load = useCallback(() => {
    if (isNew) return;
    rpc('otm.gym.dashboard', 'get_member_360', [rid]).then(setD).catch((e) => push(e.message, 'err'));
  }, [rid, isNew, push]);
  useEffect(() => { load(); fieldsGet('otm.gym.member').then((f) => setSelDef(f.status)).catch(() => {}); }, [load]);

  if (!cfg) return <p>Unknown page.</p>;
  if (isNew) return (
    <div><div className="page-head"><button className="btn ghost sm" onClick={() => router.push('/members')}>← Members</button><h1>New member</h1></div>
      <RecordForm model={cfg.model} mode="create" sections={[{ title: 'Details', fields: cfg.create! }]} onSaved={(n) => router.replace(`/members/${n}`)} /></div>
  );
  if (!d) return <Spinner />;
  const h = d.header;
  const startEdit = async () => setEdit(await readRecord(cfg.model, rid, cfg.sections.flatMap((s) => s.fields).concat(['status', 'user_id'])));
  const visible = TABS.filter((t) => t === 'overview' || t === 'notes' || t === 'documents' || ok(d[t]));
  return (
    <div className="g-360">
      <div className="page-head"><button className="btn ghost sm" onClick={() => router.push('/members')}>← Members</button>
        <button className="btn ghost sm noprint" style={{ marginLeft: 'auto' }} onClick={startEdit}>Edit details</button></div>
      <section className="g-hero g-profile">
        <Avatar name={h.name} id={h.id} photo={h.photo} size={84} />
        <div className="g-profile-main">
          <h1>{h.name} {h.inside && <Badge state="active" label="Inside now" />}</h1>
          <p>{h.code} · <Badge state={h.status} /> {h.goal && <>· {h.goal}</>}</p>
          <p className="muted">{h.membership || 'No membership'}{h.expiry ? ` · until ${h.expiry}` : ''}{h.days_left != null ? ` (${h.days_left} days left)` : ''}{h.trainer ? ` · Trainer ${h.trainer}` : ''}{h.phone ? ` · ${h.phone}` : ''}</p>
        </div>
        <div className="toolbar"><ActionButtons model={cfg.model} rec={{ id: rid, status: h.status, user_id: false }} onDone={load} dirty={false} /></div>
      </section>
      <div className="tabs g-tabs">{visible.map((t) => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{LABEL[t]}</button>)}</div>

      <div className="split"><div>
        <section className="card">
          {tab === 'overview' && (
            <div className="g-facts">
              {[['Phone', d.overview.phone], ['WhatsApp', d.overview.whatsapp], ['Email', d.overview.email], ['Age', d.overview.age], ['Joined', d.overview.join_date],
                ['Memberships', d.overview.memberships], ['Total visits', d.overview.visits], ['Last assessment', d.overview.last_assessment || 'Never'],
                ['Outstanding', `${d.currency} ${money(d.overview.outstanding)}`]].map(([k, v]) => <div key={String(k)}><small>{k}</small><b>{String(v || '—')}</b></div>)}
            </div>
          )}
          {tab === 'membership' && (ok(d.membership) ? <Table slug="memberships" rows={d.membership} cols={[['name', 'Membership'], ['plan_id', 'Plan'], ['start_date', 'Start'], ['end_date', 'End'], ['final_amount', 'Amount'], ['payment_status', 'Payment'], ['state', 'State']]} /> : <Restricted />)}
          {tab === 'attendance' && (ok(d.attendance) ? <>
            <p><b>{d.attendance.visits_30d}</b> visits in the last 30 days · last visit {d.attendance.last_visit || '—'}</p>
            <Table rows={d.attendance.recent} cols={[['date', 'Date'], ['check_in', 'In'], ['check_out', 'Out'], ['duration', 'Hours'], ['source', 'Source']]} /></> : <Restricted />)}
          {tab === 'health' && (ok(d.health) ? (
            <div className="g-facts">{Object.entries(d.health).filter(([k]) => k !== 'id').map(([k, v]) => <div key={k}><small>{k.replace(/_/g, ' ')}</small><b>{String(v || '—')}</b></div>)}</div>
          ) : d.health === null ? <p className="muted">No health profile yet. <Link href={`/health-profiles/new?member_id=${rid}`}>Create one</Link></p> : <Restricted />)}
          {tab === 'assessment' && <Table slug="assessments" rows={d.assessment} cols={[['name', 'Assessment'], ['date', 'Date'], ['weight', 'Weight'], ['bmi', 'BMI'], ['body_fat', 'Body fat %'], ['waist', 'Waist'], ['state', 'State']]} />}
          {tab === 'workout' && <Table slug="workouts" rows={d.workout} cols={[['name', 'Plan'], ['version', 'v'], ['goal', 'Goal'], ['start_date', 'Start'], ['end_date', 'End'], ['state', 'State']]} />}
          {tab === 'diet' && <Table slug="diets" rows={d.diet} cols={[['name', 'Plan'], ['version', 'v'], ['calories_target', 'Target kcal'], ['calories_total', 'Planned kcal'], ['end_date', 'End'], ['state', 'State']]} />}
          {tab === 'appointments' && <Table slug="appointments" rows={d.appointments} cols={[['name', 'Appointment'], ['start_datetime', 'When'], ['appointment_type', 'Type'], ['trainer_id', 'Trainer'], ['state', 'State']]} />}
          {tab === 'payments' && <Table slug="payments" rows={d.payments} cols={[['name', 'Charge'], ['kind', 'Kind'], ['amount', 'Amount'], ['paid_amount', 'Paid'], ['balance', 'Balance'], ['due_date', 'Due'], ['state', 'State']]} />}
          {tab === 'progress' && (ok(d.progress) ? (
            <div className="g-prog">
              {['weight', 'body_fat', 'waist', 'bmi'].map((k) => d.progress.series?.[k]?.some((v: any) => v) ? (
                <div key={k}><h3>{k.replace('_', ' ')}</h3><LineChart height={140} labels={d.progress.labels} series={[{ key: k, label: k.replace('_', ' '), values: d.progress.series[k] }]} /></div>) : null)}
              {!d.progress.labels?.length && <p className="muted">No measurements yet.</p>}
            </div>) : <Restricted />)}
          {tab === 'documents' && (ok(d.documents) ? (!d.documents.length ? <p className="muted">No documents.</p> :
            <ul className="g-docs">{d.documents.map((x: any) => <li key={x.id}><a href={`/api/file?model=ir.attachment&id=${x.id}&field=raw`}>{x.name}</a><small>{String(x.create_date).slice(0, 10)}</small></li>)}</ul>) : <Restricted />)}
          {tab === 'notes' && <div><p className="pre">{d.notes.notes || 'No notes.'}</p><p className="muted">Emergency: {d.notes.emergency.filter(Boolean).join(' · ') || '—'}</p></div>}
        </section>
        {edit && (
          <section className="card" style={{ marginTop: '1rem' }}>
            <RecordForm model={cfg.model} mode="edit" record={edit} sections={cfg.sections} onSaved={() => { setEdit(null); load(); }} />
            <button className="btn ghost sm" onClick={() => setEdit(null)}>Close</button>
          </section>
        )}
      </div><Chatter model={cfg.model} id={rid} /></div>
    </div>
  );
}
