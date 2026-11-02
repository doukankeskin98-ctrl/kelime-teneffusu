import type {StorySceneKind} from './story-content.ts';
export const WORLD_SCENES={uzay:'observatory',turkiye:'bosphorus',hababam:'school',hayvanlar:'garden',lezzetler:'bakery',muzik:'courtyard',dunya:'harbor',bilim:'valley',teknoloji:'workshop',doksanlar:'cassette',futbol:'stadium',basketbol:'court',sinema:'cinema',yesilcam:'neighborhood',diziler:'square',mitoloji:'temple'} as const;
export type SceneKind=StorySceneKind|typeof WORLD_SCENES[keyof typeof WORLD_SCENES];

/** Presentation only. Scene choices never participate in seeds, IDs or save keys. */
export function sceneForTheme(theme?:string):SceneKind {
 return WORLD_SCENES[theme as keyof typeof WORLD_SCENES]??'garden';
}
export const sceneImage=(scene:SceneKind)=>`/art/scenes/${scene}-v1.webp`;
