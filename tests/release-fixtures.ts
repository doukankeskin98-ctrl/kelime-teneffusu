import {releaseCatalogue} from '../lib/studio/releases.ts';
import type {ReleaseSummary} from '../lib/studio/release-identity.ts';

/** Read every page so archive regressions remain valid as daily content grows. */
export function releaseArchive(now:number){
 const chapters:ReleaseSummary[]=[];let offset=0;
 for(;;){
  const page=releaseCatalogue(offset,now);chapters.push(...page.chapters);
  if(page.nextOffset===null)return {chapters,total:page.total};
  if(page.nextOffset<=offset)throw new Error('Archive pagination did not advance');
  offset=page.nextOffset;
 }
}
