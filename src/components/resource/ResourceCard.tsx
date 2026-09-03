import { MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ResourceListing } from '../../types';
import Badge from '../common/Badge';

export default function ResourceCard({ listing }: { listing: ResourceListing }) {
  return <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100"><img src={listing.image || '/raw-materials-light.svg'} alt={listing.title} className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.035]" loading="lazy" /><div className="absolute left-3 top-3"><Badge tone="brand">{listing.mode}</Badge></div><div className="absolute right-3 top-3"><span className="rounded-full bg-slate-950/85 px-2.5 py-1 text-xs font-bold text-white">{listing.circularityScore}% circular</span></div></div>
    <div className="p-4"><div className="flex items-start justify-between gap-3"><div><div className="text-xs font-semibold uppercase tracking-wider text-teal-700">{listing.category}</div><h3 className="mt-1 text-base font-bold text-slate-900">{listing.title}</h3></div><div className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">{listing.urgencyScore} urgency</div></div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600"><span className="rounded-lg bg-slate-100 px-2.5 py-1.5">{listing.quantity} {listing.unit}</span><span className="rounded-lg bg-slate-100 px-2.5 py-1.5">{listing.condition.toLowerCase()}</span></div>
      <div className="mt-4 flex items-center justify-between"><div><div className="text-lg font-bold text-slate-900">{listing.price ? `₹${listing.price.toLocaleString()}/${listing.unit === 'kg' ? 'kg' : 'unit'}` : 'Free'}</div><div className="mt-1 flex items-center gap-1 text-xs text-slate-500"><MapPin className="h-3.5 w-3.5" />{listing.distanceKm} km away</div></div><Link to={`/seeker/matches?resource=${listing.id}`} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"><Sparkles className="h-3.5 w-3.5" />Match</Link></div>
      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Verified participant · {listing.trustScore} trust</div>
    </div></div>;
}
