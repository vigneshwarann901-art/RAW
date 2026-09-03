import { ClipboardList, Plus, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import Badge from '../../components/common/Badge';
import { useRaw } from '../../store/RawStore';

export default function Requirements() {
  const { requirements } = useRaw();
  return <AppShell><div className="space-y-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-teal-700">Seeker workspace</p><h1 className="mt-1 text-3xl font-black tracking-tight">My Requirements</h1><p className="mt-2 text-sm text-slate-500">Tell RAW what you need and let nearby donors come to you.</p></div><Link to="/seeker/requirements/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"><Plus className="h-4 w-4"/> New requirement</Link></div>
    <div className="overflow-hidden rounded-2xl border border-teal-100 bg-teal-50/70"><div className="grid md:grid-cols-[1.1fr_0.9fr]"><div className="p-5"><div className="flex items-start gap-3"><Sparkles className="mt-0.5 h-5 w-5 text-teal-700"/><div><p className="font-semibold">RAW Match works both ways.</p><p className="mt-1 text-sm leading-6 text-slate-600">Post what you need and eligible donors can be surfaced automatically when a compatible resource becomes available.</p></div></div></div><div className="hidden min-h-36 overflow-hidden md:block"><img src="/raw-materials-light.svg" alt="Reusable material categories" className="h-full w-full object-cover"/></div></div></div>
    <div className="grid gap-4 lg:grid-cols-2">{requirements.map(req => <div key={req.id} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-white"><ClipboardList className="h-5 w-5"/></div><Badge tone="success">{req.status}</Badge></div><h2 className="mt-5 text-xl font-black">{req.quantity} {req.unit} {req.material}</h2><p className="mt-1 text-sm text-slate-500">Up to ₹{req.maxPrice ?? '—'} · within {req.radiusKm} km · needed by {req.neededBy.slice(0,10)}</p><p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">{req.notes}</p></div>)}</div>
  </div></AppShell>;
}
