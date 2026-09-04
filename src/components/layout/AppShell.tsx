import { Bell, Bot, ChevronDown, ClipboardCheck, FileText, LayoutDashboard, Leaf, Menu, Search, Settings, UserCircle2, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useRaw } from '../../store/RawStore';
import { useAuth } from '../../auth/AuthProvider';

const nav = [
  { href: '/donor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/seeker/marketplace', label: 'Find RAW', icon: Search },
  { href: '/donor/listings', label: 'My RAW', icon: Leaf },
  { href: '/seeker/requirements', label: 'Requirements', icon: ClipboardCheck },
  { href: '/seeker/matches', label: 'RAW Match', icon: Bot },
  { href: '/donor/offers', label: 'Offers', icon: Bell },
  { href: '/donor/transactions', label: 'Transactions', icon: FileText },
  { href: '/donor/impact', label: 'Impact', icon: Leaf },
  { href: '/assistant', label: 'RAW Assistant', icon: Bot },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [topSearch, setTopSearch] = useState('');
  const { notifications, currentUser, markNotificationAsRead } = useRaw();
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const unread = notifications.filter(n => !n.read).length;

  const navigation = <nav className="space-y-1 p-4">{nav.map(item => { const Icon = item.icon; const active = pathname === item.href; return <Link onClick={() => setOpen(false)} key={item.href} to={item.href} className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${active ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}><Icon className="h-4 w-4"/>{item.label}</Link>; })}</nav>;

  return <div className="min-h-screen bg-slate-50 text-slate-900">
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:block">
      <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6"><div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-white"><Leaf className="h-5 w-5"/></div><div><div className="text-lg font-black tracking-tight">RAW</div><div className="text-[10px] uppercase tracking-[0.22em] text-slate-400">reusable network</div></div></div>
      {navigation}
      <div className="absolute bottom-0 w-full border-t border-slate-100 p-4"><Link to="/profile" className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><UserCircle2 className="h-9 w-9 text-slate-500"/><div className="min-w-0"><div className="truncate text-sm font-semibold">{currentUser.name}</div><div className="truncate text-xs text-slate-500">Trust {currentUser.trustScore} · verified participant</div></div><ChevronDown className="ml-auto h-4 w-4 text-slate-400"/></Link><button onClick={() => void signOut()} className="mt-2 w-full rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900">Sign out</button></div>
    </aside>
    {open && <div className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" onClick={() => setOpen(false)}><div className="h-full w-72 bg-white" onClick={e => e.stopPropagation()}><div className="flex h-20 items-center justify-between border-b border-slate-100 px-5"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-white"><Leaf className="h-5 w-5"/></div><span className="text-lg font-black">RAW</span></div><button onClick={() => setOpen(false)} className="rounded-lg p-2"><X className="h-5 w-5"/></button></div>{navigation}</div></div>}
    <div className="lg:pl-64"><header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur"><div className="flex h-16 items-center gap-3 px-4 sm:px-6"><button onClick={() => setOpen(true)} className="rounded-xl p-2.5 text-slate-600 hover:bg-slate-100 lg:hidden"><Menu className="h-5 w-5"/></button><form onSubmit={e => { e.preventDefault(); navigate(`/seeker/marketplace?q=${encodeURIComponent(topSearch)}`); }} className="relative hidden max-w-xl flex-1 md:block"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input value={topSearch} onChange={e => setTopSearch(e.target.value)} placeholder="Search materials, businesses, requirements..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-teal-400"/></form><div className="ml-auto flex items-center gap-2"><Link to="/assistant" className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100" title="RAW Assistant"><Bot className="h-5 w-5"/></Link><div className="relative"><button onClick={() => setShowNotifications(v => !v)} className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100" aria-label="Notifications"><Bell className="h-5 w-5"/>{unread > 0 && <span className="absolute right-1 top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-teal-500 px-1 text-[10px] font-bold text-white">{Math.min(9, unread)}</span>}</button>{showNotifications && <div className="absolute right-0 top-12 z-50 w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><div><p className="text-sm font-bold">Notifications</p><p className="text-xs text-slate-500">Live RAW activity</p></div><span className="rounded-full bg-teal-50 px-2 py-1 text-[10px] font-bold text-teal-700">REALTIME</span></div><div className="max-h-80 overflow-y-auto">{notifications.slice(0, 6).map(n => <Link onClick={() => { markNotificationAsRead(n.id); setShowNotifications(false); }} to={n.link ?? '/donor/dashboard'} key={n.id} className="block border-b border-slate-50 px-4 py-3 hover:bg-slate-50"><div className="flex items-start gap-3"><div className={`mt-1 h-2.5 w-2.5 rounded-full ${n.read ? 'bg-slate-200' : 'bg-teal-500'}`}/><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-800">{n.title}</p><p className="mt-0.5 text-xs leading-5 text-slate-500">{n.message}</p><p className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">{new Date(n.createdAt).toLocaleString()}</p></div></div></Link>)}{notifications.length === 0 && <div className="p-6 text-center text-sm text-slate-500">No notifications yet.</div>}</div></div>}</div><Link to={currentUser.role === 'ADMIN' ? '/admin' : '/profile'} className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100" title="Settings"><Settings className="h-5 w-5"/></Link></div></div></header><main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main></div>
  </div>;
}
