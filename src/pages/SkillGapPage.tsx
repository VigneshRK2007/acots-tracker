import { useEffect, useState } from 'react';
import { api, type ResumeAnalysis } from '@/api';

export default function SkillGapPage() {
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { api.latestResumeAnalysis().then(setAnalysis).catch(error => setError(error.message)); }, []);
  return <div className="mx-auto max-w-5xl p-6 lg:p-8"><header className="border-b border-slate-200 pb-5"><h1 className="text-2xl font-semibold">Skill Gap Analysis</h1><p className="mt-1 text-sm text-slate-600">The latest persisted ATS analysis determines the skill gaps below.</p></header>{error && <p className="mt-6 border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Run a resume analysis first to populate this view.</p>}{analysis && <section className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]"><div className="border border-slate-200 bg-white p-5"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Latest ATS score</p><p className="mt-2 text-4xl font-semibold tabular-nums">{analysis.atsScore}%</p><p className="mt-4 text-sm text-slate-600">{analysis.skillGaps.length} gaps identified</p></div><div className="border border-slate-200 bg-white"><h2 className="border-b border-slate-200 px-5 py-3 font-semibold">Skills and technologies to address</h2>{analysis.skillGaps.length === 0 ? <p className="p-5 text-sm text-slate-600">No skill gaps were returned.</p> : <ul className="divide-y divide-slate-200">{analysis.skillGaps.map(skill => <li key={skill} className="px-5 py-3 text-sm text-slate-700">{skill}</li>)}</ul>}</div></section>}</div>;
}
