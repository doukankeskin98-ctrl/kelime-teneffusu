import {findTheme,LEVEL_NAMES,THEMES} from './catalog.ts';
import {journeyById} from './content.ts';
import {recommendedExpedition} from './discovery.ts';
import type {Progress} from './progress.ts';

export function nextDiscovery(progress:Progress){
 const last=progress.last;
 let config:{themeId:string;level:number;journey?:string;practice?:boolean};
 if(last?.journey&&journeyById(last.journey)&&!progress.saves['route:'+last.journey]?.complete)config=last;
 else if(last&&!last.journey&&!progress.saves[`${last.themeId}.${last.level}`]?.complete)config=last;
 else {
  const remaining=last&&!last.journey?[...Array.from({length:5-last.level},(_,i)=>last.level+i+1),...Array.from({length:last.level},(_,i)=>i)].find(level=>!progress.saves[`${last.themeId}.${level}`]?.complete):undefined;
  const next=recommendedExpedition(progress).next;
  const nextStandard=!next?THEMES.flatMap(theme=>Array.from({length:6},(_,level)=>({themeId:theme.id,level}))).find(c=>!progress.saves[`${c.themeId}.${c.level}`]?.complete):undefined;
  config=remaining!==undefined?{themeId:last!.themeId,level:remaining}:next?{themeId:next.themeId,level:0,journey:next.id}:nextStandard??{themeId:'uzay',level:0,practice:true};
 }
 const key=config.journey?'route:'+config.journey:`${config.themeId}.${config.level}`,save=progress.saves[key];
 const mode=config.practice?'replay':save&&!save.complete&&save.strokes.length?'continue':Object.keys(progress.saves).length?'next':'start';
 const title=config.journey?journeyById(config.journey)!.title:LEVEL_NAMES[config.level]!;
 return {config,title,theme:findTheme(config.themeId).title,mode,label:mode==='continue'?'Keşfe devam et':mode==='replay'?'Bir daha keşfet':mode==='next'?'Sıradaki keşif':'Keşfe başla',found:mode==='continue'?save!.strokes.length:0};
}
