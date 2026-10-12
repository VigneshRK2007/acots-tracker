import { useEffect, useState } from 'react';
import { ChevronRight, MessageSquareText } from 'lucide-react';
import { api, type InterviewPrep, type JobApplication } from '@/api';

export default function InterviewPrepPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [selected, setSelected] = useState('');
  const [prep, setPrep] = useState<InterviewPrep | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.applications().then(items => { setApplications(items); if (items[0]) setSelected(items[0].id); }).catch(error => setError(error.message)).finally(() => setLoading(false)); }, []);
  const loadQuestions = async () => { if (!selected) return; setLoading(true); setError(''); try { setPrep(await api.interviewQuestions(selected)); } catch (error) { setError(error instanceof Error ? error.message : 'Could not load interview questions'); } finally { setLoading(false); } };
  return <div className="mx-auto max-w-5xl p-6 lg:p-8"><header className="border-b border-slate-200 pb-5"><h1 className="text-2xl font-semibold">Interview Prep</h1><p className="mt-1 text-sm text-slate-600">Generate a focused question set from a saved application.</p></header>
    <section className="mt-6 border border-slate-200 bg-white p-5"><label htmlFor="application" className="block text-sm font-medium">Choose an application</label><div className="mt-2 flex flex-wrap gap-3"><select id="application" disabled={applications.length === 0} value={selected} onChange={event => setSelected(event.target.value)} className="min-w-72 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1"><option value="">Select an application</option>{applications.map(item => <option key={item.id} value={item.id}>{item.company} — {item.role}</option>)}</select><button onClick={loadQuestions} disabled={!selected || loading} className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"><MessageSquareText size={16} />Build question set</button></div>{!loading && applications.length === 0 && <p className="mt-3 text-sm text-slate-600">Add an application in the tracker before generating interview preparation.</p>}</section>
    {error && <p className="mt-5 border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {prep && <section className="mt-6 border border-slate-200 bg-white"><div className="border-b border-slate-200 px-5 py-4"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">{prep.company}</p><h2 className="mt-1 font-semibold">{prep.role} interview question set</h2></div><div className="divide-y divide-slate-200">{prep.questions.map((item, index) => <article key={item.question} className="flex gap-4 px-5 py-4"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold text-slate-600">{index + 1}</span><div><p className="text-xs font-medium uppercase tracking-wide text-slate-500">{item.category}</p><p className="mt-1 text-sm leading-6 text-slate-800">{item.question}</p></div><ChevronRight size={17} className="ml-auto mt-1 text-slate-400" /></article>)}</div></section>}
  </div>;
}
