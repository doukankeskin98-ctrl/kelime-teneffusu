import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const here=fileURLToPath(new URL('.',import.meta.url));
const root=fileURLToPath(new URL('../../',import.meta.url));
const run=(...args)=>execFileSync(process.execPath,args,{stdio:'inherit',cwd:root});
run(here+'araclar/kelime-denetimi.mjs',here+'kelime-bankasi/yolculuk-v3-dunya-01-03.txt');
run('--experimental-strip-types',here+'araclar/tahta-denetimi.mjs',root,here+'veri/yerlesim.json');
run(here+'generate.mjs');
