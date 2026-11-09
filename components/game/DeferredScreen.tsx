'use client';
import {Component,lazy,Suspense,type ComponentType,type ReactNode} from 'react';
import {LoaderCircle,RefreshCw} from 'lucide-react';

class ScreenBoundary extends Component<{children:ReactNode},{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 render(){return this.state.failed?<div className="screen-load-state" role="alert"><p>Bu ekran yüklenemedi. Bağlantını kontrol edip yeniden deneyebilirsin.</p><button className="button secondary" onClick={()=>location.reload()}><RefreshCw size={18}/>Yeniden aç</button></div>:this.props.children;}
}
/** Keep the first journey in the entry bundle; optional screens load on demand. */
export function deferredGameScreen<P extends object>(name:string,load:()=>Promise<{default:ComponentType<P>}>){
 const Screen=lazy(load);
 function DeferredScreen(props:P){return <ScreenBoundary><Suspense fallback={<div className="screen-load-state" role="status"><LoaderCircle className="spin" size={22}/><span>Hazırlanıyor…</span></div>}><Screen {...props}/></Suspense></ScreenBoundary>;}
 DeferredScreen.displayName=name;return DeferredScreen;
}
