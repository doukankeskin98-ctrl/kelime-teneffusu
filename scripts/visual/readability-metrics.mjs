// Evaluated in the browser. Measure visible ink even if its accessible name lives on the parent.
export function menuMetrics() {
  const vw = innerWidth, vh = innerHeight;
  const rect = r => [r.left,r.top,r.width,r.height].map(n => Math.round(n*10)/10);
  const styles = new WeakMap();
  function style(el) {
    if (!styles.has(el)) styles.set(el, getComputedStyle(el));
    return styles.get(el);
  }
  function visible(el) {
    return el.checkVisibility({opacityProperty:true, visibilityProperty:true});
  }
  function samplePoints(el, r) {
    let x1=Math.max(0,r.left), x2=Math.min(vw,r.right);
    let y1=Math.max(0,r.top), y2=Math.min(vh,r.bottom);
    const clips=/^(clip|hidden|auto|scroll)$/;
    for(let parent=el;parent;parent=parent.parentElement){
      const css=style(parent), box=parent.getBoundingClientRect();
      if(clips.test(css.overflowX)){
        x1=Math.max(x1,box.left+parent.clientLeft);
        x2=Math.min(x2,box.left+parent.clientLeft+parent.clientWidth);
      }
      if(clips.test(css.overflowY)){
        y1=Math.max(y1,box.top+parent.clientTop);
        y2=Math.min(y2,box.top+parent.clientTop+parent.clientHeight);
      }
    }
    if(x1>=x2||y1>=y2)return [];
    // Decorative labels can be painted while forwarding taps to a parent.
    const probe=style(el).pointerEvents==='none', prop='pointer-events';
    const original=el.style.getPropertyValue(prop), priority=el.style.getPropertyPriority(prop);
    if(probe)el.style.setProperty(prop,'auto','important');
    try{
      const points=[];
      for(const y of [.5,.25,.75]){
        for(const x of [.5,.16,.84]){
          const px=x1+(x2-x1)*x, py=y1+(y2-y1)*y;
          const hit=document.elementFromPoint(px,py);
          if(hit===el || (hit && el.contains(hit)))points.push([px,py]);
        }
      }
      return points;
    }finally{
      if(probe && original)el.style.setProperty(prop,original,priority);
      else if(probe)el.style.removeProperty(prop);
    }
  }
  function badge(el) {
    for(let i=0;el&&i<4;i++,el=el.parentElement){
      const css=style(el), r=el.getBoundingClientRect();
      const painted=css.backgroundColor!=='rgba(0, 0, 0, 0)' || css.backgroundImage!=='none' || parseFloat(css.borderTopWidth)>0;
      if(painted)return r.width<=44 && r.height<=32 && parseFloat(css.borderTopLeftRadius)>=Math.min(r.width,r.height)/2-2;
    }
    return false;
  }
  const texts=[], btns=[];
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  for(let n=walker.nextNode();n;n=walker.nextNode()){
    const el=n.parentElement, label=n.textContent.trim();
    if(!label||!el||!visible(el)||el.closest('script,style'))continue;
    const css=style(el),range=document.createRange();range.selectNodeContents(n);
    let op=1;
    for(let p=el;p;p=p.parentElement)op*=Number(style(p).opacity);
    for(const r of range.getClientRects()){
      if(r.width<1||r.height<1)continue;
      const points=samplePoints(el,r);
      if(!points.length)continue;
      texts.push({points,t:label,r:rect(r),fs:parseFloat(css.fontSize),fw:Number(css.fontWeight),c:css.color,op,
        cell:!!el.closest('[data-cell]'),ah:!!el.closest('[aria-hidden=true]'),badge:badge(el),hint:!!el.closest('button[aria-label*="İpucu"]'),
        clip:(/hidden|clip/.test(css.overflowX) && el.scrollWidth>el.clientWidth+1) ||
          (/hidden|clip/.test(css.overflowY) && css.webkitLineClamp!=='none' && el.scrollHeight>el.clientHeight+2)});
    }
  }
  const controlSelector='button,a[href],[role=button],summary,[role=tab],input,select';
  function touchBox(el,box){
    if(box.width>=44&&box.height>=44)return rect(box);
    // Test a centered 44 pt square against the browser's actual hit map. This also
    // detects overlapping neighbors and clipped pseudo-elements on compact buttons.
    const left=box.left+(box.width-44)/2,top=box.top+(box.height-44)/2;
    if(left<0||top<0||left+44>vw||top+44>vh)return rect(box);
    for(let y=0;y<44;y++)for(let x=0;x<44;x++){
      const hit=document.elementFromPoint(left+x+.5,top+y+.5);
      if(hit?.closest(controlSelector)!==el)return rect(box);
    }
    for(const dx of [.25,22,43.75])for(const dy of [.25,22,43.75]){
      if(document.elementFromPoint(left+dx,top+dy)?.closest(controlSelector)!==el)return rect(box);
    }
    return [left,top,44,44];
  }
  for(const el of document.querySelectorAll(controlSelector)){
    const box=el.getBoundingClientRect(),css=style(el);
    if(!visible(el)||!samplePoints(el,box).length)continue;
    btns.push({t:(el.getAttribute('aria-label')||el.innerText||el.value||'').trim().slice(0,36),r:rect(box),hit:touchBox(el,box),bg:css.backgroundColor,
      bgi:css.backgroundImage==='none'?'':css.backgroundImage,bd:css.borderTopWidth+' '+css.borderTopColor,
      rad:css.borderTopLeftRadius,fs:css.fontSize,fw:css.fontWeight,cell:!!el.closest('[data-cell]')});
  }
  return {vw,vh,sw:document.documentElement.scrollWidth,texts,btns};
}
