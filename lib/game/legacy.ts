// Pure game logic: word data, seeded generator, selection matching, save validation.

export type Dir = [number, number];
export const ALL_DIRS: Dir[] = [
  [0, 1], [1, 0], [1, 1], [-1, 1],
  [0, -1], [-1, 0], [-1, -1], [1, -1],
];

export interface WordDef { label: string; parts: string[] }
export interface RoundDef { title: string; size: number; dirs: Dir[]; words: WordDef[]; note?: string }

const tr = (s: string) => s.toLocaleUpperCase("tr-TR");
const w = (label: string, split?: string[]): WordDef => ({
  label,
  parts: split ? split.map(tr) : [tr(label).replace(/\s+/g, "")],
});

export const ROUNDS: RoundDef[] = [
  {
    title: "İlk Ders", size: 10, dirs: [[0, 1], [1, 0]],
    words: [w("AKİL HOCA"), w("BACAKSIZ"), w("BADİ EKREM"), w("DAMAT FERİT"), w("DOMDOM ALİ")],
  },
  {
    title: "Teneffüs", size: 11, dirs: [[0, 1], [1, 0], [1, 1], [0, -1], [-1, 0]],
    words: [w("GÜDÜK NECMİ"), w("HAFİZE ANA"), w("HAYTA İSMAİL"), w("İNEK ŞABAN"), w("KEL MAHMUT")],
  },
  {
    title: "Müdürün Odası", size: 10, dirs: ALL_DIRS,
    note: "KÜLYUTMAZ NECMİ iki parça halinde saklandı: KÜLYUTMAZ ve NECMİ. İkisini de bulunca isim tamamlanır.",
    words: [w("KOPYA"), w("KÜLYUTMAZ NECMİ", ["KÜLYUTMAZ", "NECMİ"]), w("MÜDÜR"), w("PAŞA NURİ"), w("SEMRA HOCA")],
  },
  {
    title: "Son Zil", size: 13, dirs: ALL_DIRS,
    note: "UGANDA CUMHURBAŞKANI iki parça halinde saklandı: UGANDA ve CUMHURBAŞKANI. İkisini de bulunca isim tamamlanır.",
    words: [w("SOBA"), w("TULUM HAYRİ"), w("UGANDA CUMHURBAŞKANI", ["UGANDA", "CUMHURBAŞKANI"]), w("VEYSEL EFENDİ"), w("ZÜHTÜ HOCA")],
  },
];

export const TOTAL_WORDS = ROUNDS.reduce((n, r) => n + r.words.length, 0);
export const partId = (wi: number, pi: number) => `${wi}.${pi}`;
const ALPHABET = Array.from("ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ");

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Placement { id: string; text: string; r: number; c: number; dr: number; dc: number; len: number }
export interface Board { size: number; grid: string[][]; placements: Placement[] }

export function generateBoard(roundIndex: number, seed: number): Board {
  const def = ROUNDS[roundIndex];
  if (!def) throw new RangeError('Geçersiz klasik tur');
  const n = def.size;
  const parts = def.words.flatMap((wd, wi) => wd.parts.map((p, pi) => ({ id: partId(wi, pi), text: p })));
  for (const p of parts) if (Array.from(p.text).length > n) throw new Error(`${p.text} sığmıyor`);
  const order = [...parts].sort((a, b) => Array.from(b.text).length - Array.from(a.text).length);

  for (let attempt = 0; attempt < 500; attempt++) {
    const rand = rng(seed * 31 + roundIndex * 7919 + attempt * 104729);
    const grid: string[][] = Array.from({ length: n }, () => Array(n).fill(""));
    const placements: Placement[] = [];
    let ok = true;
    for (const p of order) {
      const letters = Array.from(p.text);
      const L = letters.length;
      const opts: Placement[] = [];
      for (const [dr, dc] of def.dirs)
        for (let r = 0; r < n; r++)
          for (let c = 0; c < n; c++) {
            const er = r + dr * (L - 1), ec = c + dc * (L - 1);
            if (er < 0 || er >= n || ec < 0 || ec >= n) continue;
            let fits = true;
            for (let i = 0; i < L; i++) {
              const g = grid[r + dr * i]![c + dc * i];
              if (g && g !== letters[i]) { fits = false; break; }
            }
            if (fits) opts.push({ id: p.id, text: p.text, r, c, dr, dc, len: L });
          }
      if (!opts.length) { ok = false; break; }
      const pick = opts[Math.floor(rand() * opts.length)]!;
      for (let i = 0; i < L; i++) grid[pick.r + pick.dr * i]![pick.c + pick.dc * i] = letters[i]!;
      placements.push(pick);
    }
    if (!ok) continue;
    for (let r = 0; r < n; r++)
      for (let c = 0; c < n; c++) if (!grid[r]![c]) grid[r]![c] = ALPHABET[Math.floor(rand() * ALPHABET.length)]!;
    // Placement order follows word order for stable hints.
    placements.sort((a, b) => a.id.localeCompare(b.id, "en", { numeric: true }));
    return { size: n, grid, placements };
  }
  throw new Error("Tahta oluşturulamadı");
}

export type Cell = [number, number];

/** Snap a start/end pair to a straight 8-direction line clamped inside the board. */
export function lineCells(a: Cell, b: Cell, n: number): Cell[] {
  const dr0 = b[0] - a[0], dc0 = b[1] - a[1];
  if (dr0 === 0 && dc0 === 0) return [a];
  const ang = Math.atan2(dr0, dc0);
  const step = Math.round(ang / (Math.PI / 4));
  const dr = Math.round(Math.sin(step * Math.PI / 4));
  const dc = Math.round(Math.cos(step * Math.PI / 4));
  let len = Math.max(Math.abs(dr0), Math.abs(dc0));
  const out: Cell[] = [];
  for (let i = 0; i <= len; i++) {
    const r = a[0] + dr * i, c = a[1] + dc * i;
    if (r < 0 || c < 0 || r >= n || c >= n) break;
    out.push([r, c]);
  }
  len = out.length;
  return out;
}

export function cellsText(board: Board, cells: Cell[]) {
  return cells.map(([r, c]) => board.grid[r]?.[c] ?? '').join("");
}

/** Returns the id of an unfound part that the selection spells (either direction), or a status. */
export function matchSelection(
  board: Board, roundIndex: number, cells: Cell[], found: string[],
): { kind: "found"; id: string } | { kind: "dup"; id: string } | { kind: "miss" } {
  if (cells.length < 2) return { kind: "miss" };
  const text = cellsText(board, cells);
  const rev = Array.from(text).reverse().join("");
  const def = ROUNDS[roundIndex];
  if (!def) return { kind: 'miss' };
  let dup: string | null = null;
  for (let wi = 0; wi < def.words.length; wi++)
    for (let pi = 0; pi < def.words[wi]!.parts.length; pi++) {
      const p = def.words[wi]!.parts[pi];
      if (p === text || p === rev) {
        const id = partId(wi, pi);
        if (!found.includes(id)) return { kind: "found", id };
        dup = id;
      }
    }
  return dup ? { kind: "dup", id: dup } : { kind: "miss" };
}

export function wordComplete(roundIndex: number, wi: number, found: string[]) {
  return ROUNDS[roundIndex]?.words[wi]?.parts.every((_, pi) => found.includes(partId(wi, pi))) ?? false;
}
export function roundCompleteCount(roundIndex: number, found: string[]) {
  return ROUNDS[roundIndex]?.words.filter((_, wi) => wordComplete(roundIndex, wi, found)).length ?? 0;
}
export function roundDone(roundIndex: number, found: string[]) {
  return roundCompleteCount(roundIndex, found) === ROUNDS[roundIndex]?.words.length;
}

// ---------- Save state ----------
export interface Stroke { id: string; a: Cell; b: Cell }
export interface SaveState {
  v: 1; seed: number; round: number;
  found: string[][]; strokes: Stroke[][]; hints: number[]; elapsed: number[];
  sound: boolean; zoom: boolean;
}
export const SAVE_KEY = "hababam-kelime-v1";
export const MAX_HINTS = 3;

export function freshState(seed: number, sound = false): SaveState {
  return {
    v: 1, seed, round: 0, sound, zoom: false,
    found: ROUNDS.map(() => []), strokes: ROUNDS.map(() => []),
    hints: ROUNDS.map(() => 0), elapsed: ROUNDS.map(() => 0),
  };
}

const isCell = (x: unknown, n: number): x is Cell =>
  Array.isArray(x) && x.length === 2 && x.every((v) => Number.isInteger(v) && v >= 0 && v < n);

export function validateSave(raw: unknown): SaveState | null {
  try {
    const s = raw as SaveState;
    if (!s || s.v !== 1 || !Number.isInteger(s.seed) || !Number.isInteger(s.round)) return null;
    if (s.round < 0 || s.round >= ROUNDS.length) return null;
    const R = ROUNDS.length;
    for (const k of ["found", "strokes", "hints", "elapsed"] as const)
      if (!Array.isArray(s[k]) || s[k].length !== R) return null;
    const out = freshState(s.seed, s.sound === true);
    out.round = s.round; out.zoom = s.zoom === true;
    for (let i = 0; i < R; i++) {
      const valid = new Set(ROUNDS[i]!.words.flatMap((wd, wi) => wd.parts.map((_, pi) => partId(wi, pi))));
      const n = ROUNDS[i]!.size;
      out.found[i] = Array.isArray(s.found[i]) ? [...new Set(s.found[i]!.filter((id) => valid.has(id)))] : [];
      out.strokes[i] = Array.isArray(s.strokes[i])
        ? s.strokes[i]!.filter((st) => st && out.found[i]!.includes(st.id) && isCell(st.a, n) && isCell(st.b, n))
        : [];
      const h = s.hints[i]; out.hints[i] = typeof h === 'number' && Number.isInteger(h) ? Math.min(MAX_HINTS, Math.max(0, h)) : 0;
      const e = s.elapsed[i]; out.elapsed[i] = typeof e === "number" && isFinite(e) && e >= 0 ? Math.floor(e) : 0;
    }
    // Strokes for found parts must exist; drop found ids without a stroke.
    for (let i = 0; i < R; i++) out.found[i] = out.found[i]!.filter((id) => out.strokes[i]!.some((st) => st.id === id));
    return out;
  } catch {
    return null;
  }
}

export function fmtTime(sec: number) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

