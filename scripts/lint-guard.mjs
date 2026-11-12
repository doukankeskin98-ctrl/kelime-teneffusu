import {readFile} from 'node:fs/promises';
import {relative} from 'node:path';
import {ESLint} from 'eslint';

// Ratchet known debt down; new files/rules start at zero. Do not auto-refresh it.
const {limits}=JSON.parse(await readFile(new URL('./lint-baseline.json',import.meta.url),'utf8'));
const results=await new ESLint().lintFiles(['.']);
const counts={},examples={};
for(const result of results) for(const message of result.messages){
  const file=relative(process.cwd(),result.filePath).replaceAll('\\','/');
  const key=[file,message.ruleId??'parse',message.severity].join('|');
  counts[key]=(counts[key]??0)+1;
  examples[key]=`${file}:${message.line} ${message.message}`;
}
const regressions=Object.keys(counts).filter(key=>counts[key]>(limits[key]??0));
for(const key of regressions)console.error(`${examples[key]} (${counts[key]} > baseline ${limits[key]??0})`);
console.log(`${results.reduce((n,r)=>n+r.errorCount,0)} existing errors / ${results.reduce((n,r)=>n+r.warningCount,0)} warnings; ${regressions.length} increases. Full lint debt remains visible.`);
if(regressions.length)process.exitCode=1;
