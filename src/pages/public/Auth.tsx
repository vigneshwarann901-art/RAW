import { ArrowRight, Check, Leaf, ShieldCheck, Sparkles, Users, Recycle, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../auth/AuthProvider';

export default function Auth({ mode }: { mode: 'login' | 'register' }) {
  const register = mode === 'register';
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [role, setRole] = useState<'DONOR' | 'SEEKER'>('DONOR');
  const [email, setEmail] = useState('vignesh@example.com');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submitGoogle = async () => {
    setBusy(true);
    setError('');
    const result = await signInWithGoogle(role);
    setBusy(false);
    if (result.error) setError(result.error);
  };

  const submit = async () => {
    setBusy(true);
    setError('');
    const result = register
      ? await signUp(name || 'RAW Member', email, password || 'DemoPassword123!', role, phone, businessName)
      : await signIn(email, password || 'DemoPassword123!', role);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    navigate(role === 'DONOR' ? '/donor/dashboard' : '/seeker/marketplace');
  };

  return (
    <div className="min-h-screen bg-slate-950 p-0 sm:p-4">
      <div className="mx-auto grid min-h-screen max-w-6xl overflow-hidden border border-white/10 bg-white sm:min-h-[calc(100vh-2rem)] sm:rounded-3xl lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative hidden overflow-hidden bg-slate-950 text-white lg:flex lg:flex-col">
          <img src="/raw-materials-dark.svg" alt="Reusable and recoverable raw materials" className="absolute inset-0 h-full w-full object-cover object-[66%]" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/88 via-slate-950/55 to-slate-950/96" />
          <div className="relative z-10 flex h-full flex-col p-8 xl:p-10">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-950"><Leaf className="h-5 w-5" /></div>
              <div><div className="text-xl font-black">RAW</div><div className="text-[10px] uppercase tracking-[0.22em] text-slate-400">reusable network</div></div>
            </div>
            <div className="mt-14 max-w-md">
              <p className="text-sm font-semibold text-teal-300">Reusable & Recoverable Network</p>
              <h1 className="mt-4 text-5xl font-black leading-[1.05] tracking-tight">Give useful material another life.</h1>
              <p className="mt-5 text-base leading-7 text-slate-300">Connect surplus with nearby demand, build trusted exchanges, and keep valuable resources in circulation.</p>
            </div>
            <div className="mt-8 grid max-w-sm gap-3 sm:grid-cols-2">
              {[
                { icon: Sparkles, text: 'Smart local matching' },
                { icon: Recycle, text: 'Circularity-aware discovery' },
                { icon: Users, text: 'Trusted participants' },
                { icon: MapPin, text: 'Privacy-aware locations' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-slate-200 backdrop-blur-sm">
                  <Icon className="h-4 w-4 shrink-0 text-teal-300" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
            <div className="mt-auto grid grid-cols-3 gap-3 pt-8">
              {[
                ['1.24t', 'recovered'],
                ['57', 'reuse cycles'],
                ['36', 'exchanges'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                  <div className="text-lg font-black text-white">{value}</div>
                  <div className="mt-1 text-[11px] text-slate-400">{label}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400"><ShieldCheck className="h-4 w-4" /> Privacy-aware location sharing</div>
          </div>
        </aside>

        <main className="p-5 sm:p-8 lg:p-10">
          <div className="mx-auto max-w-lg">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-white"><Leaf className="h-5 w-5" /></div>
              <div><div className="text-xl font-black">RAW</div><div className="text-[10px] uppercase tracking-[0.22em] text-slate-400">reusable network</div></div>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 lg:hidden">
              <div className="relative h-36">
                <img src="/raw-materials-light.svg" alt="Raw material categories" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-xs font-semibold text-white">Reuse locally. Keep value in circulation.</div>
              </div>
            </div>

            <div className="mt-7 lg:mt-0">
              <p className="text-sm font-semibold text-teal-700">{register ? 'Create your RAW account' : 'Welcome back'}</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">{register ? 'Join the network' : 'Sign in to RAW'}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{register ? 'Choose how you participate in the circular economy.' : 'Manage surplus, requirements, offers and transactions.'}</p>

              {register && (
                <div className="mt-6 grid grid-cols-2 gap-2">
                  {[
                    ['DONOR', 'I have RAW', 'List surplus material'],
                    ['SEEKER', 'I need RAW', 'Find or request material'],
                  ].map(([value, title, copy]) => (
                    <button key={value} type="button" onClick={() => setRole(value as 'DONOR' | 'SEEKER')} className={`rounded-xl border p-3 text-left text-sm font-semibold transition ${role === value ? 'border-teal-300 bg-teal-50 text-teal-800 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}>
                      {title}<div className="mt-1 text-xs font-normal text-slate-500">{copy}</div>
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-6 space-y-3.5">
                {register && <input value={name} onChange={e => setName(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100" placeholder="Full name" />}
                {register && role === 'SEEKER' && <input value={businessName} onChange={e => setBusinessName(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100" placeholder="Business name (optional)" />}
                {register && <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100" placeholder="Phone" />}
                <input value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100" placeholder="Email" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100" placeholder="Password" />
                <button disabled={busy} onClick={submit} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3.5 font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
                  {busy ? 'Working…' : register ? 'Create account' : 'Continue'} <ArrowRight className="h-4 w-4" />
                </button>
                <button type="button" onClick={submitGoogle} disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3.5 font-semibold transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"><Sparkles className="h-4 w-4" /> Continue with Google</button>
                {error && <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
              </div>

              <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="grid items-stretch sm:grid-cols-[1.05fr_0.95fr]">
                  <div className="relative overflow-hidden rounded-xl">
                    <img src="/raw-materials-light.svg" alt="Raw material categories" className="h-36 w-full object-cover sm:h-full" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 to-transparent" />
                    <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-lg bg-white/90 px-2.5 py-1.5 text-[11px] font-semibold text-slate-800"><Recycle className="h-3.5 w-3.5 text-teal-700" /> Keep value moving</div>
                  </div>
                  <div className="p-4 sm:pl-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-700">Built for circular exchange</p>
                    <p className="mt-2 text-sm font-bold leading-5 text-slate-900">One trusted place for surplus, demand and reuse.</p>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-500">
                      <span><strong className="text-slate-900">1.24t</strong><br />recovered</span>
                      <span><strong className="text-slate-900">36</strong><br />exchanges</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-7 text-center text-sm text-slate-500">
                {register ? 'Already have an account?' : 'New to RAW?'}{' '}
                <Link to={register ? '/auth/login' : '/auth/register'} className="font-semibold text-teal-700 hover:text-teal-800">{register ? 'Log in' : 'Create one'}</Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
