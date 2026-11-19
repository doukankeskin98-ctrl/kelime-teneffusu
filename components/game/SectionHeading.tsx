import type {ReactNode} from 'react';

export function SectionHeading({title,detail,id,className=''}:{title:string;detail?:ReactNode;id?:string;className?:string}){
 return <header className={'subpage-heading section-heading '+className}>
  <h1 id={id}>{title}</h1>{detail&&<p>{detail}</p>}
 </header>;
}
