import type { LucideIcon } from 'lucide-react';

export default function StatCard({ label, value, hint, icon: Icon }: { label: string; value: string; hint?: string; icon: LucideIcon }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</p>{hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}</div>
      <div className="rounded-xl bg-teal-50 p-3 text-teal-700"><Icon className="h-5 w-5" /></div>
    </div>
  </div>;
}
