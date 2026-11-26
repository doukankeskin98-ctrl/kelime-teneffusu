'use client';
import {useId,useLayoutEffect,useRef,type ButtonHTMLAttributes,type CSSProperties,type ReactNode,type Ref} from 'react';
import {ChevronRight,Clock,House,Play,X} from 'lucide-react';
import {openGameDialog} from '@/lib/game/legacy-ui';

type Children={children:ReactNode};
type WindowProps = Children & {
 title: string;
 onClose: () => void;
 footer?: ReactNode;
 compact?: boolean;
 visuallyHiddenTitle?: boolean;
 className?: string;
 surface?: 'arena' | 'settings' | 'menu';
 context?: string;
 panelArt?: string;
 scene?: { background: string; decoration?: ReactNode; leading?: ReactNode; home?: boolean };
};
export function Window({title,onClose,children,footer,compact=false,visuallyHiddenTitle=false,className='',surface='menu',context,scene,panelArt}:WindowProps){
 const ref=useRef<HTMLDialogElement>(null), heading=useRef<HTMLHeadingElement>(null), id=useId();
 const close=useRef(onClose);
 useLayoutEffect(()=>{close.current=onClose;},[onClose]);
 useLayoutEffect(()=>{
  if(ref.current) return openGameDialog(ref.current,()=>close.current(),window);
 },[]);
 useLayoutEffect(()=>{heading.current?.focus({preventScroll:true});},[title]);
 const frame=scene ? 'modal game-dialog scenic-outcome' : 'kt-window';
 return <dialog ref={ref} aria-labelledby={id} aria-modal="true"
   className={[frame,compact?'kt-small':'',className].filter(Boolean).join(' ')}
   data-kt-surface={scene?undefined:surface} data-kt-context={context} data-layout={scene?undefined:'viewport'}
   style={scene?{'--outcome-scene':scene.background} as CSSProperties:panelArt?{'--panel-art':`url("${panelArt}")`} as CSSProperties:undefined}
   onCancel={event=>{event.preventDefault();event.stopPropagation();onClose();}}
   onClick={event=>{
    if(event.target!==event.currentTarget)return;
    const box=event.currentTarget.getBoundingClientRect();
    if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)onClose();
   }}>
  {scene?.decoration}
  <header className={scene?'modal-head':'kt-head'}>
   {scene?.leading}
   <h2 id={id} className={visuallyHiddenTitle?'sr-only':undefined} tabIndex={-1} ref={heading}>{title}</h2>
   <button type="button" className={scene?'icon-button':'kt-close'} onClick={onClose} aria-label={scene?.home?'Ana sayfa':'Kapat'}>{scene?.home?<House/>:<X/>}</button>
  </header>
  <div className={scene?'modal-content':'kt-body'}>{children}</div>
  {footer&&<footer className={scene?'modal-actions':'kt-foot'} aria-label="İşlemler">{footer}</footer>}
 </dialog>;
}
export function Button({kind='primary',className='',...props}:ButtonHTMLAttributes<HTMLButtonElement>&{kind?:'primary'|'secondary'|'text'|'play'|'danger'}){
 return <button type="button" className={'kt-btn kt-'+kind+' '+className} {...props}/>;
}
export function Section({title,children}:{title?:string}&Children){
 return <section className="kt-section">{title&&<h3>{title}</h3>}{children}</section>;
}
export function Group({children}:Children){return <div className="kt-group">{children}</div>;}
export function RowGroup({title,children}:{title?:string}&Children){
 return <Section title={title}><Group>{children}</Group></Section>;
}

type ToggleProps={icon:ReactNode;title:string;note?:string;checked:boolean;onChange:(checked:boolean)=>void;disabled?:boolean};
export function Toggle({icon,title,note,checked,onChange,disabled}:ToggleProps){
 return <button type="button" className="kt-row" role="switch" aria-checked={checked} disabled={disabled} onClick={()=>onChange(!checked)}>
  <span className="kt-icon" aria-hidden="true">{icon}</span>
  <span className="kt-label"><b>{title}</b>{note&&<small>{note}</small>}</span>
  <i className="kt-toggle" aria-hidden="true"/>
 </button>;
}
export function Notice({children,running=false}:Children&{running?:boolean}){
 return <p className="kt-notice" data-running={running||undefined}><Clock aria-hidden="true"/>{children}</p>;
}
export function Hero({title,note,...props}:ButtonHTMLAttributes<HTMLButtonElement>&{title:string;note:string}){
 return <button type="button" className="kt-hero" {...props}>
  <span><b>{title}</b><small>{note}</small></span><i aria-hidden="true"><Play/></i>
 </button>;
}
export function Row({icon,title,note,onClick,end,buttonRef}:{buttonRef?:Ref<HTMLButtonElement>;icon:ReactNode;title:string;note?:string;onClick?:()=>void;end?:ReactNode}){
 const content=<><span className="kt-icon" aria-hidden="true">{icon}</span><span className="kt-label"><b>{title}</b>{note&&<small>{note}</small>}</span>{end??(onClick&&<ChevronRight size={18} aria-hidden="true"/>)}</>;
 return onClick?<button type="button" className="kt-row" ref={buttonRef} onClick={onClick}>{content}</button>:<div className="kt-row">{content}</div>;
}
export function Tile({icon,title,note,tone='purple',badge,...rest}:ButtonHTMLAttributes<HTMLButtonElement>&{icon:ReactNode;title:string;note:string;tone?:string;badge?:string}){
 return <button type="button" className="kt-tile" {...rest}><span className="kt-tile-art" data-tone={tone} aria-hidden="true">{icon}{badge&&<em>{badge}</em>}</span><b>{title}</b><small>{note}</small></button>;
}
export function Chip({children,tone='purple'}:Children&{tone?:string}){return <span className="kt-chip" data-tone={tone}>{children}</span>;}
export function Meter({value,total,label}:{value:number;total:number;label:string}){return <progress className="kt-meter" aria-label={label} max={total} value={value}/>;}
export function Segmented<T extends string>({label,items,value,onChange}:{label:string;items:readonly {id:T;label:string}[];value:T;onChange:(id:T)=>void}){
 return <div className="kt-segments" role="tablist" aria-label={label}>{items.map(({id,label:caption},i)=><button key={id} id={'collection-tab-'+id} type="button" role="tab" tabIndex={id===value?0:-1} aria-selected={id===value} aria-controls={'collection-panel-'+id} onClick={()=>onChange(id)} onKeyDown={e=>{const k=e.key;if(!['Home','End','ArrowLeft','ArrowRight'].includes(k))return;e.preventDefault();const next=k==='Home'?0:k==='End'?items.length-1:(i+(k==='ArrowLeft'?-1:1)+items.length)%items.length;onChange(items[next]!.id);e.currentTarget?.parentElement?.querySelectorAll('button')[next]?.focus();}}>{caption}</button>)}</div>;
}
export function EmptyState({icon,title,children}:{icon:ReactNode;title:string}&Children){return <section className="kt-empty"><span aria-hidden="true">{icon}</span><h3>{title}</h3>{children}</section>;}
export function ConfirmDialog(props:WindowProps){return <Window {...props} compact visuallyHiddenTitle className={'kt-confirm '+(props.className??'')}/>;}
