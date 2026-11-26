'use client';
import {createContext,useContext} from 'react';

export type SettingsEntry={
 mode:'home'|'solo'|'race'|'finished';
 onClose:(resume?:boolean)=>void;
 onHome?:()=>void;
 onHelp?:()=>void;
};
import type {SettingsServices} from './SettingsHome';
type Preferences={haptics:boolean;settings:SettingsServices;onHome:()=>void};
const Context=createContext<Preferences|null>(null);
export const PlayPreferencesProvider=Context.Provider;
export const usePlayHapticsEnabled=()=>useContext(Context)?.haptics??false;
export function usePlaySettings(){return useContext(Context);}
