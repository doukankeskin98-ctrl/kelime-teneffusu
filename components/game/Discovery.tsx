'use client';
import {useState,type CSSProperties} from 'react';
import {ArrowLeft,ArrowRight,BookOpen,Check,Compass,Gift,LockKeyhole,MapPin,Search,Sparkles,Star} from 'lucide-react';
import type {Journey} from '@/lib/game/content';
import {discoveryState,recommendedExpedition,type ExpeditionState,type DiscoveryReward} from '@/lib/game/discovery';
import type {Progress} from '@/lib/game/progress';
import {WorldArt} from './WorldArt';
import {Modal} from './common';

export function CollectionScene({state,compact=false}:{state:ExpeditionState;compact?:boolean}){
 return <div className={'collection-scene'+(compact?' compact':'')+(state.complete?' assembled':'')} role="img" aria-label={`${state.album.title}, ${state.pieces}/6 parça tamamlandı`}>
  <WorldArt themeId={state.expedition.id}/>
  <div className="collection-mosaic">{state.earned.map((earned,i)=><span className={earned?'revealed':'covered'} key={state.expedition.pieces[i]}>{earned?<i><Check size={12}/></i>:<b>{i+1}</b>}</span>)}</div>
  {state.done===state.chapters.length&&!state.complete&&<span className="collection-route-seal"><Check size={12}/>Rota hatıran senin</span>}
  {state.complete&&<span className="collection-ribbon"><Check size={13}/>Hatıra tamamlandı</span>}
 </div>;
}

const NODE_POINTS=[[20,81],[46,68],[23,49],[53,37],[35,18],[77,15]] as const;
export function DiscoveryMap({progress,onPlay}:{progress:Progress;onPlay:(journey:Journey,practice:boolean)=>void}){
 const states=discoveryState(progress),recommended=recommendedExpedition(progress),[selectedId,setSelectedId]=useState(''),[nodeId,setNodeId]=useState(''),[atlasOpen,setAtlasOpen]=useState(false);
 const selected=states.find(s=>s.expedition.id===selectedId)??recommended,index=states.indexOf(selected),all=[...selected.chapters,selected.bonus];
 const focus=all.find(j=>j.id===nodeId)??selected.next??selected.bonus,focusIndex=all.indexOf(focus),focusDone=selected.earned[focusIndex]!,canPlay=selected.unlocked&&(focusIndex<5||selected.bonusUnlocked);
 const nextWorld=states.slice(index+1).find(s=>s.unlocked&&!s.complete),pieceTotal=states.reduce((n,s)=>n+s.pieces,0),completeMaps=states.filter(s=>s.complete).length;
 const choose=(id:string)=>{setSelectedId(id);setNodeId('');setAtlasOpen(false);};
 return <section className="discovery-map journey-atlas" id="kesif-haritasi" aria-labelledby="discovery-map-title" style={{'--atlas-accent':selected.expedition.accent} as CSSProperties}>
  <div className="atlas-heading"><div><span className="eyebrow">KEŞFİN BİR SONRAKİ SAYFASI</span><h2 id="discovery-map-title">Yolculuğun devam ediyor.</h2><p>{completeMaps}/{states.length} harita tamam · {pieceTotal}/{states.length*6} kalıcı parça</p></div><button className="atlas-library-button" onClick={()=>setAtlasOpen(true)}><Compass size={20}/><span>Bütün haritalar<small>{states.length} farklı yolculuk</small></span></button></div>
  <div className="atlas-region-nav"><button className="icon-button" disabled={index===0} aria-label="Önceki harita" onClick={()=>choose(states[index-1]!.expedition.id)}><ArrowLeft size={18}/></button><div><span>HARİTA {selected.expedition.place} / {states.length}</span><h3>{selected.expedition.title}</h3><small>{selected.expedition.subtitle}</small></div><button className="icon-button" disabled={index===states.length-1} aria-label="Sonraki harita" onClick={()=>choose(states[index+1]!.expedition.id)}><ArrowRight size={18}/></button></div>
  <div className="atlas-adventure" key={selected.expedition.id}>
   <div className="atlas-landscape" aria-hidden="true"><WorldArt themeId={selected.expedition.id}/><i className="atlas-cloud cloud-a"/><i className="atlas-cloud cloud-b"/><span className="atlas-glint glint-a">✦</span><span className="atlas-glint glint-b">✦</span></div>
   <svg className="atlas-road" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path className="road-shadow" d="M20 81 C15 72 49 78 46 68 S15 63 23 49 S62 50 53 37 S23 35 35 18 S63 32 77 15"/><path className="road-base" d="M20 81 C15 72 49 78 46 68 S15 63 23 49 S62 50 53 37 S23 35 35 18 S63 32 77 15"/><path className="road-dots" d="M20 81 C15 72 49 78 46 68 S15 63 23 49 S62 50 53 37 S23 35 35 18 S63 32 77 15"/></svg>
   {all.map((j,i)=>{const done=selected.earned[i],open=selected.unlocked&&(i<5||selected.bonusUnlocked),current=j.id===selected.next?.id,save=progress.saves['route:'+j.id];return <button key={j.id} className={'atlas-node'+(done?' earned':'')+(current?' current':'')+(i===5?' final-node':'')+(j.id===focus.id?' focused':'')} style={{left:NODE_POINTS[i]![0]+'%',top:NODE_POINTS[i]![1]+'%'}} onClick={()=>setNodeId(j.id)} aria-pressed={j.id===focus.id} aria-label={`${i+1}. ${j.title}. ${done?'Tamamlandı':open?j.clues?'İpucu Avı':'Oynanabilir':'Kilitli'}`}><span className="node-disc">{done?<Check/>:!open?<LockKeyhole size={21}/>:i===5?<Gift/>:j.clues?<Search/>:<b>{i+1}</b>}</span><span className="node-stars" aria-hidden="true">{done?[0,1,2].map(n=><Star key={n} size={11} fill={n<(save?.stars??0)?'currentColor':'none'}/>):<small>{i===5?'SON MÜHÜR':j.clues?'İPUCU AVI':current?'SIRADAKİ':'KEŞİF'}</small>}</span></button>;})}
   <div className="atlas-scene-caption"><span>{selected.complete?'HATIRAN TAMAMLANDI':'SAHNEN ADIM ADIM AÇILIYOR'}</span><b>{selected.album.title}</b><div className="atlas-piece-progress" aria-label={`${selected.pieces} parça tamamlandı`}>{selected.earned.map((earned,i)=><i className={earned?'earned':''} key={i}>{earned?<Check size={11}/>:i+1}</i>)}</div></div>
  </div>
  <div className="atlas-play-dock"><span className="dock-token">{focusDone?<Check/>:focus.clues?<Search/>:<MapPin/>}</span><div><small>{focusDone?'KEŞFEDİLDİ':focus.clues?'İPUCU AVI · TANIMDAN KELİMEYE':'SIRADAKİ KÜÇÜK MACERA'}</small><h4>{focus.title.split(' · ').at(-1)}</h4><p>{focus.words.length} kelime · {focus.difficulty} · {focus.size} × {focus.size}</p><span><Gift size={13}/>{selected.expedition.pieces[focusIndex]}</span></div><button className="button primary" disabled={!canPlay} onClick={()=>onPlay(focus,focusDone)}>{focusDone?'Tekrar':progress.saves['route:'+focus.id]?.strokes.length?'Devam et':'Oyna'}<ArrowRight size={18}/></button></div>
  {!selected.unlocked&&<p className="atlas-unlock-note"><LockKeyhole size={16}/>{selected.previousTitle} haritasında {selected.remaining} bölüm daha tamamla.</p>}
  {selected.unlocked&&focusIndex===5&&!selected.bonusUnlocked&&<p className="atlas-unlock-note"><LockKeyhole size={16}/>Son mühür için bu haritanın beş durağını tamamla: {selected.done}/5.</p>}
  {selected.complete&&nextWorld&&<button className="atlas-next-region" onClick={()=>choose(nextWorld.expedition.id)}><Sparkles/><span>Yeni bir dünya seni bekliyor<b>{nextWorld.expedition.title}</b></span><ArrowRight/></button>}
  {selected.complete&&!nextWorld&&completeMaps===states.length&&<p className="atlas-unlock-note"><TrophyIcon/>Bütün haritalar albümünde. Dünyalara eklenen günlük keşifler aşağıda devam ediyor.</p>}
  {atlasOpen&&<Modal title="Keşif atlasın" onClose={()=>setAtlasOpen(false)}><p className="atlas-modal-intro">Üç durak sonraki haritayı, beş durak son mührü açar. İpuçlarıyla tamamlamak da geçerli.</p><div className="atlas-region-grid">{states.map(s=><button key={s.expedition.id} className={s.complete?'complete':''} onClick={()=>choose(s.expedition.id)}><WorldArt themeId={s.expedition.id}/><span className="region-number">{s.complete?<Check size={15}/>:s.unlocked?s.expedition.place:<LockKeyhole size={15}/>}</span><b>{s.expedition.title}</b><small>{s.complete?'Altı parça albümünde':s.unlocked?`${s.pieces}/6 parça`:`${s.previousTitle}: ${s.remaining} bölüm`}</small></button>)}</div></Modal>}
 </section>;
}
function TrophyIcon(){return <Star size={18}/>;}

export function DiscoveryResult({progress,themeId,rewards}:{progress:Progress;themeId:string;rewards:DiscoveryReward[]}){
 const state=discoveryState(progress).find(s=>s.expedition.id===themeId);if(!state)return null;
 return <div className="discovery-result" aria-label="Keşfinin hatıraları"><div className="discovery-result-top"><CollectionScene state={state} compact/><span><small>{state.complete?'HATIRA TAMAMLANDI':rewards.length?'KEŞFİNİN HATIRASI':'HATIRAN ALBÜMÜNDE'}</small><b>{state.album.title}</b><em>{state.pieces}/6 parça · Kalıcı koleksiyonun</em></span></div>{rewards.length>0&&<ul>{rewards.map(r=><li key={r.id}><span className={'reward-symbol reward-'+r.kind}>{r.kind==='piece'?<Gift size={18}/>:r.kind==='world'?<Compass size={18}/>:r.kind==='album'?<BookOpen size={18}/>:<Sparkles size={18}/>}</span><span><b>{r.title}</b><small>{r.description}</small></span><Check size={15}/></li>)}</ul>}{!rewards.length&&<p>Bu parçayı daha önce keşfettin. En iyi sonucun ve hatıran korunuyor.</p>}</div>;
}

export function DiscoveryAlbums({progress,onMap}:{progress:Progress;onMap:()=>void}){
 const states=discoveryState(progress),[selectedId,setSelectedId]=useState<string|null>(null),selected=states.find(s=>s.expedition.id===selectedId);
 return <><div className="discovery-album-grid">{states.map(s=><button className={'discovery-album-card'+(s.complete?' complete':'')} key={s.expedition.id} onClick={()=>setSelectedId(s.expedition.id)}><CollectionScene state={s}/><div><span className="eyebrow">{s.complete?'ALTI PARÇA, BİR GÜZEL HATIRA':s.done===5?'ROTA HATIRAN SENİN · BONUS PARÇA HAZIR':'BÖLÜM BÖLÜM TAMAMLANAN BİR SAHNE'}</span><h3>{s.album.title}</h3><p>{s.album.description}</p><span className="album-piece-dots" aria-label={`${s.pieces}/6 parça`}>{s.earned.map((earned,i)=><i className={earned?'earned':''} key={i}>{earned?<Check size={12}/>:i+1}</i>)}</span><small>{s.pieces}/6 parça <span>Parçaları gör <ArrowRight size={14}/></span></small></div></button>)}</div>{selected&&<Modal title={selected.album.title} onClose={()=>setSelectedId(null)}><CollectionScene state={selected}/><p className="collection-dialog-intro">{selected.pieces}/6 parça tamamlandı. Her hatıranın nasıl açılacağı belli; kazandıkların kalıcı.</p><ol className="collection-piece-list">{[...selected.chapters,selected.bonus].map((j,i)=><li className={selected.earned[i]?'earned':''} key={j.id}><span>{selected.earned[i]?<Check size={16}/>:i+1}</span><div><b>{selected.expedition.pieces[i]}</b><small>{selected.earned[i]?'Koleksiyonunda':j.title+' bölümünü tamamla.'}</small></div>{i===5&&<Sparkles size={17}/>}</li>)}</ol><button className="button primary full" onClick={()=>{setSelectedId(null);onMap();}}>Keşif haritasını aç<ArrowRight size={17}/></button></Modal>}</>;
}
