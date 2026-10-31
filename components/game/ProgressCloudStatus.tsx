'use client';
import {BookOpen,Cloud,CloudOff,RotateCw} from 'lucide-react';
import {progressOwnerChanged,type ProgressSaveStatus} from '@/lib/game/progress-sync';

/** Main Progress only; extra chapters and live rounds have their own save paths. */
export function ProgressCloudStatus({status,onRetry}:{status:ProgressSaveStatus;onRetry:()=>void}){
 const message=progressOwnerChanged(status)?'Hesap değişti · Bulut eşitlemesi durduruldu':status==='storage-error'?'Bu cihazda kayıt yapılamıyor.':status==='syncing'?'Ana ilerlemen eşitleniyor…':status==='saved'?'Ana ilerlemen bulutla eşitlendi':status==='offline'?'Bulut eşitlemesi bekliyor. Ana ilerlemen bu cihazda kayıtlı.':'Ana ilerlemen bu cihazda kayıtlı';
 return <div className="progress-cloud-status"><p className="cloud-status" role="status">{status==='saved'?<Cloud size={15} aria-hidden="true"/>:status==='offline'?<CloudOff size={15} aria-hidden="true"/>:<BookOpen size={15} aria-hidden="true"/>} {message}</p>{(status==='offline'||status==='storage-error')&&<button type="button" className="text-button cloud-retry" onClick={onRetry}><RotateCw size={16} aria-hidden="true"/> {status==='storage-error'?'Cihaz kaydını yeniden dene':'Yeniden eşitle'}</button>}</div>;
}
