import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
export function RequireAuth({children}:{children:ReactNode}){const {session,mode,loading}=useAuth();const location=useLocation();if(loading)return <div className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500">Loading RAW…</div>;if(mode==='demo'||session)return <>{children}</>;return <Navigate to="/auth/login" replace state={{from:location.pathname}}/>;}
export function RequireAdmin({children}:{children:ReactNode}){const {user}=useAuth();return user.role==='ADMIN'?<>{children}</>:<Navigate to="/donor/dashboard" replace/>;}
