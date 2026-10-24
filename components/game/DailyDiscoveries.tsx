'use client';
import {useState} from 'react';
import {ArrowRight,Archive,BookOpen,Check,Sparkles} from 'lucide-react';
import type {ReleaseSummary} from '@/lib/studio/releases';
import type {PublishedChapter} from '@/lib/studio/content';
import {GAME_UPDATES} from '@/lib/game/updates';
import {findTheme} from '@/lib/game/catalog';
import {Modal} from './common';
import {WorldArt} from './WorldArt';
import {PublishedChapters} from './PublishedChapters';
import {useChapterCards} from './useChapterCards';
import {ChapterProgressBadge} from './ChapterProgressBadge';
import {ChapterAvailability} from './ChapterAvailability';
import {chapterCardCopy} from '@/lib/studio/card-progress';
import {releasePairs,type ReleasePair} from '@/lib/studio/release-stamps';
import {ReleaseStamp} from './ReleaseStamp';

export function DailyDiscoveries({chapters,userId,onPlay}:{chapters:ReleaseSummary[];userId?:string;onPlay:(chapter:PublishedChapter,practice?:boolean,pair?:ReleasePair)=>void}){
 const cards=useChapterCards(userId,chapters);
 const pair=releasePairs(chapters)[0];
 const [updates,setUpdates]=useState(false),[archive,setArchive]=useState(false);
 const date=chapters[0]?.releaseDate,label=date?new Intl.DateTimeFormat('tr-TR',{day:'numeric',month:'long',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z')):'';
 return <><section className="daily-discoveries" aria-labelledby="fresh-discoveries-title"><div className="fresh-heading"><div><span className="eyebrow"><Sparkles size={14}/>{label?`${label.toLocaleUpperCase('tr-TR')} KEŞİFLERİ`:'KEŞİF DEFTERİ'}</span><h2 id="fresh-discoveries-title">Küçük bir mola.<br/><em>İki yepyeni keşif.</em></h2><p>Kolay bir başlangıç, sonra biraz merak.<br/>Bu bölümler arşivinde hep kalır.</p></div><button className="fresh-update-link" onClick={()=>setUpdates(true)}><span className="fresh-version">v{GAME_UPDATES[0].version}</span><span>Neler değişti?</span><ArrowRight size={16}/></button></div>{chapters.length?<div className="fresh-chapter-grid">{chapters.map(chapter=>{const progress=cards.values[chapter.id],copy=chapterCardCopy(progress,cards.status,chapter.spec);return <button className={'fresh-chapter '+(chapter.slot===1?'gentle':'curious')} key={chapter.id} disabled={cards.status==='offline'&&cards.available[chapter.id]===false} onClick={()=>onPlay(chapter,progress?.complete===true,pair)}><div className="fresh-chapter-art"><WorldArt themeId={chapter.spec.themeId}/><span className="fresh-chapter-number">0{chapter.slot}</span></div><div className="fresh-chapter-copy"><span className="fresh-chapter-kicker">{chapter.slot===1?'KOLAY BİR BAŞLANGIÇ':'BİR ADIM DAHA DERİNE'}<span>{findTheme(chapter.spec.themeId).title}</span></span><h3>{chapter.spec.title}</h3><p>{chapter.spec.words.length} kelime <span>·</span> {chapter.spec.size} × {chapter.spec.size} tahta <span>·</span> {chapter.spec.difficulty}</p><ChapterProgressBadge progress={progress} status={cards.status} spec={chapter.spec}/><ChapterAvailability ready={cards.available[chapter.id]} offline={cards.status==='offline'}/><span className="fresh-chapter-action">{cards.status==='offline'&&cards.available[chapter.id]===false?'Bağlantı bekleniyor':copy.action} <ArrowRight size={18}/></span></div></button>;})}</div>:<p className="fresh-empty">Yeni keşifler hazırlanıyor. Aşağıdaki dünyalardan yolculuğuna devam edebilirsin.</p>}{pair&&<ReleaseStamp pair={pair} values={cards.values} status={cards.status}/>}{cards.status==='error'&&<p className="chapter-progress-notice" role="status">İlerleme durumu yenilenemedi.<button className="text-button" onClick={cards.retry}>Yeniden kontrol et</button></p>}<div className="fresh-footer"><span><Check size={15}/>Süre baskısı yok. Keşfin kalıcı.</span><button className="text-button" onClick={()=>setArchive(true)}><Archive size={16}/>Bölüm arşivi</button></div></section>
 {updates&&<Modal title="Oyunda neler değişti?" onClose={()=>setUpdates(false)}><p>Gördüğün ekranlar ve oyun deneyimi için kısa değişiklik notları.</p><div className="game-update-list">{GAME_UPDATES.map(release=><article key={release.version}><span className="game-update-date">{release.date} <b>v{release.version}</b></span><h3>{release.title}</h3><ul>{release.items.map(item=><li key={item.where}><BookOpen size={17}/><div><b>{item.where}</b><p>{item.detail}</p></div></li>)}</ul></article>)}</div><button className="button primary full" onClick={()=>setUpdates(false)}>Keşfe dön <ArrowRight size={17}/></button></Modal>}
 {archive&&<Modal title="Kalıcı bölüm arşivin" onClose={()=>setArchive(false)}><p>Yeni eklenen bütün keşifler burada. İndirdiğin tahtalar çevrimdışı da açılabilir.</p><PublishedChapters userId={userId} collection="releases" initial={chapters} onPlay={(chapter,practice,pair)=>{setArchive(false);onPlay(chapter,practice,pair);}}/></Modal>}
 </>;
}
