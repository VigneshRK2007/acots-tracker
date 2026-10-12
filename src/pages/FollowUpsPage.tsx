import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, Check, PencilLine } from 'lucide-react';
import { api, type JobApplication } from '@/api';

function isPastOrToday(value: string | null) {
  return Boolean(value && value <= new Date().toISOString().slice(0, 10));
}

export default function FollowUpsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [stage, setStage] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => api.applications().then(setApplications).catch(error => setError(error.message)).finally(() => setLoading(false));
  useEffect(() => { void load(); }, []);
  const scheduled = useMemo(() => applications.filter(item => item.nextFollowUp || item.notes || item.interviewStage).sort((a, b) => (a.nextFollowUp ?? '9999').localeCompare(b.nextFollowUp ?? '9999')), [applications]);
  const edit = (item: JobApplication) => { setEditing(item.id); setStage(item.interviewStage ?? ''); setFollowUp(item.nextFollowUp ?? ''); setNotes(item.notes ?? ''); };
  const save = async (id: string) => { setError(''); try { const updated = await api.updateApplication(id, { interviewStage: stage || null, nextFollowUp: followUp || null, notes: notes || null }); setApplications(items => items.map(item => item.id === id ? updated : item)); setEditing(null); } catch (error) { setError(error instanceof Error ? error.message : 'Could not save follow-up'); } };

  return <div className="mx-auto max-w-5xl p-6 lg:p-8"><header className="border-b border-slate-200 pb-5"><h1 className="text-2xl font-semibold">Follow-ups & interview stages</h1><p className="mt-1 text-sm text-slate-600">Plan recruiter follow-ups and record progression from screening through final interviews.</p></header>
    {error && <p className="mt-5 border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <section className="mt-6 border border-slate-200 bg-white"><div className="border-b border-slate-200 px-5 py-3"><h2 className="font-semibold">Scheduled actions</h2></div>{loading ? <p className="p-5 text-sm text-slate-500">Loading follow-ups…</p> : scheduled.length === 0 ? <p className="p-5 text-sm text-slate-600">No follow-ups are scheduled. Add a date or recruiter note when creating an application.</p> : <ul className="divide-y divide-slate-200">{scheduled.map(item => <li key={item.id} className="px-5 py-4">{editing === item.id ? <div className="grid gap-3 md:grid-cols-[1fr_150px_auto]"><input value={stage} onChange={event => setStage(event.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1" placeholder="Stage: Screening, Technical, Final" /><input value={followUp} onChange={event => setFollowUp(event.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1" type="date" /><button onClick={() => save(item.id)} className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"><Check size={16} />Save</button><textarea value={notes} onChange={event => setNotes(event.target.value)} className="min-h-20 rounded-md border border-slate-300 p-3 text-sm outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1 md:col-span-3" placeholder="Recruiter note or planned action" /></div> : <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2"><p className="font-medium">{item.company}</p>{item.interviewStage && <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800">{item.interviewStage}</span>}</div><p className="mt-1 text-sm text-slate-600">{item.role}</p>{item.notes && <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-700">{item.notes}</p>}</div><div className="flex items-center gap-3"><div className={`flex items-center gap-2 text-sm ${isPastOrToday(item.nextFollowUp) ? 'font-medium text-amber-800' : 'text-slate-600'}`}><CalendarClock size={16} />{item.nextFollowUp ? (isPastOrToday(item.nextFollowUp) ? `Due ${item.nextFollowUp}` : item.nextFollowUp) : 'No date'}</div><button onClick={() => edit(item)} className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"><PencilLine size={15} />Edit</button></div></div>}</li>)}</ul>}</section>
  </div>;
}
