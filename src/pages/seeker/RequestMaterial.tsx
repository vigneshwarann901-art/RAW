import { ArrowRight, MapPin, Package, ShieldCheck, User } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import { useRaw } from '../../store/RawStore';
import { useAuth } from '../../auth/AuthProvider';
import { getProfileById } from '../../services/data/repository';
import type { User as RawUser } from '../../types';

export default function RequestMaterial() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { listings, addOffer } = useRaw();
  const { mode } = useAuth();
  const [quantity, setQuantity] = useState('');
  const [message, setMessage] = useState('');
  const [donor, setDonor] = useState<RawUser | null>(null);

  const listing = useMemo(() => listings.find((l) => l.id === id), [listings, id]);

  useEffect(() => {
    if (mode !== 'supabase' || !listing) { setDonor(null); return; }
    let active = true;
    void getProfileById(listing.donorId).then((result) => { if (active) setDonor(result.data); });
    return () => { active = false; };
  }, [mode, listing?.donorId]);

  if (!listing) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl py-12 text-center">
          <h2 className="text-2xl font-bold text-slate-900">Listing Not Found</h2>
          <p className="mt-2 text-sm text-slate-500">The requested material listing could not be found or has been removed.</p>
          <button
            onClick={() => navigate('/seeker/marketplace')}
            className="mt-6 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Back to Marketplace
          </button>
        </div>
      </AppShell>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const quantityNum = Number(quantity);
    if (!quantityNum || quantityNum <= 0) {
      alert('Please enter a valid required quantity.');
      return;
    }

    addOffer({
      listingId: listing.id,
      quantity: quantityNum,
      price: listing.price || 0,
      message: message || 'Requesting material pickup / order.',
    });

    navigate('/seeker/offers');
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl">
        <div>
          <p className="text-sm font-semibold text-teal-700">Material Request</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight">Request Material</h1>
          <p className="mt-2 text-sm text-slate-500">
            Submit a direct request to the donor for this material listing.
          </p>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* Listing Details */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-700">
              <Package className="h-4 w-4" /> Selected Material
            </div>
            <h2 className="mt-2 text-xl font-bold text-slate-900">{listing.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{listing.description}</p>

            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-500">Available Quantity:</span>
                <span className="font-semibold text-slate-900">
                  {listing.quantity} {listing.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Condition:</span>
                <span className="font-semibold text-slate-900">{listing.condition}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Price:</span>
                <span className="font-semibold text-slate-900">
                  {listing.price ? `₹${listing.price.toLocaleString()} / ${listing.unit}` : 'Free'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="flex items-center gap-1 font-semibold text-slate-900">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" /> {listing.location} ({listing.distanceKm} km)
                </span>
              </div>
            </div>
          </div>

          {/* Donor Details */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-700">
              <User className="h-4 w-4" /> Donor Details
            </div>
            {donor && (
              <div className="mt-3">
                <h3 className="text-lg font-bold text-slate-900">{donor.name}</h3>
                <p className="text-sm text-slate-500">{donor.role} · {donor.location}</p>

                <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" /> Verified participant · {donor.trustScore} trust score
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Successful Transactions:</span>
                    <span className="font-medium text-slate-700">{donor.successfulTransactions}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Response Rate:</span>
                    <span className="font-medium text-slate-700">{donor.responseRate}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Request Form */}
        <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Submit Request</h2>

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700">
                Quantity Required ({listing.unit})
              </label>
              <input
                type="number"
                min="1"
                max={listing.quantity}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={`Max available: ${listing.quantity} ${listing.unit}`}
                required
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">
                Message to Donor
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Explain your requirements, intended reuse, or pickup schedule..."
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-400"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Submit Request <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}