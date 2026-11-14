'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowLeft,Copy} from 'lucide-react';
import {version} from '@/package.json';
import {isNativeGame} from '@/lib/platform/runtime';
import {ISSUE_KINDS,supportDraft,type IssueKind} from '@/lib/platform/support';

export function SupportReport({onBack}:{onBack?:()=>void}){
 const [kind,setKind]=useState<IssueKind>('Kelime seçimi'),[detail,setDetail]=useState(''),[technical,setTechnical]=useState(true),[status,setStatus]=useState(''),[busy,setBusy]=useState(false),[showPreview,setShowPreview]=useState(false);
 const preview=useRef<HTMLTextAreaElement>(null),category=useRef<HTMLButtonElement>(null),active=useRef(true),lock=useRef(false);
 useEffect(()=>{active.current=true;category.current?.focus({preventScroll:true});return ()=>{active.current=false;};},[]);
 useEffect(()=>{if(showPreview){preview.current?.focus({preventScroll:true});preview.current?.select();}},[showPreview]);
 const platform=isNativeGame()?'iOS uygulaması':'Tarayıcı';
 const draft=supportDraft({kind,detail,technical,version,platform});
 const copy=async()=>{
  if(lock.current||detail.trim().length<10)return;
  lock.current=true;setBusy(true);setStatus('');
  try{if(!navigator.clipboard?.writeText)throw Error();await navigator.clipboard.writeText(draft);if(active.current)setStatus('Rapor kopyalandı. Henüz gönderilmedi.');}
  catch{if(active.current){setStatus('Otomatik kopyalanamadı. Aşağıdaki rapor metnini seçip kopyalayabilirsin.');setShowPreview(true);}}
  finally{lock.current=false;if(active.current)setBusy(false);}
 };
 return <div className="support-report">{onBack&&<button className="text-button support-back" onClick={onBack}><ArrowLeft size={18}/>Ayarlara dön</button>}
  <p>Hangi bölümde, ne yaparken sorun yaşadığını yazabilirsin.</p>
  <p className="support-availability">Doğrudan gönderim henüz açık değil. Raporunu hazırlayıp kopyalayabilirsin.</p>
  <fieldset className="support-kinds"><legend>Sorun türü</legend>{ISSUE_KINDS.map((item,i)=><button type="button" key={item} ref={i===0?category:undefined} aria-pressed={kind===item} onClick={()=>{setKind(item);setStatus('');}}>{item}</button>)}</fieldset>
  <label htmlFor="support-detail">Ne oldu?</label><textarea id="support-detail" value={detail} maxLength={1200} rows={4} placeholder="Örneğin: 15. bölümde çapraz kelimenin son harfine geldiğimde seçim tamamlanmadı." onChange={e=>{setDetail(e.target.value);setStatus('');}} aria-describedby="support-detail-note"/>
  <small id="support-detail-note">En az 10 karakter. Parola veya kişisel bilgi yazma.</small>
  <label className="support-technical"><input type="checkbox" checked={technical} onChange={e=>{setTechnical(e.target.checked);setStatus('');}}/><span>Sürüm ve platform bilgisini ekle<small>{version} · {platform}</small></span></label>
  <button className="button primary full" disabled={busy||detail.trim().length<10} onClick={()=>void copy()}><Copy size={19}/>{busy?'Kopyalanıyor…':'Raporu kopyala'}</button>
  <p className="support-status" role="status">{status}</p>
  <button className="text-button support-preview-toggle" aria-expanded={showPreview} aria-controls="support-preview-panel" onClick={()=>setShowPreview(!showPreview)}>Rapor metnini {showPreview?'gizle':'gör'}</button><div id="support-preview-panel" hidden={!showPreview}><label htmlFor="support-preview" className="sr-only">Rapor metni</label><textarea ref={preview} id="support-preview" value={draft} readOnly rows={7}/></div>
 </div>;
}
