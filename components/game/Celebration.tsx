'use client';
import type {CSSProperties} from 'react';
/** Fixed, bounded decoration; no timers or game state writes. */
export function Celebration({grand=false}:{grand?:boolean}){
 return <div className={'celebration-particles'+(grand?' is-grand':'')} aria-hidden="true">{Array.from({length:grand?18:12},(_,i)=><i key={i} style={{'--particle':i,'--x':`${(i%2?1:-1)*(30+(i*37)%135)}px`,'--y':`${-45-(i*31)%170}px`,'--turn':`${i*53}deg`,'--delay':`${(i%4)*55}ms`} as CSSProperties}/>)}<span className="celebration-halo"/></div>;
}
