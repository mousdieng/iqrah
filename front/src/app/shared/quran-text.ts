import { Ayah } from '../models';

const BASMALA = /^بِسۡمِ\s*ٱللَّهِ\s*ٱلرَّحۡمَـٰنِ\s*ٱلرَّحِیمِ\s*/u;

/**
 * The stored text of ayah 1 of every surah (except Al-Fatiha, where it is the ayah,
 * and At-Tawbah, which has none) starts with the Basmala. It is not part of the ayah,
 * so it is removed wherever a single ayah is displayed.
 */
export function ayahDisplayText(ayah: Pick<Ayah, 'text' | 'numberInSurah' | 'surahId'>): string {
  if (ayah.numberInSurah === 1 && ayah.surahId !== 1 && ayah.surahId !== 9) {
    return ayah.text.replace(BASMALA, '');
  }
  return ayah.text;
}

/** Arabic-Indic digits, e.g. 12 → ١٢ */
export function arabicNumber(n: number): string {
  return n.toLocaleString('ar-EG');
}

/** Words of an ayah as printed (pause marks stay attached as their own tokens) */
export function ayahWords(text: string): string[] {
  return text.split(/\s+/).filter(w => w.length > 0);
}

/** Small marks (waqf signs, sajda) that are not words to recite */
export function isMark(word: string): boolean {
  return /^[ۖ-ۭؕ-ؚ۞۩]+$/u.test(word);
}

/** Letters that never join the next one: no tatweel after them */
const NON_JOINING = /[ء-أإاد-زوٱؤآ]$/u;

/**
 * Hint for reciting from memory: the start of a word, e.g. بِسْمِ → بِـ.
 * The definite article ٱل is kept with the letter after it (ٱللَّهِ → ٱللَّـ),
 * otherwise every "al-" word would show the same alif.
 */
export function firstLetterHint(word: string): string {
  if (isMark(word)) return word;
  const match = word.match(/^(?:[اٱ]\p{M}*ل\p{M}*)?\P{M}\p{M}*/u);
  if (!match) return word;
  const start = match[0];
  if (start.length >= word.length) return word;
  const base = start.replace(/\p{M}/gu, '');
  return NON_JOINING.test(base) ? `${start}…` : `${start}ـ`;
}
