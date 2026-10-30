// Build guard for syntax that would stop the whole app before legacy API fallbacks run.
// This is a syntax check, not a Safari runtime/device test.
import assert from 'node:assert/strict';
import {readdir,readFile} from 'node:fs/promises';
import ts from 'typescript';
const files=(await readdir('dist/client',{recursive:true})).filter(file=>file.endsWith('.js'));
assert(files.length>0,'No built client JavaScript to verify');
const failures=[];
for(const file of files){
 const source=ts.createSourceFile(file,await readFile('dist/client/'+file,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
 assert.equal(source.parseDiagnostics.length,0,'Invalid client JavaScript: '+file);
 const visit=node=>{
  const binary=ts.isBinaryExpression(node)&&[ts.SyntaxKind.QuestionQuestionToken,ts.SyntaxKind.QuestionQuestionEqualsToken,ts.SyntaxKind.BarBarEqualsToken,ts.SyntaxKind.AmpersandAmpersandEqualsToken].includes(node.operatorToken.kind);
  const modern=ts.isPropertyAccessChain(node)||ts.isElementAccessChain(node)||ts.isCallChain(node)||ts.isBigIntLiteral(node)||ts.isPrivateIdentifier(node)||ts.isClassStaticBlockDeclaration(node)||ts.isPropertyDeclaration(node)||binary;
  const regex=ts.isRegularExpressionLiteral(node)&&(/\(\?<([=!])/.test(node.text)||/[dv][a-z]*$/.test(node.text));
  if(modern||regex)failures.push(file+': '+ts.SyntaxKind[node.kind]);ts.forEachChild(node,visit);
 };
 visit(source);
}
assert.equal(failures.length,0,'Safari 12 incompatible client syntax: '+failures.slice(0,8).join(', '));
console.log(files.length+' client chunks passed the Safari 12 syntax guard (not device QA).');
