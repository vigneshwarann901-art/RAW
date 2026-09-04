import { Component, type ErrorInfo, type ReactNode } from 'react';
type Props={children:ReactNode}; type State={hasError:boolean; message?:string};
export default class ErrorBoundary extends Component<Props, State>{
  state:State={hasError:false};
  static getDerivedStateFromError(error:Error):State{return {hasError:true,message:error.message};}
  componentDidCatch(error:Error, info:ErrorInfo){console.error('RAW application error',error,info);}
  render(){ if(!this.state.hasError) return this.props.children; return <div className="min-h-screen bg-slate-50 px-4 py-16"><div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white font-black">RAW</div><h1 className="mt-5 text-2xl font-black">Something interrupted RAW.</h1><p className="mt-2 text-sm leading-6 text-slate-500">Reload the app to continue.</p>{this.state.message&&<p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">{this.state.message}</p>}<button onClick={()=>window.location.reload()} className="mt-6 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white">Reload RAW</button></div></div>;}
}
