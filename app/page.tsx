import {GameApp} from '@/components/game/App';
import {releaseCatalogue} from '@/lib/studio/releases';
export const dynamic='force-dynamic';
export default function Page(){const catalogue=releaseCatalogue();return <GameApp releases={catalogue.chapters} releaseCounts={catalogue.themeCounts}/>;}
