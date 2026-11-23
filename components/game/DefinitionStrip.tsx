'use client';
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {Check,ChevronLeft,ChevronRight,ListChecks} from 'lucide-react';
import type {WordListData} from './common';
import {Window,Button} from '../ui/GameUI';

export interface DefinitionState {
 selected:number|null;
 select:(group:number)=>void;
 reveals:Record<number,number>;
 success:number|null;
 miss:number;
}

function Letters({answer,count,found,animate=false}:{answer:string;count:number;found:boolean;animate?:boolean}){
 return <span className="definition-letters" data-word-label aria-hidden="true">{Array.from(answer,(letter,index)=><span key={index} className="definition-letter" data-target-letter data-state={found?'found':index<count?'hint':'hidden'} data-animate={animate||undefined} style={{'--letter-delay':index*40+'ms'} as CSSProperties}>{found||index<count?letter:'✱'}</span>)}</span>;
}

export function DefinitionStrip({words,state,unavailable}:{words:WordListData;state:DefinitionState;unavailable:boolean}){
 const [list,setList]=useState(false);
 const trigger=useRef<HTMLButtonElement>(null),start=useRef<{x:number;y:number}|null>(null);
 const found=new Set(words.strokes.map(s=>s.id));
 const groups=[...new Set(words.board.targets.map(t=>t.group))].map(group=>{
  const parts=words.board.targets.filter(t=>t.group===group);
  const first=parts[0]!;
  return {group,answer:parts.map(p=>p.text).join(''),clue:words.clues?.[first.text]??first.label,done:parts.every(t=>found.has(t.id))};
 });
 const active=state.success??words.activeOnly??state.selected;
 const current=groups.find(t=>t.group===active)??groups.find(t=>!t.done)??groups[0];
 const count=groups.filter(t=>t.done).length;
 const locked=(group:number)=>words.activeOnly!==undefined&&group!==words.activeOnly;
 useEffect(()=>{if(!unavailable||!list)return;const frame=requestAnimationFrame(()=>setList(false));return()=>cancelAnimationFrame(frame);},[unavailable,list]);
 if(!current)return null;
 const idx=groups.indexOf(current),revealed=state.reveals[current.group]??0;
 const select=(index:number)=>{const item=groups[index];if(!unavailable&&item&&!locked(item.group))state.select(item.group);};
 const close=()=>{setList(false);requestAnimationFrame(()=>trigger.current?.focus({preventScroll:true}));};
 const description=`Tanım ${idx+1} / ${groups.length}. ${current.clue}. ${current.answer.length} harf. ${revealed&&!current.done?'Açık harfler: '+current.answer.slice(0,revealed)+'. ':''}${count} kelime bulundu.`;
 return <div className="definition-strip" data-success={state.success!==null||undefined} data-targets={groups.length} data-ordered={words.activeOnly!==undefined||undefined} aria-label="Tanım şeridi" role="region" onTouchStart={e=>{const p=e.touches[0];start.current=p?{x:p.clientX,y:p.clientY}:null;}} onTouchCancel={()=>{start.current=null;}} onTouchEnd={e=>{const a=start.current,p=e.changedTouches[0];start.current=null;if(!a||!p)return;const dx=p.clientX-a.x;if(Math.abs(dx)>32&&Math.abs(dx)>Math.abs(p.clientY-a.y)*1.4)select(idx+(dx<0?1:-1));}}>
  <span role="status" className="sr-only">{state.success!==null?current.answer+' bulundu. ':''}{description}</span>
  <div className="definition-question" key={state.miss} data-miss={state.miss>0||undefined}>
   <button type="button" aria-label="Önceki tanım" disabled={unavailable||idx===0||locked(groups[idx-1]?.group??-1)} onClick={()=>select(idx-1)}><ChevronLeft/></button>
   <strong key={current.group} className="definition-copy"><span>{idx+1}</span><span className="definition-text">{current.clue}</span></strong>
   <button type="button" aria-label="Sonraki tanım" disabled={unavailable||idx===groups.length-1||locked(groups[idx+1]?.group??-1)} onClick={()=>select(idx+1)}><ChevronRight/></button>
  </div>
  <div className="definition-answer" data-word-group={current.group}><span className="definition-count"><Check/>{count}/{groups.length}</span><Letters answer={current.answer} count={revealed} found={current.done} animate={state.success===current.group}/><button className="definition-list" aria-label="Tanımları aç" aria-haspopup="dialog" aria-expanded={list} ref={trigger} disabled={unavailable} onClick={()=>setList(true)}><ListChecks/></button></div>
  {list&&!unavailable&&<Window title="Tanımlar" className="definition-dialog" onClose={close} footer={<Button onClick={close}>Tahtaya dön</Button>}>
   <p><b>{count} / {groups.length}</b> kelime bulundu. Bir tanıma dokun, şerit ona geçsin.</p>{groups.map((item,i)=><button key={item.group} className="definition-option" aria-current={item===current?'true':undefined} disabled={locked(item.group)} aria-label={`${i+1}. ${item.clue}. ${item.done?item.answer+' bulundu':item.answer.length+' harf'}`} onClick={()=>{select(i);close();}}><span className="definition-number" data-done={item.done||undefined}>{item.done?<Check/>:i+1}</span><span><strong>{item.clue}</strong>{item.done?<b>{item.answer}</b>:<Letters answer={item.answer} count={state.reveals[item.group]??0} found={false}/>}</span></button>)}
  </Window>}
 </div>;
}
