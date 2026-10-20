import {getChatGPTUser} from './chatgpt-auth';
import {GameApp} from '@/components/game/App';
export const dynamic='force-dynamic';
export default async function Page(){const user=await getChatGPTUser();return <GameApp authenticated={!!user}/>;}
