import {test} from 'node:test';
import assert from 'node:assert/strict';
import {supportDraft} from '../lib/platform/support.ts';
const input={kind:'Kelime seçimi' as const,detail:'  15. bölümde son harf seçilmedi.  ',technical:true,version:'0.36.5',platform:'iOS uygulaması'};
test('support draft contains the visible issue and optional technical fields only',()=>{
 assert.equal(supportDraft({...input,token:'secret',email:'private@example.test',progress:{}} as typeof input),'Kelime Teneffüsü · Sorun bildirimi\nKonu: Kelime seçimi\n\n15. bölümde son harf seçilmedi.\n\nSürüm: 0.36.5\nPlatform: iOS uygulaması');
});
test('technical opt out excludes version and platform',()=>{
 const text=supportDraft({...input,technical:false});assert.ok(!text.includes(input.version));assert.ok(!text.includes(input.platform));
});
test('draft length remains bounded and malformed category falls back to Other',()=>{
 const text=supportDraft({...input,kind:'invalid' as typeof input.kind,detail:'a'.repeat(3000),technical:false});assert.equal(text.split('\n').at(-1)?.length,1200);assert.ok(text.includes('Konu: Diğer'));
});
