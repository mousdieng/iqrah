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
