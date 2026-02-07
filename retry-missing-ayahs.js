const https = require('https');
const fs = require('fs');

const INPUT_FILE = 'ayahs.json';
const OUTPUT_FILE = 'ayahs.json';
const BASE_URL = 'https://api.alquran.cloud/v1/ayah/';
const TOTAL_AYAHS = 6236;

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
              console.log(`Retrying ayah ${ayahNumber}... (${retriesLeft} retries left)`);
              setTimeout(() => attempt(retriesLeft - 1), 2000);
            } else {
              reject(error);
            }
          }
        });
      }).on('error', (error) => {
        if (retriesLeft > 0) {
          console.log(`Retrying ayah ${ayahNumber}... (${retriesLeft} retries left)`);
          setTimeout(() => attempt(retriesLeft - 1), 2000);
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
    console.log(`Missing ayahs: ${missingAyahs.join(', ')}`);
    console.log(`Total missing: ${missingAyahs.length}\n`);

    if (missingAyahs.length === 0) {
      console.log('No missing ayahs! All 6236 ayahs are present.');
      return;
    }

    // Fetch missing ayahs
    console.log('Fetching missing ayahs...');
    const fetchedAyahs = [];

    for (const ayahNumber of missingAyahs) {
      try {
        console.log(`Fetching ayah ${ayahNumber}...`);
        const ayah = await fetchAyah(ayahNumber);
        fetchedAyahs.push(ayah);
        console.log(`✓ Successfully fetched ayah ${ayahNumber}`);

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`✗ Failed to fetch ayah ${ayahNumber}:`, error.message);
      }
    }

    console.log(`\nSuccessfully fetched ${fetchedAyahs.length} out of ${missingAyahs.length} missing ayahs`);

    // Merge and sort all ayahs
    console.log('\nMerging ayahs...');
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
      console.log('\n✓ All 6236 ayahs are now present!');
    } else {
      console.log(`\n⚠ Still missing ${stillMissing.length} ayahs: ${stillMissing.join(', ')}`);
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
