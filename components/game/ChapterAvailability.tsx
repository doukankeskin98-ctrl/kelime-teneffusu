import {CheckCircle2,WifiOff} from 'lucide-react';

/** Device readiness is independent of the player's cloud progress. */
export function ChapterAvailability({ready,offline}:{ready:boolean|undefined;offline:boolean}){
 if(ready===undefined||(!ready&&!offline))return null;
 return <span className={'chapter-availability '+(ready?'ready':'missing')}>
  {ready?<CheckCircle2 size={15}/>:<WifiOff size={15}/>}
  <span>{ready?'Çevrimdışı hazır':'İnternet gerekli'}{!ready&&<small>Önce bir kez çevrimiçi aç.</small>}</span>
 </span>;
}
