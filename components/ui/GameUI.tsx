'use client';
import {useId,useLayoutEffect,useRef,type ButtonHTMLAttributes,type ReactNode,type Ref} from 'react';
import {ChevronRight,X} from 'lucide-react';
import {openGameDialog} from '@/lib/game/legacy-ui';

type Children={children:ReactNode};
type WindowProps=Children&{title:string;onClose:()=>void;footer?:ReactNode;compact?:boolean;visuallyHiddenTitle?:boolean;className?:string};
export function Window({title,onClose,children,footer,compact=false,visuallyHiddenTitle=false,className=''}:WindowProps){
 const ref=useRef<HTMLDialogElement>(null),heading=useRef<HTMLHeadingElement>(null),id=useId(),close=useRef(onClose);
 useLayoutEffect(()=>{close.current=onClose;},[onClose]);
 useLayoutEffect(()=>{if(!ref.current)return;return openGameDialog(ref.current,()=>close.current(),window);},[]);
 useLayoutEffect(()=>{heading.current?.focus({preventScroll:true});},[title]);
 return <dialog data-layout="viewport" className={'kt-window'+(compact?' kt-small':'')+' '+className} ref={ref} aria-labelledby={id} onCancel={event=>{event.preventDefault();onClose();}}>
  <header className="kt-head"><h2 id={id} className={visuallyHiddenTitle?'sr-only':undefined} tabIndex={-1} ref={heading}>{title}</h2><button type="button" onClick={onClose} aria-label="Kapat"><X/></button></header>
  <div className="kt-body">{children}</div>{footer&&<footer className="kt-foot">{footer}</footer>}
 </dialog>;
}
export function Button({kind='primary',className='',...props}:ButtonHTMLAttributes<HTMLButtonElement>&{kind?:'primary'|'secondary'|'text'|'play'|'danger'}){
 return <button type="button" className={'kt-btn kt-'+kind+' '+className} {...props}/>;
}
export function RowGroup({title,children}:{title?:string}&Children){return <section className="kt-section">{title&&<h3>{title}</h3>}<div className="kt-group">{children}</div></section>;}
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
