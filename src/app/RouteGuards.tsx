import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";


export function RequireAuth({
  children
}:{
  children:ReactNode;
}){

  const { session, loading } = useAuth();

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



  // TEMPORARY DEMO MODE
  // Allows frontend OTP demo login

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