import { readFileSync } from 'node:fs';
const [root, ...paths] = process.argv.slice(2);
const { boardIssues, PRESENTATION_RULES } = await import(root + '/lib/game/board-quality.ts');
const { hedef, puan, SINIR, YONLER } = await import(new URL('zorluk-tablosu.mjs', import.meta.url).href);
const { uygunsuzDiziler } = await import(new URL('uygunsuz-tarama.mjs', import.meta.url).href);
const LV = JSON.parse(readFileSync(new URL('mevcut-bantlar.json', import.meta.url), 'utf8'));
const REV = [
    '0,-1',
    '-1,0',
    '-1,-1',
    '1,-1'
];
const levels = paths.flatMap((p)=>JSON.parse(readFileSync(p, 'utf8')).levels).sort((a, b)=>a.n - b.n);
const errs = [], warns = [];
const E = (n, m)=>errs.push(`HATA  ${String(n).padStart(3)} ${m}`), W = (n, m)=>warns.push(`UYARI ${String(n).padStart(3)} ${m}`);
const lastUse = new Map();
const prev = new Map();
for (const o of levels){
    if (o.fail) {
        E(o.n, 'üretilemedi: ' + o.fail);
        continue;
    }
    const band = LV[o.n - 1];
    if (!band || band.id !== o.id) {
        E(o.n, 'bölüm kimliği mevcut sırayla eşleşmiyor: ' + o.id);
        continue;
    }
    const H = hedef(o.world, o.pos, {
        clue: !!band.w?.chapter?.clues
    });
    const R = o.grid.length, C = o.grid[0].length;
    if (R > SINIR.maxSatir || C > SINIR.maxSutun) E(o.n, `tahta ${C}×${R}, sınır 9×9`);
    if (R !== H.R || C !== H.C) E(o.n, `tahta ${C}×${R}, tablo ${H.C}×${H.R} istiyor`);
    if (o.grid.some((r)=>[
            ...r
        ].length !== C)) E(o.n, 'satır uzunlukları eşit değil');
    if (o.grid.some((r)=>!/^[ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ]+$/.test(r))) E(o.n, 'ızgarada Türkçe alfabe dışı harf var');
    if (o.words.length > SINIR.maxKelime) E(o.n, `${o.words.length} kelime, sınır ${SINIR.maxKelime}`);
    if (o.words.length !== H.words) E(o.n, `${o.words.length} kelime, tablo ${H.words} istiyor`);
    const g = o.grid.map((r)=>[
            ...r
        ]);
    let diag = 0, rev = 0;
    const use = new Map(), yon = new Map();
    for (const [t, r1, c1, r2, c2] of o.placements){
        const dr = Math.sign(r2 - r1), dc = Math.sign(c2 - c1), n = [
            ...t
        ].length;
        if (Math.max(Math.abs(r2 - r1), Math.abs(c2 - c1)) !== n - 1 || dr && dc && Math.abs(r2 - r1) !== Math.abs(c2 - c1)) E(o.n, t + ': yol uzunluğu/yönü kelimeyle uyuşmuyor');
        for(let k = 0; k < n; k++){
            const ch = g[r1 + dr * k]?.[c1 + dc * k];
            if (ch !== [
                ...t
            ][k]) {
                E(o.n, t + ': ızgaradaki harf uyuşmuyor');
                break;
            }
            const key = r1 + dr * k + ',' + (c1 + dc * k);
            use.set(key, (use.get(key) ?? 0) + 1);
        }
        if (dr && dc) diag++;
        if (REV.includes(dr + ',' + dc)) rev++;
        yon.set(dr + ',' + dc, (yon.get(dr + ',' + dc) ?? 0) + 1);
        if (!YONLER[H.dirs].includes(dr + ',' + dc)) E(o.n, t + ': bu bölümde izin verilmeyen yön ' + dr + ',' + dc);
        if (n < SINIR.minHarf || n > SINIR.maxHarf) E(o.n, t + ': ' + n + ' harf');
    }
    const N = o.words.length, cross = [
        ...use.values()
    ].filter((v)=>v > 1).length;
    const Y = H.yon;
    if (diag < Y.caprazAz || diag > Y.caprazCok) E(o.n, `çapraz ${diag}/${N}, izin ${Y.caprazAz}–${Y.caprazCok}`);
    if (rev < Y.tersAz || rev > Y.tersCok) E(o.n, `ters ${rev}/${N}, izin ${Y.tersAz}–${Y.tersCok}`);
    const yogun = Math.max(...yon.values());
    if (yogun > Y.yonCok) E(o.n, `bir yönde ${yogun} kelime, en çok ${Y.yonCok}`);
    if (yon.size < Y.yonAz) E(o.n, `${yon.size} farklı yön, en az ${Y.yonAz}`);
    if (cross < H.crossMin) E(o.n, `kesişme ${cross}, en az ${H.crossMin}`);
    if (H.maxCross === 0 && cross > 0) E(o.n, 'öğretme bölümünde kesişme olmamalı');
    const hid = o.hiddenIds ?? [], ids = new Set(o.words.map((_, i)=>i + '.0'));
    if (hid.length !== H.hidden) E(o.n, `gizli kelime ${hid.length}, tablo ${H.hidden} istiyor`);
    if (new Set(hid).size !== hid.length) E(o.n, 'gizli kelime kimliği iki kez');
    for (const id of hid){
        if (!ids.has(id)) E(o.n, 'gizli kelime kimliği tahtada yok: ' + id);
        else if ([
            ...o.words[+id.split('.')[0]]
        ].length <= 3) E(o.n, '3 harfli kelime gizlenmez: ' + o.words[+id.split('.')[0]]);
    }
    if (o.hiddenWords && JSON.stringify(o.hiddenWords) !== JSON.stringify(hid.filter((id)=>ids.has(id)).map((id)=>o.words[+id.split('.')[0]]))) E(o.n, 'gizli kelime adları kimliklerle uyuşmuyor');
    for (const u of uygunsuzDiziler(o.grid, o.placements))E(o.n, `uygunsuz dizi tahtada okunuyor: ${u.dizi} (${u.a}, yön ${u.yon})`);
    const uc = o.words.filter((w)=>[
            ...w
        ].length === 3).length, uzun = o.words.filter((w)=>[
            ...w
        ].length >= 8).length;
    if (uc > Math.max(1, Math.floor(N * SINIR.ucHarfOran))) E(o.n, `3 harfli kelime ${uc}, en çok ${Math.max(1, Math.floor(N * SINIR.ucHarfOran))}`);
    if (uzun > SINIR.maxUzun) E(o.n, `8–9 harfli kelime ${uzun}, en çok ${SINIR.maxUzun}`);
    for (const w of o.words)if (o.words.some((x)=>x !== w && x.includes(w))) E(o.n, w + ': başka bir hedefin içinde');
    const near = new Set(LV.slice(Math.max(0, o.n - 7), o.n - 1).flatMap((b)=>b.words));
    for (const w of o.words)if (near.has(w)) E(o.n, w + ': eski tahtanın önceki 6 bölümünde var');
    for (const w of o.words){
        const ls = lastUse.get(w);
        if (ls !== undefined && o.n - ls < 40) E(o.n, `${w}: ${o.n - ls} bölüm önce de vardı`);
        else if (ls !== undefined && o.n - ls < 120) W(o.n, `${w}: ${o.n - ls} bölüm önce de vardı`);
        lastUse.set(w, o.n);
    }
    const targets = o.words.map((w, i)=>({
            id: i + '.0',
            label: w,
            text: w,
            group: i
        }));
    const placements = o.placements.map(([t, a, b, c, d])=>{
        const i = o.words.indexOf(t);
        return {
            id: i + '.0',
            label: t,
            text: t,
            group: i,
            a: [
                a,
                b
            ],
            b: [
                c,
                d
            ]
        };
    });
    const issues = boardIssues({
        version: 2,
        size: Math.max(R, C),
        grid: g,
        targets,
        placements
    }, PRESENTATION_RULES);
    for (const is of issues)E(o.n, `oyunun güvenlik denetimi: ${is.kind} ${is.text}`);
    const sc = puan({
        words: N,
        letters: o.words.reduce((s, w)=>s + [
                ...w
            ].length, 0),
        diag,
        rev,
        crossings: cross,
        R,
        C,
        long: o.words.filter((w)=>[
                ...w
            ].length >= 8).length,
        hidden: o.hiddenIds?.length ?? 0
    });
    const p = prev.get(o.world);
    if (p !== undefined && o.pos > 1 && sc < p + 2) E(o.n, `zorluk ${sc.toFixed(1)}, bir önceki bölüm ${p.toFixed(1)}: dünyada her bölüm en az 2 puan zor olmalı`);
    prev.set(o.world, sc);
}
console.log(`Tahta denetimi: ${levels.length} bölüm · HATA ${errs.length} · UYARI ${warns.length}`);
for (const l of [
    ...errs,
    ...warns
])console.log(l);
process.exit(errs.length ? 1 : 0);
