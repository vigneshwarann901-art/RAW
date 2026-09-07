import { ArrowRight, Chrome, Leaf, Lock, Mail, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import type { UserRole } from "../../types";

const roleOptions: { value: UserRole; title: string; description: string }[] = [
  { value: "DONOR", title: "RAW Donor", description: "I provide materials" },
  { value: "SEEKER", title: "RAW Seeker", description: "I need materials" },
  { value: "BUSINESS", title: "Industry", description: "I represent a business" },
];

const donorTypes = [
  "Household",
  "Industry",
  "Hotel / Restaurant",
  "Medical / Healthcare",
  "Office / Organization",
  "Retail Shop",
  "Construction",
  "Other",
];

const seekerTypes = ["Manufacturer", "Recycler", "Construction Company", "Organization", "Other"];

function roleHome(role: UserRole) {
  return role === "SEEKER" ? "/seeker/dashboard" : "/donor/dashboard";
}

export default function Auth({ mode }: { mode: "login" | "register" }) {
  const register = mode === "register";
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const [role, setRole] = useState<UserRole>("DONOR");
  const [userType, setUserType] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [address, setAddress] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const showBusinessFields =
    register &&
    (role === "BUSINESS" || role === "SEEKER" || (role === "DONOR" && userType !== "" && userType !== "Household"));

  const submit = async () => {
    setError("");
    setMessage("");

    if (!email.trim() || !password.trim()) {
      setError("Enter your email and password.");
      return;
    }

    setBusy(true);

    if (register) {
      const result = await signUp(name || "RAW User", email, password, role, phone, businessName);
      setBusy(false);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.message) {
        setMessage(result.message);
        return;
      }

      navigate(roleHome(role));
      return;
    }

    const result = await signIn(email, password, role);
    setBusy(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    navigate(roleHome(role));
  };

  const google = async () => {
    setError("");
    setBusy(true);
    const result = await signInWithGoogle(role);
    setBusy(false);
    if (result.error) setError(result.error);
    // On success Supabase redirects the browser to the OAuth provider.
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <div className="w-full grid lg:grid-cols-2 bg-white">
        {/* LEFT VIDEO */}
        <div className="hidden lg:flex relative overflow-hidden bg-black">
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
            <source src="/vedios/login-demo.mp4" type="video/mp4" />
          </video>

          <div className="absolute inset-0 bg-black/50" />

          <div className="relative z-10 p-12 text-white flex flex-col justify-between h-full">
            <div className="flex items-center gap-3">
              <div className="bg-white text-black p-3 rounded-xl">
                <Leaf />
              </div>
              <div>
                <h1 className="text-3xl font-black">RAW</h1>
                <p className="text-sm text-gray-300">Reusable Asset Workflow</p>
              </div>
            </div>

            <div>
              <h2 className="text-5xl font-black">Give useful materials another life.</h2>
              <p className="mt-5 text-lg text-gray-200">Connecting waste generators, collectors and recyclers.</p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-start justify-center p-10 bg-white overflow-y-auto">
          <div className="w-full max-w-xl py-10">
            <div className="mb-8">
              <p className="text-emerald-600 font-bold">{register ? "Create RAW Account" : "Welcome Back"}</p>
              <h2 className="text-4xl font-black text-slate-900 mt-2">{register ? "Join RAW" : "Login to RAW"}</h2>
              <p className="mt-3 text-gray-500">
                {register ? "Connect with the circular economy" : "Sign in to continue to RAW"}
              </p>
            </div>

            {/* ROLE SELECT */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {roleOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRole(option.value)}
                  className={`p-4 rounded-xl border text-left ${
                    role === option.value ? "border-emerald-500 bg-emerald-50" : "border-gray-200"
                  }`}
                >
                  <h3 className="font-bold text-sm">{option.title}</h3>
                  <p className="text-xs text-gray-500">{option.description}</p>
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {register && (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:border-emerald-500"
                />
              )}

              {register && (
                <select
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3"
                >
                  <option value="">Select Account Type</option>
                  {(role === "SEEKER" ? seekerTypes : donorTypes).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              )}

              {showBusinessFields && (
                <>
                  <input
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Business / Company Name"
                    className="w-full border rounded-xl px-4 py-3"
                  />
                  <input
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    placeholder="GST Number"
                    className="w-full border rounded-xl px-4 py-3"
                  />
                </>
              )}

              {register && (
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Address"
                  className="w-full border rounded-xl px-4 py-3"
                />
              )}

              {register && (
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Mobile Number"
                  className="w-full border rounded-xl px-4 py-3"
                />
              )}

              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full border rounded-xl pl-11 pr-4 py-3 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  autoComplete={register ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={register ? "Create Password" : "Password"}
                  className="w-full border rounded-xl pl-11 pr-4 py-3 outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  void submit();
                }}
                className="w-full mt-1 rounded-xl bg-slate-950 text-white py-3.5 font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? "Processing..." : register ? "Create RAW Account" : "Login"}
                <ArrowRight size={18} />
              </button>

              <div className="flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs font-semibold text-gray-400">OR</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  void google();
                }}
                className="w-full rounded-xl border border-gray-200 text-slate-900 py-3.5 font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Chrome size={18} /> Continue with Google
              </button>

              {error && (
                <div className="mt-4 rounded-xl bg-red-50 border border-red-200 text-red-700 p-3 text-sm">
                  {error}
                </div>
              )}

              {message && (
                <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 text-sm">
                  {message}
                </div>
              )}

              <div className="mt-8 flex items-center gap-3 text-sm text-gray-500">
                <ShieldCheck size={18} />
                Secure RAW verification system
              </div>

              <p className="mt-8 text-center text-sm text-gray-500">
                {register ? "Already have an account?" : "New to RAW?"}{" "}
                <Link to={register ? "/auth/login" : "/auth/register"} className="font-bold text-emerald-600">
                  {register ? "Login" : "Create one"}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
