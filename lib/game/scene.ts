import type {StorySceneKind} from './story-content.ts';
export const WORLD_SCENES={okul:'school',tiyatro:'neighborhood',oyku:'square','film-atolyesi':'cinema','sokak-oyunlari':'cassette',uzay:'observatory',turkiye:'bosphorus',hababam:'school',hayvanlar:'garden',lezzetler:'bakery',muzik:'courtyard',dunya:'harbor',bilim:'valley',teknoloji:'workshop',doksanlar:'cassette',futbol:'stadium',basketbol:'court',sinema:'cinema',yesilcam:'neighborhood',diziler:'square',mitoloji:'temple'} as const;
export type SceneKind=StorySceneKind|typeof WORLD_SCENES[keyof typeof WORLD_SCENES]|'winter-room'|'farmstead';
/** Art direction is separate from the immutable theme used to generate a puzzle. */
export const ROUTE_SCENES:Record<string,SceneKind>={
 'ufuk-ciftlik':'farmstead','ufuk-orman':'garden','ufuk-gol':'valley','ufuk-yagmur':'garden',
 'ufuk-kamp':'valley','ufuk-ada':'harbor','ufuk-kent':'square','ufuk-pazar':'bakery',
 'ufuk-firin':'bakery','ufuk-sofra':'winter-room','ufuk-ev':'winter-room','ufuk-bahcivan':'workshop',
 'ufuk-fotograf':'square','ufuk-sahne':'cinema','ufuk-desen':'workshop','ufuk-dokuma':'workshop',
 'ufuk-deney':'workshop','ufuk-gok':'observatory','ufuk-yol':'square','ufuk-kis':'winter-room',
};

/** Presentation only. Scene choices never participate in seeds, IDs or save keys. */
export function sceneForTheme(theme?:string):SceneKind {
 return WORLD_SCENES[theme as keyof typeof WORLD_SCENES]??'garden';
}
export const sceneForRoute=(worldId:string|undefined,theme?:string):SceneKind=>ROUTE_SCENES[worldId??'']??sceneForTheme(theme);
export const sceneForJourney=(id:string|undefined,theme?:string):SceneKind=>sceneForRoute(id?.replace(/-\d+$/,''),theme);
export const sceneImage=(scene:SceneKind)=>`/art/scenes/${scene}-v1.webp`;
