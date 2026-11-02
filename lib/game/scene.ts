import type {StorySceneKind} from './story-content.ts';

/** Presentation only. Scene choices never participate in seeds, IDs or save keys. */
export function sceneForTheme(theme?:string):StorySceneKind {
 if(['uzay','bilim','teknoloji'].includes(theme??''))return 'observatory';
 if(['turkiye','dunya'].includes(theme??''))return 'harbor';
 if(theme==='lezzetler')return 'bakery';
 if(['muzik','yesilcam','diziler','sinema','mitoloji'].includes(theme??''))return 'courtyard';
 return 'garden';
}
export const sceneImage=(scene:StorySceneKind)=>`/art/scenes/${scene}-v1.webp`;
