'use client';
import {useEffect,useRef,useState} from 'react';
import {isNativeGame,gameIsActive} from '@/lib/platform/runtime';
import {startRoomPolling} from '@/lib/platform/room-poll';
import {memberFetch} from '@/lib/auth/firebase-client';
import type {RoomView} from '@/lib/game/server';
export function useLiveRoom(id:string|undefined,onRoom:(room:RoomView,sourceId:string)=>void,onClock:(time:number)=>void){
 const callbacks=useRef({onRoom,onClock});callbacks.current={onRoom,onClock};
 const [connection,setConnection]=useState<'connecting'|'connected'|'reconnecting'>('connecting');
 useEffect(()=>{
  if(!id)return;
  if(isNativeGame()){
   let connected=false;
   const poll=startRoomPolling<RoomView>({
    active:()=>!document.hidden&&gameIsActive(),
    read:async signal=>{const r=await memberFetch('/api/game?action=room&id='+encodeURIComponent(id),{signal});if(!r.ok)throw new Error('room');const room=await r.json() as RoomView;if(!room||typeof room.id!=='string')throw new Error('room');return room;},
    accept:room=>{callbacks.current.onRoom(room,id);callbacks.current.onClock(room.serverNow);},
    status:ok=>{if(ok)connected=true;setConnection(ok?'connected':connected?'reconnecting':'connecting');},
   });
   document.addEventListener('visibilitychange',poll.visibility);
   return ()=>{poll.stop();document.removeEventListener('visibilitychange',poll.visibility);};
  }
  let stopped=false,serial=0,timer:ReturnType<typeof setTimeout>,abort:AbortController|undefined,failures=0;
  const connect=async()=>{
   if(stopped||document.hidden)return;const generation=++serial;abort?.abort();abort=new AbortController();setConnection(failures?'reconnecting':'connecting');
   try{
    const response=await memberFetch('/api/live?id='+encodeURIComponent(id),{signal:abort.signal});
    if(!response.ok||!response.body||!response.headers.get('Content-Type')?.includes('text/event-stream'))throw new Error('stream');
    const reader=response.body.getReader(),decoder=new TextDecoder();let buffer='';
    while(!stopped&&serial===generation){
     const result=await reader.read();if(stopped||serial!==generation){await reader.cancel();break;}if(result.done)break;
     buffer+=decoder.decode(result.value,{stream:true});if(buffer.length>131072)throw new Error('stream too large');
     let index:number;
     while((index=buffer.indexOf('\n\n'))>=0){
      const block=buffer.slice(0,index);buffer=buffer.slice(index+2);const event=block.split('\n').find(l=>l.startsWith('event: '))?.slice(7),raw=block.split('\n').find(l=>l.startsWith('data: '))?.slice(6);if(!raw)continue;
      const value=JSON.parse(raw) as RoomView&{serverNow:number};
      if(event==='room'&&typeof value.id==='string'){callbacks.current.onRoom(value,id);failures=0;setConnection('connected');}
      if(event==='clock'&&typeof value.serverNow==='number')callbacks.current.onClock(value.serverNow);
     }
    }
   }catch{if(!stopped&&serial===generation&&!document.hidden){failures++;setConnection('reconnecting');}}
   finally{if(!stopped&&serial===generation&&!document.hidden)timer=setTimeout(()=>void connect(),Math.min(6000,500+failures*900));}
  };
  const visibility=()=>{clearTimeout(timer);serial++;abort?.abort();if(!document.hidden)void connect();};
  void connect();document.addEventListener('visibilitychange',visibility);
  return ()=>{stopped=true;serial++;abort?.abort();clearTimeout(timer);document.removeEventListener('visibilitychange',visibility);};
 },[id]);
 return connection;
}
