import {Swords} from 'lucide-react';
import type {ReactNode} from 'react';
import {SceneArt} from './SceneArt';
import {SectionHeading} from './SectionHeading';
export function ArenaEntryBackdrop({children}:{children:ReactNode}){
 return <section className="arena-stage" aria-labelledby="arena-title">
  <div className="arena-stage-art" aria-hidden="true"><SceneArt scene="stadium" eager/><div/></div>
  <SectionHeading id="arena-title" className="arena-stage-heading" title="Arena" detail="120 saniye. Her maç yeni kelimeler."/>
  <div className="arena-stage-emblem" aria-hidden="true"><Swords size={64}/><i/><i/></div>
  <div className="arena-stage-dock">{children}</div>
 </section>;
}
