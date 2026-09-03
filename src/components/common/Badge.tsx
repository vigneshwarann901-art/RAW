import type { ReactNode } from 'react';

export default function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral'|'success'|'warning'|'brand' }) {
  const styles = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    brand: 'bg-teal-50 text-teal-700 border-teal-200',
  };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[tone]}`}>{children}</span>;
}
