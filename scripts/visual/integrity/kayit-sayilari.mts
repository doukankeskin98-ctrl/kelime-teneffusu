// Bir kayıt örneğinin oyunun KENDİ koduyla hesaplanan sayıları (Claude, 21 Kasım 2026).
// Repo kökünden: node_modules/.bin/tsx <yol>/kayit-sayilari.mts <kayıt.json>
// Kayıt biçimi: {key, value (JSON metni), chapters}. Kabul tablosundaki beklenen değerlerle karşılaştırmak içindir.
import {readFileSync} from 'node:fs';import {pathToFileURL} from 'node:url';import {join} from 'node:path';
const R=(p:string)=>import(pathToFileURL(join(process.cwd(),p)).href);
const {collectionStats}=await R('lib/game/progress.ts'),{discoveryState}=await R('lib/game/discovery.ts'),{mainJourneyChapters}=await R('lib/game/main-journey.ts');
const f=JSON.parse(readFileSync(process.argv[2]??(()=>{throw new Error('Kayıt dosyası gerekli');})(),'utf8'));const p=JSON.parse(f.value);
const st=collectionStats(p),ds=discoveryState(p),mj=mainJourneyChapters(p);
console.log(JSON.stringify({bolum:st.completed,yildiz:st.stars,tema:st.worlds,tamamlananDunya:ds.filter((s:{complete:boolean})=>s.complete).length,yolculuk:mj.filter((x:{complete:boolean;unlocked:boolean})=>x.complete).length+'/'+mj.length,acikBolum:mj.filter((x:{complete:boolean;unlocked:boolean})=>x.unlocked).length}));
