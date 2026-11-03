'use client';
import {useEffect,type CSSProperties} from 'react';
import type {SceneKind} from '@/lib/game/scene';
import {sceneForTheme,sceneImage} from '@/lib/game/scene';

export function SceneArt({theme,scene,className='',eager=false}:{theme?:string;scene?:SceneKind;className?:string;eager?:boolean}){
 return <img className={'scene-art '+className} src={sceneImage(scene??sceneForTheme(theme))} alt="" aria-hidden="true" loading={eager?'eager':'lazy'} decoding="async" width="1024" height="1536"/>;
}
export function GameScene({scene,stage=1,nextScene}:{scene:SceneKind;stage?:number;nextScene?:SceneKind}){
 useEffect(()=>{if(!nextScene||nextScene===scene||(navigator as Navigator&{connection?:{saveData?:boolean}}).connection?.saveData)return;const timer=setTimeout(()=>{const image=new Image();image.decoding='async';image.src=sceneImage(nextScene);},600);return ()=>clearTimeout(timer);},[scene,nextScene]);
 return <div className={'game-scenery scenery-'+scene} aria-hidden="true" style={{'--scene-light':Math.min(1,Math.max(.76,stage))} as CSSProperties}><SceneArt scene={scene} eager/><div className="scenery-shade"/><div className="scenery-motes"><i/><i/><i/></div></div>;
}
