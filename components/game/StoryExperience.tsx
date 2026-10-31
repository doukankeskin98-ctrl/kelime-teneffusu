'use client';
import {ArrowRight,BookOpen,Check,Clock,Sparkles,Star} from 'lucide-react';
import {LIVING_STORIES,storyStage,type LivingStory} from '@/lib/game/story-content';
import {journeyBoard} from '@/lib/game/content';
import {timeLabel} from '@/lib/game/engine';
import type {Progress,SavedLevel} from '@/lib/game/progress';
import type {SoloConfig} from './Solo';
import {StoryScene} from './StoryScene';

type ShelfProps={progress:Progress;onPlay:(config:SoloConfig)=>void};
const playConfig=(story:LivingStory,progress:Progress):SoloConfig=>({themeId:story.themeId,level:0,journey:story.id,...(progress.saves['route:'+story.id]?.complete?{practice:true}:{})});
export function StoryCollection({progress,onPlay,album=false}:{album?:boolean}&ShelfProps){
 const completed=LIVING_STORIES.filter(s=>progress.saves['route:'+s.id]?.complete).length;
 return <section className={'story-collection'+(album?' story-album':'')} aria-label={album?'Canlandırdığın hikâyeler':'Beş küçük hikâye'}>
  <header className="story-collection-heading"><div><span className="journey-section-label">{album?'KELİMELERİNDEN HATIRALAR':'HER BİRİ BAŞKA BİR DÜNYA'}</span><h2>{album?'Canlandırdığın hikâyeler':'Beş küçük hikâye.'}</h2></div><span><BookOpen size={16}/>{completed}/5</span></header>
  <div className="story-card-grid">{LIVING_STORIES.map((story,i)=>{const saved=progress.saves['route:'+story.id],stage=storyStage(story,journeyBoard(story),saved?.strokes??[]),continuing=!!saved&&!saved.complete&&(saved.strokes.length>0||saved.elapsed>0||saved.hints>0);return <button className={'story-card'+(saved?.complete?' is-complete':'')} key={story.id} onClick={()=>onPlay(playConfig(story,progress))} aria-label={`${story.title} · ${saved?.complete?'Yeniden canlandır':continuing?'Devam et':'Başla'}`}>
   <div className="story-card-art"><StoryScene kind={story.scene} stage={stage.index} preview={!album}/><span className="story-card-number">{saved?.complete?<Check size={15}/>:String(i+1).padStart(2,'0')}</span>{saved?.complete&&<span className="story-card-stars" aria-label={`${saved.stars} yıldız`}>{[0,1,2].map(n=><Star key={n} size={11} fill={n<saved.stars?'currentColor':'none'}/>)}</span>}</div>
   <div className="story-card-copy"><h3>{story.title}</h3><p>{saved?.complete?story.keepsake:continuing?`${stage.index}/${story.steps.length} adım · Devam et`:album?'Kelimelerinle canlanacak':`${story.steps.length} kelime · Acele yok`}</p><ArrowRight size={17}/></div>
  </button>;})}</div>
 </section>;
}
export function StoryShelf({progress,onPlay}:ShelfProps){
 const story=LIVING_STORIES.find(s=>{const save=progress.saves['route:'+s.id];return save&&!save.complete&&(save.strokes.length>0||save.elapsed>0||save.hints>0);})??LIVING_STORIES.find(s=>!progress.saves['route:'+s.id]?.complete)??LIVING_STORIES[0]!;
 const saved=progress.saves['route:'+story.id],continuing=!!saved&&!saved.complete&&(saved.strokes.length>0||saved.elapsed>0||saved.hints>0),stage=storyStage(story,journeyBoard(story),saved?.strokes??[]);
 return <div className="story-home">
  <article className="story-feature"><div className="story-feature-art"><StoryScene kind={story.scene} stage={stage.index} preview={!continuing}/><span className="story-feature-badge"><Sparkles size={15}/>KELİMELERİNLE CANLANIR</span><div className="story-feature-caption"><span>CANLANAN HİKÂYELER</span><p>Bir kelime bul.<br/>Dünyası değişsin.</p></div></div>
   <div className="story-feature-copy"><span className="journey-section-label">{saved?.complete?'YENİDEN GÖRMEK GÜZEL':continuing?'HİKÂYEN SENİ BEKLİYOR':'İLK KELİMEYLE BAŞLAR'}</span><h1 id="story-home-title">{story.title}</h1><p>{story.tagline}</p><div className="story-feature-meta"><span>{continuing?`${stage.index}/${story.steps.length} adım`:story.steps.length+' kelime'}</span><i/><span>Süre baskısı yok</span></div><button className="button primary full" onClick={()=>onPlay(playConfig(story,progress))}><span>{saved?.complete?'Yeniden canlandır':continuing?'Hikâyene devam et':'Hikâyeyi başlat'}</span><ArrowRight size={21}/></button><small>{continuing?'Kaldığın yer ve kelimelerin burada.':'Kelimeleri bul, ipuçlarını çöz, sahneyi tamamla.'}</small></div>
  </article><StoryCollection progress={progress} onPlay={onPlay}/>
 </div>;
}
export function StoryHud({story,stage,hints,notice}:{story:LivingStory;stage:number;hints:number;notice?:string}){
 return <div className="story-hud"><div className="story-hud-art"><StoryScene kind={story.scene} stage={stage}/></div><div className="story-hud-copy"><span className="story-hud-meta"><span>{stage===story.steps.length?'HİKÂYEN CANLANDI':`ADIM ${stage+1} / ${story.steps.length}`}</span><span className="story-star-goal" title="İpuçları yıldız sayısını azaltır; süre etkilemez." aria-label={`${stage===story.steps.length?'':'Tamamlarsan '}${3-Math.min(2,hints)} yıldız`}><Star size={12} fill="currentColor"/>{3-Math.min(2,hints)}</span></span><p role="status">{notice||(stage?story.steps[stage-1]!.reveal:'İlk kelimeyi bul. Hikâyeyi sen başlat.')}</p><ol className="story-step-dots" aria-label={`${stage}/${story.steps.length} adım tamamlandı`}>{story.steps.map((step,i)=><li key={step.word} className={i<stage?'is-done':i===stage?'is-current':''} aria-label={i<stage?step.word:`Adım ${i+1}`} aria-current={i===stage?'step':undefined}>{i<stage?<Check size={10}/>:i+1}</li>)}</ol></div></div>;
}
export function StoryResult({story,save,best}:{story:LivingStory;save:SavedLevel;best?:SavedLevel}){
 const improved=best?.complete&&(save.stars>best.stars||save.stars===best.stars&&save.elapsed<best.elapsed);
 return <div className="story-result"><div className="story-result-art"><StoryScene kind={story.scene} stage={story.steps.length}/><span><BookOpen size={15}/>{best?.complete?'HATIRANI YENİDEN CANLANDIRDIN':'ALBÜMÜNE BİR HATIRA'}</span></div><span className="journey-section-label">{story.keepsake}</span><h2>{story.title}</h2><p>{story.ending}</p><div className="story-result-stars" aria-label={`${save.stars} yıldız`}>{[0,1,2].map(i=><Star key={i} size={30} fill={i<save.stars?'currentColor':'none'}/>)}</div><div className="story-result-stats"><span><Check size={15}/>{story.steps.length} kelime</span><span><Clock size={15}/>{timeLabel(save.elapsed)}</span><span>{save.hints} ipucu</span></div><p className="story-star-rule">İpuçsuz 3 · Bir ipucuyla 2 · İki veya üç ipucuyla 1 yıldız.<br/>Süre yıldızları etkilemez. Hatıran her durumda senin.</p><p className="story-result-note">{improved?'Bu hikâyedeki en iyi sonucunu geliştirdin.':best?.complete?'En iyi sonucun albümünde korunur.':'Hikâyen albümünde. Dilediğinde yeniden canlandır.'}</p></div>;
}
