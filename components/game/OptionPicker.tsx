'use client';
import {useState} from 'react';
import {Check,ChevronDown,Search} from 'lucide-react';
import {Modal} from './common';
export function OptionPicker({id,label,value,options,onChange}:{id:string;label:string;value:string;options:{value:string;label:string}[];onChange:(value:string)=>void}){
 const [open,setOpen]=useState(false),[query,setQuery]=useState('');
 const filtered=options.filter(item=>item.label.toLocaleLowerCase('tr').includes(query.toLocaleLowerCase('tr')));
 return <div className="option-picker"><span id={id+'-label'}>{label}</span><button id={id} type="button" className="option-picker-trigger" aria-labelledby={id+'-label '+id+'-value'} aria-haspopup="dialog" disabled={!options.length} onClick={()=>{setQuery('');setOpen(true);}}><span id={id+'-value'}>{options.find(o=>o.value===value)?.label??'Bölümler hazırlanıyor…'}</span><ChevronDown size={18}/></button>{open&&<Modal title={label} className="game-library-sheet option-picker-sheet" onClose={()=>setOpen(false)}>{options.length>8&&<label className="search-box"><Search size={18}/><input aria-label={label+' ara'} placeholder="Ara" value={query} onChange={e=>setQuery(e.target.value)}/></label>}<div className="option-picker-list">{filtered.map(item=><button type="button" key={item.value} aria-pressed={item.value===value} onClick={()=>{onChange(item.value);setOpen(false);}}><span>{item.label}</span>{item.value===value&&<Check size={18}/>}</button>)}{filtered.length===0&&<p>Aramana uygun seçenek yok.</p>}</div></Modal>}</div>;
}
