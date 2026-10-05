import { useRef, useState } from 'react';
import { FileText, Upload } from 'lucide-react';
import { api, type ResumeAnalysis } from '@/api';

export default function ResumeOptimizerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const submit = async () => { if (!file || !jobDescription.trim()) return; setLoading(true); setError(''); try { setAnalysis(await api.analyzeResume(file, jobDescription.trim())); } catch (error) { setError(error instanceof Error ? error.message : 'Analysis failed'); } finally { setLoading(false); } };
  const reset = () => { setFile(null); setJobDescription(''); setAnalysis(null); setError(''); };
  return <div className="mx-auto max-w-5xl p-6 lg:p-8"><header className="border-b border-slate-200 pb-5"><h1 className="text-2xl font-semibold">Resume Optimizer</h1><p className="mt-1 text-sm text-slate-600">Send a resume and job description to the ATS analysis service.</p></header>
    {!analysis ? <div className="mt-6 grid gap-6 lg:grid-cols-2"><section><label className="mb-2 block text-sm font-medium">Resume file</label><button type="button" onClick={() => fileInput.current?.click()} className="flex min-h-48 w-full flex-col items-center justify-center border border-dashed border-slate-300 bg-white px-5 text-center hover:border-slate-500"><Upload size={20} className="text-slate-500" /><span className="mt-3 text-sm font-medium">{file ? file.name : 'Choose a PDF, DOC, DOCX, or text file'}</span><span className="mt-1 text-xs text-slate-500">Maximum upload size: 5 MB</span></button><input ref={fileInput} onChange={event => setFile(event.target.files?.[0] ?? null)} type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" /></section><section><label htmlFor="job-description" className="mb-2 block text-sm font-medium">Job description</label><textarea id="job-description" value={jobDescription} onChange={event => setJobDescription(event.target.value)} className="h-48 w-full resize-none rounded-md border border-slate-300 p-3 text-sm outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1" placeholder="Paste the target job description" /></section><div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-5 lg:col-span-2"><button onClick={reset} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">Clear</button><button disabled={!file || !jobDescription.trim() || loading} onClick={submit} className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50">{loading ? 'Analyzing…' : 'Analyze resume'}</button></div></div> : <Results analysis={analysis} reset={reset} />}
    {error && <p className="mt-5 border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
  </div>;
}

function Results({ analysis, reset }: { analysis: ResumeAnalysis; reset: () => void }) {
  return <div className="mt-6 space-y-6"><section className="grid gap-6 border border-slate-200 bg-white p-6 md:grid-cols-[180px_1fr_auto]"><div><p className="text-xs font-medium uppercase tracking-wide text-slate-500">ATS score</p><p className="mt-2 text-5xl font-semibold tabular-nums">{analysis.atsScore}<span className="text-xl text-slate-500">%</span></p></div><div><h2 className="font-semibold">Analysis completed</h2><p className="mt-2 text-sm leading-6 text-slate-600">The score, skill gaps, and suggestions below are returned by the configured analysis service.</p></div><button onClick={reset} className="h-fit rounded-md border border-slate-300 px-3 py-2 text-sm font-medium">New analysis</button></section><section className="grid gap-6 lg:grid-cols-2"><ResultList title="Skill gaps" values={analysis.skillGaps} /><ResultList title="Optimization suggestions" values={analysis.optimizationSuggestions} /></section></div>;
}

function ResultList({ title, values }: { title: string; values: string[] }) { return <section className="border border-slate-200 bg-white"><h2 className="border-b border-slate-200 px-5 py-3 font-semibold">{title}</h2>{values.length === 0 ? <p className="p-5 text-sm text-slate-600">No items were returned.</p> : <ul className="divide-y divide-slate-200">{values.map(value => <li key={value} className="flex gap-3 px-5 py-3 text-sm leading-6 text-slate-700"><FileText size={16} className="mt-1 shrink-0 text-slate-500" />{value}</li>)}</ul>}</section>; }
