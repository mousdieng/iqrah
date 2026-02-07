const https = require('https');
const fs = require('fs');

const TOTAL_AYAHS = 6236;
const OUTPUT_FILE = 'ayahs.json';
const BASE_URL = 'https://api.alquran.cloud/v1/ayah/';

// Function to fetch a single ayah
function fetchAyah(ayahNumber) {
  return new Promise((resolve, reject) => {
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
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Function to fetch all ayahs with rate limiting
async function fetchAllAyahs() {
  const ayahs = [];
  const batchSize = 50; // Fetch in batches to avoid overwhelming the API
  const delayBetweenBatches = 1000; // 1 second delay between batches

  console.log(`Starting to fetch ${TOTAL_AYAHS} ayahs...`);

  for (let i = 1; i <= TOTAL_AYAHS; i += batchSize) {
    const end = Math.min(i + batchSize - 1, TOTAL_AYAHS);
    console.log(`Fetching ayahs ${i} to ${end}...`);

    // Fetch batch in parallel
    const batchPromises = [];
    for (let j = i; j <= end; j++) {
      batchPromises.push(
        fetchAyah(j).catch(error => {
          console.error(`Error fetching ayah ${j}:`, error.message);
          return null; // Continue even if one fails
        })
      );
    }

    const batchResults = await Promise.all(batchPromises);
    ayahs.push(...batchResults.filter(result => result !== null));

    // Progress indicator
    const progress = ((ayahs.length / TOTAL_AYAHS) * 100).toFixed(2);
    console.log(`Progress: ${ayahs.length}/${TOTAL_AYAHS} (${progress}%)`);

    // Delay between batches to be respectful to the API
    if (end < TOTAL_AYAHS) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }
  }

  return ayahs;
}

// Main execution
async function main() {
  try {
    const startTime = Date.now();

    const ayahs = await fetchAllAyahs();

    // Save to JSON file
    console.log(`\nSaving ${ayahs.length} ayahs to ${OUTPUT_FILE}...`);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(ayahs, null, 2), 'utf8');

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`\n✓ Successfully saved ${ayahs.length} ayahs to ${OUTPUT_FILE}`);
    console.log(`Total time: ${duration} seconds`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
