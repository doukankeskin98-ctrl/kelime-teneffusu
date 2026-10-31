'use client';
import {Check} from 'lucide-react';
import {BOARD_COLORS,type BoardColor} from '@/lib/game/board-color';
export function BoardColorSettings({value='white',onChange}:{value?:BoardColor;onChange:(color:BoardColor)=>void}){
 return <fieldset className="board-color-settings"><legend>Tahta rengi</legend><p>Yalnızca senin tahtanın görünümünü değiştirir. Tercihin profilinle saklanır.</p><div className="board-color-options">{BOARD_COLORS.map(color=><button type="button" key={color.id} aria-pressed={value===color.id} onClick={()=>onChange(color.id)}><span className="board-color-preview" style={{background:color.paper}} aria-hidden="true">A B<br/>C Ç</span><b>{color.name}</b><small>{value===color.id?<><Check size={14}/>Seçili</>:'Seç'}</small></button>)}</div></fieldset>;
}
