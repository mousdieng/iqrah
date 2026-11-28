/**
 * Global id (1-6236) of the first ayah of each juz, index 0 = juz 1.
 * Checked against the juz stored with every ayah in the database.
 */
export const JUZ_START_IDS = [
  1, 149, 260, 386, 517, 641, 751, 900, 1042, 1201,
  1328, 1479, 1649, 1803, 2030, 2215, 2484, 2674, 2876, 3215,
  3386, 3564, 3733, 4090, 4265, 4511, 4706, 5105, 5242, 5673
];

export const TOTAL_AYAHS = 6236;

/** First and last ayah id of a juz (1-30) */
export function juzRange(juz: number): { from: number; to: number } {
  const from = JUZ_START_IDS[juz - 1];
  const to = juz < 30 ? JUZ_START_IDS[juz] - 1 : TOTAL_AYAHS;
  return { from, to };
}
