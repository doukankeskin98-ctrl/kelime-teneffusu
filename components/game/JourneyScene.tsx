'use client';
import {useId} from 'react';
/** Decorative vector diorama; real progress is separately available as text. */
export function JourneyScene({theme='uzay',className=''}:{theme?:string;className?:string}){
 const id=useId().replace(/:/g,''),space=theme==='uzay',warm=['turkiye','lezzetler','tarcin'].some(t=>theme.includes(t));
 const sky=space?['#172d45','#587a85']:warm?['#9cbba6','#e9d6a4']:['#427568','#bfd5b1'];
 return <svg className={'journey-scene '+className} viewBox="0 0 640 340" aria-hidden="true" focusable="false">
  <defs><linearGradient id={id+'sky'} x2="0" y2="1"><stop stopColor={sky[0]}/><stop offset="1" stopColor={sky[1]}/></linearGradient><linearGradient id={id+'hill'} x2="0" y2="1"><stop stopColor="#88a888"/><stop offset="1" stopColor="#487b62"/></linearGradient><linearGradient id={id+'tile'} x2="0" y2="1"><stop stopColor="#fffdf0"/><stop offset="1" stopColor="#e9dcb4"/></linearGradient><radialGradient id={id+'glow'}><stop stopColor="#ffecb5" stopOpacity=".45"/><stop offset="1" stopColor="#ffecb5" stopOpacity="0"/></radialGradient></defs>
  <path fill={'url(#'+id+'sky)'} d="M0 0h640v340H0z"/><circle fill={'url(#'+id+'glow)'} cx="452" cy="85" r="150"/><circle fill="#faedc4" cx="452" cy="74" r="31"/>
  {space&&<><ellipse cx="452" cy="74" rx="55" ry="10" fill="none" stroke="#ead8a2" strokeWidth="5" transform="rotate(-23 452 74)"/><g fill="#f5e9c4">{[[76,34],[167,75],[270,27],[332,90],[563,40],[595,116],[220,126]].map(([x,y],i)=><path key={i} d={`M${x} ${y!-4}l1.5 3 3 1-3 1.5-1.5 3-1-3-3-1.5 3-1z`}/>)}</g></>}
  <g fill="#fff8e3" opacity={space?'.13':'.35'}><path d="M35 93c8-23 35-25 49-8 17-11 38-2 42 11H35z"/><path d="M477 142c13-24 41-23 54-4 21-13 44-4 50 12H477z"/><path d="M248 56c8-17 29-18 38-3 12-6 26 0 29 8h-67z"/></g>
  <path d="M0 224C80 141 140 153 223 209c94-123 156-110 229-28 65-44 134-39 188-1v160H0z" fill="#719784" opacity=".6"/><path d="M0 269c111-95 211-52 302-32 119-102 220-65 338 12v91H0z" fill={'url(#'+id+'hill)'}/><ellipse cx="329" cy="286" rx="186" ry="32" fill="#1d4c3c" opacity=".25"/>
  <path d="M139 259c20-62 88-101 175-94 97-31 169 8 192 80-55 63-263 77-367 14z" fill="#2e644f"/><path d="M139 246c20-62 88-101 175-94 97-31 169 8 192 80-55 63-263 77-367 14z" fill="#9bb999"/>
  <path d="M165 242c47-30 105 9 139-10 44-25-30-40-3-58 16-10 49-12 75-8" fill="none" stroke="#d5d6b1" strokeWidth="21" strokeLinecap="round"/><path d="M165 239c47-30 105 9 139-10 44-25-30-40-3-58 16-10 49-12 75-8" fill="none" stroke="#f0e6bd" strokeWidth="13" strokeLinecap="round"/>
  {[[192,201,1],[457,216,.9],[403,160,.65],[130,255,.7]].map(([x,y,s],i)=><g key={i} transform={`translate(${x} ${y}) scale(${s})`}><path d="M-3 0v-34h7V0" fill="#53654b"/><path d="M0-80c-37 31-31 62 0 55 31 7 36-24 0-55" fill={i%2?'#285e4b':'#396f52'}/><path d="M0-71v40" stroke="#81a97b" strokeWidth="2" opacity=".5"/></g>)}
  <g className="scene-letter scene-letter-one" transform="translate(228 111) rotate(-12 35 35)"><rect y="7" width="70" height="74" rx="16" fill="#b9a575"/><rect width="70" height="74" rx="16" fill={'url(#'+id+'tile)'} stroke="#fff8dc" strokeWidth="2"/><text x="35" y="52" textAnchor="middle" fontFamily="Georgia,serif" fontWeight="bold" fontSize="47" fill="#245b43">K</text></g>
  <g className="scene-letter scene-letter-two" transform="translate(309 101) rotate(8 35 35)"><rect y="7" width="70" height="74" rx="16" fill="#b9a575"/><rect width="70" height="74" rx="16" fill={'url(#'+id+'tile)'} stroke="#fff8dc" strokeWidth="2"/><text x="35" y="52" textAnchor="middle" fontFamily="Georgia,serif" fontWeight="bold" fontSize="47" fill="#245b43">T</text></g>
  <g fill="#f3d784"><path d="M370 214l5 10 11 2-8 8 1 11-9-5-10 5 2-11-8-8 11-2z"/><circle cx="205" cy="249" r="4"/><circle cx="421" cy="247" r="3"/></g><path d="M0 314c80-32 117 9 182 26H0zm640-14c-75-20-114 10-158 40h158z" fill="#234f3e"/>
 </svg>;
}
