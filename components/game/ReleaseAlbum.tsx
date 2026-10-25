'use client';
import {useState,type ReactNode} from 'react';
import {ArrowRight} from 'lucide-react';
import type {PublishedChapter} from '@/lib/studio/content';
import type {ChapterCardProgress,ChapterCardState} from '@/lib/studio/card-progress';
import {releaseStamp,releaseDateLabel,type ReleasePair} from '@/lib/studio/release-stamps';
import {Modal} from './common';
import {ReleaseStamp} from './ReleaseStamp';

/** A view of existing completions. Opening the album never grants a reward. */
export function ReleaseAlbum({pairs,values,status,renderCard,initialSelectedDate}:{pairs:ReleasePair[];values:Record<string,ChapterCardProgress>;status:ChapterCardState;renderCard:(chapter:PublishedChapter,afterSelect:()=>void)=>ReactNode;initialSelectedDate?:string}){
 const [selectedDate,setSelectedDate]=useState<string|null>(initialSelectedDate??null),selected=pairs.find(pair=>pair.date===selectedDate);
 if(!pairs.length)return <p className="published-catalogue-note" role="status">Keşif çiftleri henüz doğrulanamadı. Bağlantı geldiğinde yeniden kontrol edebilirsin.</p>;
 return <><div className="release-album-grid">{pairs.map(pair=>{const stamp=releaseStamp(pair,values,status);return <article className={'release-album-card'+(stamp.earned?' earned':'')} key={pair.date}><time dateTime={pair.date}>{releaseDateLabel(pair.date)}</time><ReleaseStamp pair={pair} values={values} status={status} compact/><ul className="release-album-titles">{pair.chapters.map(chapter=><li key={chapter.id}>{chapter.spec.title}</li>)}</ul><button className="text-button" onClick={()=>setSelectedDate(pair.date)}>{stamp.earned?'Bölümleri yeniden aç':'Keşifleri aç'}<ArrowRight size={16}/></button></article>;})}</div>
 {selected&&<Modal title={releaseDateLabel(selected.date)+' keşifleri'} onClose={()=>setSelectedDate(null)}><p>Bu iki bölüm aynı damganın parçaları. İstediğin sırayla ve kendi temponda keşfet.</p><div className="published-chapter-grid">{selected.chapters.map(chapter=>renderCard(chapter,()=>setSelectedDate(null)))}</div><button className="text-button full" onClick={()=>setSelectedDate(null)}>Damga rafına dön</button></Modal>}
 </>;
}
