const fs = require('fs');

const INPUT_FILE = 'ayahs.json';
const OUTPUT_FILE = 'ayahs.json';
const TOTAL_AYAHS = 6236;

function main() {
  console.log('Reading ayahs file...');
  const data = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
  console.log(`Found ${data.length} total entries\n`);

  // Remove duplicates by keeping only one entry per ayah number
  const ayahMap = new Map();

  data.forEach(ayah => {
    if (ayah && ayah.data && ayah.data.number) {
      const ayahNumber = ayah.data.number;
      if (!ayahMap.has(ayahNumber)) {
        ayahMap.set(ayahNumber, ayah);
      }
    }
  });

  console.log(`After removing duplicates: ${ayahMap.size} unique ayahs`);

  // Convert map to sorted array
  const uniqueAyahs = Array.from(ayahMap.values()).sort((a, b) => {
    return (a?.data?.number || 0) - (b?.data?.number || 0);
  });

  // Find missing ayahs
  const existingNumbers = new Set(Array.from(ayahMap.keys()));
  const missing = [];
  for (let i = 1; i <= TOTAL_AYAHS; i++) {
    if (!existingNumbers.has(i)) {
      missing.push(i);
    }
  }

  console.log(`\nMissing ayahs: ${missing.length}`);
  if (missing.length > 0 && missing.length <= 100) {
    console.log('Missing ayah numbers:', missing.join(', '));
  }

  // Save cleaned data
  console.log(`\nSaving ${uniqueAyahs.length} unique ayahs to ${OUTPUT_FILE}...`);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(uniqueAyahs, null, 2), 'utf8');

  console.log(`\n✓ Successfully saved ${uniqueAyahs.length} ayahs`);
  console.log(`  Total expected: ${TOTAL_AYAHS}`);
  console.log(`  Missing: ${missing.length}`);

  if (missing.length === 0) {
    console.log('\n✓✓✓ PERFECT! All 6236 ayahs are present! ✓✓✓');
  }
}

main();
