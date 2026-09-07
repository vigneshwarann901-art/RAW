import { Bell, Package, Check, Clock, XCircle, AlertCircle } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import Badge from '../../components/common/Badge';
import { useRaw } from '../../store/RawStore';
import { demoUsers } from '../../data/demo';

export default function SeekerOffers() {
  const { offers, listings, currentUser } = useRaw();

  const seekerOffers = offers.filter((offer) => offer.seekerId === currentUser.id);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge tone="warning"><Clock className="mr-1 inline h-3 w-3" /> PENDING</Badge>;
      case 'ACCEPTED':
        return <Badge tone="success"><Check className="mr-1 inline h-3 w-3" /> ACCEPTED</Badge>;
      case 'REJECTED':
        return <Badge tone="neutral"><XCircle className="mr-1 inline h-3 w-3" /> REJECTED</Badge>;
      case 'COUNTERED':
        return <Badge tone="brand"><AlertCircle className="mr-1 inline h-3 w-3" /> COUNTERED</Badge>;
      default:
        return <Badge tone="neutral">{status}</Badge>;
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl">
        <div>
          <p className="text-sm font-semibold text-teal-700">Seeker requests</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight">Requested Materials</h1>
          <p className="mt-2 text-sm text-slate-500">Track the status of your material requests and donor responses.</p>
        </div>

        <div className="mt-6 space-y-4">
          {seekerOffers.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <Package className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-3 text-base font-bold text-slate-900">No requests submitted yet</h3>
              <p className="mt-1 text-sm text-slate-500">Explore the marketplace to request materials from donors.</p>
            </div>
          ) : (
            seekerOffers.map((offer) => {
              const listing = listings.find((l) => l.id === offer.listingId);
              const donor = demoUsers.find((u) => u.id === listing?.donorId);

              return (
                <div key={offer.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">
                          {listing ? listing.title : 'Material Request'}
                        </h3>
                        {getStatusBadge(offer.status)}
                      </div>

                      <p className="mt-1 text-sm font-medium text-slate-600">
                        Quantity Requested: <span className="font-bold text-slate-900">{offer.quantity} {listing?.unit || 'units'}</span>
                      </p>

                      {donor && (
                        <p className="mt-0.5 text-xs text-slate-500">
                          Donor: <span className="font-semibold text-slate-700">{donor.name}</span> ({donor.location})
                        </p>
                      )}

                      <div className="mt-3 rounded-xl bg-slate-50 p-4 text-sm">
                        <div className="flex justify-between text-xs font-semibold text-slate-500">
                          <span>Your Message:</span>
                          <span>Offered Price: {offer.price ? `₹${offer.price}` : 'Free'}</span>
                        </div>
                        <p className="mt-1 text-slate-700">{offer.message || 'No message provided'}</p>
                      </div>

                      {/* Donor response feedback */}
                      <div className="mt-3 text-sm">
                        {offer.status === 'ACCEPTED' && (
                          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-800">
                            <p className="font-bold">Donor accepted your request!</p>
                            <p className="text-xs text-emerald-700 mt-0.5">Check your transactions or contact the donor to coordinate pickup.</p>
                          </div>
                        )}
                        {offer.status === 'REJECTED' && (
                          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-800">
                            <p className="font-bold">Request declined</p>
                            <p className="text-xs text-red-700 mt-0.5">The donor was unable to accept this request at this time.</p>
                          </div>
                        )}
                        {offer.status === 'COUNTERED' && (
                          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800">
                            <p className="font-bold">Donor submitted a counter-offer</p>
                            <p className="text-xs text-amber-700 mt-0.5">Please review the updated terms.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}