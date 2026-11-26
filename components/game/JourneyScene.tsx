'use client';
import {paint} from '../ui/art-palette';

import {useId} from 'react';
/** Decorative vector diorama; real progress is separately available as text. */
export function JourneyScene({theme='uzay',className=''}:{theme?:string;className?:string}){
 const id=useId().replace(/:/g,''),space=theme==='uzay',warm=['turkiye','lezzetler','tarcin'].some(t=>theme.includes(t));
 const sky=space?[paint.sky18,paint.sky43]:warm?[paint.leaf67,paint.ochre78]:[paint.teal36,paint.leaf76];
 return <svg className={'journey-scene '+className} viewBox="0 0 640 340" aria-hidden="true" focusable="false">
  <defs><linearGradient id={id+'sky'} x2="0" y2="1"><stop stopColor={sky[0]}/><stop offset="1" stopColor={sky[1]}/></linearGradient><linearGradient id={id+'hill'} x2="0" y2="1"><stop stopColor={paint.leaf60}/><stop offset="1" stopColor={paint.teal38}/></linearGradient><linearGradient id={id+'tile'} x2="0" y2="1"><stop stopColor={paint.stone97b}/><stop offset="1" stopColor={paint.ochre81a}/></linearGradient><radialGradient id={id+'glow'}><stop stopColor={paint.ochre85a} stopOpacity=".45"/><stop offset="1" stopColor={paint.ochre85a} stopOpacity="0"/></radialGradient></defs>
  <path fill={'url(#'+id+'sky)'} d="M0 0h640v340H0z"/><circle fill={'url(#'+id+'glow)'} cx="452" cy="85" r="150"/><circle fill={paint.ochre87b} cx="452" cy="74" r="31"/>
  {space&&<><ellipse cx="452" cy="74" rx="55" ry="10" fill="none" stroke={paint.ochre78a} strokeWidth="5" transform="rotate(-23 452 74)"/><g fill={paint.ochre86a}>{[[76,34],[167,75],[270,27],[332,90],[563,40],[595,116],[220,126]].map(([x,y],i)=><path key={i} d={`M${x} ${y!-4}l1.5 3 3 1-3 1.5-1.5 3-1-3-3-1.5 3-1z`}/>)}</g></>}
  <g fill={paint.ochre95a} opacity={space?'.13':'.35'}><path d="M35 93c8-23 35-25 49-8 17-11 38-2 42 11H35z"/><path d="M477 142c13-24 41-23 54-4 21-13 44-4 50 12H477z"/><path d="M248 56c8-17 29-18 38-3 12-6 26 0 29 8h-67z"/></g>
  <path d="M0 224C80 141 140 153 223 209c94-123 156-110 229-28 65-44 134-39 188-1v160H0z" fill={paint.teal52a} opacity=".6"/><path d="M0 269c111-95 211-52 302-32 119-102 220-65 338 12v91H0z" fill={'url(#'+id+'hill)'}/><ellipse cx="329" cy="286" rx="186" ry="32" fill={paint.teal21} opacity=".25"/>
  <path d="M139 259c20-62 88-101 175-94 97-31 169 8 192 80-55 63-263 77-367 14z" fill={paint.teal29}/><path d="M139 246c20-62 88-101 175-94 97-31 169 8 192 80-55 63-263 77-367 14z" fill={paint.leaf66}/>
  <path d="M165 242c47-30 105 9 139-10 44-25-30-40-3-58 16-10 49-12 75-8" fill="none" stroke={paint.ochre77} strokeWidth="21" strokeLinecap="round"/><path d="M165 239c47-30 105 9 139-10 44-25-30-40-3-58 16-10 49-12 75-8" fill="none" stroke={paint.ochre84} strokeWidth="13" strokeLinecap="round"/>
  {[[192,201,1],[457,216,.9],[403,160,.65],[130,255,.7]].map(([x,y,s],i)=><g key={i} transform={`translate(${x} ${y}) scale(${s})`}><path d="M-3 0v-34h7V0" fill={paint.leaf35}/><path d="M0-80c-37 31-31 62 0 55 31 7 36-24 0-55" fill={i%2?paint.teal26:paint.teal33}/><path d="M0-71v40" stroke={paint.leaf57} strokeWidth="2" opacity=".5"/></g>)}
  <g className="scene-letter scene-letter-one" transform="translate(228 111) rotate(-12 35 35)"><rect y="7" width="70" height="74" rx="16" fill={paint.ochre59b}/><rect width="70" height="74" rx="16" fill={'url(#'+id+'tile)'} stroke={paint.ochre93} strokeWidth="2"/><text x="35" y="52" textAnchor="middle" fontFamily="Georgia,serif" fontWeight="bold" fontSize="47" fill={paint.teal25}>K</text></g>
  <g className="scene-letter scene-letter-two" transform="translate(309 101) rotate(8 35 35)"><rect y="7" width="70" height="74" rx="16" fill={paint.ochre59b}/><rect width="70" height="74" rx="16" fill={'url(#'+id+'tile)'} stroke={paint.ochre93} strokeWidth="2"/><text x="35" y="52" textAnchor="middle" fontFamily="Georgia,serif" fontWeight="bold" fontSize="47" fill={paint.teal25}>T</text></g>
  <g fill={paint.ochre74}><path d="M370 214l5 10 11 2-8 8 1 11-9-5-10 5 2-11-8-8 11-2z"/><circle cx="205" cy="249" r="4"/><circle cx="421" cy="247" r="3"/></g><path d="M0 314c80-32 117 9 182 26H0zm640-14c-75-20-114 10-158 40h158z" fill={paint.teal22c}/>
 </svg>;
}
