import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {readdirSync} from 'node:fs';

const here=fileURLToPath(new URL('.',import.meta.url));
const root=fileURLToPath(new URL('../../',import.meta.url));
const run=(...args)=>execFileSync(process.execPath,args,{stdio:'inherit',cwd:root});
const banks=readdirSync(here+'kelime-bankasi').filter(f=>/^yolculuk-v3-dunya-.*\.txt$/.test(f)).sort().map(f=>here+'kelime-bankasi/'+f);
for(const bank of banks)run(here+'araclar/kelime-denetimi.mjs',bank,'--oyun',root);
run('--experimental-strip-types',here+'araclar/tahta-denetimi.mts',root,here+'veri/yerlesim.json','--banka',banks.join(','));
run(here+'generate.mjs');
run('--experimental-strip-types',here+'araclar/zorluk-olcumu.mts',here+'veri/yerlesim.json');
