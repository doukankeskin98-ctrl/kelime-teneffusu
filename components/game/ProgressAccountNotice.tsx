'use client';
import {RefreshCw,TriangleAlert} from 'lucide-react';
import {progressOwnerChanged,type ProgressSaveStatus} from '@/lib/game/progress-sync';

export function ProgressAccountNotice({status,onRefresh,onRetry,inGame=false}:{status:ProgressSaveStatus;onRefresh:()=>void;onRetry:()=>void;inGame?:boolean}){
 if(!progressOwnerChanged(status))return null;
 const storageFailed=status==='account-changed-storage-error';
 return <div className="error-box progress-account-notice" role="status"><TriangleAlert size={19} aria-hidden="true"/><div><b>Hesap değişti</b><p>{storageFailed?'Ana ilerlemenin bulut eşitlemesi durduruldu; bu cihazda da ana ilerleme için kayıt yapılamıyor. Profili yenilemeden önce cihaz kaydını yeniden dene.':'Ana ilerlemenin bulut eşitlemesi durduruldu. Ana ilerlemen bu cihazda kayıtlı; güncel profilini yükleyerek devam edebilirsin.'}</p></div>{inGame&&!storageFailed?<small>Oyundan çıktıktan sonra profilini buradan yenileyebilirsin.</small>:<button className="button secondary" onClick={storageFailed?onRetry:onRefresh}><RefreshCw size={16}/>{storageFailed?'Cihaz kaydını yeniden dene':'Profili yenile'}</button>}</div>;
}
