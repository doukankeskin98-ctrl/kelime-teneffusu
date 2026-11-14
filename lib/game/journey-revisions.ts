import {journeyById,type Journey} from './content.ts';
import {CONTENT_REVISION_TWO} from './progress-rollout.ts';
import type {Progress,SavedLevel} from './progress.ts';

/** Pilot catalogue, never substituted for released revision 1. These are not live
 * until the full route/editorial and physical-device acceptance is recorded. */
type RevisionDraft=Pick<Journey,'title'|'words'|'size'|'difficulty'|'note'> & Pick<Partial<Journey>,'clues'>;
export const JOURNEY_REVISION_TWO:Record<string,RevisionDraft>={
 'ufuk-gok-1':{title:'Yıldızın içinden',words:['ÇEKİRDEK','KATMAN','YAKIT','ISI','IŞIN'],size:8,difficulty:'Rahat',note:'Yıldızın merkezinden yayılan ışığa uzan.'},
 'ufuk-gok-2':{title:'Yıldız ışığı',words:['TAYF','DALGA','RENK','PARLAK','SÖNÜK'],size:8,difficulty:'Dengeli',note:'Tayf, ışığın renklere ayrılmış görünümüdür.'},
 'ufuk-gok-3':{title:'Uzaklığı ölçmek',words:['AÇI','ÖLÇÜM','MESAFE','KONUM','HESAP','ÜÇGEN'],size:9,difficulty:'Dengeli',note:'Farklı noktalardan bak, uzaklığın izini sür.'},
 'ufuk-gok-4':{title:'Yıldızın ömrü',words:['BULUT','ÇÖKÜŞ','FÜZYON','DEV','CÜCE','KALINTI'],size:9,difficulty:'Dengeli',note:'Tanımı oku, cevabı yıldızların arasında bul.',clues:{BULUT:'Yıldız doğurabilen gaz ve toz topluluğu.','ÇÖKÜŞ':'Yerçekimi etkisiyle içe doğru büzülme.','FÜZYON':'Hafif atom çekirdeklerinin birleşmesi.',DEV:'Kırmızı ...: genişlemiş bir yıldız türü.','CÜCE':'Beyaz ...: yıldızdan kalan küçük, yoğun çekirdek.',KALINTI:'Bir oluşumdan geriye kalan.'}},
 'ufuk-gok-5':{title:'Gözlem hazırlığı',words:['TRİPOD','AYAR','NETLİK','SESSİZLİK','KARANLIK','SABIR'],size:9,difficulty:'Ustalık',note:'Gözlem için ortamını ve araçlarını hazırla.'},
 'ufuk-gok-6':{title:'Ufukta renkler',words:['ŞAFAK','GURUP','KIZILLIK','MAVİ','TURUNCU','ALACA'],size:9,difficulty:'Dengeli',note:'Gurup, Güneş’in ufukta batışıdır.'},
};
export function journeyRevision(id:string,revision:number=1):Journey|undefined{
 const legacy=journeyById(id);if(revision===1)return legacy;
 const next=JOURNEY_REVISION_TWO[id];return legacy&&revision===2&&next?{...legacy,clues:undefined,...next,subtitle:'Gökyüzü Defteri',revision:2}:undefined;
}
export const savedRevision=(save:SavedLevel|undefined)=>save?.revision??1;
export function revisionSave(progress:Pick<Progress,'saves'|'revisionSaves'>,key:string,revision:number){
 const primary=progress.saves[key];return primary&&savedRevision(primary)===revision?primary:progress.revisionSaves?.[key]?.[revision];
}
/** A run captures this once. A later cloud response cannot replace its board. */
export function playableJourney(id:string,progress:Pick<Progress,'saves'>,enableRevisionTwo=CONTENT_REVISION_TWO){
 const saved=progress.saves['route:'+id];
 return journeyRevision(id,saved?savedRevision(saved):enableRevisionTwo&&JOURNEY_REVISION_TWO[id]?2:1);
}
export const journeyPresentationKey=(journey:Journey)=>'route:'+journey.id+(journey.revision===2?'@2':'');
