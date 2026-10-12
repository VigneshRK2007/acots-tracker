import { useEffect, useState } from 'react';
import { ArrowRight, BarChart3, BellRing, BriefcaseBusiness, Target } from 'lucide-react';
import { api, type JobApplication, type ResumeAnalysis } from '@/api';
import type { PageId } from '@/components/Sidebar';

const statuses = ['SAVED', 'APPLIED', 'INTERVIEWING', 'OFFER', 'REJECTED'] as const;

export default function DashboardPage({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.applications(), api.latestResumeAnalysis().catch(() => null)])
      .then(([applicationItems, latest]) => { setApplications(applicationItems); setAnalysis(latest); })
      .catch(error => setError(error instanceof Error ? error.message : 'Could not load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  const count = (status: string) => applications.filter(item => item.status === status).length;
  const interviewStages = applications.filter(item => item.status === 'INTERVIEWING' || item.interviewStage);
  const dueFollowUps = applications.filter(item => item.nextFollowUp && item.nextFollowUp <= new Date().toISOString().slice(0, 10));
  return <div className="mx-auto max-w-6xl p-6 lg:p-8">
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
      <div><p className="text-sm font-medium text-slate-500">Overview</p><h1 className="mt-1 text-2xl font-semibold tracking-tight">Candidate operations dashboard</h1><p className="mt-1 text-sm text-slate-600">A live view of your job-search pipeline and latest resume analysis.</p></div>
      <button onClick={() => onNavigate('applications')} className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">Manage applications <ArrowRight size={16} /></button>
    </header>
    {error && <p className="mt-5 border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <Stat icon={BriefcaseBusiness} label="Total applications" value={loading ? '—' : applications.length.toString()} />
      <Stat icon={BarChart3} label="Applied" value={loading ? '—' : count('APPLIED').toString()} />
      <Stat icon={BarChart3} label="Rejected" value={loading ? '—' : count('REJECTED').toString()} />
      <Stat icon={BellRing} label="Interview stages" value={loading ? '—' : interviewStages.length.toString()} />
      <Stat icon={BellRing} label="Follow-ups due" value={loading ? '—' : dueFollowUps.length.toString()} />
      <Stat icon={Target} label="Latest ATS score" value={analysis ? `${analysis.atsScore}%` : '—'} />
    </div>
    <div className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
      <section className="border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3"><h2 className="font-semibold">Application pipeline</h2><button onClick={() => onNavigate('applications')} className="text-sm font-medium text-slate-700 hover:text-slate-950">Open tracker</button></div>
        <div className="grid grid-cols-5 divide-x divide-slate-200">
          {statuses.map(status => <div key={status} className="px-3 py-5 text-center"><p className="text-2xl font-semibold tabular-nums">{loading ? '—' : count(status)}</p><p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">{status === 'INTERVIEWING' ? 'Interviewing' : status}</p></div>)}
        </div>
        {applications.length > 0 && <ul className="divide-y divide-slate-200 border-t border-slate-200">{applications.slice(0, 4).map(application => <li key={application.id} className="flex items-center justify-between gap-3 px-5 py-3"><div><p className="text-sm font-medium">{application.company}</p><p className="text-xs text-slate-500">{application.role}</p></div><StatusBadge status={application.status} /></li>)}</ul>}
        {!loading && applications.length === 0 && <Empty text="No applications yet. Add your first job to start tracking progress." action="Add application" onClick={() => onNavigate('applications')} />}
      </section>
      <section className="border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3"><h2 className="font-semibold">Resume readiness</h2><button onClick={() => onNavigate('resume')} className="text-sm font-medium text-slate-700 hover:text-slate-950">Analyze resume</button></div>
        {analysis ? <div className="p-5"><p className="text-4xl font-semibold tabular-nums">{analysis.atsScore}%</p><p className="mt-1 text-sm text-slate-600">Latest ATS match score</p><div className="mt-5 border-t border-slate-200 pt-4"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Priority gaps</p><ul className="mt-2 space-y-2">{analysis.skillGaps.slice(0, 4).map(skill => <li key={skill} className="text-sm text-slate-700">{skill}</li>)}</ul></div></div> : <Empty text="Run a resume analysis to show ATS insights here." action="Open optimizer" onClick={() => onNavigate('resume')} />}
      </section>
    </div>
    <section className="mt-6 border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3"><h2 className="font-semibold">Interview stages & follow-ups</h2><button onClick={() => onNavigate('followups')} className="text-sm font-medium text-slate-700 hover:text-slate-950">Open follow-ups</button></div>
      {interviewStages.length === 0 ? <Empty text="No interview stages recorded. Add a stage when you create or update an application." action="Manage applications" onClick={() => onNavigate('applications')} /> : <ul className="divide-y divide-slate-200">{interviewStages.slice(0, 5).map(application => <li key={application.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"><div><p className="text-sm font-medium">{application.company}</p><p className="text-xs text-slate-500">{application.role}</p></div><div className="flex items-center gap-3"><span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800">{application.interviewStage ?? 'Interviewing'}</span><span className="text-xs text-slate-500">{application.nextFollowUp ? `Follow up: ${application.nextFollowUp}` : 'No follow-up date'}</span></div></li>)}</ul>}
    </section>
  </div>;
}

function Stat({ icon: Icon, label, value }: { icon: typeof BriefcaseBusiness; label: string; value: string }) { return <section className="border border-slate-200 bg-white p-5"><Icon size={18} className="text-slate-500" /><p className="mt-4 text-2xl font-semibold tabular-nums">{value}</p><p className="mt-1 text-sm text-slate-600">{label}</p></section>; }
function Empty({ text, action, onClick }: { text: string; action: string; onClick: () => void }) { return <div className="p-5"><p className="text-sm leading-6 text-slate-600">{text}</p><button onClick={onClick} className="mt-4 text-sm font-medium text-slate-900 underline underline-offset-4">{action}</button></div>; }
export function StatusBadge({ status }: { status: string }) { const styles: Record<string, string> = { SAVED: 'bg-slate-100 text-slate-700', APPLIED: 'bg-blue-50 text-blue-700', INTERVIEWING: 'bg-amber-50 text-amber-800', OFFER: 'bg-emerald-50 text-emerald-700', REJECTED: 'bg-red-50 text-red-700' }; return <span className={`rounded-md px-2 py-1 text-xs font-medium ${styles[status] ?? styles.SAVED}`}>{status === 'INTERVIEWING' ? 'Interviewing' : status.charAt(0) + status.slice(1).toLowerCase()}</span>; }
