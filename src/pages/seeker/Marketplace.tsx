import { Filter, Grid2X2, Map, Search, SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import ResourceCard from '../../components/resource/ResourceCard';
import { useRaw } from '../../store/RawStore';

export default function Marketplace() {
  const { listings } = useRaw();
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [maxDistance, setMaxDistance] = useState('50');
  const [condition, setCondition] = useState('All');
  const [showMap, setShowMap] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '');
  const [category, setCategory] = useState('All');
  const filtered = useMemo(() => listings.filter(item => {
    const matchesQuery = `${item.title} ${item.material} ${item.category}`.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === 'All' || item.category === category;
    const matchesDistance = item.distanceKm <= Number(maxDistance || 50);
    const matchesCondition = condition === 'All' || item.condition === condition;
    return matchesQuery && matchesCategory && matchesDistance && matchesCondition;
  }), [listings, query, category, maxDistance, condition]);

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-sm font-semibold text-teal-700">Marketplace</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight">Find RAW near you</h1>
          <p className="mt-2 text-sm text-slate-500">Search reusable and recoverable materials from verified participants.</p>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={e => {
                const next = e.target.value;
                setQuery(next);
                setSearchParams(next ? { q: next } : {});
              }}
              placeholder="Search copper, cardboard, chairs..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-4 text-sm outline-none focus:border-teal-400"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(v => !v)}
            className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${showFilters ? 'border-teal-300 bg-teal-50 text-teal-800' : 'border-slate-200'}`}
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
          <button
            type="button"
            onClick={() => setShowMap(v => !v)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold"
          >
            <Map className="h-4 w-4" /> {showMap ? 'Hide map' : 'Map view'}
          </button>
        </div>

        {showFilters && (
          <div className="grid gap-3 rounded-2xl border border-teal-100 bg-teal-50/70 p-4 md:grid-cols-2">
            <label className="text-xs font-semibold text-slate-700">
              Max distance (km)
              <input
                type="number"
                min="1"
                value={maxDistance}
                onChange={e => setMaxDistance(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
              />
            </label>
            <label className="text-xs font-semibold text-slate-700">
              Condition
              <select
                value={condition}
                onChange={e => setCondition(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
              >
                <option>All</option>
                <option>EXCELLENT</option>
                <option>GOOD</option>
                <option>FAIR</option>
                <option>DAMAGED</option>
                <option>MIXED</option>
              </select>
            </label>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory('All')}
            className={`rounded-full px-4 py-2 text-xs font-semibold ${category === 'All' ? 'bg-slate-950 text-white' : 'border border-slate-200 bg-white text-slate-600'}`}
          >
            All
          </button>
          {['Metal', 'Furniture', 'Packaging', 'Electronics', 'Textiles'].map(x => (
            <button
              key={x}
              onClick={() => setCategory(x)}
              className={`rounded-full px-4 py-2 text-xs font-semibold ${category === x ? 'bg-slate-950 text-white' : 'border border-slate-200 bg-white text-slate-600'}`}
            >
              {x}
            </button>
          ))}
          <span className="ml-auto inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold">
            <Filter className="h-3.5 w-3.5" /> {filtered.length} results
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
            <div className="p-6 lg:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Local circular network</p>
              <h2 className="mt-2 max-w-lg text-2xl font-black tracking-tight text-slate-950">Find reusable materials without the search fatigue.</h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-slate-500">RAW brings surplus, demand and trusted participants together in one place — so materials can move to their next useful life.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800">Verified network</span>
                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">Circularity-aware</span>
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">Local-first</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-2 sm:grid-cols-3">
              <div className="overflow-hidden rounded-xl"><img src="/material-copper.svg" alt="Copper wire" className="aspect-[4/3] h-full w-full object-cover" /></div>
              <div className="overflow-hidden rounded-xl"><img src="/material-chairs.svg" alt="Reusable office chairs" className="aspect-[4/3] h-full w-full object-cover" /></div>
              <div className="col-span-2 overflow-hidden rounded-xl sm:col-span-1"><img src="/material-cardboard.svg" alt="Clean cardboard" className="aspect-[4/3] h-full w-full object-cover" /></div>
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(item => (
            <ResourceCard key={item.id} listing={item} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="font-semibold">No RAW found</p>
            <p className="mt-1 text-sm text-slate-500">Try changing your search or filters.</p>
          </div>
        )}

        {showMap && (
          <div id="raw-map-preview" className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Grid2X2 className="h-4 w-4" /> Map preview
            </div>
            <div className="relative mt-4 h-72 overflow-hidden rounded-xl bg-slate-100">
              <img src="/raw-materials-light.svg" alt="Reusable and recoverable materials" className="h-full w-full object-cover opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 rounded-xl border border-white/40 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm">Approximate participant locations · privacy protected</div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
