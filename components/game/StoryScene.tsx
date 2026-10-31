'use client';
import {useId,type ReactNode} from 'react';
import type {StorySceneKind} from '@/lib/game/story-content';

function Detail({show,children}:{show:boolean;children:ReactNode}){return <g className={'story-detail '+(show?'is-revealed':'is-waiting')}>{children}</g>;}
/** Original vector scenes: no image download and no independent reward state. */
export function StoryScene({kind,stage=0,preview=false}:{kind:StorySceneKind;stage?:number;preview?:boolean}){
 const id=useId().replace(/:/g,''),n=preview?5:stage,night=kind==='observatory',warm=kind==='bakery'||kind==='courtyard';
 return <svg className={'living-scene scene-'+kind} viewBox="0 0 640 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
 <defs>
  <linearGradient id={id+'sky'} x2="0" y2="1"><stop stopColor={night?'#172e4c':warm?'#d7bd91':kind==='harbor'?'#508d98':'#8cba9e'}/><stop offset="1" stopColor={night?'#688b98':warm?'#f5e7bd':'#e2e7c4'}/></linearGradient>
  <linearGradient id={id+'sea'} x2="0" y2="1"><stop stopColor="#70b5b3"/><stop offset="1" stopColor="#246e79"/></linearGradient>
  <linearGradient id={id+'grass'} x2="0" y2="1"><stop stopColor="#a8c19a"/><stop offset="1" stopColor="#527e58"/></linearGradient>
  <linearGradient id={id+'wall'}><stop stopColor="#d5c5a1"/><stop offset=".5" stopColor="#fff5d6"/><stop offset="1" stopColor="#e4d9b9"/></linearGradient>
  <radialGradient id={id+'light'}><stop stopColor="#ffe49a" stopOpacity=".9"/><stop offset="1" stopColor="#ffe49a" stopOpacity="0"/></radialGradient>
  <pattern id={id+'grain'} width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".6" fill="#fff" opacity=".12"/></pattern>
 </defs>
 <path d="M0 0h640v360H0z" fill={'url(#'+id+'sky)'}/>
 <circle cx={night?492:480} cy={night?70:85} r={night?23:39} fill="#fff0bf" opacity=".85"/>
 <g fill="#fff8dc" opacity={night?'.1':'.5'}><path d="M39 86c11-21 41-25 57-5 18-11 40-2 44 13H39z"/><path d="M417 140c13-22 42-22 57-5 17-10 36-5 45 11H417z"/></g>
 {kind==='harbor'&&<>
  <path d="M0 200l70-45 68 35 58-31 72 55 95-61 95 41 83-46 99 59v153H0z" fill="#729b93"/>
  <path d="M0 226c172-25 329 10 640-12v146H0z" fill={'url(#'+id+'sea)'}/>
  <g fill="none" stroke="#b2ded0" strokeWidth="2" opacity=".6"><path d="M335 252h76m61 21h116M270 309h103m66 20h77M7 282h87m310 12h45"/></g>
  <path d="M0 254c63-48 144-39 215-2l68 61-82 47H0z" fill="#536e5b"/>
  <path d="M0 249c65-45 135-39 210-1l40 39-63 34H0z" fill="#b5c39b"/>
  <Detail show={n>=1}><path d="M0 288c76-23 133-20 205 6l29 16-47 31H0z" fill="#e6d2a0"/><path d="M20 259l11-38 13 35m115 5 9-30 12 36" fill="none" stroke="#3c7861" strokeWidth="5" strokeLinecap="round"/><g fill="#e9c47b"><circle cx="30" cy="227" r="4"/><circle cx="169" cy="234" r="4"/></g></Detail>
  <g><ellipse cx="141" cy="262" rx="52" ry="13" fill="#365a4f" opacity=".25"/><path d="M116 127h43l14 126q-37 15-72 0z" fill={'url(#'+id+'wall)'}/><path d="M111 171h53l4 29h-60z" fill="#bd7661"/><path d="M112 123v-31h52v31z" fill="#355f60"/><path d="M103 91l35-29 35 29z" fill="#b96550"/><path d="M105 125h66" stroke="#b8a487" strokeWidth="7" strokeLinecap="round"/><path d="M127 259v-30q11-17 22 0v30" fill="#47766b"/><rect x="132" y="140" width="10" height="19" rx="5" fill="#648f82"/></g>
  <Detail show={n>=2}><path d="M145 106L548 40v144z" fill="#ffedb0" opacity=".24"/><ellipse cx="140" cy="107" rx="72" ry="51" fill={'url(#'+id+'light)'}/><rect x="122" y="98" width="31" height="18" rx="3" fill="#fff4ba"/></Detail>
  <Detail show={n>=3}><g transform="translate(390 210)"><ellipse cx="20" cy="77" rx="65" ry="8" fill="#1e5862" opacity=".22"/><path d="M-41 47h122l-24 28H-15z" fill="#b77150"/><path d="M-31 51h99" stroke="#edd5a6" strokeWidth="5"/><path d="M17 46v-101" stroke="#5a705e" strokeWidth="4"/><path d="M10-47v86H-36z" fill="#fff6d5"/><path d="M24-35v74h48z" fill="#dce4c7"/><path d="M21-55l24 9-24 7z" fill="#cb7557"/></g></Detail>
  <Detail show={n>=4}><g><path d="M486 263h154v15H478z" fill="#b58d61"/><path d="M511 275v38m88-38v43" stroke="#7b7454" strokeWidth="9"/><path d="M531 184h73v78h-73z" fill="#f0d5a7"/><path d="M518 187l50-38 49 38z" fill="#a25f50"/><path d="M553 230h25v32h-25" fill="#705e4d"/><rect x="543" y="199" width="15" height="19" rx="2" fill="#ffe59a"/><rect x="576" y="199" width="15" height="19" rx="2" fill="#ffe59a"/></g></Detail>
 </>}
 {kind==='garden'&&<>
  <path d="M0 213q135-116 277-9 183-116 363-17v173H0z" fill="#729e7b"/><path d="M0 272q156-103 355-22 127-61 285-6v116H0z" fill={'url(#'+id+'grass)'}/>
  <g fill="#366d58"><path d="M61 278C3 206 31 146 70 121c50 68 60 116-9 157"/><path d="M573 286c-63-63-30-132 7-159 50 73 52 125-7 159"/></g><g stroke="#a2ba85" strokeWidth="6"><path d="M65 173v153m515-139v142"/></g>
  <ellipse cx="314" cy="302" rx="126" ry="34" fill="#557a52"/><ellipse cx="314" cy="293" rx="111" ry="27" fill="#987652"/>
  <Detail show={n>=1}><path d="M304 293c-22-21-4-39 16-37 10 22 6 35-16 37" fill="#d4b779"/><path d="M303 277l13 15" stroke="#8e744c" strokeWidth="2"/><g fill="#c6a673"><circle cx="247" cy="294" r="4"/><circle cx="361" cy="301" r="4"/></g></Detail>
  <Detail show={n>=2}><path d="M201 87c-9-39 42-61 65-30 32-23 60 5 54 29 20-1 32 15 30 31H183c-6-18 1-28 18-30" fill="#e2eee0"/><g stroke="#74aeb2" strokeWidth="5" strokeLinecap="round"><path d="M217 140l-7 14m47-12-7 14m47-14-7 14m-54 14-7 14m47-11-7 14"/></g></Detail>
  <Detail show={n>=3}><path d="M313 286v-80" stroke="#447b4e" strokeWidth="7"/><path d="M310 247c-50 1-64-22-60-46 46-1 59 18 60 46M317 231c43 1 61-22 54-47-39 3-52 22-54 47" fill="#92bd76"/><path d="M258 211l48 32m21-20 35-28" stroke="#c3d798" strokeWidth="2"/></Detail>
  <Detail show={n>=4}><g transform="translate(314 188)"><g fill="#f0c682"><ellipse cy="-20" rx="13" ry="23"/><ellipse cx="22" cy="-5" rx="23" ry="13" transform="rotate(-20 22 -5)"/><ellipse cx="14" cy="20" rx="13" ry="23" transform="rotate(-30 14 20)"/><ellipse cx="-17" cy="17" rx="13" ry="23" transform="rotate(35 -17 17)"/><ellipse cx="-24" cy="-8" rx="23" ry="13" transform="rotate(20 -24 -8)"/></g><circle r="13" fill="#a77c43"/><circle r="6" fill="#f8e9a4"/></g><g fill="#efdd9f"><circle cx="154" cy="296" r="6"/><circle cx="455" cy="310" r="6"/></g></Detail>
  <Detail show={n>=5}><g transform="translate(410 153) rotate(-14)"><path d="M0 0c-39-48-57-14-18 12C-50 35-15 49 0 8c17 35 48 15 20-3C61-22 28-40 0 0" fill="#cb8e71"/><path d="M0-3v20m0-18-7-10m7 10 8-10" stroke="#52715b" strokeWidth="3" strokeLinecap="round"/></g></Detail>
 </>}
 {kind==='bakery'&&<>
  <path d="M0 284h640v76H0" fill="#c6ba97"/><path d="M52 96h532v205H52z" fill="#d8bd91"/><path d="M37 96l30-34h513l20 34z" fill="#6d8668"/>
  <path d="M157 109h292v159H157z" fill="#8c7559"/><path d="M184 139h238v129H184z" fill="#5e6150"/>
  <path d="M38 94h557v37H38z" fill="#e5d5ab"/><g fill="#64816a"><path d="M38 94h46v37H38zm92 0h46v37h-46zm92 0h46v37h-46zm92 0h46v37h-46zm92 0h46v37h-46zm92 0h46v37h-46z"/></g>
  <path d="M163 264h281v49H163z" fill="#ad835c"/><path d="M146 255h315v15H146z" fill="#eddab4"/><path d="M80 168h52v113H80z" fill="#78917c"/><path d="M91 184h30v64H91z" fill="#b9c9a5"/><path d="M481 171h64v71h-64z" fill="#77917a"/><path d="M489 180h48v53h-48z" fill="#f6dfa8"/><path d="M513 181v52m-24-27h48" stroke="#95a88a" strokeWidth="4"/>
  <Detail show={n>=1}><path d="M181 212l8-39h38l8 39z" fill="#e8d6a9"/><ellipse cx="207" cy="172" rx="19" ry="6" fill="#f5e9c8"/><path d="M196 192h22" stroke="#9a9a70" strokeWidth="4"/><g fill="#f7eed3"><circle cx="207" cy="229" r="4"/><circle cx="198" cy="241" r="3"/><circle cx="219" cy="237" r="3"/></g></Detail>
  <Detail show={n>=2}><ellipse cx="272" cy="248" rx="34" ry="8" fill="#6b614b" opacity=".2"/><path d="M242 244q-6-38 31-38 39 2 29 38z" fill="#f1dcad"/><path d="M257 216q18-8 31 1" fill="none" stroke="#fff0c9" strokeWidth="4"/></Detail>
  <Detail show={n>=3}><path d="M331 244v-64q35-47 71 0v64z" fill="#c18c54"/><path d="M340 240v-51q26-38 53 0v51z" fill="#deae67"/><ellipse cx="367" cy="213" rx="48" ry="49" fill={'url(#'+id+'light)'}/><path d="M354 235c-13-24 8-25 9-40 18 14 2 19 17 40" fill="#ffe3a1"/></Detail>
  <Detail show={n>=4}><path d="M303 271q-4-24 44-24 43 0 42 24z" fill="#ca914e"/><g stroke="#f1cb83" strokeWidth="4" strokeLinecap="round"><path d="M320 253l7 10m10-11 7 10m10-10 7 10"/></g></Detail>
  <Detail show={n>=5}><ellipse cx="489" cy="295" rx="51" ry="14" fill="#eee0bb"/><path d="M466 303l-8 37m55-37 9 37" stroke="#8b7960" strokeWidth="6"/><path d="M462 287h22l-3 16h-16z" fill="#d0a36c"/><ellipse cx="508" cy="294" rx="17" ry="6" fill="#cfb786"/><path d="M503 289q9-14 18 2" fill="#d6a35c"/></Detail>
 </>}
 {kind==='observatory'&&<>
  <path d="M0 252l112-83 103 76 105-91 111 95 120-77 89 59v129H0z" fill="#506c76"/><path d="M0 294q124-72 256-13 211-84 384-11v90H0z" fill="#385c60"/>
  <ellipse cx="299" cy="316" rx="166" ry="26" fill="#263f4a"/><path d="M188 233h196v77H188z" fill={'url(#'+id+'wall)'}/><path d="M180 234a106 106 0 0 1 212 0z" fill="#7eacaa"/><path d="M284 130c-51 24-61 58-58 104h58z" fill="#aac5b3"/><path d="M177 235h219" stroke="#426e70" strokeWidth="9" strokeLinecap="round"/>
  <path d="M267 310v-43q18-27 37 0v43" fill="#4c7979"/><rect x="209" y="257" width="22" height="22" rx="3" fill="#638784"/><rect x="342" y="257" width="22" height="22" rx="3" fill="#638784"/>
  <Detail show={n>=1}><ellipse cx="306" cy="158" rx="21" ry="17" fill="#d9e7cf"/><ellipse cx="306" cy="158" rx="14" ry="11" fill="#557f88"/><path d="M300 151l13 11" stroke="#a9d4cc" strokeWidth="3"/></Detail>
  <Detail show={n>=2}><g transform="translate(308 189) rotate(-25)"><path d="M0 0h89v25H0z" fill="#d4d8b6"/><path d="M0 2h15v21H0z" fill="#4d7d80"/><path d="M80-4h14v33H80z" fill="#709f9f"/><path d="M40 24v33m0-15-17 15m17-15 19 15" stroke="#e3dcb3" strokeWidth="7"/></g></Detail>
  <Detail show={n>=3}><g transform="translate(122 111) rotate(-18)"><path d="M-16-8h32v24h-32z" fill="#d9d8ad"/><path d="M-61-14h35v33h-35zm87 0h35v33H26z" fill="#5b9caa" stroke="#a1c6c3" strokeWidth="2"/><path d="M-26 2h52m-70-17v34m88-34v34" stroke="#d4d6aa" strokeWidth="2"/></g></Detail>
  <Detail show={n>=4}><circle cx="478" cy="174" r="38" fill="#d3bc83"/><ellipse cx="478" cy="174" rx="65" ry="14" transform="rotate(-23 478 174)" fill="none" stroke="#e6d7a5" strokeWidth="7"/></Detail>
  <Detail show={n>=5}><g fill="#fbeab5">{[[59,46],[195,57],[260,82],[381,55],[555,110],[421,278],[82,221]].map(([x,y],i)=><path key={i} d={`M${x} ${y! -6}l2 4 5 2-5 2-2 4-2-4-5-2 5-2z`}/>)}</g></Detail>
 </>}
 {kind==='courtyard'&&<>
  <path d="M0 242h640v118H0z" fill="#baa886"/><path d="M0 290q300-25 640 0" fill="none" stroke="#d8c8a3" strokeWidth="4"/>
  <path d="M43 100h130v166H43z" fill="#d0b48c"/><path d="M31 100l78-53 77 53z" fill="#a26f56"/><path d="M480 97h128v168H480z" fill="#c7af87"/><path d="M466 97l76-48 78 48z" fill="#68806a"/>
  <g fill="#718e77"><path d="M82 263v-78q27-35 52 0v78z"/><rect x="65" y="117" width="28" height="34" rx="4"/><rect x="121" y="117" width="28" height="34" rx="4"/><rect x="506" y="117" width="28" height="34" rx="4"/><rect x="553" y="117" width="28" height="34" rx="4"/></g>
  <path d="M149 74q168 103 340 0" fill="none" stroke="#7f8363" strokeWidth="3"/><g fill="#f9dfa0">{[176,225,275,325,375,425,474].map((x,i)=><circle key={x} cx={x} cy={84+Math.sin(i/6*Math.PI)*40} r="6"/>)}</g>
  <path d="M193 255h242v27H193z" fill="#96734f"/><path d="M181 247h265v12H181z" fill="#d7b985"/>
  <Detail show={n>=1}><path d="M239 218v-68l40-8v66" fill="none" stroke="#705e48" strokeWidth="5"/><ellipse cx="231" cy="219" rx="11" ry="7" fill="#705e48"/><ellipse cx="271" cy="209" rx="11" ry="7" fill="#705e48"/></Detail>
  <Detail show={n>=2}><g transform="translate(314 217) rotate(19)"><path d="M-5-11c-35-32-54 9-25 22-17 29 30 43 37 9 38-9 22-43-12-31" fill="#c28b53"/><path d="M-1-10v-69h9v77" fill="#8b674c"/><circle cx="-4" cy="9" r="10" fill="#655b45"/><path d="M-2-69v91m4-91v91" stroke="#e5c897" strokeWidth="1.5"/></g></Detail>
  <Detail show={n>=3}><ellipse cx="393" cy="214" rx="24" ry="9" fill="#efe0bb"/><path d="M369 214l5 32h38l5-32" fill="#b77556"/><path d="M376 217l10 26 11-26 10 26" fill="none" stroke="#e9c38f" strokeWidth="2"/><path d="M361 196l34 10m30-15-21 14" stroke="#ac875b" strokeWidth="4" strokeLinecap="round"/></Detail>
  <Detail show={n>=4}><g>{[[204,215,'#799a81'],[461,219,'#c48e70']].map(([x,y,color],i)=><g key={i} transform={`translate(${x} ${y})`}><circle cy="-38" r="13" fill="#d2ae83"/><path d="M-19 5v-22q19-17 38 0V5z" fill={String(color)}/><path d="M-8 6v19m16-19v19" stroke="#646b54" strokeWidth="7" strokeLinecap="round"/></g>)}</g></Detail>
  <Detail show={n>=5}><g fill="#6a8062">{[116,168,493,546].map((x,i)=><g key={x} transform={`translate(${x} ${302+i%2*13})`}><circle cy="-15" r="12" fill="#d2b48d"/><path d="M-21 25v-18q21-24 42 0v18z"/><path d="M-15 8l-12-26m41 26 12-26" stroke="#d2b48d" strokeWidth="6" strokeLinecap="round"/></g>)}</g></Detail>
 </>}
 <path d="M0 0h640v360H0z" fill={'url(#'+id+'grain)'} pointerEvents="none"/>
 </svg>;
}
