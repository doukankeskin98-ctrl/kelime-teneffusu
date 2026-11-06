import {timeLabel} from '@/lib/game/engine';

/** A fixed-height scoreboard shared by live and asynchronous competition. */
export function CompetitionHud({seconds,leftLabel,leftValue,rightLabel,rightValue,onRank,urgent=false,elapsed=false}:{seconds:number;leftLabel:string;leftValue:string;rightLabel:string;rightValue:string;onRank?:()=>void;urgent?:boolean;elapsed?:boolean}){
 const right=<><span title={rightLabel}>{rightLabel}</span><strong>{rightValue}</strong></>;
 return <div className="competition-hud">
  <div className="competition-player"><span title={leftLabel}>{leftLabel}</span><strong>{leftValue}</strong></div>
  <div className={'competition-clock'+(urgent?' urgent':'')} aria-label={`${elapsed?'Geçen':'Kalan'} süre ${timeLabel(seconds)}`}><span>{elapsed?'Süre':'Kalan süre'}</span><strong>{timeLabel(seconds)}</strong></div>
  {onRank?<button className="competition-player competition-rank" onClick={onRank} aria-label="Maç sıralamasını aç">{right}</button>:<div className="competition-player competition-rank">{right}</div>}
 </div>;
}
