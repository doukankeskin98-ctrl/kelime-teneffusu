/** Personal paper tones. IDs are persisted in the existing owner-scoped Progress v2. */
export const BOARD_COLORS=[
 {id:'white',name:'Beyaz',paper:'#fffdf4'},
 {id:'walnut',name:'Kahverengi',paper:'#d5b28d'},
 {id:'sage',name:'Adaçayı',paper:'#dce6d2'},
 {id:'sand',name:'Kum',paper:'#f1dfb0'},
] as const;
export type BoardColor=typeof BOARD_COLORS[number]['id'];
export const boardColor=(value:unknown):BoardColor|undefined=>BOARD_COLORS.find(c=>c.id===value)?.id;
