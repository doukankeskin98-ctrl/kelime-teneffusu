import {readFileSync,readdirSync} from 'node:fs';
// Only public source/build inputs are emitted; never read environment or runtime data.
const paths=['pnpm-lock.yaml','drizzle/meta/_journal.json',...readdirSync('drizzle').filter(n=>/^0001_.*\.sql$/.test(n)).map(n=>'drizzle/'+n),...readdirSync('drizzle/meta').filter(n=>/^0001_snapshot\.json$/.test(n)).map(n=>'drizzle/meta/'+n)];
for(const path of paths){
 const content=readFileSync(path).toString('base64'),count=Math.ceil(content.length/6000);
 for(let index=0;index<count;index++)console.log('KT_BUILD_INPUT_V1 '+JSON.stringify({path,index,count,data:content.slice(index*6000,(index+1)*6000)}));
}
console.log('KT_BUILD_INPUTS_COMPLETE');
