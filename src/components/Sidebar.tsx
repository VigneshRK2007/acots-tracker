import { Home, FileText, Target, X } from 'lucide-react';

export type PageId = 'home' | 'resume' | 'skills';

const navigation = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'resume', label: 'Resume Optimizer', icon: FileText },
  { id: 'skills', label: 'Skill Gap', icon: Target },
] as const;

export default function Sidebar({ page, onNavigate, mobileOpen, close }: { page: PageId; onNavigate: (page: PageId) => void; mobileOpen: boolean; close: () => void }) {
  return <>
    <div onClick={close} className={`fixed inset-0 z-30 bg-slate-950/40 lg:hidden ${mobileOpen ? '' : 'hidden'}`} />
    <aside className={`fixed top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:sticky lg:z-0 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-4"><Logo /><button onClick={close} className="ml-auto text-slate-500 lg:hidden" aria-label="Close navigation"><X size={20} /></button></div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => { onNavigate(id); close(); }} className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium ${page === id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}><Icon size={18} />{label}</button>)}
      </nav>
      <div className="border-t border-slate-200 px-4 py-3 text-xs text-slate-500">ACOTS · Candidate Tracking</div>
    </aside>
  </>;
}

export function Logo() {
  return <><div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-900 text-xs font-bold text-white">AC</div><div><div className="text-sm font-bold tracking-tight text-slate-900">ACOTS</div><div className="text-[10px] text-slate-500">Candidate Tracking</div></div></>;
}
