'use client';
import {useState,type CSSProperties} from 'react';
import {ArrowRight,BookOpen,Check,Compass,Gift,LockKeyhole,MapPin,Sparkles,Star} from 'lucide-react';
import type {Journey} from '@/lib/game/content';
import {discoveryState,recommendedExpedition,type ExpeditionState,type DiscoveryReward} from '@/lib/game/discovery';
import type {Progress} from '@/lib/game/progress';
import {WorldArt} from './WorldArt';
import {Modal} from './common';

function Atlas({states}:{states:ExpeditionState[]}){
 return <svg className="discovery-atlas" viewBox="0 0 760 228" fill="none" aria-hidden="true">
  <path d="M0 0h760v228H0z" fill="#e8eddd"/>
  <path d="M0 178c102-45 148 26 247-12s172 21 269-21 171-13 244 8v75H0" fill="#dce4cf"/>
  <path d="M111 131c90 115 120-127 265-28s144-14 257 23" stroke="#f9f6e9" strokeWidth="17" strokeLinecap="round"/>
  <path d="M111 131c90 115 120-127 265-28s144-14 257 23" stroke="#92aa8d" strokeWidth="2.5" strokeDasharray="3 9" strokeLinecap="round"/>
  <g transform="translate(61 42)"><ellipse cx="58" cy="135" rx="75" ry="14" fill="#bbcbb2"/><path d="m13 123 19-62h47l21 62z" fill="#f3ead5"/><path d="M27 66c-1-49 59-49 59 0z" fill="#8e9bb9"/><path d="M35 65c0-35 10-46 21-46M65 23c10 12 14 25 14 42" stroke="#c3cedd" strokeWidth="3"/><path d="M24 66h64" stroke="#657793" strokeWidth="6" strokeLinecap="round"/><path d="M47 123V93c0-17 25-17 25 0v30" fill="#d2b16f"/><circle cx="28" cy="87" r="4" fill="#a6b7b9"/><circle cx="87" cy="91" r="4" fill="#a6b7b9"/><path d="m112 20 3 8 9 1-7 5 2 9-7-5-7 5 2-9-7-5 9-1z" fill="#d7b466"/><path d="M1 23v10m-5-5h10M98 55v8m-4-4h8" stroke="#a1b3b6" strokeWidth="2"/></g>
  <g transform="translate(310 36)"><ellipse cx="64" cy="141" rx="79" ry="14" fill="#bbcbb2"/><path d="m0 140 25-80 14-39 17 44 21 75z" fill="#d8bd95"/><path d="m20 67 19-51 20 51-20-9z" fill="#b59a78"/><path d="m57 141 17-50 13-29 15 33 16 46z" fill="#ead4b1"/><path d="m71 94 16-38 18 38-17-7z" fill="#bba27c"/><path d="M35 101v15m51-5v13" stroke="#ad9273" strokeWidth="7" strokeLinecap="round"/><g transform="translate(100 10)"><path d="M0 15c0-21 32-21 32 0 0 12-16 29-16 29S0 27 0 15" fill="#b98268"/><path d="M16 0c-9 13-9 28 0 44 9-17 9-31 0-44" fill="#f3daa8"/><path d="m11 45 1 7h8l1-7" fill="#8e7258"/></g></g>
  <g transform="translate(566 54)"><ellipse cx="65" cy="122" rx="83" ry="14" fill="#bbcbb2"/><path d="M10 54h105v66H10z" fill="#e6d7b9"/><path d="m0 54 62-35 65 35z" fill="#8f9e7e"/><path d="M50 120V83c0-15 24-15 24 0v37" fill="#b59469"/><path d="M24 69h16v22H24zm62 0h16v22H86z" fill="#91aba0"/><path d="M62 24V2m0 0 27 8-27 6" stroke="#8d9b7b" strokeWidth="3" strokeLinejoin="round"/><path d="M-8 118V75m-1 14c-27-24-11-42 0-29 17-17 29 10 0 29" fill="#87a282" stroke="#87a282" strokeWidth="3"/><path d="m109 118 20-4 16 4-17 5z" fill="#b99c72"/></g>
  {states.map((s,i)=><g key={s.expedition.id} transform={`translate(${122+i*252} 197)`}><circle r="12" fill={s.complete?'#315e46':s.unlocked?'#fbf5dc':'#d1d8c7'} stroke={s.unlocked?'#6e9175':'#aebba7'} strokeWidth="1.5"/>{s.complete?<path d="m-4 0 3 3 6-7" stroke="#f9f5e7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>:<text textAnchor="middle" y="4" fill="#4a6854" fontSize="11" fontFamily="Arial,sans-serif" fontWeight="700">{i+1}</text>}</g>)}
  <path d="M215 40h25m-12-12v25M482 51h13m-7-7v14" stroke="#bfcbb2" strokeWidth="2" strokeLinecap="round"/><circle cx="472" cy="186" r="3" fill="#b0bea4"/><circle cx="245" cy="163" r="3" fill="#d4b971"/>
 </svg>;
}

export function CollectionScene({state,compact=false}:{state:ExpeditionState;compact?:boolean}){
 return <div className={'collection-scene'+(compact?' compact':'')+(state.complete?' assembled':'')} role="img" aria-label={`${state.album.title}, ${state.pieces}/6 parça tamamlandı`}>
  <WorldArt themeId={state.expedition.id}/>
  <div className="collection-mosaic">{state.earned.map((earned,i)=><span className={earned?'revealed':'covered'} key={state.expedition.pieces[i]}>{earned?<i><Check size={12}/></i>:<b>{i+1}</b>}</span>)}</div>
  {state.done===state.chapters.length&&!state.complete&&<span className="collection-route-seal"><Check size={12}/>Rota hatıran senin</span>}
  {state.complete&&<span className="collection-ribbon"><Check size={13}/>Hatıra tamamlandı</span>}
 </div>;
}

export function DiscoveryMap({progress,onPlay}:{progress:Progress;onPlay:(journey:Journey,practice:boolean)=>void}){
 const states=discoveryState(progress),recommended=recommendedExpedition(progress),[selectedId,setSelectedId]=useState('');
 const selected=states.find(s=>s.expedition.id===selectedId)??recommended;
 const chapterTotal=states.reduce((n,s)=>n+s.done,0),pieceTotal=states.reduce((n,s)=>n+s.pieces,0),selectedIndex=states.indexOf(selected),following=states[selectedIndex+1];
 return <section className="discovery-map" id="kesif-haritasi" aria-labelledby="discovery-map-title">
  <div className="discovery-map-heading"><div><span className="eyebrow">BİRİKEN KEŞİFLER, AÇILAN DÜNYALAR</span><h2 id="discovery-map-title">Senin keşif haritan.</h2><p>Bir durak seç. Kelimeleri bul. Hatıranı tamamla.</p></div><span className="map-tally"><Compass size={18}/><b>{chapterTotal}<small>/15 durak</small></b><i/><BookOpen size={18}/><b>{pieceTotal}<small>/18 parça</small></b></span></div>
  <div className="atlas-paper"><Atlas states={states}/><span className="atlas-caption">KÜÇÜK MOLALARIN BÜYÜK HARİTASI</span></div>
  <div className="expedition-choices" aria-label="Haritadaki dünyalar">{states.map(s=><button key={s.expedition.id} aria-pressed={s===selected} aria-controls="expedition-detail" className={'expedition-choice'+(s===selected?' selected':'')+(!s.unlocked?' waiting':'')} onClick={()=>setSelectedId(s.expedition.id)} style={{'--expedition-accent':s.expedition.accent} as CSSProperties}><span className="expedition-marker">{s.complete?<Check size={18}/>:s.unlocked?s.expedition.place:<LockKeyhole size={16}/>}</span><span><b>{s.expedition.title}</b><small>{s.complete?'Hatıran tamamlandı':s.unlocked?`${s.done}/5 durak keşfedildi`:`${s.previousTitle}: ${s.remaining} bölüm daha`}</small></span><ArrowRight size={17}/></button>)}</div>
  <div className="expedition-detail" id="expedition-detail" aria-label={selected.expedition.title}>
   <div className="expedition-story"><span className="eyebrow"><MapPin size={13}/>{selected.expedition.place} NUMARALI DURAK</span><h3>{selected.expedition.title}</h3><p>{selected.expedition.subtitle}</p><CollectionScene state={selected}/><div className="expedition-album-heading"><BookOpen size={17}/><b>{selected.album.title}</b><span>{selected.pieces}/6</span></div><div className="tiny-track"><i style={{width:`${selected.pieces/6*100}%`}}/></div><p className="collection-permanence">Her bölüm bir parça. Hatıraların hep senin.</p>
    {selected.nextPiece&&<div className="next-discovery-reward"><Gift size={20}/><span><small>BİR SONRAKİ HATIRAN</small><b>{selected.nextPiece}</b><em>{selected.next!.title} bölümünü tamamla.</em></span></div>}
    {!selected.unlocked&&<div className="expedition-unlock-note"><LockKeyhole size={18}/><span><b>Açılış koşulu belli.</b><small>{selected.previousTitle} rotasında {selected.remaining} bölüm daha tamamla. İpucu kullanabilirsin.</small></span></div>}
    {selected.next&&<button className="button primary full" onClick={()=>onPlay(selected.next!,false)}>{selected.done?'Yolculuğuna devam et':'İlk durağa başla'}<ArrowRight size={17}/></button>}
    {selected.complete&&<div className="expedition-complete-note"><Sparkles size={20}/><span>Altı parçanın hepsi yerli yerinde.<br/>İstediğin bölüme yeniden uğrayabilirsin.</span></div>}
   </div>
   <div className="expedition-chapters"><div className="expedition-chapter-heading"><b>Beş durak, altı hatıra.</b><small>Üç bölüm bir sonraki dünyayı, beş bölüm bonusu açar.</small></div><ol>{selected.chapters.map((j,i)=>{const save=progress.saves['route:'+j.id],done=save?.complete;return <li key={j.id}><button className={'expedition-chapter'+(done?' done':'')+(selected.next?.id===j.id?' next':'')} disabled={!selected.unlocked} onClick={()=>onPlay(j,!!done)}><span className="chapter-node">{done?<Check size={18}/>:i+1}</span><span className="chapter-copy"><b>{j.title}</b><small>{j.words.length} kelime · {j.difficulty}</small><em><Gift size={12}/>{selected.expedition.pieces[i]}</em></span><span className="chapter-status">{done?<><span className="chapter-stars" aria-label={`${save.stars} yıldız`}>{[0,1,2].map(n=><Star size={11} fill={n<save.stars?'currentColor':'none'} key={n}/>)}</span><small>Tekrar oyna</small></>:selected.unlocked?<ArrowRight size={17}/>:<LockKeyhole size={16}/>}</span></button></li>;})}</ol>
    <button className={'expedition-bonus'+(selected.earned[5]?' done':'')} disabled={!selected.bonusUnlocked} onClick={()=>onPlay(selected.bonus,selected.earned[5]!)}><span className="bonus-emblem">{selected.earned[5]?<Check size={23}/>:selected.bonusUnlocked?<Sparkles size={23}/>:<LockKeyhole size={21}/>}</span><span><small>ALTINCI PARÇA · BONUS BÖLÜM</small><b>{selected.bonus.title}</b><em>{selected.earned[5]?'Hatıra tamamlandı. Yeniden oynayabilirsin.':selected.bonusUnlocked?'Beş durak tamam. Son parça seni bekliyor.':`Açmak için beş durağı tamamla: ${selected.done}/5`}</em></span>{selected.bonusUnlocked&&<ArrowRight size={18}/>}</button>
    {following&&<p className="map-next-world"><Compass size={17}/><span>{following.unlocked?<>Sonraki durak açık: <b>{following.expedition.title}</b></>:<><b>{Math.max(0,3-selected.done)} bölüm sonra</b> {following.expedition.title} açılacak.</>}</span></p>}
    <p className="map-freedom">Bütün temalara aşağıdan serbestçe ulaşabilirsin. Harita ek bir keşif yolu.</p>
   </div>
  </div>
 </section>;
}

export function DiscoveryResult({progress,themeId,rewards}:{progress:Progress;themeId:string;rewards:DiscoveryReward[]}){
 const state=discoveryState(progress).find(s=>s.expedition.id===themeId);if(!state)return null;
 return <div className="discovery-result" aria-label="Keşfinin hatıraları"><div className="discovery-result-top"><CollectionScene state={state} compact/><span><small>{state.complete?'HATIRA TAMAMLANDI':rewards.length?'KEŞFİNİN HATIRASI':'HATIRAN ALBÜMÜNDE'}</small><b>{state.album.title}</b><em>{state.pieces}/6 parça · Kalıcı koleksiyonun</em></span></div>{rewards.length>0&&<ul>{rewards.map(r=><li key={r.id}><span className={'reward-symbol reward-'+r.kind}>{r.kind==='piece'?<Gift size={18}/>:r.kind==='world'?<Compass size={18}/>:r.kind==='album'?<BookOpen size={18}/>:<Sparkles size={18}/>}</span><span><b>{r.title}</b><small>{r.description}</small></span><Check size={15}/></li>)}</ul>}{!rewards.length&&<p>Bu parçayı daha önce keşfettin. En iyi sonucun ve hatıran korunuyor.</p>}</div>;
}

export function DiscoveryAlbums({progress,onMap}:{progress:Progress;onMap:()=>void}){
 const states=discoveryState(progress),[selectedId,setSelectedId]=useState<string|null>(null),selected=states.find(s=>s.expedition.id===selectedId);
 return <><div className="discovery-album-grid">{states.map(s=><button className={'discovery-album-card'+(s.complete?' complete':'')} key={s.expedition.id} onClick={()=>setSelectedId(s.expedition.id)}><CollectionScene state={s}/><div><span className="eyebrow">{s.complete?'ALTI PARÇA, BİR GÜZEL HATIRA':s.done===5?'ROTA HATIRAN SENİN · BONUS PARÇA HAZIR':'BÖLÜM BÖLÜM TAMAMLANAN BİR SAHNE'}</span><h3>{s.album.title}</h3><p>{s.album.description}</p><span className="album-piece-dots" aria-label={`${s.pieces}/6 parça`}>{s.earned.map((earned,i)=><i className={earned?'earned':''} key={i}>{earned?<Check size={12}/>:i+1}</i>)}</span><small>{s.pieces}/6 parça <span>Parçaları gör <ArrowRight size={14}/></span></small></div></button>)}</div>{selected&&<Modal title={selected.album.title} onClose={()=>setSelectedId(null)}><CollectionScene state={selected}/><p className="collection-dialog-intro">{selected.pieces}/6 parça tamamlandı. Her hatıranın nasıl açılacağı belli; kazandıkların kalıcı.</p><ol className="collection-piece-list">{[...selected.chapters,selected.bonus].map((j,i)=><li className={selected.earned[i]?'earned':''} key={j.id}><span>{selected.earned[i]?<Check size={16}/>:i+1}</span><div><b>{selected.expedition.pieces[i]}</b><small>{selected.earned[i]?'Koleksiyonunda':j.title+' bölümünü tamamla.'}</small></div>{i===5&&<Sparkles size={17}/>}</li>)}</ol><button className="button primary full" onClick={()=>{setSelectedId(null);onMap();}}>Keşif haritasını aç<ArrowRight size={17}/></button></Modal>}</>;
}
