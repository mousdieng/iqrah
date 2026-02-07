const https = require('https');
const fs = require('fs');

const INPUT_FILE = 'ayahs.json';
const OUTPUT_FILE = 'ayahs.json';
const BASE_URL = 'https://api.alquran.cloud/v1/ayah/';
const TOTAL_AYAHS = 6236;
const BATCH_SIZE = 50; // Fetch 50 ayahs at a time

// Function to fetch a single ayah with retries
function fetchAyah(ayahNumber, retries = 3) {
  return new Promise((resolve, reject) => {
    const attempt = (retriesLeft) => {
      https.get(`${BASE_URL}${ayahNumber}`, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed);
          } catch (error) {
            if (retriesLeft > 0) {
              setTimeout(() => attempt(retriesLeft - 1), 1000);
            } else {
              reject(error);
            }
          }
        });
      }).on('error', (error) => {
        if (retriesLeft > 0) {
          setTimeout(() => attempt(retriesLeft - 1), 1000);
        } else {
          reject(error);
        }
      });
    };

    attempt(retries);
  });
}

// Function to find missing ayahs
function findMissingAyahs(ayahs) {
  const existingNumbers = new Set();

  ayahs.forEach(ayah => {
    if (ayah && ayah.data && ayah.data.number) {
      existingNumbers.add(ayah.data.number);
    }
  });

  const missing = [];
  for (let i = 1; i <= TOTAL_AYAHS; i++) {
    if (!existingNumbers.has(i)) {
      missing.push(i);
    }
  }

  return missing;
}

// Main execution
async function main() {
  try {
    console.log('Reading existing ayahs file...');
    const existingData = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
    console.log(`Found ${existingData.length} existing ayahs\n`);

    // Find missing ayahs
    const missingAyahs = findMissingAyahs(existingData);
    console.log(`Total missing: ${missingAyahs.length}\n`);

    if (missingAyahs.length === 0) {
      console.log('No missing ayahs! All 6236 ayahs are present.');
      return;
    }

    // Fetch missing ayahs in batches
    const fetchedAyahs = [];
    const totalBatches = Math.ceil(missingAyahs.length / BATCH_SIZE);

    console.log(`Fetching ${missingAyahs.length} ayahs in ${totalBatches} batches of ${BATCH_SIZE}...\n`);

    for (let i = 0; i < missingAyahs.length; i += BATCH_SIZE) {
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      const batch = missingAyahs.slice(i, i + BATCH_SIZE);

      console.log(`\n[Batch ${batchNumber}/${totalBatches}] Fetching ayahs ${batch[0]} to ${batch[batch.length - 1]}...`);

      // Fetch all ayahs in this batch in parallel
      const batchPromises = batch.map(ayahNumber =>
        fetchAyah(ayahNumber).catch(error => {
          console.error(`  ✗ Failed to fetch ayah ${ayahNumber}:`, error.message);
          return null;
        })
      );

      const batchResults = await Promise.all(batchPromises);
      const successfulFetches = batchResults.filter(result => result !== null);

      fetchedAyahs.push(...successfulFetches);

      console.log(`  ✓ Successfully fetched ${successfulFetches.length}/${batch.length} ayahs`);
      console.log(`  Progress: ${fetchedAyahs.length}/${missingAyahs.length} (${((fetchedAyahs.length / missingAyahs.length) * 100).toFixed(1)}%)`);

      // Small delay between batches to be respectful to the API
      if (i + BATCH_SIZE < missingAyahs.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`\n✓ Successfully fetched ${fetchedAyahs.length} out of ${missingAyahs.length} missing ayahs`);

    // Merge and sort all ayahs
    console.log('\nMerging and sorting ayahs...');
    const allAyahs = [...existingData, ...fetchedAyahs];

    // Sort by ayah number
    allAyahs.sort((a, b) => {
      const numA = a?.data?.number || 0;
      const numB = b?.data?.number || 0;
      return numA - numB;
    });

    console.log(`Total ayahs after merge: ${allAyahs.length}`);

    // Save to file
    console.log(`\nSaving to ${OUTPUT_FILE}...`);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allAyahs, null, 2), 'utf8');

    console.log(`\n✓ Successfully saved ${allAyahs.length} ayahs to ${OUTPUT_FILE}`);

    // Verify completeness
    const stillMissing = findMissingAyahs(allAyahs);
    if (stillMissing.length === 0) {
      console.log('\n✓✓✓ SUCCESS! All 6236 ayahs are now present! ✓✓✓');
    } else {
      console.log(`\n⚠ Still missing ${stillMissing.length} ayahs:`);
      console.log(stillMissing.slice(0, 50).join(', ') + (stillMissing.length > 50 ? '...' : ''));
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
