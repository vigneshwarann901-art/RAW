import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";


export function RequireAuth({
  children
}:{
  children:ReactNode;
}){

  const { session, loading, mode } = useAuth();

  const location = useLocation();


  if(loading){

    return (

      <div className="
      grid
      min-h-screen
      place-items-center
      bg-slate-50
      text-sm
      text-slate-500
      ">

        Loading RAW…

      </div>

    );

  }



  // When Supabase is configured, a real session is required.
  // (Demo mode, used only when Supabase env vars are absent, has no session concept.)
  if(mode === "supabase" && !session){

    return (

      <Navigate
        to="/auth/login"
        replace
        state={{ from: location }}
      />

    );

  }

  return <>{children}</>;

}




export function RequireAdmin({
  children
}:{
  children:ReactNode;
}){


  const { user } = useAuth();



  if(user?.role==="ADMIN"){

    return <>{children}</>;

  }



  return (

    <Navigate

      to="/donor/dashboard"

      replace

    />

  );


}