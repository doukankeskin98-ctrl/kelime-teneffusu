import {GameApp} from '@/components/game/App';
import {releaseCatalogue} from '@/lib/studio/releases';
export const dynamic='force-dynamic';
export default function Page(){return <GameApp releases={releaseCatalogue().chapters.slice(0,2)}/>;}
