import { ArrowRight, FileText } from 'lucide-react';
import type { PageId } from '@/components/Sidebar';

export default function HomePage({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  return <div className="mx-auto max-w-5xl p-6 lg:p-8">
    <div className="border-b border-slate-200 pb-8">
      <p className="text-sm font-medium text-slate-500">ACOTS</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Job search operations, in one workspace.</h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Track real applications, analyze a resume against a job description, identify skill gaps, and retrieve role-specific interview preparation.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button onClick={() => onNavigate('resume')} className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">Analyze resume <ArrowRight size={16} /></button>
        <button onClick={() => onNavigate('resume')} className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"><FileText size={16} />Analyze resume</button>
      </div>
    </div>
    <div className="grid grid-cols-1 divide-y divide-slate-200 md:grid-cols-3 md:divide-x md:divide-y-0">
      <div className="py-6 md:pr-6"><h2 className="font-semibold">PDF extraction</h2><p className="mt-2 text-sm leading-6 text-slate-600">The FastAPI service extracts text directly from the submitted PDF before analysis.</p></div>
      <div className="py-6 md:px-6"><h2 className="font-semibold">Gemini analysis</h2><p className="mt-2 text-sm leading-6 text-slate-600">A resume and target description are submitted to Gemini for structured ATS feedback.</p></div>
      <div className="py-6 md:pl-6"><h2 className="font-semibold">Persisted results</h2><p className="mt-2 text-sm leading-6 text-slate-600">The latest score, skill gaps, and optimization suggestions are stored in PostgreSQL.</p></div>
    </div>
  </div>;
}
