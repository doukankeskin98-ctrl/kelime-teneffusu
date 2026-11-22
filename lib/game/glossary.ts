/** Display vocabulary only. Never use these labels as save or reward identities. */
export const GAME_TERMS={chapter:'Bölüm',world:'Dünya',album:'Albüm',piece:'Parça',weekly:'Haftanın kartpostalı',extras:'Ek bölümler',games:'Oyunlar',bonus:'Bonus turu',sprint:'Hızlı tur'} as const;
export const PROFILE_TITLES=['Yeni gezgin','Meraklı gezgin','Usta gezgin'] as const;
export const ARENA_TITLES=['Meraklı yarışmacı','Keskin bakış','Arena ustası'] as const;
export const profileTitle=(completed:number)=>PROFILE_TITLES[completed>=48?2:completed>=12?1:0];
export const arenaTitle=(rating:number)=>ARENA_TITLES[rating>=1500?2:rating>=1200?1:0];
export const worldAlbumTitle=(worldTitle:string)=>worldTitle+' albümü';
