// Inspect the actual white sheets, including text inside their scrollable content.
// Raster sampling preserves gradient backgrounds, translucent layers and native field fills.
export async function measureDialogText(page,selector='dialog[open]') {
 const count = await page.evaluate(`(() => {
  const dialog = [...document.querySelectorAll(${JSON.stringify(selector)})].at(-1);
  const items = [];
  function add(element, range, text, pseudo) {
   if (!text || element.closest('.sr-only,[hidden],svg') || !element.checkVisibility({visibilityProperty:true,opacityProperty:true})) return;
   const style = getComputedStyle(element, pseudo);
   const fill = style.color.match(/[\\d.]+/g).map(Number);
   let alpha = fill[3] ?? 1;
   for (let e=element;e;e=e.parentElement) alpha *= Number(getComputedStyle(e).opacity);
   const required = parseFloat(style.fontSize)>=24 && Number(style.fontWeight)>=700 ? 3 : 4.5;
   items.push({element,range,text,fill,alpha,required});
  }
  const walker = document.createTreeWalker(dialog,NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
   const node=walker.currentNode, element=node.parentElement, range=document.createRange();
   if(element.closest('textarea,style,script'))continue;
   range.selectNodeContents(node);
   if(range.getBoundingClientRect().width>1)add(element,range,node.textContent.trim());
  }
  for(const field of dialog.querySelectorAll('textarea,input:not([type=checkbox]):not([type=radio]):not([type=range])')) {
   const selected = document.activeElement===field && field.value && field.selectionStart===0 && field.selectionEnd===field.value.length;
   add(field,null,field.value||field.placeholder,selected?'::selection':field.value?null:'::placeholder');
  }
  window.__contrastItems=items;
  const mask=document.createElement('style');mask.id='contrast-mask';
  mask.textContent=${JSON.stringify(selector + ',' + selector + ' *,' + selector + ' ::placeholder')}+'{-webkit-text-fill-color:transparent!important;text-shadow:none!important;caret-color:transparent!important}';
  // Keep the native selection highlight and hide its glyphs for background sampling.
  mask.textContent+=${JSON.stringify(selector+' textarea::selection,'+selector+' input::selection')}+'{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important}';
  document.head.append(mask);
  return items.length;
 })()`);
 const rows=[];
 try {
  for(let i=0;i<count;i++){
   const item=await page.evaluate(`(async() => {
    const {element,range,text,fill,alpha,required}=window.__contrastItems[${i}];
    element.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'});
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    const box=range?Array.from(range.getClientRects()).find(r=>r.width>1&&r.height>1):element.getBoundingClientRect();
    if(!box)throw Error('Missing text bounds: '+text);
    const y=Math.max(1,Math.min(innerHeight-1,box.y+box.height/2));
    const points=[.2,.5,.8].map(t=>[Math.max(1,Math.min(innerWidth-1,box.x+box.width*t)),y]);
    if(!element.contains(document.elementFromPoint(...points[1])))throw Error('Text covered: '+text);
    return {text,fill,alpha,required,points};
   })()`);
   const png=await page.screenshot();
   await page.evaluate(`(async()=>{const img=new Image();img.src='data:image/png;base64,${png}';await img.decode();const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);window.__contrastCanvas=ctx})()`);
   const backgrounds=await page.evaluate(`(${JSON.stringify(item.points)}).map(([x,y])=>Array.from(window.__contrastCanvas.getImageData(Math.floor(x*devicePixelRatio),Math.floor(y*devicePixelRatio),1,1).data).slice(0,3))`);
   const ratios=backgrounds.map(bg=>{
    const applied=bg.map((v,k)=>item.alpha*item.fill[k]+(1-item.alpha)*v);
    const lum=rgb=>rgb.map(n=>n/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((a,v,k)=>a+v*[.2126,.7152,.0722][k],0);
    const [lo,hi]=[lum(bg),lum(applied)].sort((a,b)=>a-b);
    return (hi+.05)/(lo+.05);
   });
   const ratio=Math.min(...ratios);
   rows.push({text:item.text,foreground:item.fill,alpha:item.alpha,background:backgrounds[ratios.indexOf(ratio)],ratio:Number(ratio.toFixed(3)),required:item.required,pass:ratio>=item.required});
  }
 } finally {
  await page.evaluate("document.getElementById('contrast-mask')?.remove();delete window.__contrastCanvas;delete window.__contrastItems");
 }
 return rows;
}
