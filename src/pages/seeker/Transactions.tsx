import { PackageCheck, ReceiptText } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import Badge from '../../components/common/Badge';
import { useRaw } from '../../store/RawStore';

export default function SeekerTransactions() {
  const { transactions, currentUser } = useRaw();
  const seekerTransactions = transactions.filter((item) => item.seekerId === currentUser.id);

  return (
    <AppShell>
      <div>
        <p className="text-sm font-semibold text-teal-700">History</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">Transactions</h1>
        <p className="mt-2 text-sm text-slate-500">Your material exchanges with donors.</p>
        <div className="mt-6 space-y-4">
          {seekerTransactions.map((t) => (
            <div key={t.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-teal-50 text-teal-700">
                  <PackageCheck className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold">{t.id}</h3>
                    <Badge tone={t.status === 'COMPLETED' ? 'success' : 'brand'}>{t.status}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {t.material} · {t.quantity} {t.unit} · pickup {new Date(t.pickupTime).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-left lg:text-right">
                  <div className="text-lg font-black">₹{t.total.toLocaleString()}</div>
                  <div className="text-xs text-slate-500">Agreed transaction value</div>
                </div>
                <div className="flex gap-2">
                  <Link to={`/donor/receipts/${t.id}`} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold">
                    <ReceiptText className="h-4 w-4" /> Receipt
                  </Link>
                </div>
              </div>
            </div>
          ))}
          {seekerTransactions.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="font-semibold">No transactions yet</p>
              <p className="mt-1 text-sm text-slate-500">Your completed exchanges will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}