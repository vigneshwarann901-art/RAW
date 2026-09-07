import { Link } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import Badge from '../../components/common/Badge';
import { useRaw } from '../../store/RawStore';

export default function SeekerDashboard() {
  const { currentUser, listings, requirements, transactions } = useRaw();
  const seekerRequirements = requirements.filter((item) => item.seekerId === currentUser.id || currentUser.role === 'SEEKER');
  const seekerTransactions = transactions.filter((item) => item.seekerId === currentUser.id || currentUser.role === 'SEEKER');
  const activeRequirements = seekerRequirements.filter((item) => item.status === 'ACTIVE');
  const completedTransactions = seekerTransactions.filter((item) => item.status === 'COMPLETED');
  const materialsReceived = completedTransactions.reduce((sum, item) => sum + item.quantity, 0);
  const availableListings = listings.filter((item) => item.status === 'ACTIVE');

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-teal-700">Seeker workspace</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight">Seeker Workspace</h1>
            <p className="mt-2 text-sm text-slate-500">Track your material needs, matches and completed RAW exchanges.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/seeker/requirements/new" className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">Post Requirement</Link>
            <Link to="/seeker/marketplace" className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">Find RAW Materials</Link>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          <Card title="Requirements Posted" value={String(seekerRequirements.length)} />
          <Card title="Active Requirements" value={String(activeRequirements.length)} />
          <Card title="Materials Received" value={`${materialsReceived.toLocaleString()} kg`} />
          <Card title="Transactions" value={String(seekerTransactions.length)} />
          <Card title="Waste Recovered" value={`${materialsReceived.toLocaleString()} kg`} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-bold">Recent Requirements</h2>
                <p className="mt-1 text-sm text-slate-500">Materials you have requested from the RAW network.</p>
              </div>
              <Link to="/seeker/requirements" className="text-sm font-semibold text-teal-700">View all</Link>
            </div>
            <div className="mt-5 space-y-3">
              {seekerRequirements.slice(0, 5).map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{item.material}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.quantity} {item.unit} · needed by {item.neededBy.slice(0, 10)}</p>
                    </div>
                    <Badge tone={item.status === 'ACTIVE' ? 'success' : 'neutral'}>{item.status}</Badge>
                  </div>
                </div>
              ))}
              {seekerRequirements.length === 0 && <p className="py-6 text-center text-sm text-slate-400">No requirements posted yet.</p>}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-bold">Recommended Materials</h2>
                <p className="mt-1 text-sm text-slate-500">Available donor listings you can review now.</p>
              </div>
              <Link to="/seeker/marketplace" className="text-sm font-semibold text-teal-700">Open marketplace</Link>
            </div>
            <div className="mt-5 space-y-3">
              {availableListings.slice(0, 5).map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.quantity} {item.unit} · {item.location} · {item.condition}</p>
                    </div>
                    <div className="text-right text-sm font-bold text-slate-900">{item.price ? `₹${item.price.toLocaleString()}` : 'Free'}</div>
                  </div>
                </div>
              ))}
              {availableListings.length === 0 && <p className="py-6 text-center text-sm text-slate-400">No donor listings available yet.</p>}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <p className="text-sm text-slate-500">{title}</p>
      <h2 className="mt-3 text-3xl font-black">{value}</h2>
    </div>
  );
}
