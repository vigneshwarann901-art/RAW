import { Camera, CheckCircle2, ChevronRight, MapPin, Sparkles, UploadCloud } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import Badge from '../../components/common/Badge';
import { mockMaterialScan, suggestPrice } from '../../services/ai';
import { uploadListingImage } from '../../services/storage';
import { useRaw } from '../../store/RawStore';
import { useAuth } from '../../auth/AuthProvider';
import type { Condition, ExchangeMode } from '../../types';

export default function ListRaw() {
  const navigate = useNavigate();
  const { addListing } = useRaw();
  const { mode: authMode } = useAuth();
  const [published, setPublished] = useState(false);
  const [material, setMaterial] = useState('Copper Wire');
  const [category, setCategory] = useState('Metal');
  const [quantity, setQuantity] = useState('100');
  const [unit, setUnit] = useState('kg');
  const [condition, setCondition] = useState<Condition>('GOOD');
  const [price, setPrice] = useState('605');
  const [mode, setMode] = useState<ExchangeMode>('SELL');
  const [image, setImage] = useState<string | null>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanNote, setScanNote] = useState('Upload a photo to let RAW suggest a material.');
  const [draftSaved, setDraftSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const pricing = useMemo(() => suggestPrice(material, Number(quantity) || 0), [material, quantity]);

  const scan = async (file?: File) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setImage(previewUrl);
    setUploadError('');
    setScanLoading(true);
    setUploading(authMode === 'supabase');

    const [result, uploadResult] = await Promise.all([
      mockMaterialScan(file.name),
      authMode === 'supabase' ? uploadListingImage(file) : Promise.resolve({ url: null, error: null }),
    ]);

    setMaterial(result.material);
    setCategory(result.category);
    setCondition(result.condition);
    setScanNote(`${result.note} Confidence ${result.confidence}%.`);
    const scannedPricing = suggestPrice(result.material, Number(quantity) || 0);
    setPrice(String(scannedPricing.recommended));
    setScanLoading(false);
    setUploading(false);

    if (uploadResult.error) {
      setUploadError(uploadResult.error);
    } else if (uploadResult.url) {
      setImage(uploadResult.url);
      URL.revokeObjectURL(previewUrl);
    }
  };

  const saveDraft = () => {
    try { localStorage.setItem('raw:draft:listing', JSON.stringify({ material, category, quantity, unit, condition, price, mode, image, scanNote, savedAt: new Date().toISOString() })); } catch { /* best effort */ }
    setDraftSaved(true);
    window.setTimeout(() => setDraftSaved(false), 2200);
  };

  const publish = () => {
    // A blob: URL only resolves inside this tab, so never persist one — fall back
    // to the placeholder if the real upload hasn't finished (or wasn't attempted).
    const persistedImage = image && !image.startsWith('blob:') ? image : '/material-copper.svg';
    addListing({
      material,
      category,
      title: `${condition === 'GOOD' ? 'Good' : 'Available'} ${material}`,
      description: scanNote,
      quantity: Number(quantity),
      unit,
      condition,
      price: mode === 'DONATE' ? 0 : Number(price),
      location: 'Chennai',
      distanceKm: 0,
      availableUntil: new Date(Date.now() + 86400000).toISOString(),
      mode,
      image: persistedImage,
      images: persistedImage === '/material-copper.svg' ? [] : [persistedImage],
      trustScore: 94,
      circularityScore: condition === 'DAMAGED' ? 74 : 93,
      urgencyScore: 76,
      aiConfidence: 94,
    });
    setPublished(true);
  };

  return <AppShell><div className="mx-auto max-w-5xl"><div><p className="text-sm font-semibold text-teal-700">Donor workspace</p><h1 className="mt-1 text-3xl font-black tracking-tight">List RAW</h1><p className="mt-2 text-sm text-slate-500">Create a listing in a few steps. RAW can assist with identification and pricing.</p></div>
    {published ? <div className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-emerald-700"><CheckCircle2 className="h-7 w-7"/></div><h2 className="mt-5 text-2xl font-black text-emerald-900">RAW is live</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-emerald-800">Your material is now discoverable. RAW can now surface compatible demand and offers.</p><div className="mt-6 flex justify-center gap-3"><button onClick={() => navigate('/donor/listings')} className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">View my RAW</button><button onClick={() => setPublished(false)} className="rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold">List another</button></div></div> : <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7"><div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr]"><div className="space-y-6">
      <div><label className="text-sm font-semibold">Material photo</label><label className="mt-2 block cursor-pointer"><div className="grid min-h-44 place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center">{image ? <img src={image} alt="RAW preview" className="h-44 w-full rounded-xl object-cover"/> : <div><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white text-slate-500 shadow-sm"><Camera className="h-5 w-5"/></div><p className="mt-3 font-semibold">Upload or take a photo</p><p className="mt-1 text-xs text-slate-500">JPG, PNG up to 10 MB</p><span className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold"><UploadCloud className="h-4 w-4"/> Choose image</span></div>}</div><input type="file" accept="image/*" capture="environment" className="hidden" onChange={e => scan(e.target.files?.[0])}/></label>{uploading && <p className="mt-2 text-xs font-semibold text-teal-700">Uploading photo…</p>}{uploadError && <div className="mt-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">{uploadError}</div>}</div>
      <div><label className="text-sm font-semibold">Material</label><div className="mt-2 grid grid-cols-[1fr_auto] gap-2"><input value={material} onChange={e => setMaterial(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-400"/><Badge tone="success">{scanLoading ? 'Scanning…' : 'AI ready'}</Badge></div><p className="mt-2 text-xs leading-5 text-slate-500">{scanNote}</p></div>
      <div className="grid gap-4 sm:grid-cols-2"><div><label className="text-sm font-semibold">Quantity</label><input type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"/></div><div><label className="text-sm font-semibold">Unit</label><select value={unit} onChange={e => setUnit(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"><option>kg</option><option>units</option><option>litres</option></select></div></div>
      <div><label className="text-sm font-semibold">Condition</label><select value={condition} onChange={e => setCondition(e.target.value as Condition)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"><option value="EXCELLENT">Excellent</option><option value="GOOD">Good</option><option value="FAIR">Fair</option><option value="DAMAGED">Damaged</option><option value="MIXED">Mixed</option></select></div>
      <div><label className="text-sm font-semibold">Your price</label><input type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} disabled={mode === 'DONATE'} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 disabled:bg-slate-100"/></div>
      <div><label className="text-sm font-semibold">Exchange mode</label><div className="mt-2 grid grid-cols-3 gap-2">{(['SELL','DONATE','SWAP'] as const).map(x => <button type="button" onClick={() => setMode(x)} key={x} className={`rounded-xl border px-3 py-3 text-sm font-semibold ${mode===x?'border-teal-300 bg-teal-50 text-teal-800':'border-slate-200'}`}>{x}</button>)}</div></div>
      <div><label className="text-sm font-semibold">Location</label><div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm"><MapPin className="h-4 w-4 text-teal-600"/> Approximate location · Chennai</div><p className="mt-1 text-xs text-slate-500">Exact residential addresses are never shown on public listings.</p></div>
    </div><aside className="rounded-2xl bg-slate-950 p-5 text-white"><div className="flex items-center gap-2 text-sm font-semibold"><Sparkles className="h-4 w-4 text-teal-300"/> Smart pricing</div><div className="mt-6 text-sm text-slate-400">Suggested range</div><div className="mt-1 text-3xl font-black">₹{pricing.low}–₹{pricing.high}/{unit}</div><div className="mt-2 text-sm text-slate-300">Recommended <span className="font-bold text-white">₹{pricing.recommended}/{unit}</span></div><div className="mt-5 h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-teal-300" style={{ width: `${pricing.confidence}%` }}/></div><div className="mt-2 flex justify-between text-xs text-slate-400"><span>Model confidence</span><span>{pricing.confidence}%</span></div><div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">Pricing guidance is an estimate based on material, condition, quantity, location and available market signals.</div><div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-sm"><div className="font-semibold">Circularity</div><div className="mt-2 text-2xl font-black">{condition === 'DAMAGED' ? '74%' : '93%'}</div><p className="mt-1 text-slate-400">Estimated direct-reuse potential</p></div></aside></div><div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-5"><button type="button" onClick={saveDraft} className="text-sm font-semibold text-slate-500 hover:text-slate-900">{draftSaved ? 'Draft saved ✓' : 'Save draft'}</button><button onClick={publish} disabled={uploading} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{uploading ? 'Uploading photo…' : 'Review & publish'} <ChevronRight className="h-4 w-4"/></button></div></div>}
  </div></AppShell>;
}
