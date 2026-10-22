'use client';
import {useId,useState} from 'react';
import {ArrowRight,Check,CheckCircle2,LoaderCircle} from 'lucide-react';
import {releaseDateLabel,releaseStamp,type ReleasePair} from '@/lib/studio/release-stamps';
import type {ChapterCardProgress,ChapterCardState} from '@/lib/studio/card-progress';
import {Modal} from './common';

function StampArt({earned=false,large=false}:{earned?:boolean;large?:boolean}){
 return <svg className={'release-stamp-art'+(large?' large':'')} viewBox="0 0 100 100" fill="none" aria-hidden="true"><circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 3"/><circle cx="50" cy="50" r="39" stroke="currentColor"/><path d="M33 68c5-15 16-29 33-39-1 21-10 37-28 35M42 58c-14-1-22-11-21-23 16 2 25 9 25 18M37 67l-4 9M47 50l12-10M42 57l-9-10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>{earned&&<path d="m61 68 5 5 12-14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>}</svg>;
}

export function ReleaseStamp({pair,values,status,compact=false}:{pair:ReleasePair;values:Record<string,ChapterCardProgress>;status:ChapterCardState;compact?:boolean}){
 const stamp=releaseStamp(pair,values,status),[open,setOpen]=useState(false),id=useId();
 return <><div className={'release-stamp'+(stamp.earned?' earned':'')+(compact?' compact':'')} aria-labelledby={id}><StampArt earned={stamp.earned}/><div className="release-stamp-copy"><span className="eyebrow">{stamp.earned?'KALICI BİR HATIRA':'KÜÇÜK BİR KEŞİF HEDEFİ'}</span><h3 id={id}>{stamp.earned?'Keşif damgan açıldı':'İki keşif, bir hatıra'}</h3><p>{stamp.detail}</p>{!compact&&<ol className="release-stamp-steps">{stamp.steps.map(({chapter,progress})=><li className={progress?.complete?'done':''} key={chapter.id}>{progress?.complete?<CheckCircle2 size={15}/>:<span className="release-step-dot"/>}<span>{chapter.spec.title}<small>{progress?.complete?'Tamamlandı':progress?'Tamamlayınca işaretlenir':'Kayıt bekleniyor'}</small></span></li>)}</ol>}{!stamp.earned&&!compact&&<small className="release-stamp-rule">İki bölümü de tamamla. İpucu ve süre şartı yok; arşivden istediğin zaman dön.</small>}</div>{stamp.earned?<button className="text-button release-stamp-open" onClick={()=>setOpen(true)}>Damganı gör <ArrowRight size={16}/></button>:status==='loading'&&!stamp.known?<LoaderCircle className="spin release-stamp-loading" size={17} aria-label="Kayıtlar yükleniyor"/>:null}</div>
 {open&&stamp.earned&&<Modal title="Bir keşif hatırası daha." onClose={()=>setOpen(false)}><div className="release-stamp-certificate"><span className="eyebrow">KELİME TENEFFÜSÜ · KEŞİF DEFTERİN</span><StampArt earned large/><h3>{releaseDateLabel(pair.date)}</h3><p>İki küçük dünyayı keşfettin.<br/>Bu damga senin tamamlamalarından doğdu.</p><ul>{stamp.steps.map(({chapter})=><li key={chapter.id}><Check size={16}/>{chapter.spec.title}</li>)}</ul><span className="release-certificate-seal">İki keşif tamam · Kalıcı hatıra</span></div><p className="release-stamp-permanent">Bölümler ve damgan bu tarihin arşivinde kalır. Yeniden oynadığında aynı hatıra korunur.</p><button className="button primary full" onClick={()=>setOpen(false)}>Keşiflere dön <ArrowRight size={17}/></button></Modal>}
 </>;
}
