'use client';
import {Component,lazy,Suspense,useState,type ComponentType,type ReactNode} from 'react';
import {LoaderCircle,RefreshCw} from 'lucide-react';

class ScreenBoundary extends Component<{children:ReactNode;onRetry:()=>void},{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 render(){return this.state.failed?<div className="screen-load-state" role="alert"><p>Bu ekran yüklenemedi. Bağlantını kontrol edip yeniden deneyebilirsin.</p><button className="button secondary" onClick={this.props.onRetry}><RefreshCw size={18} aria-hidden="true"/>Yeniden dene</button></div>:this.props.children;}
}
/** Keep the first journey in the entry bundle; optional screens load on demand. */
export function deferredGameScreen<P extends object>(name:string,load:()=>Promise<{default:ComponentType<P>}>){
 let loading:ReturnType<typeof load>|undefined;
 const preload=()=>loading??=(load().catch(error=>{loading=undefined;throw error;}));
 function DeferredScreen(props:P){
  // A rejected React.lazy instance keeps its error. Retry only this screen,
  // retaining the parent game, current props and saved progress.
  const [{Screen,attempt},setAttempt]=useState(()=>({Screen:lazy(preload),attempt:0}));
  const retry=()=>setAttempt(current=>({Screen:lazy(preload),attempt:current.attempt+1}));
  return <ScreenBoundary key={attempt} onRetry={retry}><Suspense fallback={<div className="screen-load-state" role="status"><LoaderCircle className="spin" size={22} aria-hidden="true"/><span>Hazırlanıyor…</span></div>}><Screen {...props}/></Suspense></ScreenBoundary>;
 }
 DeferredScreen.displayName=name;return Object.assign(DeferredScreen,{preload});
}
