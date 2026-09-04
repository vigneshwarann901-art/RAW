import { ArrowRight, ClipboardList, MapPin, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import { useRaw } from '../../store/RawStore';
import type { Condition } from '../../types';

export default function RequirementNew() {
  const navigate = useNavigate();
  const { addRequirement } = useRaw();
  const [material, setMaterial] = useState('Copper Wire');
  const [quantity, setQuantity] = useState('80');
  const [unit, setUnit] = useState('kg');
  const [maxPrice, setMaxPrice] = useState('620');
  const [condition, setCondition] = useState<Condition>('GOOD');
  const [radiusKm, setRadiusKm] = useState('10');
  const [notes, setNotes] = useState('Prefer clean insulated wire.');
  const submit = () => {
    addRequirement({ material, quantity: Number(quantity), unit, maxPrice: Number(maxPrice), condition, location: 'Adyar, Chennai', radiusKm: Number(radiusKm), neededBy: new Date(Date.now() + 86400000).toISOString(), notes });
    navigate('/seeker/requirements');
  };
  return <AppShell><div className="mx-auto max-w-4xl"><div><p className="text-sm font-semibold text-teal-700">Seeker workspace</p><h1 className="mt-1 text-3xl font-black tracking-tight">Post a RAW requirement</h1><p className="mt-2 text-sm text-slate-500">Tell nearby donors what you need. RAW will surface compatible material automatically.</p></div>
    <div className="mt-7 rounded-2xl border border-teal-100 bg-teal-50/70 p-5"><div className="flex gap-3"><Sparkles className="h-5 w-5 text-teal-700"/><div><p className="font-semibold">Demand-side matching</p><p className="mt-1 text-sm text-slate-600">When a donor lists a compatible resource, your requirement can become a top candidate.</p></div></div></div>
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6"><div className="grid gap-5 md:grid-cols-2"><label className="text-sm font-semibold">Material<input value={material} onChange={e => setMaterial(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-teal-400" placeholder="e.g. Copper Wire"/></label><label className="text-sm font-semibold">Quantity<div className="mt-2 grid grid-cols-[1fr_110px] gap-2"><input value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 font-normal"/><select value={unit} onChange={e => setUnit(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-3 font-normal"><option>kg</option><option>units</option><option>tonnes</option></select></div></label><label className="text-sm font-semibold">Maximum price<input value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal" placeholder="₹ / unit"/></label><label className="text-sm font-semibold">Condition<select value={condition} onChange={e => setCondition(e.target.value as Condition)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal"><option>EXCELLENT</option><option>GOOD</option><option>FAIR</option><option>DAMAGED</option><option>MIXED</option></select></label><label className="text-sm font-semibold">Search radius<input value={radiusKm} onChange={e => setRadiusKm(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal"/></label><div className="rounded-xl bg-slate-50 p-4"><div className="flex items-center gap-2 text-sm font-semibold"><MapPin className="h-4 w-4 text-teal-700"/> Approximate location</div><p className="mt-1 text-sm text-slate-500">Adyar, Chennai · exact address stays private</p></div></div>
      <label className="mt-5 block text-sm font-semibold">Notes<textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-teal-400"/></label>
      <div className="mt-6 flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-xs text-slate-500"><ClipboardList className="h-4 w-4"/> Your requirement stays active until fulfilled.</div><button onClick={submit} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white">Publish requirement <ArrowRight className="h-4 w-4"/></button></div>
    </section></div></AppShell>;
}
