import { ArrowLeft, Eye, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import Badge from '../../components/common/Badge';
import { useRaw } from '../../store/RawStore';

export default function MyListings() {
  const { listings } = useRaw();
  const { id } = useParams();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const filtered = useMemo(() => listings.filter(item => {
    const matchesQuery = `${item.title} ${item.material} ${item.category}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === 'All' || item.status === status.toUpperCase();
    return matchesQuery && matchesStatus;
  }), [listings, query, status]);

  const selected = id ? listings.find(item => item.id === id) : undefined;

  if (id && selected) return <AppShell><div className="mx-auto max-w-5xl space-y-6">
    <Link to="/donor/listings" className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700"><ArrowLeft className="h-4 w-4"/> Back to My RAW</Link>
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <div className="grid gap-0 md:grid-cols-2">
        <img src={selected.image} alt={selected.title} className="aspect-[4/3] h-full w-full object-cover md:aspect-auto md:min-h-80" />
        <div className="p-7">
          <div className="flex items-center justify-between gap-3"><Badge tone={selected.status === 'ACTIVE' ? 'success' : 'neutral'}>{selected.status}</Badge><span className="text-xs font-semibold text-slate-500">{selected.mode}</span></div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">{selected.category}</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">{selected.title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">{selected.description}</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Quantity</div><div className="mt-1 font-black">{selected.quantity} {selected.unit}</div></div>
            <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Price</div><div className="mt-1 font-black">{selected.price ? `₹${selected.price.toLocaleString()}` : 'Free'}</div></div>
            <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Trust</div><div className="mt-1 font-black">{selected.trustScore}</div></div>
            <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Circularity</div><div className="mt-1 font-black">{selected.circularityScore}%</div></div>
          </div>
        </div>
      </div>
    </div>
  </div></AppShell>;

  return <AppShell><div className="space-y-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-teal-700">Donor workspace</p><h1 className="mt-1 text-3xl font-black tracking-tight">My RAW</h1><p className="mt-2 text-sm text-slate-500">Manage what you have available for reuse, sale or donation.</p></div><Link to="/donor/listings/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"><Plus className="h-4 w-4"/> List RAW</Link></div>
    <div className="flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search your listings..." className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-4 text-sm outline-none focus:border-teal-400"/></div><select value={status} onChange={e => setStatus(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"><option>All</option><option>Active</option><option>Pending</option><option>Completed</option><option>Expired</option></select></div>
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="hidden grid-cols-[1.5fr_0.6fr_0.7fr_0.7fr_auto] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 md:grid"><span>RAW</span><span>Qty</span><span>Price</span><span>Status</span><span/></div>{filtered.map(item => <div key={item.id} className="grid gap-4 border-b border-slate-100 px-5 py-4 last:border-0 md:grid-cols-[1.5fr_0.6fr_0.7fr_0.7fr_auto] md:items-center"><div><div className="font-semibold text-slate-900">{item.title}</div><div className="mt-1 text-xs text-slate-500">{item.material} · {item.location}</div></div><div className="text-sm text-slate-600">{item.quantity} {item.unit}</div><div className="text-sm font-semibold">{item.price ? `₹${item.price.toLocaleString()}` : 'Free'}</div><div><Badge tone={item.status === 'ACTIVE' ? 'success' : 'neutral'}>{item.status}</Badge></div><Link to={`/donor/listings/${item.id}`} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold"><Eye className="h-3.5 w-3.5"/> View</Link></div>)}</div>
    {filtered.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><p className="font-semibold">No RAW listings found</p><p className="mt-1 text-sm text-slate-500">Try a different search or status filter.</p></div>}
  </div></AppShell>;
}
