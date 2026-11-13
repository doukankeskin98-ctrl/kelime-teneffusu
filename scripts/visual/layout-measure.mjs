// Read-only DOM capture shared by local visual tools. Never changes player state.
export function capturePlayLayout() {
  const screen = document.querySelector('.viewport-play');
  const board = screen?.querySelector('.letter-board');
  if (!screen || !board) return {error: 'tahta yok'};
  const rect = element => {
    const b = element.getBoundingClientRect();
    return {left:b.left, top:b.top, right:b.right, bottom:b.bottom, width:b.width, height:b.height};
  };
  const visible = element => {
    const css = getComputedStyle(element), b = rect(element);
    return css.display !== 'none' && css.visibility !== 'hidden' && b.width > 0 && b.height > 0;
  };
  const named = element => ({...rect(element), name:element.getAttribute('aria-label') || element.textContent?.trim() || element.className});
  const rack = screen.querySelector('.target-rack');
  const words = [...screen.querySelectorAll('.target-rack .target-letters')].filter(visible).map(word => ({
    ...named(word), letters:[...word.children].filter(letter => !letter.classList.contains('target-space')).map(named),
  }));
  const targets = [...screen.querySelectorAll('.target-focus-button,.clue-slot>button')].filter(visible).map(element=>({...named(element),minTouchHeight:element.classList.contains('target-focus-button')?36:44}));
  const controls = [...screen.querySelectorAll('.play-controls button,.solo-control-dock button,.duel-controls button,.sprint-footer button')].filter(visible).map(named);
  const cells = [...board.querySelectorAll('[data-cell]')].map(rect);
  return {width:innerWidth,height:innerHeight,scrollHeight:document.scrollingElement.scrollHeight,
    scrollWidth:document.documentElement.scrollWidth,board:rect(board),rack:rack?rect(rack):null,
    cell:cells.length?Math.min(...cells.map(c => c.width)):0,words,targets,controls};
}

export function layoutProblems(sample) {
  if (sample.error) return [sample.error];
  const issues = [], epsilon = 1;
  const outside = (b, area) => b.left < area.left-epsilon || b.top < area.top-epsilon || b.right > area.right+epsilon || b.bottom > area.bottom+epsilon;
  const overlaps = (a,b) => Math.min(a.right,b.right)-Math.max(a.left,b.left)>epsilon && Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>epsilon;
  const viewport = {left:0,top:0,right:sample.width,bottom:sample.height};
  if (sample.scrollHeight > sample.height+epsilon) issues.push('sayfa kayıyor');
  if (sample.scrollWidth > sample.width+epsilon) issues.push('yatay taşma');
  if (outside(sample.board,viewport)) issues.push('tahta ekran dışında');
  if (sample.cell < 26-epsilon) issues.push('harf hücresi okunabilirlik sınırının altında');
  if (!sample.controls.length) issues.push('oyun kontrolü bulunamadı');
  for (const word of sample.words) {
    // Check actual glyph boxes as well as their container: overflow:hidden can
    // hide letters without increasing document width or the tag's outer bounds.
    if (sample.rack && [word,...word.letters].some(b => outside(b,sample.rack))) issues.push('kırpılan kelime: '+word.name);
    if (word.letters.some(b => Math.abs(b.top-word.letters[0].top)>4)) issues.push('bölünen kelime: '+word.name);
  }
  const buttons = [...sample.targets,...sample.controls];
  for (const button of buttons) {
    if (button.width < 44-epsilon || button.height < (button.minTouchHeight??44)-epsilon) issues.push('küçük dokunma alanı: '+button.name);
    if (outside(button,viewport)) issues.push('düğme ekran dışında: '+button.name);
    if (overlaps(button,sample.board)) issues.push('düğme tahtayı örtüyor: '+button.name);
  }
  for (let i=0;i<buttons.length;i++) for (let j=i+1;j<buttons.length;j++)
    if (overlaps(buttons[i],buttons[j])) issues.push('çakışan dokunma alanları: '+buttons[i].name+' / '+buttons[j].name);
  return issues;
}
