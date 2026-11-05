// Isolated simulator fixture: no account, network mutations or saved game data.
import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {setNativeTransport} from '@/lib/platform/runtime';
import {inviteLink,shareLink,shareMessage,type InviteKind} from '@/lib/platform/sharing';
import {installNativeSharing} from '../sharing';

setNativeTransport(async()=>{throw Error('No network in sharing QA');});
installNativeSharing();
const codes={oda:'ABCDEFGH',arkadas:'ABCDEFGH23',meydan:'23456789AB'};
function SharingFixture(){
 const [result,setResult]=useState(''),[url,setUrl]=useState('');
 const share=async(kind:InviteKind)=>{const link=inviteLink(kind,codes[kind]);setUrl(link);setResult('Bekleniyor');const result=await shareLink('Kelime Teneffüsü daveti',link);setResult(result+' · '+shareMessage(result));};
 return <main style={{padding:'80px 20px',font:'18px system-ui'}}><h1>Davet testi</h1>{(['oda','arkadas','meydan'] as const).map(kind=><button key={kind} style={{display:'block',padding:20,marginBottom:12}} onClick={()=>void share(kind)}>{kind} paylaş</button>)}<p aria-label="Paylaşım sonucu">{result}</p><p style={{overflowWrap:'anywhere'}}>{url}</p><label>Yapıştırılan davet<textarea aria-label="Yapıştırılan davet" style={{width:'100%',height:100}}/></label></main>;
}
createRoot(document.getElementById('root')!).render(<SharingFixture/>);
