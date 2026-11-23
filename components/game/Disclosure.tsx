'use client';
import {useId,useState,type ReactNode} from 'react';
import {ChevronDown} from 'lucide-react';
/** Native button semantics keep keyboard and screen reader operation intact. */
export function Disclosure({title,children,icon,note,className=''}:{title:string;children:ReactNode;icon?:ReactNode;note?:string;className?:string}){
 const [open,setOpen]=useState(false),id=useId();
 return <section className={'game-disclosure '+className}><button type="button" className="game-disclosure-trigger" aria-expanded={open} aria-controls={id} onClick={()=>setOpen(!open)}>{icon?<><span className="kt-icon" aria-hidden="true">{icon}</span><span className="kt-label"><b>{title}</b>{note&&<small>{note}</small>}</span></>:title}<ChevronDown size={18} aria-hidden="true"/></button><div id={id} hidden={!open}>{children}</div></section>;
}
