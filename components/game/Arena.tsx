'use client';
import {PlayerSafety} from './PlayerSafety';
import {inviteLink,shareMessage,shareSucceeded} from '@/lib/platform/sharing';
import {useResultPresentation} from './useResultPresentation';
import {startArenaClock} from '@/lib/game/arena-clock';
import {gameIsActive} from '@/lib/platform/runtime';
import {useEffect,useRef,useState} from 'react';
import {ArrowRight,Check,Clock,Copy,Link2,LoaderCircle,Radio,RefreshCw,Share2,ShieldCheck,Star,Swords,Trophy,Users,Volume2,VolumeX,WifiOff,ZoomIn} from 'lucide-react';
import {findTheme} from '@/lib/game/catalog';
import {goldenId,match,timeLabel,type Cell,type Stroke} from '@/lib/game/engine';
import type {Progress} from '@/lib/game/progress';
import type {ArenaParticipant,ArenaSeries,RoomView} from '@/lib/game/server';
import {track} from '@/lib/game/telemetry';
import {api,getApi,Modal,PlayLayout,MatchTools,shareLink,useChime} from './common';
import {SceneArt,GameScene} from './SceneArt';
import {CompetitionHud} from './CompetitionHud';
import {useLiveRoom} from './useLiveRoom';

const CompassIcon=()=> <Radio size={19}/>;
const roundLabel=(kind?:string)=>kind==='clue'?'Bilmeceli tur':'Normal kelime turu';

export function Arena({authenticated,ownerId,onLogin,progress,onProgress,practice,onPlaying,onChallenge,onFriends}:{authenticated:boolean;ownerId?:string;onLogin:()=>void;progress:Progress;onProgress:(p:Progress)=>void;practice:()=>void;onPlaying?:(playing:boolean)=>void;onChallenge?:()=>void;onFriends?:()=>void}){
 const [room,setRoom]=useState<RoomView|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[code,setCode]=useState(''),[now,setNow]=useState(Date.now()),[preview,setPreview]=useState(''),[leaving,setLeaving]=useState(false),[share,setShare]=useState(''),[rules,setRules]=useState(false),[joinedAt,setJoinedAt]=useState(Date.now()),[pending,setPending]=useState<Stroke|null>(null),[review,setReview]=useState(false),[ranking,setRanking]=useState(false),[previousResult,setPreviousResult]=useState(false),[seriesOpen,setSeriesOpen]=useState(false);
 const result=useResultPresentation(room?.phase==='finished',room?room.id+':'+room.round:'none');
 const preferenceKey='kt-arena-riddles-v1:'+(ownerId??'device');
 const [riddles,setRiddles]=useState(false);
 useEffect(()=>{try{setRiddles(localStorage.getItem(preferenceKey)==='on');}catch{setRiddles(false);}},[preferenceKey]);
 const toggleRiddles=()=>{const next=!riddles;setRiddles(next);try{localStorage.setItem(preferenceKey,next?'on':'off');}catch{}};
 const roundPreference=<button type="button" className="arena-round-preference" role="switch" aria-checked={riddles} disabled={busy} onClick={toggleRiddles}><span><b>Araya bilmece ekle</b><small>{riddles?'İlk maç kelimeler, sonraki bilmece.':'Kelimeleri gör, tahtada bul.'}</small></span><i className={'switch'+(riddles?' on':'')} aria-hidden="true"/></button>;
 const [hubPanel,setHubPanel]=useState<'friend'|'rules'|'rankings'|null>(null);
 useEffect(()=>{if(room)setHubPanel(null);},[room?.id]);
 const actionLock=useRef(false),epoch=useRef(0);
 useEffect(()=>{window.scrollTo({top:0});},[room?.id]);
 const offset=useRef(0),mounted=useRef(true),chime=useChime(progress.sound,progress.haptics),tracked=useRef('');
 const currentRoom=useRef(room);currentRoom.current=room;
 const soundRound=useRef<{key:string;phase:string}|null>(null);
 const soundKey=room?room.id+':'+room.round:'',soundPhase=room?.phase==='active'?(room.starts!==null&&now>=room.starts?'playing':'countdown'):room?.phase??'none';
 useEffect(()=>{const previous=soundRound.current;soundRound.current={key:soundKey,phase:soundPhase};if(!previous||previous.key!==soundKey)return;if(previous.phase==='countdown'&&soundPhase==='playing')chime('start');if(previous.phase!=='finished'&&soundPhase==='finished')chime(room?.winner===room?.you.id?'complete':'finish');},[soundKey,soundPhase]);
 const context=()=>({epoch:epoch.current,id:currentRoom.current?.id??null,round:currentRoom.current?.round??null});
 const isCurrent=(stamp:ReturnType<typeof context>)=>mounted.current&&stamp.epoch===epoch.current&&stamp.id===(currentRoom.current?.id??null)&&stamp.round===(currentRoom.current?.round??null);
 const accept=(next:RoomView|null,allowSwitch=false)=>{
  const old=currentRoom.current;
  if(!mounted.current||next&&ownerId&&next.you.id!==ownerId)return;
  if(!allowSwitch&&(!old||!next||old.id!==next.id))return;
  if(old&&next&&old.id===next.id&&(next.revision<old.revision||(next.revision===old.revision&&next.serverNow<old.serverNow)))return;
  if(next&&old?.id===next.id&&old.round===next.round&&old.phase==='active'&&next.phase==='finished'&&!result.wasPrepared()&&!ranking&&!rules&&!leaving)result.prepare(next.you.strokes.length>old.you.strokes.length);
  if(next){offset.current=next.serverNow-Date.now();setNow(next.serverNow);}if(next&&(next.phase==='active'||next.phase==='finished')){setSeriesOpen(false);setPreviousResult(false);}currentRoom.current=next;setRoom(next);
 };
 const recover=async()=>{const stamp=context();try{const next=await arenaRequest(signal=>getApi<RoomView|null>('?action=room',signal));if(isCurrent(stamp)){accept(next,true);setError('');}}catch(e){if(isCurrent(stamp))setError((e as Error).message);}};
 useEffect(()=>{const blocked=()=>{epoch.current++;accept(null,true);setRanking(false);setPreviousResult(false);setPending(null);const url=new URL(location.href);url.searchParams.delete('oda');history.replaceState(null,'',url.pathname+url.search);};window.addEventListener('kt-player-blocked',blocked);return()=>window.removeEventListener('kt-player-blocked',blocked);},[]);
 const connection=useLiveRoom(room?.id,(next,sourceId)=>{const old=currentRoom.current;if(!old||sourceId!==old.id)return;const paired=old.kind==='quick'&&old.phase==='waiting'&&next.kind==='quick'&&next.you.id===old.you.id;accept(next,paired);},time=>{offset.current=time-Date.now();});
 useEffect(()=>{
  mounted.current=true;const params=new URLSearchParams(location.search);setCode((params.get('oda')??'').toUpperCase().slice(0,8));if(params.has('oda'))setHubPanel('friend');
  if(authenticated){const stamp=context(),controller=new AbortController();getApi<RoomView|null>('?action=room',controller.signal).then(async current=>{
   if(!isCurrent(stamp))return;if(current){accept(current,true);return;}
   const invited=params.get('oda')?.toUpperCase()??'';
   if(/^[A-HJ-NP-Z2-9]{8}$/.test(invited)){setBusy(true);try{const next=await api<RoomView>('enter',{kind:'friend',code:invited,...(ownerId?{expectedOwnerId:ownerId}:{})},controller.signal);if(isCurrent(stamp)){accept(next,true);setJoinedAt(Date.now());}}finally{if(mounted.current)setBusy(false);}}
  }).catch(e=>{if(isCurrent(stamp)&&e.name!=='AbortError')setError(e.message);});return ()=>{mounted.current=false;controller.abort();};}
  return ()=>{mounted.current=false;};
 },[authenticated,ownerId]);
 useEffect(()=>{onPlaying?.(!!room);return ()=>onPlaying?.(false);},[room?.id]);
 const clockStart=room?.phase==='active'?room.starts:null;
 const waitingUntil=room?.kind==='quick'&&room.phase==='waiting'?joinedAt+15000:undefined;
 useEffect(()=>{
  let pageActive=true;
  const clock=startArenaClock({localNow:Date.now,serverNow:()=>Date.now()+offset.current,visible:()=>pageActive&&!document.hidden&&gameIsActive(),publish:setNow,schedule:(fn,ms)=>setTimeout(fn,ms),cancel:id=>clearTimeout(id as ReturnType<typeof setTimeout>)},{starts:clockStart,waitingUntil});
  document.addEventListener('visibilitychange',clock.refresh);
  const hide=()=>{pageActive=false;clock.refresh();},show=()=>{pageActive=true;clock.refresh();};
  window.addEventListener('pagehide',hide);window.addEventListener('pageshow',show);
  return ()=>{clock.stop();document.removeEventListener('visibilitychange',clock.refresh);window.removeEventListener('pagehide',hide);window.removeEventListener('pageshow',show);};
 },[clockStart,waitingUntil]);
 useEffect(()=>{if(room?.phase==='active'&&tracked.current!==room.id+':'+room.round){tracked.current=room.id+':'+room.round;track('arena_start');setReview(false);}if(room?.phase==='finished')track('arena_complete');},[room?.phase,room?.round]);
 useEffect(()=>{setPending(null);setPreview('');setReview(false);setRanking(false);setPreviousResult(false);setSeriesOpen(false);},[room?.id,room?.round]);
 const run=async(action:string,data:Record<string,unknown>={})=>{
  if(actionLock.current)return;actionLock.current=true;epoch.current++;const stamp=context();setBusy(true);setError('');
  try{const next=await arenaRequest(signal=>api<RoomView>(action,{...data,...(room?{round:room.round,expectedOwnerId:room.you.id}:ownerId?{expectedOwnerId:ownerId}:{})},signal));if(isCurrent(stamp)){accept(next,action==='enter');if(action==='enter')setJoinedAt(Date.now());if(action==='ready'&&next.you.ready&&!room?.you.ready&&next.id===room?.id&&next.round===room?.round&&currentRoom.current?.revision===next.revision)chime('ready');}}
  catch(e){if(isCurrent(stamp))setError((e as Error).message);}finally{actionLock.current=false;if(mounted.current)setBusy(false);}
 };
 const leave=async(waitingOnly=false)=>{
  if(!room)return true;if(actionLock.current)return false;actionLock.current=true;epoch.current++;const stamp=context();setBusy(true);setError('');
  try{await arenaRequest(signal=>api('leave',{id:room.id,round:room.round,expectedOwnerId:room.you.id,...(waitingOnly?{waitingOnly:true}:{})},signal));if(!isCurrent(stamp))return false;epoch.current++;accept(null,true);setLeaving(false);setPreview('');setPending(null);const url=new URL(location.href);url.searchParams.delete('oda');history.replaceState(null,'',url.pathname+url.search);return true;}
  catch(e){if(isCurrent(stamp))setError((e as Error).message);return false;}finally{actionLock.current=false;if(mounted.current)setBusy(false);}
 };
 const waitingChallenge=async()=>{
  const current=currentRoom.current;
  if(!onChallenge||!current||current.id!==room?.id||current.round!==room?.round||current.kind!=='quick'||current.phase!=='waiting'||current.players?.some(p=>p.id!==current.you.id&&!p.left))return;
  if(await leave(true))onChallenge();
 };
 const copy=async()=>{if(!room)return;const stamp=context();setShare('');const result=await shareLink('Kelime Teneffüsü’nde birlikte yarışalım mı?',inviteLink('oda',room.code));if(!isCurrent(stamp)||result==='busy')return;setShare(shareMessage(result));if(shareSucceeded(result))track('invite_share');};
 const commit=async(a:Cell,b:Cell)=>{
  const claimNow=Date.now()+offset.current;
  if(!room?.board||actionLock.current||!gameIsActive()||document.hidden||room.phase!=='active'||room.starts===null||claimNow<room.starts||room.ends===null||claimNow>=room.ends)return;
  const target=match(room.board,a,b);if(!target){chime('miss');setPreview('Bir başka yönden bak.');track('selection_miss');return;}
  if(room.you.strokes.some(s=>s.id===target.id)){setPreview('Bu kelimeyi bulmuştun.');return;}
  if(room.you.strokes.length+1===room.board.targets.length)result.prepare();
  actionLock.current=true;const stamp=context();setBusy(true);setPending({id:target.id,a,b});setError('');chime();
  try{const next=await arenaRequest(signal=>api<RoomView>('claim',{id:room.id,round:room.round,expectedOwnerId:room.you.id,a,b},signal));if(!isCurrent(stamp))return;accept(next);if(currentRoom.current?.you.strokes.some(s=>s.id===target.id))setPreview('Bir kelime daha!');}catch(e){if(isCurrent(stamp)){result.skip();setError((e as Error).message);}}finally{actionLock.current=false;if(mounted.current){setBusy(false);setPending(null);}}
 };
 if(!room)return <section className="arena-stage" aria-labelledby="arena-title">
  <div className="arena-stage-art" aria-hidden="true"><SceneArt scene="stadium" eager/><div/></div>
  <div className="arena-stage-heading"><span>AYNI TAHTA · AYNI ANDA</span><h1 id="arena-title">Arena</h1><p>120 saniye. Her maç yeni kelimeler.</p></div>
  <div className="arena-stage-emblem" aria-hidden="true"><Swords size={64}/><i/><i/></div>
  <div className="arena-stage-dock">{roundPreference}
   <button className="stage-play" disabled={busy} onClick={authenticated?()=>void run('enter',{kind:'quick',mode:'group',roundPolicy:riddles?'mixed':'words'}):onLogin}>{busy?<LoaderCircle className="spin" size={22}/>:<Swords size={22}/>}<span>Hızlı eşleş<small>Açık grup · 2 veya daha fazla oyuncu</small></span><ArrowRight size={21}/></button>
   <button className="arena-friend-action" disabled={busy} onClick={()=>setHubPanel('friend')}><Users size={23}/><span>Arkadaşlarınla oyna<small>Oda oluştur veya kodla katıl</small></span><ArrowRight size={20}/></button>
   {error&&<p className="error-box" role="alert">{error}</p>}
   <div className="arena-secondary-actions"><button disabled={busy} onClick={authenticated?()=>void run('enter',{kind:'quick'}):onLogin}><ShieldCheck size={17}/>Dereceli düello</button><button onClick={()=>setHubPanel('rankings')}><Trophy size={17}/>Sıralama</button><button onClick={()=>setHubPanel('rules')}><Clock size={17}/>Kurallar</button></div>
   <div className="arena-social-actions">{onChallenge&&<button onClick={onChallenge}><CompassIcon/><span>Meydan okuma<small>Farklı saatlerde aynı bulmaca</small></span><ArrowRight size={16}/></button>}{onFriends&&<button onClick={onFriends}><Users size={19}/><span>Arkadaşlarım</span><ArrowRight size={16}/></button>}</div>
  </div>
  {hubPanel==='friend'&&<Modal className="game-tools-modal game-library-sheet arena-entry-sheet" title="Arkadaşlarınla oyna" onClose={()=>setHubPanel(null)}><div className="room-entry-sheet"><p>Odanı oluştur, davet bağlantısını arkadaşlarınla paylaş.</p>{roundPreference}<button className="button primary full" disabled={busy} onClick={authenticated?()=>void run('enter',{kind:'friend',mode:'group',roundPolicy:riddles?'mixed':'words'}):()=>{setHubPanel(null);onLogin();}}><Link2 size={19}/>{busy?'Oda hazırlanıyor…':'Özel oda oluştur'}</button><div className="or-line"><span>veya oda koduyla katıl</span></div><form onSubmit={e=>{e.preventDefault();if(!authenticated){setHubPanel(null);onLogin();return;}void run('enter',{kind:'friend',code});}}><label htmlFor="room-code">Oda kodu</label><div className="input-action"><input id="room-code" placeholder="8 karakter" maxLength={8} autoCapitalize="characters" autoComplete="off" value={code} onChange={e=>setCode(e.target.value.toUpperCase().replace(/[^A-HJ-NP-Z2-9]/g,''))}/><button className="icon-button" type="submit" aria-label="Odaya katıl" disabled={code.length!==8||busy}><ArrowRight/></button></div></form><p className="muted">Herkes hazır olduğunda oda sahibi başlatır. Özel maçlar derece puanını değiştirmez.</p>{error&&<p className="error-box" role="alert">{error}</p>}</div></Modal>}
  {hubPanel==='rankings'&&<Modal scene="stadium" className="arena-scoreboard" title="Derece sıralaması" onClose={()=>setHubPanel(null)} footer={<button className="button primary full" onClick={()=>setHubPanel(null)}>Arena’ya dön</button>}><p className="arena-result-next">Dereceli düelloların genel sıralaması. Oda maçlarının puanları bu listeyi değiştirmez.</p><Rankings/></Modal>}
  {hubPanel==='rules'&&<Modal className="game-tools-modal game-library-sheet" title="Arena kuralları" onClose={()=>setHubPanel(null)}><p>Herkes aynı bulmacaya aynı anda başlar. 120 saniyede kelimeleri bul.</p><p>İşaretli Altın Kelime, açık olduğu sırada iki kat puan verir. İpucu ve satın alınan avantaj yok.</p><p>Hızlı grup ve özel oda maçları dereceyi değiştirmez. Dereceli düello iki kişiyle oynanır.</p><button className="button primary full" onClick={()=>setHubPanel(null)}>Anladım</button></Modal>}
 </section>;
 const people=room.players??[{...room.you,count:room.you.strokes.length,online:true,left:false,rank:1},...(room.opponent?[{...room.opponent,id:'opponent',left:false,rank:2}]:[])];
 const group=room.mode==='group',members=people.filter(p=>!p.left),host=room.hostId===room.you.id,allReady=members.length>=2&&members.every(p=>p.ready);
 if(room.phase==='waiting'||room.phase==='ready'||room.phase==='cancelled')return <><GameScene scene="stadium"/><section className="arena-room-lobby">
  <header className="arena-room-heading"><button className="icon-button" aria-label="Odadan ayrıl" disabled={busy} onClick={()=>void leave()}><ArrowRight style={{transform:'rotate(180deg)'}}/></button><div><small>{group?'Birlikte Arena':'Dereceli düello'} · Maç {room.round}</small><h1>{room.phase==='cancelled'?'Oda kapandı':room.phase==='waiting'?'Rakip aranıyor':'Maça hazırlanalım'}</h1></div></header>
  {group&&<p className="room-round-policy">{room.roundPolicy==='words'?'Kelimeleri gör, tahtada bul':'Aralarda bilmece turları'}</p>}<div className="arena-room-summary"><Swords size={25}/><div><b>{group?roundLabel(room.roundKind):'Kelime düellosu'}</b><p>{group&&room.roundKind==='clue'?'Tanımı çöz, cevabı tahtada bul.':'Kelimeleri bul, en yüksek puanı topla.'} 120 saniye.</p></div></div>
  <div className="arena-room-content"><h2>{members.length} oyuncu <span>{members.filter(p=>p.ready).length} hazır</span></h2><ArenaRoster people={members} you={room.you.id} lobby/>
  {room.kind==='friend'&&<div className="arena-room-invite"><span><small>Oda kodu</small><b>{room.code}</b></span><button className="button secondary" disabled={busy} onClick={()=>void copy()}><Share2 size={18}/>Arkadaşlarını davet et</button>{share&&<p role="status">{share}</p>}</div>}
  <p className="arena-next-round">Sonraki maç: {roundLabel(room.nextRoundKind)}</p><div className="arena-room-links">{room.series&&room.series.rounds>0&&<button className="text-button" onClick={()=>setSeriesOpen(true)}><Trophy size={17}/>Oda galibiyetleri</button>}{room.lastResult&&<button className="text-button" onClick={()=>setPreviousResult(true)}>Önceki maç sonucu</button>}</div>
  </div>
  <footer className="arena-room-actions">
  {room.roundUnavailable&&<p className="error-box" role="status">{room.roundUnavailable}</p>}
  {onChallenge&&room.kind==='quick'&&room.phase==='waiting'&&members.length===1&&now-offset.current-joinedAt>=15000&&<div className="arena-wait-alternative"><p>Beklemek istemezsen aynı bulmacada farklı saatlerde yarışabilirsin.</p><button className="button secondary full" disabled={busy} onClick={()=>void waitingChallenge()}>Meydan okumaya geç <ArrowRight size={18}/></button></div>}
  {room.phase==='cancelled'?<p>{room.reason}</p>:room.phase==='waiting'?<p role="status"><LoaderCircle className="spin" size={16}/>{room.kind==='friend'?'Davet ettiğin oyuncular bekleniyor.':'Bir oyuncu daha katılınca hazırlanabilirsiniz.'}</p>:<><p>{room.you.ready?(group&&!host?'Oda sahibinin başlatması bekleniyor.':group?'Herkes hazır olduğunda maçı başlat.':'Rakibin hazır olduğunda düello başlar.'):'Hazır olduğunda aşağıya dokun.'}</p><div className="arena-ready-buttons"><button className="button primary" disabled={room.you.ready||busy} onClick={()=>void run('ready',{id:room.id})}>{busy?<LoaderCircle className="spin" size={18}/>:<Check size={18}/>} {room.you.ready?'Hazırsın':'Hazırım'}</button>{group&&host&&<button className="button gold" disabled={!(room.canStart??allReady)||busy} onClick={()=>void run('start',{id:room.id})}>Maçı başlat <ArrowRight size={18}/></button>}</div></>}
  {connection==='reconnecting'&&<p role="status">Bağlantı yenileniyor…</p>}{error&&<div className="error-box" role="alert">{error}<button className="text-button" disabled={busy} onClick={()=>void recover()}>Odayı kontrol et</button></div>}
  <button className="text-button full" disabled={busy} onClick={()=>void leave()}>{room.phase==='cancelled'?'Arena’ya dön':'Odadan ayrıl'}</button>
  </footer>
  {seriesOpen&&room.series&&<Modal scene="stadium" className="arena-scoreboard" title="Oda galibiyetleri" onClose={()=>setSeriesOpen(false)} footer={<button className="button primary full" onClick={()=>setSeriesOpen(false)}>Lobiye dön</button>}><ArenaSeriesBoard series={room.series} you={room.you.id}/></Modal>}
  {previousResult&&room.lastResult&&<Modal scene="stadium" className="arena-result arena-scoreboard achievement-modal" title={`Maç ${room.lastResult.round} · Sonuç`} onClose={()=>setPreviousResult(false)} footer={<button className="button primary full" onClick={()=>setPreviousResult(false)}>Lobiye dön</button>}><p className="center muted">{room.lastResult.reason}</p><ArenaMatchStandings people={room.lastResult.players} you={room.you.id} historical/></Modal>}
 </section></>;
 const board=room.board;if(!board)return <p role="status">Tahta hazırlanıyor…</p>;
 const countdown=room.starts!==null?Math.max(0,Math.ceil((room.starts-now)/1000)):0,seconds=room.ends!==null?Math.min(120,Math.max(0,(room.ends-now)/1000)):0,finished=room.phase==='finished',golden=room.starts!==null&&!finished?goldenId(board.targets,room.starts,now):null;
 const strokes=!finished&&pending&&!room.you.strokes.some(s=>s.id===pending.id)?[...room.you.strokes,pending]:room.you.strokes;
 const wordList={board,strokes:room.you.strokes,golden,clues:room.clues};
 const openStandings=()=>{if(finished){result.skip();setRanking(false);setReview(false);}else setRanking(true);};
 const goldenTarget=board.targets.find(t=>t.id===golden),goldenLabel=room.clues&&goldenTarget&&!room.you.strokes.some(s=>s.id===golden)?'İşaretli tanım':goldenTarget?.label??'İşaretli kelime';
 return <><PlayLayout headerAction={<MatchTools finished={finished} review={review} zoom={progress.zoom} onZoom={()=>onProgress({...progress,zoom:!progress.zoom})} sound={progress.sound} onSound={()=>{chime(progress.sound?'mute':'enable');onProgress({...progress,sound:!progress.sound});}} onHelp={()=>setRules(true)}/>} departing={result.departing&&!review&&!ranking&&!leaving&&!rules} celebrating={finished&&result.ready&&!review&&!ranking&&!leaving&&!rules} feedbackPaused={leaving||rules||ranking} localFeedback={finished?null:pending} scene="stadium" onSelectLetter={depth=>chime('letter',depth)} wordList={wordList} wordListKey={room.id+':'+room.round} wordListUnavailable={finished||leaving||rules||ranking} inputBlocked={!!pending&&!finished} busy={!!pending} inputStatus="Kelimen doğrulanıyor. Süre devam ediyor." kicker={`Maç ${room.round} · ${group?roundLabel(room.roundKind):'Dereceli düello'}`} title={group?'Arena':findTheme(room.themeId).title} onBack={()=>setLeaving(true)} board={board} strokes={strokes} paused={!finished&&(countdown>0||seconds<=0)} readOnly={finished} reviewStatus={group?"Maç tamamlandı · Tahtanı inceleyebilirsin.":"Düello tamamlandı · Tahtanı inceleyebilirsin."} zoom={progress.zoom} onCommit={(a,b)=>void commit(a,b)} preview={preview} onPreview={setPreview} footer={<div className="duel-controls"><button className="text-button" onClick={openStandings}>{finished?<><Trophy size={16}/>{result.ready?'Maç sonucu':'Sonuca geç'}</>:<><Users size={16}/>{members.length} kişi · Sıralama</>}</button></div>} aside={<><div className={'golden-note'+(golden?' active':'')}><Star size={22}/><div><b>{golden?'Altın Kelime açık!':'Sıradaki fırsatı bekle.'}</b><small>{golden?`${goldenLabel} şimdi ×2 puan.`:'Her 40 saniyede 20 saniyelik çifte puan.'}</small></div></div>{finished&&result.ready&&<button className="button primary full" onClick={()=>{result.skip();setReview(false);}}>{group?'Maç sonucu':'Düello sonucu'} <Trophy size={18}/></button>}</>}>
  <CompetitionHud seconds={seconds} leftLabel={`Sen · ${room.you.strokes.length}/${board.targets.length}`} leftValue={`${room.you.score} puan`} rightLabel="Sıralaman" rightValue={`${people.find(p=>p.id===room.you.id)?.rank??1} / ${people.length}`} urgent={!finished&&seconds<20} onRank={openStandings}/><div className="competition-meta" role="status">{connection==='connected'?'':connection==='reconnecting'?'Bağlantı yenileniyor…':'Bağlanıyor…'}</div>{error&&<p className="error-box" role="alert">{error}<button className="text-button" onClick={()=>void recover()}>Kontrol et</button></p>}

 </PlayLayout>
 {countdown>0&&<div className="countdown-overlay"><small>Maç başlıyor</small><b key={countdown}>{countdown}</b><span>{group?roundLabel(room.roundKind)+' · ':''}Hazır ol!</span></div>}
 {finished&&result.ready&&!review&&!ranking&&!leaving&&!rules&&<Modal scene="stadium" className="arena-result arena-scoreboard achievement-modal celebration-outcome scene-result" title={room.winner===null?'Berabere':room.winner===room.you.id?'Kazandın!':'Maç tamamlandı'} onClose={()=>setReview(true)} footer={<><button className="button primary full" disabled={busy} onClick={()=>void run('next',{id:room.id})}><RefreshCw size={18}/>{busy?'Yeni maç hazırlanıyor…':'Tekrar oyna'}</button><button className="text-button" disabled={busy} onClick={()=>void leave()}>Arena’ya dön</button>{error&&<p className="error-box" role="alert">{error}</p>}</>}><p className="arena-result-context"><Trophy size={24} aria-hidden="true"/><span>Maç {room.round} · {room.reason}</span></p><ArenaMatchStandings people={people} you={room.you.id} historical/>{room.series&&<ArenaSeriesBoard series={room.series} you={room.you.id}/>}<p className="arena-result-next">{group?'Sıradaki: '+roundLabel(room.nextRoundKind)+'. ':''}Yeni maç için birlikte hazır olun.</p></Modal>}
 {ranking&&!leaving&&!rules&&<Modal scene="stadium" className="arena-scoreboard" title={finished?'Maç tamamlandı':'Canlı sıralama'} onClose={()=>setRanking(false)} footer={<button className="button primary full" onClick={()=>setRanking(false)}>{finished?'Maç sonucuna dön':'Tahtaya dön'}</button>}><ArenaMatchStandings people={people} you={room.you.id} historical={finished}/>{room.series&&<ArenaSeriesBoard series={room.series} you={room.you.id}/>}</Modal>}
 {leaving&&<Modal title={finished?'Arena’ya dönelim mi?':'Düellodan ayrılacak mısın?'} onClose={()=>setLeaving(false)}><p>{finished?'Sonucun kaydedildi. Yeni bir düelloya başlayabilirsin.':'Ayrılırsan bu maçtaki yarışın sona erer. Diğer oyuncuların süresi devam eder.'}</p><div className="button-row"><button className="button secondary" onClick={()=>setLeaving(false)}>Oyunda kal</button><button className="button primary" disabled={busy} onClick={()=>void leave()}>Arena’ya dön</button></div></Modal>}
 {rules&&!leaving&&<Modal className="game-tools-modal game-library-sheet" title="Düello kuralları" onClose={()=>setRules(false)}><p>{group&&<>{room.roundPolicy==='words'?'Her maçta kelimeler açık verilir.':room.roundPolicy==='mixed'?'İlk maç kelimelerle başlar. Sonraki maçlar bilmece ve kelime olarak dönüşür.':'Bu oda kelime ve bilmece turlarını dönüşümlü oynar.'} </>}120 saniye boyunca aynı tahtada yarışın. Bütün kelimeleri ilk bulan kazanır. Süre dolarsa en yüksek puan kazanır; birincilik puanları eşitse beraberlik olur. Eşit puanlar aynı sırayı paylaşır.</p><p>Bir kelime 100 + harf başına 10 puan değerinde. İlk 20 saniye ve her 40 saniyede açılan 20 saniyelik Altın Kelime penceresinde işaretli kelime ×2 puan verir.</p><p>İpucu yok. Yanlış seçim cezası yok. Bağlantı kesilirse süre devam eder. Yalnız iki kişilik dereceli düello Arena puanını etkiler. Hızlı grup ve özel odalar etkilemez. Oda serisindeki galibiyetler gerçek tamamlanmış maçlardan hesaplanır; beraberlik kimseye galibiyet eklemez.</p><button className="button primary full" onClick={()=>setRules(false)}>Anlaşıldı</button></Modal>}
 </>;
}
/** Server ranks are authoritative, including ties and departed players. */
export function ArenaMatchStandings({people,you,historical=false}:{people:ArenaParticipant[];you:string;historical?:boolean}){
 const me=people.find(p=>p.id===you);
 return <section className="match-standings" aria-label="Maç sonucu sıralaması">
  <h2>Maç sıralaması <span>{people.length} oyuncu</span></h2>
  {me&&people.length>4&&<p className="standings-personal"><span>Sen · {me.rank}. sıra</span><strong>{me.score} <small>puan</small></strong></p>}
  <ArenaRoster people={people} you={you} historical={historical}/>
 </section>;
}
export function ArenaSeriesBoard({series,you}:{series:ArenaSeries;you:string;expanded?:boolean}){
 const [page,setPage]=useState(0),pages=Math.max(1,Math.ceil(series.players.length/12)),current=Math.min(page,pages-1),me=series.players.find(p=>p.id===you);
 return <section className="arena-series" aria-label="Bu odanın galibiyetleri"><h2><Trophy size={18}/><span>Oda galibiyetleri <small>{series.rounds} kayıtlı maç · Sen {me?.wins??0} galibiyet</small></span></h2>
  {series.rounds===0?<p>İlk tamamlanan maçtan sonra galibiyetler burada birikir.</p>:<><p>Eşit galibiyetler aynı sırayı paylaşır.</p><ol aria-label="Oda serisi galibiyetleri">{series.players.slice(current*12,current*12+12).map(p=><li key={p.id} className={p.id===you?'is-you':''}><span>{p.rank}.</span><strong>{p.name}{p.id===you?' · Sen':''}<small>{p.played} maç · {p.draws} beraberlik{!p.active?' · Odadan ayrıldı':''}</small></strong><b>{p.wins}<small>galibiyet</small></b></li>)}</ol>{pages>1&&<nav aria-label="Seri sıralaması sayfaları"><button className="text-button" disabled={current===0} onClick={()=>setPage(current-1)}>Önceki</button><span>{current+1}/{pages}</span><button className="text-button" disabled={current===pages-1} onClick={()=>setPage(current+1)}>Sonraki</button></nav>}</>}
 </section>;
}
export function ArenaRoster({people,you,lobby=false,historical=false}:{people:ArenaParticipant[];you:string;lobby?:boolean;historical?:boolean}){
 const [page,setPage]=useState(0);const pages=Math.max(1,Math.ceil(people.length/12)),current=Math.min(page,pages-1);
 return <div className="arena-roster"><ol aria-label={lobby?'Odadaki oyuncular':'Maç sıralaması'}>{people.slice(current*12,current*12+12).map(p=><li key={p.id} className={p.id===you?'is-you':''}><span className="roster-rank">{lobby?<Users size={16}/>:p.rank}</span><strong>{p.name}{p.id===you&&<small> · Sen</small>}</strong><span>{lobby?(p.ready?'Hazır':'Hazırlanıyor'):`${p.score} puan`}</span><small>{p.left?'Ayrıldı':!historical&&!p.online?'Bağlantı bekliyor':lobby?'':`${p.count} kelime`}</small>{p.id!==you&&<PlayerSafety id={p.id} name={p.name}/>}</li>)}</ol>{pages>1&&<nav aria-label="Oyuncu sayfaları"><button className="text-button" disabled={current===0} onClick={()=>setPage(current-1)}>Önceki</button><span>{current+1}/{pages}</span><button className="text-button" disabled={current===pages-1} onClick={()=>setPage(current+1)}>Sonraki</button></nav>}</div>;
}
type RankingsData={day:string;daily:{nickname:string;duration:number}[];arena:{nickname:string;played:number;wins:number;score:number;rating:number}[]};
export function Rankings({daily=false}:{daily?:boolean}){
 const [data,setData]=useState<RankingsData|null>(null),[error,setError]=useState(''),[attempt,setAttempt]=useState(0);
 useEffect(()=>{const c=new AbortController();setError('');getApi<RankingsData>('?action=rankings',c.signal).then(value=>{if(!c.signal.aborted)setData(value);}).catch(e=>{if(!c.signal.aborted&&e.name!=='AbortError')setError(e.message);});return ()=>c.abort();},[attempt]);
 const entries=daily?data?.daily:data?.arena;
 return <div className="rankings"><div className="section-title"><h2>{daily?'Bugünün en hızlıları':'Arena’nın kelime ustaları'}</h2><Trophy size={21}/></div>{error?<div className="ranking-empty"><p role="status">Sıralama şu an alınamadı.</p><button className="button secondary" onClick={()=>setAttempt(n=>n+1)}><RefreshCw size={16}/>Yeniden dene</button></div>:!entries?<p className="muted" role="status">Sıralama yükleniyor…</p>:entries.length===0?<div className="ranking-empty"><Trophy size={29} strokeWidth={1.5}/><p>{daily?'Bugünün ilk keşfi senden gelsin.':'İlk dereceli düelloyla sıralamayı başlat.'}</p><small>Burada tamamlanmış oyunların gerçek sonuçları görünür.</small></div>:<ol>{entries.map((p,i)=><li key={i}><span className="rank-position">{String(i+1).padStart(2,'0')}</span><span className="avatar small">{p.nickname.slice(0,1)}</span><strong>{p.nickname}</strong><b>{'duration' in p?timeLabel(p.duration/1000):`${p.rating} puan`}</b><small>{'played' in p?`${p.played} düello`:''}</small></li>)}</ol>}</div>;
}

/** Bound recovery time without retrying an uncertain mutation automatically. */
async function arenaRequest<T>(request:(signal:AbortSignal)=>Promise<T>):Promise<T>{
 const controller=new AbortController();let timer:ReturnType<typeof setTimeout>;
 try{return await Promise.race([request(controller.signal),new Promise<never>((_,reject)=>{timer=setTimeout(()=>{reject(new Error('Sunucu yanıtı gecikti. Bağlantını kontrol edip odayı yeniden kontrol edebilirsin.'));controller.abort();},12000);})]);}
 finally{clearTimeout(timer!);}
}
