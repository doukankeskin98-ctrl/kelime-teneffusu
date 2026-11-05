export const ISSUE_KINDS=['Kelime seçimi','Görüntü ve yazılar','İlerleme ve kayıt','Arena ve bağlantı','Diğer'] as const;
export type IssueKind=typeof ISSUE_KINDS[number];
/** Only explicitly supplied, visible fields belong in a support draft. */
export function supportDraft(input:{kind:IssueKind;detail:string;technical:boolean;version:string;platform:string}):string {
 const kind=ISSUE_KINDS.includes(input.kind)?input.kind:'Diğer';
 const lines=['Kelime Teneffüsü · Sorun bildirimi','Konu: '+kind,'',input.detail.trim().slice(0,1200)];
 if(input.technical)lines.push('','Sürüm: '+input.version,'Platform: '+input.platform);
 return lines.join('\n');
}
